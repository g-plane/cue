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
  UnknownFileType,
}

export function translateErrorMessage(kind: ErrorKind): string {
  switch (kind) {
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
    case ErrorKind.UnknownFileType:
      return "Unknown file type. Only 'BINARY', 'MOTOROLA', 'AIFF', 'WAVE' and 'MP3' are allowed.";
    default:
      return "(unknown error)";
  }
}
