export interface CueSheeet {
  catalog?: string;
  CDTextFile?: string;
  file?: File;
  flags?: Flags;
  isrc?: string;
  performer?: string;
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
  performer?: string;
}
