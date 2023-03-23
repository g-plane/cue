export interface Position {
  pos: number
  line: number
  column: number
}

export interface CueSheet {
  catalog?: string
  CDTextFile?: string
  title?: string
  performer?: string
  songWriter?: string
  files: File[]
  comments: string[]
}

export interface File {
  name: string
  type: FileType
  tracks: Track[]
}

export enum FileType {
  /** @internal This shouldn't be used in real world. */
  Unknown, // for tolerant parsing
  Binary,
  Motorola,
  Aiff,
  Wave,
  Mp3,
}

export interface Flags {
  digitalCopyPermitted: boolean
  fourChannelAudio: boolean
  preEmphasisEnabled: boolean
  /** Serial Copy Management System */
  scms: boolean
}

export interface Index {
  number: number
  startingTime: [number, number, number]
}

export interface Track {
  trackNumber: number
  dataType: TrackDataType
  title?: string
  performer?: string
  songWriter?: string
  flags?: Flags
  indexes: Index[]
  isrc?: string
  preGap?: [number, number, number]
  postGap?: [number, number, number]
}

export enum TrackDataType {
  /** @internal */
  Unknown,
  Audio,
  Cdg,
  'Mode1/2048',
  'Mode1/2352',
  'Mode2/2336',
  'Mode2/2352',
  'Cdi/2336',
  'Cdi/2352',
}
