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
  assertEquals(error1.errorAt.line, 1);
  assertEquals(error1.errorAt.column, 9);

  const { sheet: sheet2, errors: [error2] } = parse(`CATALOG 1234`);
  assertEquals(sheet2, { catalog: "1234", tracks: [], comments: [] });
  assertEquals(error2.kind, ErrorKind.InvalidCatalogFormat);
  assertEquals(error2.errorAt.line, 1);
  assertEquals(error2.errorAt.column, 9);
});

Deno.test("duplicated catalog", () => {
  const source = `CATALOG 1234567890123
CATALOG 0987654321098`;

  const { sheet, errors: [error] } = parse(source);
  assertEquals(sheet, { catalog: "0987654321098", tracks: [], comments: [] });
  assertEquals(error.kind, ErrorKind.DuplicatedCatalog);
  assertEquals(error.errorAt.line, 2);
  assertEquals(error.errorAt.column, 1);
});

Deno.test("missing catalog argument", () => {
  const { sheet, errors: [error] } = parse(`CATALOG`);
  assertEquals(sheet, { tracks: [], comments: [] });
  assertEquals(error.kind, ErrorKind.ExpectTokenUnquoted);
  assertEquals(error.errorAt.line, 1);
  assertEquals(error.errorAt.column, 8);
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
  assertEquals(error.errorAt.line, 1);
  assertEquals(error.errorAt.column, 12);
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
  assertEquals(error.errorAt.line, 1);
  assertEquals(error.errorAt.column, 6);
});

Deno.test("missing FILE command file type argument", () => {
  const { sheet, errors } = parse(`FILE audio.wav`);
  assertEquals(sheet, {
    file: { name: "audio.wav", type: FileType.Unknown },
    tracks: [],
    comments: [],
  });
  assertEquals(errors[0].kind, ErrorKind.ExpectTokenUnquoted);
  assertEquals(errors[0].errorAt.line, 1);
  assertEquals(errors[0].errorAt.column, 15);
  assertEquals(errors[1].kind, ErrorKind.UnknownFileType);
  assertEquals(errors[1].errorAt.line, 1);
  assertEquals(errors[1].errorAt.column, 15);
});

Deno.test("invalid FILE command file type argument", () => {
  const { sheet, errors: [error] } = parse(`FILE audio.wav WAV`);
  assertEquals(sheet, {
    file: { name: "audio.wav", type: FileType.Unknown },
    tracks: [],
    comments: [],
  });
  assertEquals(error.kind, ErrorKind.UnknownFileType);
  assertEquals(error.errorAt.line, 1);
  assertEquals(error.errorAt.column, 16);
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
  assertEquals(error.errorAt.line, 1);
  assertEquals(error.errorAt.column, 20);
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
});
