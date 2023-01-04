import { assertEquals } from "https://deno.land/std@0.170.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.170.0/testing/bdd.ts";
import { ErrorKind } from "./errors.ts";
import { parse } from "./parser.ts";
import { FileType, TrackDataType } from "./types.ts";

describe("CATALOG command", () => {
  it("parse valid catalog", () => {
    assertEquals(parse(`CATALOG 1234567890123`), {
      sheet: { catalog: "1234567890123", tracks: [], comments: [] },
      errors: [],
    });

    assertEquals(parse(`catalog 1234567890123`), {
      sheet: { catalog: "1234567890123", tracks: [], comments: [] },
      errors: [],
    });

    assertEquals(parse(`Catalog 1234567890123`), {
      sheet: { catalog: "1234567890123", tracks: [], comments: [] },
      errors: [],
    });
  });

  it("invalid catalog format", () => {
    const { sheet: sheet1, errors: [error1] } = parse(`CATALOG abcdefghijklm`);
    assertEquals(sheet1, {
      catalog: "abcdefghijklm",
      tracks: [],
      comments: [],
    });
    assertEquals(error1.kind, ErrorKind.InvalidCatalogFormat);
    assertEquals(error1.position.line, 1);
    assertEquals(error1.position.column, 9);

    const { sheet: sheet2, errors: [error2] } = parse(`CATALOG 1234`);
    assertEquals(sheet2, { catalog: "1234", tracks: [], comments: [] });
    assertEquals(error2.kind, ErrorKind.InvalidCatalogFormat);
    assertEquals(error2.position.line, 1);
    assertEquals(error2.position.column, 9);
  });

  it("duplicated catalog", () => {
    const source = `CATALOG 1234567890123
CATALOG 0987654321098`;

    const { sheet, errors: [error] } = parse(source);
    assertEquals(sheet, { catalog: "0987654321098", tracks: [], comments: [] });
    assertEquals(error.kind, ErrorKind.DuplicatedCatalog);
    assertEquals(error.position.line, 2);
    assertEquals(error.position.column, 1);
  });

  it("missing catalog argument", () => {
    const { sheet, errors: [error] } = parse(`CATALOG`);
    assertEquals(sheet, { tracks: [], comments: [] });
    assertEquals(error.kind, ErrorKind.ExpectTokenUnquoted);
    assertEquals(error.position.line, 1);
    assertEquals(error.position.column, 8);
  });
});

describe("CDTEXTFILE command", () => {
  it("parse valid CD Text File", () => {
    assertEquals(parse(`CDTEXTFILE C:\\a.cdt`), {
      sheet: { CDTextFile: "C:\\a.cdt", tracks: [], comments: [] },
      errors: [],
    });

    assertEquals(parse(`cdtextfile /mnt/c/a.cdt`), {
      sheet: { CDTextFile: "/mnt/c/a.cdt", tracks: [], comments: [] },
      errors: [],
    });

    assertEquals(
      parse(`CdTextFile "C:\\Documents and Settings\\Administrator\\a.cdt"`),
      {
        sheet: {
          CDTextFile: "C:\\Documents and Settings\\Administrator\\a.cdt",
          tracks: [],
          comments: [],
        },
        errors: [],
      },
    );
  });

  it("missing CD Text File argument", () => {
    const { sheet, errors: [error] } = parse(`CDTEXTFILE `);
    assertEquals(sheet, { tracks: [], comments: [] });
    assertEquals(error.kind, ErrorKind.MissingArguments);
    assertEquals(error.position.line, 1);
    assertEquals(error.position.column, 12);
  });
});

describe("FILE command", () => {
  it("parse valid FILE command", () => {
    assertEquals(parse(`FILE audio.iso BINARY`), {
      sheet: {
        file: { name: "audio.iso", type: FileType.Binary },
        tracks: [],
        comments: [],
      },
      errors: [],
    });

    assertEquals(parse(`FILE audio.motorola MOTOROLA`), {
      sheet: {
        file: { name: "audio.motorola", type: FileType.Motorola },
        tracks: [],
        comments: [],
      },
      errors: [],
    });

    assertEquals(parse(`FILE audio.aiff AIFF`), {
      sheet: {
        file: { name: "audio.aiff", type: FileType.Aiff },
        tracks: [],
        comments: [],
      },
      errors: [],
    });

    assertEquals(parse(`FILE audio.wav WAVE`), {
      sheet: {
        file: { name: "audio.wav", type: FileType.Wave },
        tracks: [],
        comments: [],
      },
      errors: [],
    });

    assertEquals(parse(`FILE audio.mp3 MP3`), {
      sheet: {
        file: { name: "audio.mp3", type: FileType.Mp3 },
        tracks: [],
        comments: [],
      },
      errors: [],
    });

    assertEquals(parse(`File C:\\audio.iso Binary`), {
      sheet: {
        file: { name: "C:\\audio.iso", type: FileType.Binary },
        tracks: [],
        comments: [],
      },
      errors: [],
    });

    assertEquals(parse(`file "C:\\wonderful audio.iso" binary`), {
      sheet: {
        file: { name: "C:\\wonderful audio.iso", type: FileType.Binary },
        tracks: [],
        comments: [],
      },
      errors: [],
    });
  });

  it("missing file name argument", () => {
    const { sheet, errors: [error] } = parse(`FILE `);
    assertEquals(sheet, { tracks: [], comments: [] });
    assertEquals(error.kind, ErrorKind.MissingArguments);
    assertEquals(error.position.line, 1);
    assertEquals(error.position.column, 6);
  });

  it("missing file type argument", () => {
    const { sheet, errors } = parse(`FILE audio.wav`);
    assertEquals(sheet, {
      file: { name: "audio.wav", type: FileType.Unknown },
      tracks: [],
      comments: [],
    });
    assertEquals(errors[0].kind, ErrorKind.ExpectTokenUnquoted);
    assertEquals(errors[0].position.line, 1);
    assertEquals(errors[0].position.column, 15);
    assertEquals(errors[1].kind, ErrorKind.UnknownFileType);
    assertEquals(errors[1].position.line, 1);
    assertEquals(errors[1].position.column, 15);
  });

  it("invalid file type argument", () => {
    const { sheet, errors: [error] } = parse(`FILE audio.wav WAV`);
    assertEquals(sheet, {
      file: { name: "audio.wav", type: FileType.Unknown },
      tracks: [],
      comments: [],
    });
    assertEquals(error.kind, ErrorKind.UnknownFileType);
    assertEquals(error.position.line, 1);
    assertEquals(error.position.column, 16);
  });

  it("disallow multiple commands on the same line", () => {
    const { sheet, errors: [error] } = parse(
      `CDTEXTFILE cdt.cdt FILE audio.wav WAV`,
    );
    assertEquals(sheet, {
      CDTextFile: "cdt.cdt",
      file: { name: "audio.wav", type: FileType.Unknown },
      tracks: [],
      comments: [],
    });
    assertEquals(error.kind, ErrorKind.ExpectLineBreak);
    assertEquals(error.position.line, 1);
    assertEquals(error.position.column, 20);
  });
});

describe("FLAGS command", () => {
  it("parse valid FLAGS command", () => {
    assertEquals(parse(`TRACK 20 AUDIO\nFLAGS DCP`), {
      sheet: {
        flags: {
          digitalCopyPermitted: true,
          fourChannelAudio: false,
          preEmphasisEnabled: false,
          scms: false,
        },
        tracks: [
          { dataType: TrackDataType.AUDIO, indexes: [], trackNumber: 20 },
        ],
        comments: [],
      },
      errors: [],
    });

    assertEquals(parse(`TRACK 20 AUDIO\nFLAGS 4CH\n`), {
      sheet: {
        flags: {
          digitalCopyPermitted: false,
          fourChannelAudio: true,
          preEmphasisEnabled: false,
          scms: false,
        },
        tracks: [
          { dataType: TrackDataType.AUDIO, indexes: [], trackNumber: 20 },
        ],
        comments: [],
      },
      errors: [],
    });

    assertEquals(parse(`TRACK 20 AUDIO\nFLAGS PRE\n`), {
      sheet: {
        flags: {
          digitalCopyPermitted: false,
          fourChannelAudio: false,
          preEmphasisEnabled: true,
          scms: false,
        },
        tracks: [
          { dataType: TrackDataType.AUDIO, indexes: [], trackNumber: 20 },
        ],
        comments: [],
      },
      errors: [],
    });

    assertEquals(parse(`TRACK 20 AUDIO\nFLAGS SCMS\n`), {
      sheet: {
        flags: {
          digitalCopyPermitted: false,
          fourChannelAudio: false,
          preEmphasisEnabled: false,
          scms: true,
        },
        tracks: [
          { dataType: TrackDataType.AUDIO, indexes: [], trackNumber: 20 },
        ],
        comments: [],
      },
      errors: [],
    });

    assertEquals(parse(`TRACK 20 AUDIO\nFLAGS DCP PRE SCMS 4CH\n`), {
      sheet: {
        flags: {
          digitalCopyPermitted: true,
          fourChannelAudio: true,
          preEmphasisEnabled: true,
          scms: true,
        },
        tracks: [
          { dataType: TrackDataType.AUDIO, indexes: [], trackNumber: 20 },
        ],
        comments: [],
      },
      errors: [],
    });
  });

  it("unknown flag", () => {
    const { sheet, errors: [error] } = parse(`TRACK 20 AUDIO\nFLAGS ABC\n`);
    assertEquals(sheet, {
      flags: {
        digitalCopyPermitted: false,
        fourChannelAudio: false,
        preEmphasisEnabled: false,
        scms: false,
      },
      tracks: [
        { dataType: TrackDataType.AUDIO, indexes: [], trackNumber: 20 },
      ],
      comments: [],
    });
    assertEquals(error.kind, ErrorKind.UnknownFlag);
    assertEquals(error.position.line, 2);
    assertEquals(error.position.column, 7);
  });

  it("unknown flag with parsed known flag", () => {
    const { sheet, errors: [error] } = parse(
      `TRACK 20 AUDIO\nFLAGS SCMS ABC\n`,
    );
    assertEquals(sheet, {
      flags: {
        digitalCopyPermitted: false,
        fourChannelAudio: false,
        preEmphasisEnabled: false,
        scms: true,
      },
      tracks: [
        { dataType: TrackDataType.AUDIO, indexes: [], trackNumber: 20 },
      ],
      comments: [],
    });
    assertEquals(error.kind, ErrorKind.UnknownFlag);
    assertEquals(error.position.line, 2);
    assertEquals(error.position.column, 12);
  });

  it("flag should be case-sensitive", () => {
    const { sheet, errors: [error] } = parse(`TRACK 20 AUDIO\nFLAGS pre\n`);
    assertEquals(sheet, {
      flags: {
        digitalCopyPermitted: false,
        fourChannelAudio: false,
        preEmphasisEnabled: false,
        scms: false,
      },
      tracks: [
        { dataType: TrackDataType.AUDIO, indexes: [], trackNumber: 20 },
      ],
      comments: [],
    });
    assertEquals(error.kind, ErrorKind.UnknownFlag);
    assertEquals(error.position.line, 2);
    assertEquals(error.position.column, 7);
  });

  it("too many flags", () => {
    const { sheet, errors: [error] } = parse(
      `TRACK 20 AUDIO\nFLAGS 4CH PRE SCMS DCP 4CH\n`,
    );
    assertEquals(sheet, {
      flags: {
        digitalCopyPermitted: true,
        fourChannelAudio: true,
        preEmphasisEnabled: true,
        scms: true,
      },
      tracks: [
        { dataType: TrackDataType.AUDIO, indexes: [], trackNumber: 20 },
      ],
      comments: [],
    });
    assertEquals(error.kind, ErrorKind.TooManyFlags);
    assertEquals(error.position.line, 2);
    assertEquals(error.position.column, 24);
  });

  it("duplicated FLAGS command", () => {
    const { sheet, errors: [error] } = parse(
      `TRACK 20 AUDIO\nFLAGS 4CH\nFLAGS DCP\n`,
    );
    assertEquals(sheet, {
      flags: {
        digitalCopyPermitted: true,
        // latter `FLAGS` command will override former `FLAGS` command
        fourChannelAudio: false,
        preEmphasisEnabled: false,
        scms: false,
      },
      tracks: [
        { dataType: TrackDataType.AUDIO, indexes: [], trackNumber: 20 },
      ],
      comments: [],
    });
    assertEquals(error.kind, ErrorKind.DuplicatedFlagsCommand);
    assertEquals(error.position.line, 3);
    assertEquals(error.position.column, 1);
  });

  it("FLAGS command without arguments", () => {
    const { sheet, errors: [error] } = parse(
      `TRACK 20 AUDIO\nFLAGS\n`,
    );
    assertEquals(sheet, {
      flags: {
        digitalCopyPermitted: false,
        fourChannelAudio: false,
        preEmphasisEnabled: false,
        scms: false,
      },
      tracks: [
        { dataType: TrackDataType.AUDIO, indexes: [], trackNumber: 20 },
      ],
      comments: [],
    });
    assertEquals(error.kind, ErrorKind.NoFlags);
    assertEquals(error.position.line, 2);
    assertEquals(error.position.column, 6);
  });

  it("FLAGS command must come after TRACK command", () => {
    const { sheet, errors: [error] } = parse(
      `FLAGS PRE\n`,
    );
    assertEquals(sheet, {
      flags: {
        digitalCopyPermitted: false,
        fourChannelAudio: false,
        preEmphasisEnabled: true,
        scms: false,
      },
      tracks: [],
      comments: [],
    });
    assertEquals(error.kind, ErrorKind.InvalidFlagsCommandLocation);
    assertEquals(error.position.line, 1);
    assertEquals(error.position.column, 1);
  });

  it("FLAGS command must come before INDEX command", () => {
    const { sheet, errors: [error] } = parse(
      `TRACK 20 AUDIO\nINDEX 01 00:00:00\nFLAGS PRE\n`,
    );
    assertEquals(sheet, {
      flags: {
        digitalCopyPermitted: false,
        fourChannelAudio: false,
        preEmphasisEnabled: true,
        scms: false,
      },
      tracks: [{
        dataType: TrackDataType.AUDIO,
        indexes: [{ number: 1, startingTime: [0, 0, 0] }],
        trackNumber: 20,
      }],
      comments: [],
    });
    assertEquals(error.kind, ErrorKind.InvalidFlagsCommandLocation);
    assertEquals(error.position.line, 3);
    assertEquals(error.position.column, 1);
  });

  it("arguments can't be quoted", () => {
    const { sheet, errors: [error] } = parse(
      `TRACK 20 AUDIO\nFLAGS "PRE"\n`,
    );
    assertEquals(sheet, {
      flags: {
        digitalCopyPermitted: false,
        fourChannelAudio: false,
        preEmphasisEnabled: false,
        scms: false,
      },
      tracks: [
        { dataType: TrackDataType.AUDIO, indexes: [], trackNumber: 20 },
      ],
      comments: [],
    });
    assertEquals(error.kind, ErrorKind.NoFlags);
    assertEquals(error.position.line, 2);
    assertEquals(error.position.column, 12);
  });
});

describe("INDEX command", () => {
  it("parse valid INDEX command", () => {
    assertEquals(parse("TRACK 1 AUDIO\nINDEX 01 00:00:00"), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 1,
          dataType: TrackDataType.AUDIO,
          indexes: [{ number: 1, startingTime: [0, 0, 0] }],
        }],
      },
      errors: [],
    });

    assertEquals(
      parse("TRACK 1 AUDIO\nINDEX 00 00:00:00\nINDEX 01 123:45:56"),
      {
        sheet: {
          comments: [],
          tracks: [{
            trackNumber: 1,
            dataType: TrackDataType.AUDIO,
            indexes: [
              { number: 0, startingTime: [0, 0, 0] },
              { number: 1, startingTime: [123, 45, 56] },
            ],
          }],
        },
        errors: [],
      },
    );

    assertEquals(
      parse(`
      TRACK 1 AUDIO
        INDEX 00 00:00:00
      TRACK 2 AUDIO
        INDEX 01 123:45:56`),
      {
        sheet: {
          comments: [],
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.AUDIO,
              indexes: [
                { number: 0, startingTime: [0, 0, 0] },
              ],
            },
            {
              trackNumber: 2,
              dataType: TrackDataType.AUDIO,
              indexes: [
                { number: 1, startingTime: [123, 45, 56] },
              ],
            },
          ],
        },
        errors: [],
      },
    );
  });

  it("first index must be 0 or 1", () => {
    const { sheet, errors: [error] } = parse(
      "TRACK 1 AUDIO\nINDEX 02 00:00:00",
    );
    assertEquals(sheet, {
      comments: [],
      tracks: [{
        trackNumber: 1,
        dataType: TrackDataType.AUDIO,
        indexes: [{ number: 2, startingTime: [0, 0, 0] }],
      }],
    });
    assertEquals(error.kind, ErrorKind.InvalidFirstIndexNumber);
    assertEquals(error.position.line, 2);
    assertEquals(error.position.column, 7);
  });

  it("first index must start from 00:00:00", () => {
    const { sheet, errors: [error] } = parse(
      "TRACK 1 AUDIO\nINDEX 00 00:00:01",
    );
    assertEquals(sheet, {
      comments: [],
      tracks: [{
        trackNumber: 1,
        dataType: TrackDataType.AUDIO,
        indexes: [{ number: 0, startingTime: [0, 0, 1] }],
      }],
    });
    assertEquals(error.kind, ErrorKind.InvalidFirstIndexTime);
    assertEquals(error.position.line, 2);
    assertEquals(error.position.column, 10);
  });

  it("invalid index number", () => {
    const { sheet, errors: [error] } = parse(
      "TRACK 1 AUDIO\nINDEX 00 00:00:00\nINDEX a 00:02:00",
    );
    assertEquals(sheet, {
      comments: [],
      tracks: [{
        trackNumber: 1,
        dataType: TrackDataType.AUDIO,
        indexes: [
          { number: 0, startingTime: [0, 0, 0] },
          { number: NaN, startingTime: [0, 2, 0] },
        ],
      }],
    });
    assertEquals(error.kind, ErrorKind.InvalidIndexNumberRange);
    assertEquals(error.position.line, 3);
    assertEquals(error.position.column, 7);
  });

  it("index number out of range", () => {
    const { sheet, errors: [error] } = parse(
      "TRACK 1 AUDIO\nINDEX 00 00:00:00\nINDEX 100 00:02:00",
    );
    assertEquals(sheet, {
      comments: [],
      tracks: [{
        trackNumber: 1,
        dataType: TrackDataType.AUDIO,
        indexes: [
          { number: 0, startingTime: [0, 0, 0] },
          { number: 100, startingTime: [0, 2, 0] },
        ],
      }],
    });
    assertEquals(error.kind, ErrorKind.InvalidIndexNumberRange);
    assertEquals(error.position.line, 3);
    assertEquals(error.position.column, 7);
  });

  it("invalid index time format", () => {
    const { sheet, errors: [error] } = parse(
      "TRACK 1 AUDIO\nINDEX 00 0:1:0",
    );
    assertEquals(sheet, {
      comments: [],
      tracks: [{
        trackNumber: 1,
        dataType: TrackDataType.AUDIO,
        indexes: [
          { number: 0, startingTime: [0, 0, 0] },
        ],
      }],
    });
    assertEquals(error.kind, ErrorKind.InvalidTimeFormat);
    assertEquals(error.position.line, 2);
    assertEquals(error.position.column, 10);
  });

  it("frames too large", () => {
    const { sheet, errors: [error] } = parse(
      "TRACK 1 AUDIO\nINDEX 00 00:00:00\nINDEX 01 00:00:75",
    );
    assertEquals(sheet, {
      comments: [],
      tracks: [{
        trackNumber: 1,
        dataType: TrackDataType.AUDIO,
        indexes: [
          { number: 0, startingTime: [0, 0, 0] },
          { number: 1, startingTime: [0, 0, 75] },
        ],
      }],
    });
    assertEquals(error.kind, ErrorKind.FramesTooLarge);
    assertEquals(error.position.line, 3);
    assertEquals(error.position.column, 10);
  });
});

describe("ISRC command", () => {
  it("parse valid ISRC command", () => {
    assertEquals(parse("TRACK 1 AUDIO\nISRC abxyz1234567"), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 1,
          dataType: TrackDataType.AUDIO,
          indexes: [],
          isrc: "abxyz1234567",
        }],
      },
      errors: [],
    });

    assertEquals(parse("TRACK 1 AUDIO\nISRC ABXYZ1234567"), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 1,
          dataType: TrackDataType.AUDIO,
          indexes: [],
          isrc: "ABXYZ1234567",
        }],
      },
      errors: [],
    });

    assertEquals(parse("TRACK 1 AUDIO\nISRC 012341234567"), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 1,
          dataType: TrackDataType.AUDIO,
          indexes: [],
          isrc: "012341234567",
        }],
      },
      errors: [],
    });
  });

  it("too short ISRC", () => {
    const { sheet, errors: [error] } = parse("TRACK 1 AUDIO\nISRC abc");
    assertEquals(sheet, {
      comments: [],
      tracks: [{
        trackNumber: 1,
        dataType: TrackDataType.AUDIO,
        indexes: [],
        isrc: "abc",
      }],
    });
    assertEquals(error.kind, ErrorKind.InvalidISRCFormat);
    assertEquals(error.position.line, 2);
    assertEquals(error.position.column, 6);
  });

  it("too short ISRC", () => {
    const { sheet, errors: [error] } = parse(
      "TRACK 1 AUDIO\nISRC abcde012345678",
    );
    assertEquals(sheet, {
      comments: [],
      tracks: [{
        trackNumber: 1,
        dataType: TrackDataType.AUDIO,
        indexes: [],
        isrc: "abcde012345678",
      }],
    });
    assertEquals(error.kind, ErrorKind.InvalidISRCFormat);
    assertEquals(error.position.line, 2);
    assertEquals(error.position.column, 6);
  });

  it("invalid ISRC format", () => {
    const { sheet, errors: [error] } = parse(
      "TRACK 1 AUDIO\nISRC abcdef1234567",
    );
    assertEquals(sheet, {
      comments: [],
      tracks: [{
        trackNumber: 1,
        dataType: TrackDataType.AUDIO,
        indexes: [],
        isrc: "abcdef1234567",
      }],
    });
    assertEquals(error.kind, ErrorKind.InvalidISRCFormat);
    assertEquals(error.position.line, 2);
    assertEquals(error.position.column, 6);
  });

  it("ISRC command must come after TRACK command", () => {
    const { sheet, errors: [error] } = parse("ISRC ABXYZ1234567");
    assertEquals(sheet, {
      comments: [],
      tracks: [],
    });
    assertEquals(error.kind, ErrorKind.InvalidISRCCommandLocation);
    assertEquals(error.position.line, 1);
    assertEquals(error.position.column, 1);
  });

  it("ISRC command must come before INDEX command", () => {
    const { sheet, errors: [error] } = parse(
      "TRACK 1 AUDIO\nINDEX 00 00:00:00\nISRC ABXYZ1234567",
    );
    assertEquals(sheet, {
      comments: [],
      tracks: [{
        trackNumber: 1,
        dataType: TrackDataType.AUDIO,
        indexes: [{ number: 0, startingTime: [0, 0, 0] }],
        isrc: "ABXYZ1234567",
      }],
    });
    assertEquals(error.kind, ErrorKind.InvalidISRCCommandLocation);
    assertEquals(error.position.line, 3);
    assertEquals(error.position.column, 1);
  });
});

describe("PERFORMER command", () => {
  it("parse valid PERFORMER command", () => {
    assertEquals(parse("PERFORMER abc"), {
      sheet: {
        comments: [],
        tracks: [],
        performer: "abc",
      },
      errors: [],
    });

    assertEquals(parse("TRACK 1 AUDIO\nPERFORMER abc"), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 1,
          dataType: TrackDataType.AUDIO,
          indexes: [],
          performer: "abc",
        }],
      },
      errors: [],
    });

    assertEquals(parse(`PERFORMER "abc def"`), {
      sheet: {
        comments: [],
        tracks: [],
        performer: "abc def",
      },
      errors: [],
    });

    assertEquals(parse(`TRACK 1 AUDIO\nPERFORMER "abc def"`), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 1,
          dataType: TrackDataType.AUDIO,
          indexes: [],
          performer: "abc def",
        }],
      },
      errors: [],
    });

    assertEquals(parse("PERFORMER 🍥🫕"), {
      sheet: {
        comments: [],
        tracks: [],
        performer: "🍥🫕",
      },
      errors: [],
    });
  });

  it("performer too long", () => {
    const performer = "x".repeat(81);
    const { sheet, errors: [error] } = parse(`PERFORMER ${performer}`);
    assertEquals(sheet, {
      comments: [],
      tracks: [],
      performer,
    });
    assertEquals(error.kind, ErrorKind.TooLongPerformer);
    assertEquals(error.position.line, 1);
    assertEquals(error.position.column, 11);
  });
});

describe("POSTGAP command", () => {
  it("parse valid POSTGAP command", () => {
    assertEquals(parse("TRACK 1 AUDIO\nINDEX 00 00:00:00\nPOSTGAP 00:02:00"), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 1,
          dataType: TrackDataType.AUDIO,
          indexes: [{ number: 0, startingTime: [0, 0, 0] }],
          postGap: [0, 2, 0],
        }],
      },
      errors: [],
    });

    assertEquals(parse("TRACK 1 AUDIO\nINDEX 00 00:00:00\nPOSTGAP 123:45:56"), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 1,
          dataType: TrackDataType.AUDIO,
          indexes: [{ number: 0, startingTime: [0, 0, 0] }],
          postGap: [123, 45, 56],
        }],
      },
      errors: [],
    });
  });

  it("duplicated POSTGAP command", () => {
    const { sheet, errors: [error] } = parse(
      "TRACK 1 AUDIO\nINDEX 00 00:00:00\nPOSTGAP 00:00:00\nPOSTGAP 00:01:00",
    );
    assertEquals(sheet, {
      comments: [],
      tracks: [{
        trackNumber: 1,
        dataType: TrackDataType.AUDIO,
        indexes: [{ number: 0, startingTime: [0, 0, 0] }],
        postGap: [0, 1, 0],
      }],
    });
    assertEquals(error.kind, ErrorKind.DuplicatedPostGapCommand);
    assertEquals(error.position.line, 4);
    assertEquals(error.position.column, 1);
  });

  it("POSTGAP command must come after INDEX command", () => {
    const { sheet, errors: [error] } = parse(
      "TRACK 1 AUDIO\nPOSTGAP 00:00:00\nINDEX 00 00:00:00",
    );
    assertEquals(sheet, {
      comments: [],
      tracks: [{
        trackNumber: 1,
        dataType: TrackDataType.AUDIO,
        indexes: [{ number: 0, startingTime: [0, 0, 0] }],
        postGap: [0, 0, 0],
      }],
    });
    assertEquals(error.kind, ErrorKind.InvalidPostGapCommandLocation);
    assertEquals(error.position.line, 2);
    assertEquals(error.position.column, 1);
  });

  it("missing current track", () => {
    const { sheet, errors: [error] } = parse("POSTGAP 00:00:00\n");
    assertEquals(sheet, {
      comments: [],
      tracks: [],
    });
    assertEquals(error.kind, ErrorKind.CurrentTrackRequired);
    assertEquals(error.position.line, 1);
    assertEquals(error.position.column, 1);
  });

  it("frame too large", () => {
    const { sheet, errors: [error] } = parse(
      "TRACK 1 AUDIO\nINDEX 00 00:00:00\nPOSTGAP 00:02:75",
    );
    assertEquals(sheet, {
      comments: [],
      tracks: [{
        trackNumber: 1,
        dataType: TrackDataType.AUDIO,
        indexes: [{ number: 0, startingTime: [0, 0, 0] }],
        postGap: [0, 2, 75],
      }],
    });
    assertEquals(error.kind, ErrorKind.FramesTooLarge);
    assertEquals(error.position.line, 3);
    assertEquals(error.position.column, 9);
  });
});

describe("PREGAP command", () => {
  it("parse valid PREGAP command", () => {
    assertEquals(parse("TRACK 1 AUDIO\nPREGAP 00:02:00\nINDEX 00 00:00:00"), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 1,
          dataType: TrackDataType.AUDIO,
          indexes: [{ number: 0, startingTime: [0, 0, 0] }],
          preGap: [0, 2, 0],
        }],
      },
      errors: [],
    });

    assertEquals(parse("TRACK 1 AUDIO\nPREGAP 123:45:56\nINDEX 00 00:00:00"), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 1,
          dataType: TrackDataType.AUDIO,
          indexes: [{ number: 0, startingTime: [0, 0, 0] }],
          preGap: [123, 45, 56],
        }],
      },
      errors: [],
    });
  });

  it("duplicated PREGAP command", () => {
    const { sheet, errors: [error] } = parse(
      "TRACK 1 AUDIO\nPREGAP 00:00:00\nPREGAP 00:01:00\nINDEX 00 00:00:00",
    );
    assertEquals(sheet, {
      comments: [],
      tracks: [{
        trackNumber: 1,
        dataType: TrackDataType.AUDIO,
        indexes: [{ number: 0, startingTime: [0, 0, 0] }],
        preGap: [0, 1, 0],
      }],
    });
    assertEquals(error.kind, ErrorKind.DuplicatedPreGapCommand);
    assertEquals(error.position.line, 3);
    assertEquals(error.position.column, 1);
  });

  it("POSTGAP command must come before INDEX command", () => {
    const { sheet, errors: [error] } = parse(
      "TRACK 1 AUDIO\nINDEX 00 00:00:00\nPREGAP 00:00:00",
    );
    assertEquals(sheet, {
      comments: [],
      tracks: [{
        trackNumber: 1,
        dataType: TrackDataType.AUDIO,
        indexes: [{ number: 0, startingTime: [0, 0, 0] }],
        preGap: [0, 0, 0],
      }],
    });
    assertEquals(error.kind, ErrorKind.InvalidPreGapCommandLocation);
    assertEquals(error.position.line, 3);
    assertEquals(error.position.column, 1);
  });

  it("missing current track", () => {
    const { sheet, errors: [error] } = parse("PREGAP 00:00:00\n");
    assertEquals(sheet, {
      comments: [],
      tracks: [],
    });
    assertEquals(error.kind, ErrorKind.CurrentTrackRequired);
    assertEquals(error.position.line, 1);
    assertEquals(error.position.column, 1);
  });

  it("frame too large", () => {
    const { sheet, errors: [error] } = parse(
      "TRACK 1 AUDIO\nPREGAP 00:02:75\nINDEX 00 00:00:00",
    );
    assertEquals(sheet, {
      comments: [],
      tracks: [{
        trackNumber: 1,
        dataType: TrackDataType.AUDIO,
        indexes: [{ number: 0, startingTime: [0, 0, 0] }],
        preGap: [0, 2, 75],
      }],
    });
    assertEquals(error.kind, ErrorKind.FramesTooLarge);
    assertEquals(error.position.line, 2);
    assertEquals(error.position.column, 8);
  });
});

describe("REM command", () => {
  it("parse comments", () => {
    assertEquals(parse("REM\nREM"), {
      sheet: {
        comments: ["", ""],
        tracks: [],
      },
      errors: [],
    });

    assertEquals(parse("REM a b cd"), {
      sheet: {
        comments: ["a b cd"],
        tracks: [],
      },
      errors: [],
    });

    assertEquals(parse(`REM "a b c d"`), {
      sheet: {
        comments: ["a b c d"],
        tracks: [],
      },
      errors: [],
    });
  });
});

describe("SONGWRITER command", () => {
  it("parse valid SONGWRITER command", () => {
    assertEquals(parse("SONGWRITER abc"), {
      sheet: {
        comments: [],
        tracks: [],
        songWriter: "abc",
      },
      errors: [],
    });

    assertEquals(parse("TRACK 1 AUDIO\nSONGWRITER abc"), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 1,
          dataType: TrackDataType.AUDIO,
          indexes: [],
          songWriter: "abc",
        }],
      },
      errors: [],
    });

    assertEquals(parse(`SONGWRITER "abc def"`), {
      sheet: {
        comments: [],
        tracks: [],
        songWriter: "abc def",
      },
      errors: [],
    });

    assertEquals(parse(`TRACK 1 AUDIO\nSONGWRITER "abc def"`), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 1,
          dataType: TrackDataType.AUDIO,
          indexes: [],
          songWriter: "abc def",
        }],
      },
      errors: [],
    });

    assertEquals(parse("SONGWRITER 🍥🫕"), {
      sheet: {
        comments: [],
        tracks: [],
        songWriter: "🍥🫕",
      },
      errors: [],
    });
  });

  it("song writer too long", () => {
    const songWriter = "x".repeat(81);
    const { sheet, errors: [error] } = parse(`SONGWRITER ${songWriter}`);
    assertEquals(sheet, {
      comments: [],
      tracks: [],
      songWriter,
    });
    assertEquals(error.kind, ErrorKind.TooLongSongWriter);
    assertEquals(error.position.line, 1);
    assertEquals(error.position.column, 12);
  });
});

describe("TITLE command", () => {
  it("parse valid TITLE command", () => {
    assertEquals(parse("TITLE abc"), {
      sheet: {
        comments: [],
        tracks: [],
        title: "abc",
      },
      errors: [],
    });

    assertEquals(parse("TRACK 1 AUDIO\nTITLE abc"), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 1,
          dataType: TrackDataType.AUDIO,
          indexes: [],
          title: "abc",
        }],
      },
      errors: [],
    });

    assertEquals(parse(`TITLE "abc def"`), {
      sheet: {
        comments: [],
        tracks: [],
        title: "abc def",
      },
      errors: [],
    });

    assertEquals(parse(`TRACK 1 AUDIO\nTITLE "abc def"`), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 1,
          dataType: TrackDataType.AUDIO,
          indexes: [],
          title: "abc def",
        }],
      },
      errors: [],
    });

    assertEquals(parse("TITLE 🍥🫕"), {
      sheet: {
        comments: [],
        tracks: [],
        title: "🍥🫕",
      },
      errors: [],
    });
  });

  it("song writer too long", () => {
    const title = "x".repeat(81);
    const { sheet, errors: [error] } = parse(`TITLE ${title}`);
    assertEquals(sheet, {
      comments: [],
      tracks: [],
      title,
    });
    assertEquals(error.kind, ErrorKind.TooLongTitle);
    assertEquals(error.position.line, 1);
    assertEquals(error.position.column, 7);
  });
});

describe("TRACK command", () => {
  it("parse valid TRACK command", () => {
    assertEquals(parse("TRACK 1 AUDIO"), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 1,
          dataType: TrackDataType.AUDIO,
          indexes: [],
        }],
      },
      errors: [],
    });

    assertEquals(parse("TRACK 1 audio"), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 1,
          dataType: TrackDataType.AUDIO,
          indexes: [],
        }],
      },
      errors: [],
    });

    assertEquals(parse("TRACK 99 CDG"), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 99,
          dataType: TrackDataType.CDG,
          indexes: [],
        }],
      },
      errors: [],
    });

    assertEquals(parse("TRACK 99 Cdg"), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 99,
          dataType: TrackDataType.CDG,
          indexes: [],
        }],
      },
      errors: [],
    });

    assertEquals(parse("TRACK 12 MODE1/2048"), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 12,
          dataType: TrackDataType["MODE1/2048"],
          indexes: [],
        }],
      },
      errors: [],
    });

    assertEquals(parse("TRACK 1 MODE1/2352"), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 1,
          dataType: TrackDataType["MODE1/2352"],
          indexes: [],
        }],
      },
      errors: [],
    });

    assertEquals(parse("TRACK 1 MODE2/2336"), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 1,
          dataType: TrackDataType["MODE2/2336"],
          indexes: [],
        }],
      },
      errors: [],
    });

    assertEquals(parse("TRACK 1 MODE2/2352"), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 1,
          dataType: TrackDataType["MODE2/2352"],
          indexes: [],
        }],
      },
      errors: [],
    });

    assertEquals(parse("TRACK 1 CDI/2336"), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 1,
          dataType: TrackDataType["CDI/2336"],
          indexes: [],
        }],
      },
      errors: [],
    });

    assertEquals(parse("TRACK 1 CDI/2352"), {
      sheet: {
        comments: [],
        tracks: [{
          trackNumber: 1,
          dataType: TrackDataType["CDI/2352"],
          indexes: [],
        }],
      },
      errors: [],
    });
  });

  it("multiple tracks", () => {
    assertEquals(
      parse(`
TRACK 1 AUDIO
  PERFORMER pa
  TITLE ta
TRACK 2 CDG
  PERFORMER pb
  TITLE tb
    `),
      {
        sheet: {
          comments: [],
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.AUDIO,
              indexes: [],
              performer: "pa",
              title: "ta",
            },
            {
              trackNumber: 2,
              dataType: TrackDataType.CDG,
              indexes: [],
              performer: "pb",
              title: "tb",
            },
          ],
        },
        errors: [],
      },
    );
  });

  it("unknown track data type", () => {
    const { sheet, errors: [error] } = parse("TRACK 1 XYZ");
    assertEquals(sheet, {
      comments: [],
      tracks: [{
        trackNumber: 1,
        dataType: TrackDataType.Unknown,
        indexes: [],
      }],
    });
    assertEquals(error.kind, ErrorKind.UnknownTrackDataType);
    assertEquals(error.position.line, 1);
    assertEquals(error.position.column, 9);
  });

  it("track number lower than 1", () => {
    const { sheet, errors: [error] } = parse("TRACK 0 AUDIO");
    assertEquals(sheet, {
      comments: [],
      tracks: [{
        trackNumber: 0,
        dataType: TrackDataType.AUDIO,
        indexes: [],
      }],
    });
    assertEquals(error.kind, ErrorKind.InvalidTrackNumberRange);
    assertEquals(error.position.line, 1);
    assertEquals(error.position.column, 7);
  });

  it("track number higher than 99", () => {
    const { sheet, errors: [error] } = parse("TRACK 100 AUDIO");
    assertEquals(sheet, {
      comments: [],
      tracks: [{
        trackNumber: 100,
        dataType: TrackDataType.AUDIO,
        indexes: [],
      }],
    });
    assertEquals(error.kind, ErrorKind.InvalidTrackNumberRange);
    assertEquals(error.position.line, 1);
    assertEquals(error.position.column, 7);
  });

  it("track number must be sequential", () => {
    const { sheet, errors: [error] } = parse("TRACK 2 AUDIO\nTRACK 4 AUDIO");
    assertEquals(sheet, {
      comments: [],
      tracks: [
        {
          trackNumber: 2,
          dataType: TrackDataType.AUDIO,
          indexes: [],
        },
        {
          trackNumber: 4,
          dataType: TrackDataType.AUDIO,
          indexes: [],
        },
      ],
    });
    assertEquals(error.kind, ErrorKind.InvalidTrackNumberSequence);
    assertEquals(error.position.line, 2);
    assertEquals(error.position.column, 7);
  });

  it("check at least one track", () => {
    const { sheet, errors: [error] } = parse("", {
      checkAtLeastOneTrack: true,
    });
    assertEquals(sheet, {
      comments: [],
      tracks: [],
    });
    assertEquals(error.kind, ErrorKind.TracksRequired);
    assertEquals(error.position.line, 1);
    assertEquals(error.position.column, 1);
  });
});
