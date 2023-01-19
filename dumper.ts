import { FileType, TrackDataType } from "./types.ts";
import type { CueSheet } from "./types.ts";

export interface DumperOptions {
  lineBreak?: "\n" | "\r\n";
  indentKind?: " " | "\t";
  indentSize?: number;
}

export function dump(sheet: CueSheet, options: DumperOptions = {}): string {
  const { lineBreak = "\n", indentKind = " ", indentSize = 2 } = options;

  let indentLevel = 0;
  let output = "";

  if (sheet.catalog) {
    output += createLine(`CATALOG ${sheet.catalog}`);
  }
  if (sheet.CDTextFile) {
    output += createLine(`CDTEXTFILE ${quote(sheet.CDTextFile)}`);
  }
  if (sheet.title) {
    output += createLine(`TITLE ${quote(sheet.title)}`);
  }
  if (sheet.performer) {
    output += createLine(`PERFORMER ${quote(sheet.performer)}`);
  }
  if (sheet.songWriter) {
    output += createLine(`SONGWRITER ${quote(sheet.songWriter)}`);
  }

  output += sheet.files.map((file) => {
    let fileOutput = createLine(
      `FILE ${quote(file.name)} ${FileType[file.type].toUpperCase()}`,
    );

    indentLevel += 1;
    fileOutput += file.tracks.map((track) => {
      let trackOutput = createLine(
        `TRACK ${track.trackNumber} ${
          TrackDataType[track.dataType].toUpperCase()
        }`,
      );

      indentLevel += 1;
      if (track.title) {
        trackOutput += createLine(`TITLE ${quote(track.title)}`);
      }
      if (track.performer) {
        trackOutput += createLine(`PERFORMER ${quote(track.performer)}`);
      }
      if (track.songWriter) {
        trackOutput += createLine(`SONGWRITER ${quote(track.songWriter)}`);
      }
      if (track.isrc) {
        trackOutput += createLine(`ISRC ${track.isrc}`);
      }
      if (track.preGap) {
        trackOutput += createLine(`PREGAP ${stringifyTime(track.preGap)}`);
      }
      trackOutput += track.indexes.map((index) => {
        return createLine(
          `INDEX ${stringifyNumber(index.number)} ${
            stringifyTime(index.startingTime)
          }`,
        );
      }).join("");
      if (track.postGap) {
        trackOutput += createLine(`POSTGAP ${stringifyTime(track.postGap)}`);
      }
      indentLevel -= 1;

      return trackOutput;
    }).join("");
    indentLevel -= 1;

    return fileOutput;
  }).join(lineBreak);

  function createLine(text: string): string {
    const indent = indentKind === "\t"
      ? indentKind
      : indentKind.repeat(indentLevel * indentSize);
    return indent + text + lineBreak;
  }

  return output;
}

function stringifyNumber(value: number): string {
  return value.toString().padStart(2, "0");
}

function stringifyTime(time: [number, number, number]): string {
  return stringifyNumber(time[0]) + ":" + stringifyNumber(time[1]) + ":" +
    stringifyNumber(time[2]);
}

function quote(text: string): string {
  return `"${text.replaceAll('"', '\\"')}"`;
}
