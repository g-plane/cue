export type CueSheeet = {
  catalog?: string;
  CDTextFile?: string;
  file?: {
    name: string;
    type: FileType;
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
