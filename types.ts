export type CueSheeet = {
  catalog?: string;
  CDTextFile?: string;
  file?: {
    name: string;
    type: FileType;
  };
};

export enum FileType {
  Binary,
  Motorola,
  Aiff,
  Wave,
  Mp3,
}
