export interface CueSheeet {
  catalog?: string;
  CDTextFile?: string;
  file?: File;
  flags?: Flags;
  isrc?: string;
  title?: string;
  performer?: string;
  songWriter?: string;
  tracks: Track[];
  comments: string[];
}

export interface File {
  name: string;
  type: FileType;
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
  digitalCopyPermitted: boolean;
  fourChannelAudio: boolean;
  preEmphasisEnabled: boolean;
  /** Serial Copy Management System */
  scms: boolean;
}

export interface Index {
  number: number;
  startingTime: [number, number, number];
}

export interface Track {
  trackNumber: number;
  dataType: TrackDataType;
  title?: string;
  performer?: string;
  songWriter?: string;
  index?: Index;
  preGap?: [number, number, number];
  postGap?: [number, number, number];
}

export enum TrackDataType {
  Unknown,
  "AUDIO",
  "CDG",
  "MODE1/2048",
  "MODE1/2352",
  "MODE2/2336",
  "MODE2/2352",
  "CDI/2336",
  "CDI/2352",
}
