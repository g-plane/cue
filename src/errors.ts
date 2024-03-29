import type { Position } from './types.js'

export enum ErrorKind {
  Reserved,
  UnterminatedQuotedString,
  ExpectLineBreak,
  ExpectTokenEOF,
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
  InvalidIndexNumberSequence,
  InvalidTimeFormat,
  FramesTooLarge,
  InvalidFirstIndexNumber,
  InvalidFirstIndexTime,
  InvalidISRCCommandLocation,
  InvalidISRCFormat,
  TooLongPerformer,
  CurrentTrackRequired,
  InvalidPostGapCommandLocation,
  DuplicatedPostGapCommand,
  InvalidPreGapCommandLocation,
  DuplicatedPreGapCommand,
  TooLongSongWriter,
  TooLongTitle,
  InvalidTrackNumberRange,
  InvalidTrackNumberSequence,
  UnknownTrackDataType,
  TracksRequired,
  UnknownFlag,
}

export function translateErrorMessage(kind: ErrorKind): string {
  switch (kind) {
    case ErrorKind.Reserved:
      throw new TypeError('unreachable code')
    case ErrorKind.UnterminatedQuotedString:
      return "Quoted string isn't terminated."
    case ErrorKind.ExpectLineBreak:
      return 'Expect line break.'
    case ErrorKind.ExpectTokenEOF:
      return 'Expect end of file.'
    case ErrorKind.ExpectTokenUnquoted:
      return 'Expect an unquoted string.'
    case ErrorKind.ExpectTokenQuoted:
      return 'Expect a quoted string.'
    case ErrorKind.UnexpectedToken:
      return 'Unexpected token.'
    case ErrorKind.MissingArguments:
      return 'Missing arguments.'
    case ErrorKind.InvalidCatalogFormat:
      return 'Catalog must be 13 digits.'
    case ErrorKind.DuplicatedCatalog:
      return 'Catalog can appear only once in one cue sheet.'
    case ErrorKind.InvalidFileCommandLocation:
      return "'FILE' commands must appear before any other command, except 'CATALOG' and 'CDTEXTFILE'."
    case ErrorKind.UnknownFileType:
      return "Unknown file type. Only 'BINARY', 'MOTOROLA', 'AIFF', 'WAVE' and 'MP3' are allowed."
    case ErrorKind.InvalidFlagsCommandLocation:
      return "'FLAGS' command must appear after a 'TRACK' command, but before any 'INDEX' commands."
    case ErrorKind.DuplicatedFlagsCommand:
      return "'FLAGS' command can appear only once in each track."
    case ErrorKind.NoFlags:
      return "'FLAGS' command must specify at least one flag."
    case ErrorKind.TooManyFlags:
      return "Too many flags encountered. It can't have more than four flags."
    case ErrorKind.UnknownFlag:
      return "Unknown flag. Only 'DCP', '4CH', 'PRE' and 'SCMS' are allowed."
    case ErrorKind.InvalidIndexNumberRange:
      return 'Index number must be a number between 0 and 99. (inclusive)'
    case ErrorKind.InvalidIndexNumberSequence:
      return 'Index number must be sequential after previous indexes.'
    case ErrorKind.InvalidTimeFormat:
      return "Time format must be 'mm:ss:ff'."
    case ErrorKind.FramesTooLarge:
      return "Frames can't be greater than 74."
    case ErrorKind.InvalidFirstIndexNumber:
      return 'Number of first index must be 0 or 1.'
    case ErrorKind.InvalidFirstIndexTime:
      return 'First index of a file must start at 00:00:00.'
    case ErrorKind.InvalidISRCCommandLocation:
      return "'ISRC' command must be specified after a 'TRACK' command, but before any 'INDEX' commands."
    case ErrorKind.InvalidISRCFormat:
      return 'Invalid ISRC format.'
    case ErrorKind.TooLongPerformer:
      return 'Performer must have 1 to 80 characters.'
    case ErrorKind.CurrentTrackRequired:
      return 'This command must be under a specific track.'
    case ErrorKind.InvalidPostGapCommandLocation:
      return "'POSTGAP' command must appear after all 'INDEX' commands for the current track."
    case ErrorKind.DuplicatedPostGapCommand:
      return "Only one 'POSTGAP' command is allowed per track."
    case ErrorKind.InvalidPreGapCommandLocation:
      return "'PREGAP' command must appear before any 'INDEX' commands."
    case ErrorKind.DuplicatedPreGapCommand:
      return "Only one 'PREGAP' command is allowed per track."
    case ErrorKind.TooLongSongWriter:
      return 'Song writer must have 1 to 80 characters.'
    case ErrorKind.TooLongTitle:
      return 'Title must have 1 to 80 characters.'
    case ErrorKind.InvalidTrackNumberRange:
      return 'Track number range must be from 1 to 99.'
    case ErrorKind.InvalidTrackNumberSequence:
      return 'Track number must be sequential after previous tracks.'
    case ErrorKind.UnknownTrackDataType:
      return 'Unknown track data type.'
    case ErrorKind.TracksRequired:
      return 'At least one track is required.'
  }
}

export class ParsingError extends Error {
  constructor(public kind: ErrorKind, public position: Position) {
    super(
      `${translateErrorMessage(kind)} (${position.line}:${position.column})`
    )
  }
}
