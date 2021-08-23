export type CueSheeet = {
  catalog?: string;
  CDTextFile?: string;
  file?: {
    name: string;
    type: FileType;
  };
  flags?: {
    digitalCopyPermitted: boolean;
    fourChannelAudio: boolean;
    preEmphasisEnabled: boolean;
    /** Serial Copy Management System */
    scms: boolean;
  };
};

export enum FileType {
  /** @internal This shouldn't be used in real world. */
  Unknown, // for tolerant parsing
  Binary,
  Motorola,
  Aiff,
  Wave,
  Mp3,
}
