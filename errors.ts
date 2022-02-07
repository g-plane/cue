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
  InvalidIndexTimeFormat,
  InvalidISRCCommandLocation,
  InvalidISRCFormat,
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
    case ErrorKind.InvalidIndexTimeFormat:
      return "Index time format must be 'mm:ss:ff'.";
    case ErrorKind.InvalidISRCCommandLocation:
      return "'ISRC' command must be specified after a 'TRACK' command, but before any 'INDEX' commands.";
    case ErrorKind.InvalidISRCFormat:
      return "Invalid ISRC format.";
  }
}
