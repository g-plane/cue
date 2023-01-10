import { ErrorKind, ParsingError } from "./errors.ts";
import { tokenize, TokenKind } from "./tokenizer.ts";
import type { TokenStream, TokenUnquoted } from "./tokenizer.ts";
import { FileType, TrackDataType } from "./types.ts";
import type { CueSheeet, Track } from "./types.ts";

function stripBOM(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) {
    return text.slice(1);
  }

  return text;
}

enum ParsedCommand {
  CATALOG = 1,
  CDTEXTFILE = 1 << 1,
  FILE = 1 << 2,
  FLAGS = 1 << 3,
  INDEX = 1 << 4,
  ISRC = 1 << 5,
  PERFORMER = 1 << 6,
  POSTGAP = 1 << 7,
  PREGAP = 1 << 8,
  REM = 1 << 9,
  SONGWRITER = 1 << 10,
  TITLE = 1 << 11,
  TRACK = 1 << 12,
}

interface ParserState {
  currentTrack: Track | null;
  parsedCommand: number;
  commandToken: TokenUnquoted;
}

interface Context {
  sheet: CueSheeet;

  state: ParserState;

  options: ParserOptions;

  /**
   * Raise a parsing error.
   */
  raise(
    kind: ErrorKind,
    errorAt: { pos: number; line: number; column: number },
  ): void;
}

interface ParserOptions {
  fatal?: boolean;
  checkAtLeastOneTrack?: boolean;
  strictFileCommandPosition?: boolean;
}

export function parse(source: string, options: ParserOptions = {}) {
  const errors: ParsingError[] = [];
  const raise: Context["raise"] = (kind, errorAt) => {
    const error = new ParsingError(kind, errorAt);
    if (options.fatal) {
      throw error;
    } else {
      errors.push(error);
    }
  };

  const tokens = tokenize(stripBOM(source), raise);

  const context: Context = {
    sheet: {
      files: [],
      comments: [],
    },
    state: {
      currentTrack: null,
      parsedCommand: 0,
      commandToken: null!,
    },
    options,
    raise,
  };

  while (!tokens.isEof()) {
    parseCommand(tokens, context);

    if (!tokens.isEof()) {
      tokens.expectLinebreak();
    }
  }

  if (context.state.currentTrack) {
    context.sheet.files.at(-1)?.tracks.push(context.state.currentTrack);
  }

  if (
    options.checkAtLeastOneTrack &&
    context.sheet.files.flatMap(({ tracks }) => tracks).length === 0
  ) {
    context.raise(ErrorKind.TracksRequired, tokens.getCurrentLocation());
  }

  return { sheet: context.sheet, errors };
}

function parseCommand(
  tokens: TokenStream,
  context: Context,
): void {
  const commandToken = tokens.expectString(TokenKind.Unquoted);
  context.state.commandToken = commandToken;
  const command = commandToken.value.toUpperCase();

  switch (command) {
    case "CATALOG":
      parseCatalog(tokens, context);
      break;
    case "CDTEXTFILE":
      parseCDTextFile(tokens, context);
      break;
    case "FILE":
      parseFile(tokens, context);
      break;
    case "FLAGS":
      parseFlags(tokens, context);
      break;
    case "INDEX":
      parseIndex(tokens, context);
      break;
    case "ISRC":
      parseISRC(tokens, context);
      break;
    case "PERFORMER":
      parsePerformer(tokens, context);
      break;
    case "POSTGAP":
      parsePostGap(tokens, context);
      break;
    case "PREGAP":
      parsePreGap(tokens, context);
      break;
    case "REM":
      parseRem(tokens, context);
      break;
    case "SONGWRITER":
      parseSongWriter(tokens, context);
      break;
    case "TITLE":
      parseTitle(tokens, context);
      break;
    case "TRACK":
      parseTrack(tokens, context);
      break;
    default:
      return;
  }

  const commandEnumValue = ParsedCommand[command];
  if (commandEnumValue) {
    context.state.parsedCommand |= commandEnumValue;
  }
}

const RE_CATALOG = /^\d{13}$/;

function parseCatalog(
  tokens: TokenStream,
  context: Context,
): void {
  if (context.state.parsedCommand & ParsedCommand.CATALOG) {
    context.raise(ErrorKind.DuplicatedCatalog, context.state.commandToken);
  }

  const tokenCatalog = tokens.expectString(TokenKind.Unquoted);
  // unquoted text won't be empty
  // but tolerant parser will return an empty string if parsing failed
  if (tokenCatalog.value === "") {
    return;
  }
  if (!RE_CATALOG.test(tokenCatalog.value)) {
    context.raise(ErrorKind.InvalidCatalogFormat, tokenCatalog);
  }

  context.sheet.catalog = tokenCatalog.value;
}

function parseCDTextFile(
  tokens: TokenStream,
  context: Context,
): void {
  const token = tokens.eatString();
  if (token) {
    context.sheet.CDTextFile = token.value;
  } else {
    context.raise(ErrorKind.MissingArguments, tokens.getCurrentLocation());
  }
}

function parseFile(
  tokens: TokenStream,
  context: Context,
): void {
  const { state: { parsedCommand }, options } = context;
  if (
    options.strictFileCommandPosition &&
    parsedCommand &&
    !(parsedCommand & ParsedCommand.CATALOG ||
      parsedCommand & ParsedCommand.CDTEXTFILE)
  ) {
    context.raise(
      ErrorKind.InvalidFileCommandLocation,
      context.state.commandToken,
    );
  }

  const fileNameToken = tokens.eatString();
  if (!fileNameToken) {
    context.raise(ErrorKind.MissingArguments, tokens.getCurrentLocation());
    return;
  }

  const fileTypeToken = tokens.expectString(TokenKind.Unquoted);
  const fileType = (() => {
    switch (fileTypeToken.value.toUpperCase()) {
      case "BINARY":
        return FileType.Binary;
      case "MOTOROLA":
        return FileType.Motorola;
      case "AIFF":
        return FileType.Aiff;
      case "WAVE":
        return FileType.Wave;
      case "MP3":
        return FileType.Mp3;
      default:
        return FileType.Unknown;
    }
  })();
  if (fileType === FileType.Unknown) {
    context.raise(ErrorKind.UnknownFileType, fileTypeToken);
  }

  context.sheet.files.push({
    name: fileNameToken.value,
    type: fileType,
    tracks: [],
  });
}

function parseFlags(
  tokens: TokenStream,
  context: Context,
): void {
  const { parsedCommand } = context.state;
  if (
    !(parsedCommand & ParsedCommand.TRACK) ||
    parsedCommand & ParsedCommand.INDEX
  ) {
    context.raise(
      ErrorKind.InvalidFlagsCommandLocation,
      context.state.commandToken,
    );
  }
  if (parsedCommand & ParsedCommand.FLAGS) {
    context.raise(ErrorKind.DuplicatedFlagsCommand, context.state.commandToken);
  }

  let digitalCopyPermitted = false;
  let fourChannelAudio = false;
  let preEmphasisEnabled = false;
  let scms = false;

  let encounteredFlagsCount = 0;
  let token = tokens.eatString(TokenKind.Unquoted);
  while (token?.value) {
    encounteredFlagsCount += 1;
    switch (token.value) {
      case "DCP":
        digitalCopyPermitted = true;
        break;
      case "4CH":
        fourChannelAudio = true;
        break;
      case "PRE":
        preEmphasisEnabled = true;
        break;
      case "SCMS":
        scms = true;
        break;
      default:
        context.raise(ErrorKind.UnknownFlag, token);
    }

    // Flags can't be more than 4,
    // but make sure report error only once.
    if (encounteredFlagsCount === 5) {
      context.raise(ErrorKind.TooManyFlags, token);
    }

    token = tokens.eatString(TokenKind.Unquoted);
  }

  if (encounteredFlagsCount === 0) {
    context.raise(ErrorKind.NoFlags, tokens.getCurrentLocation());
  }

  context.sheet.flags = {
    digitalCopyPermitted,
    fourChannelAudio,
    preEmphasisEnabled,
    scms,
  };
}

const RE_TIME = /^(\d{2,}):([0-5]\d):(\d{2})$/;

function parseIndex(tokens: TokenStream, context: Context): void {
  if (!context.state.currentTrack) {
    context.raise(ErrorKind.CurrentTrackRequired, context.state.commandToken);
    return;
  }

  const indexNumberToken = tokens.expectString(TokenKind.Unquoted);
  const number = Number.parseInt(indexNumberToken.value);
  if (number < 0 || number > 99 || Number.isNaN(number)) {
    context.raise(ErrorKind.InvalidIndexNumberRange, indexNumberToken);
  }

  const previousIndex = context.state.currentTrack.indexes.at(-1);
  if (previousIndex && previousIndex.number !== number - 1) {
    context.raise(ErrorKind.InvalidIndexNumberSequence, indexNumberToken);
  }

  const indexTimeToken = tokens.expectString(TokenKind.Unquoted);
  const matches = RE_TIME.exec(indexTimeToken.value);
  if (!matches) {
    context.raise(ErrorKind.InvalidTimeFormat, indexTimeToken);
    context.state.currentTrack.indexes.push({
      number,
      startingTime: [0, 0, 0],
    });
    return;
  }

  const startingTime: [number, number, number] = [
    Number.parseInt(matches[1]),
    Number.parseInt(matches[2]),
    Number.parseInt(matches[3]),
  ];

  const isFirstIndex = context.state.currentTrack.indexes.length === 0;
  if (isFirstIndex) {
    if (number !== 0 && number !== 1) {
      context.raise(ErrorKind.InvalidFirstIndexNumber, indexNumberToken);
    }
    if (
      /* current track is first track of a file */
      context.sheet.files.at(-1)?.tracks.length === 0 &&
      (startingTime[0] !== 0 || startingTime[1] !== 0 || startingTime[2] !== 0)
    ) {
      context.raise(ErrorKind.InvalidFirstIndexTime, indexTimeToken);
    }
  }

  if (startingTime[2] > 74) {
    context.raise(ErrorKind.FramesTooLarge, indexTimeToken);
  }

  context.state.currentTrack.indexes.push({ number, startingTime });
}

const RE_ISRC = /^[a-z0-9]{5}\d{7}$/i;

function parseISRC(
  tokens: TokenStream,
  context: Context,
): void {
  const { parsedCommand } = context.state;
  if (
    !(parsedCommand & ParsedCommand.TRACK) ||
    parsedCommand & ParsedCommand.INDEX
  ) {
    context.raise(
      ErrorKind.InvalidISRCCommandLocation,
      context.state.commandToken,
    );
  }

  const token = tokens.expectString(TokenKind.Unquoted);
  const isrc = token.value;
  if (!RE_ISRC.test(isrc)) {
    context.raise(ErrorKind.InvalidISRCFormat, token);
  }

  if (context.state.currentTrack) {
    context.state.currentTrack.isrc = isrc;
  }
}

function parsePerformer(tokens: TokenStream, context: Context): void {
  const token = tokens.eatString();
  if (!token) {
    context.raise(ErrorKind.MissingArguments, tokens.getCurrentLocation());
    return;
  }

  if (token.value.length > 80) {
    context.raise(ErrorKind.TooLongPerformer, token);
  }

  if (context.state.currentTrack) {
    context.state.currentTrack.performer = token.value;
  } else {
    context.sheet.performer = token.value;
  }
}

function parsePostGap(tokens: TokenStream, context: Context): void {
  if (!context.state.currentTrack) {
    context.raise(ErrorKind.CurrentTrackRequired, context.state.commandToken);
    return;
  }
  if (!(context.state.parsedCommand & ParsedCommand.INDEX)) {
    context.raise(
      ErrorKind.InvalidPostGapCommandLocation,
      context.state.commandToken,
    );
  }
  if (context.state.parsedCommand & ParsedCommand.POSTGAP) {
    context.raise(
      ErrorKind.DuplicatedPostGapCommand,
      context.state.commandToken,
    );
  }

  const token = tokens.expectString(TokenKind.Unquoted);
  const matches = RE_TIME.exec(token.value);
  if (matches) {
    const postGap: Track["postGap"] = [
      Number.parseInt(matches[1]),
      Number.parseInt(matches[2]),
      Number.parseInt(matches[3]),
    ];

    if (postGap[2] > 74) {
      context.raise(ErrorKind.FramesTooLarge, token);
    }

    context.state.currentTrack.postGap = postGap;
  } else {
    context.raise(ErrorKind.InvalidTimeFormat, token);
  }
}

function parsePreGap(tokens: TokenStream, context: Context): void {
  if (!context.state.currentTrack) {
    context.raise(ErrorKind.CurrentTrackRequired, context.state.commandToken);
    return;
  }
  if (context.state.parsedCommand & ParsedCommand.INDEX) {
    context.raise(
      ErrorKind.InvalidPreGapCommandLocation,
      context.state.commandToken,
    );
  }
  if (context.state.parsedCommand & ParsedCommand.PREGAP) {
    context.raise(
      ErrorKind.DuplicatedPreGapCommand,
      context.state.commandToken,
    );
  }

  const token = tokens.expectString(TokenKind.Unquoted);
  const matches = RE_TIME.exec(token.value);
  if (matches) {
    const preGap: Track["preGap"] = [
      Number.parseInt(matches[1]),
      Number.parseInt(matches[2]),
      Number.parseInt(matches[3]),
    ];

    if (preGap[2] > 74) {
      context.raise(ErrorKind.FramesTooLarge, token);
    }

    context.state.currentTrack.preGap = preGap;
  } else {
    context.raise(ErrorKind.InvalidTimeFormat, token);
  }
}

function parseRem(tokens: TokenStream, context: Context): void {
  const commentParts: string[] = [];
  let token = tokens.eatString();
  while (token?.value) {
    commentParts.push(token.value);
    token = tokens.eatString();
  }

  context.sheet.comments.push(commentParts.join(" "));
}

function parseSongWriter(tokens: TokenStream, context: Context): void {
  const token = tokens.eatString();
  if (!token) {
    context.raise(ErrorKind.MissingArguments, tokens.getCurrentLocation());
    return;
  }

  const songWriter = token.value;
  if (songWriter.length > 80) {
    context.raise(ErrorKind.TooLongSongWriter, token);
  }

  if (context.state.currentTrack) {
    context.state.currentTrack.songWriter = songWriter;
  } else {
    context.sheet.songWriter = songWriter;
  }
}

function parseTitle(tokens: TokenStream, context: Context): void {
  const token = tokens.eatString();
  if (!token) {
    context.raise(ErrorKind.MissingArguments, tokens.getCurrentLocation());
    return;
  }

  const title = token.value;
  if (title.length > 80) {
    context.raise(ErrorKind.TooLongTitle, token);
  }

  if (context.state.currentTrack) {
    context.state.currentTrack.title = title;
  } else {
    context.sheet.title = title;
  }
}

function parseTrack(tokens: TokenStream, context: Context): void {
  const { state } = context;
  state.parsedCommand &= ~ParsedCommand.TITLE;
  state.parsedCommand &= ~ParsedCommand.PERFORMER;
  state.parsedCommand &= ~ParsedCommand.SONGWRITER;
  state.parsedCommand &= ~ParsedCommand.INDEX;
  state.parsedCommand &= ~ParsedCommand.PREGAP;
  state.parsedCommand &= ~ParsedCommand.POSTGAP;
  state.parsedCommand &= ~ParsedCommand.ISRC;

  const previousTrack = state.currentTrack;
  if (previousTrack) {
    context.sheet.files.at(-1)?.tracks.push(previousTrack);
  }

  const trackNumberToken = tokens.expectString(TokenKind.Unquoted);
  const trackNumber = Number.parseInt(trackNumberToken.value);
  if (trackNumber < 1 || trackNumber > 99) {
    context.raise(ErrorKind.InvalidTrackNumberRange, trackNumberToken);
  }

  if (previousTrack && previousTrack.trackNumber !== trackNumber - 1) {
    context.raise(ErrorKind.InvalidTrackNumberSequence, trackNumberToken);
  }

  const dataTypeToken = tokens.expectString(TokenKind.Unquoted);
  const dataType = (() => {
    switch (dataTypeToken.value.toUpperCase()) {
      case "AUDIO":
        return TrackDataType["AUDIO"];
      case "CDG":
        return TrackDataType["CDG"];
      case "MODE1/2048":
        return TrackDataType["MODE1/2048"];
      case "MODE1/2352":
        return TrackDataType["MODE1/2352"];
      case "MODE2/2336":
        return TrackDataType["MODE2/2336"];
      case "MODE2/2352":
        return TrackDataType["MODE2/2352"];
      case "CDI/2336":
        return TrackDataType["CDI/2336"];
      case "CDI/2352":
        return TrackDataType["CDI/2352"];
      default:
        return TrackDataType.Unknown;
    }
  })();
  if (dataType === TrackDataType.Unknown) {
    context.raise(ErrorKind.UnknownTrackDataType, dataTypeToken);
  }

  context.state.currentTrack = { trackNumber, dataType, indexes: [] };
}
