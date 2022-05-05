import { assertEquals } from "https://deno.land/std@0.104.0/testing/asserts.ts";
import { ErrorKind } from "./errors.ts";
import { parse } from "./parser.ts";
import { FileType, TrackDataType } from "./types.ts";

Deno.test("parse valid catalog", () => {
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

Deno.test("invalid catalog format", () => {
  const { sheet: sheet1, errors: [error1] } = parse(`CATALOG abcdefghijklm`);
  assertEquals(sheet1, { catalog: "abcdefghijklm", tracks: [], comments: [] });
  assertEquals(error1.kind, ErrorKind.InvalidCatalogFormat);
  assertEquals(error1.position.line, 1);
  assertEquals(error1.position.column, 9);

  const { sheet: sheet2, errors: [error2] } = parse(`CATALOG 1234`);
  assertEquals(sheet2, { catalog: "1234", tracks: [], comments: [] });
  assertEquals(error2.kind, ErrorKind.InvalidCatalogFormat);
  assertEquals(error2.position.line, 1);
  assertEquals(error2.position.column, 9);
});

Deno.test("duplicated catalog", () => {
  const source = `CATALOG 1234567890123
CATALOG 0987654321098`;

  const { sheet, errors: [error] } = parse(source);
  assertEquals(sheet, { catalog: "0987654321098", tracks: [], comments: [] });
  assertEquals(error.kind, ErrorKind.DuplicatedCatalog);
  assertEquals(error.position.line, 2);
  assertEquals(error.position.column, 1);
});

Deno.test("missing catalog argument", () => {
  const { sheet, errors: [error] } = parse(`CATALOG`);
  assertEquals(sheet, { tracks: [], comments: [] });
  assertEquals(error.kind, ErrorKind.ExpectTokenUnquoted);
  assertEquals(error.position.line, 1);
  assertEquals(error.position.column, 8);
});

Deno.test("parse valid CD Text File", () => {
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

Deno.test("missing CD Text File argument", () => {
  const { sheet, errors: [error] } = parse(`CDTEXTFILE `);
  assertEquals(sheet, { tracks: [], comments: [] });
  assertEquals(error.kind, ErrorKind.MissingArguments);
  assertEquals(error.position.line, 1);
  assertEquals(error.position.column, 12);
});

Deno.test("parse valid FILE command", () => {
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

Deno.test("missing FILE command file name argument", () => {
  const { sheet, errors: [error] } = parse(`FILE `);
  assertEquals(sheet, { tracks: [], comments: [] });
  assertEquals(error.kind, ErrorKind.MissingArguments);
  assertEquals(error.position.line, 1);
  assertEquals(error.position.column, 6);
});

Deno.test("missing FILE command file type argument", () => {
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

Deno.test("invalid FILE command file type argument", () => {
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

Deno.test("disallow multiple commands on the same line", () => {
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

Deno.test("parse valid FLAGS command", () => {
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

Deno.test("unknown FLAGS command flag", () => {
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

Deno.test("unknown FLAGS command flag with parsed known flag", () => {
  const { sheet, errors: [error] } = parse(`TRACK 20 AUDIO\nFLAGS SCMS ABC\n`);
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

Deno.test("FLAGS command flag should be case-sensitive", () => {
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

Deno.test("FLAGS command contains too many flags", () => {
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

Deno.test("duplicated FLAGS command", () => {
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

Deno.test("FLAGS command without arguments", () => {
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

Deno.test("FLAGS command must come after TRACK command", () => {
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

Deno.test("FLAGS command must come before INDEX command", () => {
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

Deno.test("FLAGS command arguments can't be quoted", () => {
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
