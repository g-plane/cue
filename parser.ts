import { ErrorKind, translateErrorMessage } from "./errors.ts";
import { FileType } from "./types.ts";
import type { CueSheeet, Index, Track } from "./types.ts";

function stripBOM(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) {
    return text.slice(1);
  }

  return text;
}

enum TokenType {
  EOF,
  LineBreak,
  Unquoted,
  Quoted,
}

type BaseToken = { pos: number; line: number; column: number };
type TokenEOF = BaseToken & { type: TokenType.EOF };
type TokenLineBreak = BaseToken & { type: TokenType.LineBreak };
type TokenUnquoted = BaseToken & { type: TokenType.Unquoted; text: string };
type TokenQuoted = BaseToken & { type: TokenType.Quoted; text: string };

type Token = TokenEOF | TokenLineBreak | TokenUnquoted | TokenQuoted;

const RE_TOKENIZER = /(?:"(.*?)"|(\S+?))(?:[^\S\n]+|(?=\n)|$)|\n|\s+/g;

type TokenStream = Generator<Token, Token>;

export function* tokenize(source: string): TokenStream {
  let line = 1, linePos = -1;
  for (const matches of source.matchAll(RE_TOKENIZER)) {
    const index = matches.index!;
    const column = index - linePos;

    if (matches[0].charCodeAt(0) === 10) {
      yield { pos: index, line, column, type: TokenType.LineBreak };
      line += 1;
      linePos = index;
    } else if (matches[1] != null) {
      const text = matches[1];
      yield { pos: index, line, column, type: TokenType.Quoted, text };
    } else if (matches[2] != null) {
      const text = matches[2];
      yield { pos: index, line, column, type: TokenType.Unquoted, text };
    }
  }

  return {
    pos: source.length,
    line,
    column: source.length - linePos,
    type: TokenType.EOF,
  };
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
  skipLineBreak: boolean;
  commandToken: Token;
}

interface Context {
  sheet: CueSheeet;

  state: ParserState;

  /**
   * Raise a parsing error.
   */
  raise(
    kind: ErrorKind,
    errorAt: { pos: number; line: number; column: number },
  ): void;
}

function expectToken(
  tokens: TokenStream,
  type: TokenType.EOF,
  context: Context,
): TokenEOF;
function expectToken(
  tokens: TokenStream,
  type: TokenType.LineBreak,
  context: Context,
): TokenLineBreak;
function expectToken(
  tokens: TokenStream,
  type: TokenType.Unquoted,
  context: Context,
): TokenUnquoted;
function expectToken(
  tokens: TokenStream,
  type: TokenType.Quoted,
  context: Context,
): TokenQuoted;
function expectToken(
  tokens: TokenStream,
  type: TokenType,
  context: Context,
): Token {
  const token = tokens.next().value;
  if (token.type !== type) {
    switch (type) {
      case TokenType.EOF:
        context.raise(ErrorKind.ExpectTokenEOF, token);
        break;
      case TokenType.LineBreak:
        context.raise(ErrorKind.ExpectTokenLineBreak, token);
        return {
          pos: token.pos,
          line: token.line,
          column: token.column,
          type: TokenType.LineBreak,
        };
      case TokenType.Unquoted:
        context.raise(ErrorKind.ExpectTokenUnquoted, token);
        return {
          pos: token.pos,
          line: token.line,
          column: token.column,
          type: TokenType.Unquoted,
          text: "",
        };
      case TokenType.Quoted:
        context.raise(ErrorKind.ExpectTokenQuoted, token);
        return {
          pos: token.pos,
          line: token.line,
          column: token.column,
          type: TokenType.Quoted,
          text: "",
        };
    }
  }

  return token;
}

type ParsingError = { kind: ErrorKind; line: number; column: number };

interface ParserOptions {
  fatal?: boolean;
}

export function parse(source: string, options: ParserOptions = {}) {
  const tokens = tokenize(stripBOM(source));

  const errors: ParsingError[] = [];
  const raise: Context["raise"] = options.fatal
    ? ((kind, errorAt) => {
      throw new SyntaxError(
        `${translateErrorMessage(kind)} (${errorAt.line}:${errorAt.column})`,
        { cause: { kind, errorAt } },
      );
    })
    : ((kind, errorAt) => {
      errors.push({ kind, line: errorAt.line, column: errorAt.column });
    });

  const context: Context = {
    sheet: {
      comments: [],
    },
    state: {
      currentTrack: null,
      parsedCommand: 0,
      skipLineBreak: false,
      commandToken: null!,
    },
    raise,
  };

  while (true) {
    const next = tokens.next();
    const token = next.value;
    if (next.done || token.type === TokenType.EOF) {
      break;
    } else if (token.type === TokenType.Unquoted) {
      context.state.commandToken = token;
      parseCommand(token, tokens, context);

      if (context.state.skipLineBreak) {
        context.state.skipLineBreak = false;
      } else {
        let next = tokens.next();
        if (
          !next.done &&
          next.value.type !== TokenType.LineBreak &&
          next.value.type !== TokenType.EOF
        ) {
          context.raise(ErrorKind.UnexpectedToken, next.value);
        }

        while (
          !next.done &&
          next.value.type !== TokenType.LineBreak &&
          next.value.type !== TokenType.EOF
        ) {
          next = tokens.next();
        }
      }
    } else if (token.type === TokenType.LineBreak) {
      continue;
    } else {
      raise(ErrorKind.UnexpectedToken, token);
    }
  }

  return { sheet: context.sheet, errors };
}

function parseCommand(
  commandToken: TokenUnquoted,
  tokens: TokenStream,
  context: Context,
): void {
  const command = commandToken.text.toUpperCase();
  const commandEnumValue: number | undefined = Reflect.get(
    ParsedCommand,
    command,
  );
  if (commandEnumValue) {
    context.state.parsedCommand |= commandEnumValue;
  }

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
    case "ISRC":
      parseISRC(tokens, context);
      break;
    case "PERFORMER":
      parsePerformer(tokens, context);
      break;
    case "REM":
      parseRem(tokens, context);
      break;
    case "POSTGAP":
      parsePostGap(tokens, context);
      break;
    case "PREGAP":
      parsePreGap(tokens, context);
      break;
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

  const tokenCatalog = expectToken(tokens, TokenType.Unquoted, context);
  if (!RE_CATALOG.test(tokenCatalog.text)) {
    context.raise(ErrorKind.InvalidCatalogFormat, tokenCatalog);
  }

  context.sheet.catalog = tokenCatalog.text;
}

function parseCDTextFile(
  tokens: TokenStream,
  context: Context,
): void {
  const token = tokens.next().value;
  if (token.type === TokenType.Unquoted || token.type === TokenType.Quoted) {
    context.sheet.CDTextFile = token.text;
  } else {
    context.raise(ErrorKind.MissingArguments, token);
  }
}

function parseFile(
  tokens: TokenStream,
  context: Context,
): void {
  const { parsedCommand } = context.state;
  if (
    parsedCommand &&
    !(parsedCommand & ParsedCommand.CATALOG) &&
    !(parsedCommand & ParsedCommand.CDTEXTFILE)
  ) {
    context.raise(
      ErrorKind.InvalidFileCommandLocation,
      context.state.commandToken,
    );
  }

  const fileNameToken = tokens.next().value;
  if (
    fileNameToken.type !== TokenType.Unquoted &&
    fileNameToken.type !== TokenType.Quoted
  ) {
    context.raise(ErrorKind.MissingArguments, fileNameToken);
    return;
  }

  const fileTypeToken = expectToken(tokens, TokenType.Unquoted, context);
  const fileType = (() => {
    switch (fileTypeToken.text.toUpperCase()) {
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

  context.sheet.file = { name: fileNameToken.text, type: fileType };
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
  while (true) {
    const token = tokens.next().value;
    if (token.type === TokenType.Unquoted) {
      if (encounteredFlagsCount === 4) {
        context.raise(ErrorKind.TooManyFlags, token);
      } else {
        switch (token.text) {
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
        encounteredFlagsCount += 1;
      }
    } else if (
      token.type === TokenType.LineBreak || token.type === TokenType.EOF
    ) {
      if (encounteredFlagsCount === 0) {
        context.raise(ErrorKind.NoFlags, token);
      }

      context.state.skipLineBreak = true;

      context.sheet.flags = {
        digitalCopyPermitted,
        fourChannelAudio,
        preEmphasisEnabled,
        scms,
      };
    } else {
      context.raise(ErrorKind.UnexpectedToken, token);
    }
  }
}

const RE_TIME = /^\d{2}:\d{2}:\d{2}$/;

function parseIndex(tokens: TokenStream, context: Context): Index {
  const indexNumberToken = expectToken(tokens, TokenType.Unquoted, context);
  const number = Number.parseInt(indexNumberToken.text);
  if (number < 0 || number > 99) {
    context.raise(ErrorKind.InvalidIndexNumberRange, indexNumberToken);
  }

  const indexTimeToken = expectToken(tokens, TokenType.Unquoted, context);
  const matches = RE_TIME.exec(indexTimeToken.text);
  if (!matches) {
    context.raise(ErrorKind.InvalidTimeFormat, indexTimeToken);
    return {
      number,
      startingTime: [0, 0, 0],
    };
  }
  return {
    number,
    startingTime: [
      Number.parseInt(matches[1]),
      Number.parseInt(matches[2]),
      Number.parseInt(matches[3]),
    ],
  };
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

  const token = expectToken(tokens, TokenType.Unquoted, context);
  const isrc = token.text;
  if (!RE_ISRC.test(isrc)) {
    context.raise(ErrorKind.InvalidISRCFormat, token);
  }

  context.sheet.isrc = isrc;
}

function parsePerformer(tokens: TokenStream, context: Context): void {
  const token = tokens.next().value;
  if (token.type !== TokenType.Unquoted && token.type !== TokenType.Quoted) {
    context.raise(ErrorKind.MissingArguments, token);
    return;
  }

  if (context.state.currentTrack) {
    context.state.currentTrack.performer = token.text;
  } else {
    context.sheet.performer = token.text;
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

  const token = expectToken(tokens, TokenType.Unquoted, context);
  const matches = RE_TIME.exec(token.text);
  if (matches) {
    context.state.currentTrack.postGap = [
      Number.parseInt(matches[1]),
      Number.parseInt(matches[2]),
      Number.parseInt(matches[3]),
    ];
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

  const token = expectToken(tokens, TokenType.Unquoted, context);
  const matches = RE_TIME.exec(token.text);
  if (matches) {
    context.state.currentTrack.preGap = [
      Number.parseInt(matches[1]),
      Number.parseInt(matches[2]),
      Number.parseInt(matches[3]),
    ];
  } else {
    context.raise(ErrorKind.InvalidTimeFormat, token);
  }
}

function parseRem(tokens: TokenStream, context: Context): void {
  const commentParts: string[] = [];
  let token = tokens.next().value;
  while (token.type === TokenType.Unquoted || token.type === TokenType.Quoted) {
    commentParts.push(token.text);
    token = tokens.next().value;
  }

  context.state.skipLineBreak = true;
  context.sheet.comments.push(commentParts.join(" "));
}
