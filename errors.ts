export enum ErrorKind {
  Reserved,
  ExpectTokenEOF,
  ExpectTokenLineBreak,
  ExpectTokenUnquoted,
  ExpectTokenQuoted,
  ExpectEnding,
  InvalidCatalogFormat,
  DuplicatedCatalog,
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
    case ErrorKind.ExpectEnding:
      return "Expect line break or end of file.";
    case ErrorKind.InvalidCatalogFormat:
      return "Catalog must be 13 digits.";
    case ErrorKind.DuplicatedCatalog:
      return "Catalog can appear only once in one cue sheet.";
    default:
      return "(unknown error)";
  }
}
