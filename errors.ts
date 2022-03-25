import type { Location } from "./types.ts";

export enum ErrorKind {
  Reserved,
  ExpectTokenEOF,
  ExpectTokenLineBreak,
  ExpectTokenUnquoted,
  ExpectTokenQuoted,
  UnexpectedToken,
  MissingArguments,
  InvalidCatalogFormat,
  DuplicatedCatalog,
  InvalidFileCommandLocation,
  UnknownFileType,
  InvalidFlagsCommandLocation,
  DuplicatedFlagsCommand,
  NoFlags,
  TooManyFlags,
  InvalidIndexNumberRange,
  InvalidTimeFormat,
  InvalidISRCCommandLocation,
  InvalidISRCFormat,
  CurrentTrackRequired,
  InvalidPostGapCommandLocation,
  DuplicatedPostGapCommand,
  InvalidPreGapCommandLocation,
  DuplicatedPreGapCommand,
  InvalidTrackNumberRange,
  UnknownTrackDataType,
  UnknownFlag,
}

export function translateErrorMessage(kind: ErrorKind): string {
  switch (kind) {
    case ErrorKind.Reserved:
      throw new TypeError("unreachable code");
    case ErrorKind.ExpectTokenEOF:
      return "Expect end of file.";
    case ErrorKind.ExpectTokenLineBreak:
      return "Expect line break.";
    case ErrorKind.ExpectTokenUnquoted:
      return "Expect an unquoted string.";
    case ErrorKind.ExpectTokenQuoted:
      return "Expect a quoted string.";
    case ErrorKind.UnexpectedToken:
      return "Unexpected token.";
    case ErrorKind.MissingArguments:
      return "Missing arguments.";
    case ErrorKind.InvalidCatalogFormat:
      return "Catalog must be 13 digits.";
    case ErrorKind.DuplicatedCatalog:
      return "Catalog can appear only once in one cue sheet.";
    case ErrorKind.InvalidFileCommandLocation:
      return "'FILE' commands must appear before any other command, except 'CATALOG' and 'CDTEXTFILE'.";
    case ErrorKind.UnknownFileType:
      return "Unknown file type. Only 'BINARY', 'MOTOROLA', 'AIFF', 'WAVE' and 'MP3' are allowed.";
    case ErrorKind.InvalidFlagsCommandLocation:
      return "'FLAGS' command must appear after a 'TRACK' command, but before any 'INDEX' commands.";
    case ErrorKind.DuplicatedFlagsCommand:
      return "'FLAGS' command can appear only once in each track.";
    case ErrorKind.NoFlags:
      return "'FLAGS' command must specify at least one flag.";
    case ErrorKind.TooManyFlags:
      return "Too many flags encountered. It can't have more than four flags.";
    case ErrorKind.UnknownFlag:
      return "Unknown flag. Only 'DCP', '4CH', 'PRE' and 'SCMS' are allowed.";
    case ErrorKind.InvalidIndexNumberRange:
      return "Index number range must be from 0 to 99.";
    case ErrorKind.InvalidTimeFormat:
      return "Time format must be 'mm:ss:ff'.";
    case ErrorKind.InvalidISRCCommandLocation:
      return "'ISRC' command must be specified after a 'TRACK' command, but before any 'INDEX' commands.";
    case ErrorKind.InvalidISRCFormat:
      return "Invalid ISRC format.";
    case ErrorKind.CurrentTrackRequired:
      return "This command must be under a specific track.";
    case ErrorKind.InvalidPostGapCommandLocation:
      return "'POSTGAP' command must appear after all 'INDEX' commands for the current track.";
    case ErrorKind.DuplicatedPostGapCommand:
      return "Only one 'POSTGAP' command is allowed per track.";
    case ErrorKind.InvalidPreGapCommandLocation:
      return "'PREGAP' command must appear before any 'INDEX' commands.";
    case ErrorKind.DuplicatedPreGapCommand:
      return "Only one 'PREGAP' command is allowed per track.";
    case ErrorKind.InvalidTrackNumberRange:
      return "Track number range must be from 1 to 99.";
    case ErrorKind.UnknownTrackDataType:
      return "Unknown track data type.";
  }
}

export class ParsingError extends Error {
  constructor(public kind: ErrorKind, public errorAt: Location) {
    super(`${translateErrorMessage(kind)} (${errorAt.line}:${errorAt.column})`);
  }
}
