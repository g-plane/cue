import { assertEquals } from "https://deno.land/std@0.104.0/testing/asserts.ts";
import { ErrorKind } from "./errors.ts";
import { parse } from "./parser.ts";
import { FileType } from "./types.ts";

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
  assertEquals(parse(`CATALOG abcdefghijklm`), {
    sheet: { catalog: "abcdefghijklm", tracks: [], comments: [] },
    errors: [{ kind: ErrorKind.InvalidCatalogFormat, line: 1, column: 9 }],
  });

  assertEquals(parse(`CATALOG 1234`), {
    sheet: { catalog: "1234", tracks: [], comments: [] },
    errors: [{ kind: ErrorKind.InvalidCatalogFormat, line: 1, column: 9 }],
  });
});

Deno.test("duplicated catalog", () => {
  const source = `CATALOG 1234567890123
CATALOG 0987654321098`;

  assertEquals(parse(source), {
    sheet: { catalog: "0987654321098", tracks: [], comments: [] },
    errors: [{ kind: ErrorKind.DuplicatedCatalog, line: 2, column: 1 }],
  });
});

Deno.test("missing catalog argument", () => {
  assertEquals(parse(`CATALOG`), {
    sheet: { tracks: [], comments: [] },
    errors: [{ kind: ErrorKind.ExpectTokenUnquoted, line: 1, column: 8 }],
  });
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
  assertEquals(parse(`CDTEXTFILE `), {
    sheet: { tracks: [], comments: [] },
    errors: [{ kind: ErrorKind.MissingArguments, line: 1, column: 12 }],
  });
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
  assertEquals(parse(`FILE `), {
    sheet: { tracks: [], comments: [] },
    errors: [{ kind: ErrorKind.MissingArguments, line: 1, column: 6 }],
  });
});

Deno.test("missing FILE command file type argument", () => {
  assertEquals(parse(`FILE audio.wav`), {
    sheet: {
      file: { name: "audio.wav", type: FileType.Unknown },
      tracks: [],
      comments: [],
    },
    errors: [
      { kind: ErrorKind.ExpectTokenUnquoted, line: 1, column: 15 },
      {
        kind: ErrorKind.UnknownFileType,
        line: 1,
        column: 15,
      },
    ],
  });
});

Deno.test("invalid FILE command file type argument", () => {
  assertEquals(parse(`FILE audio.wav WAV`), {
    sheet: {
      file: { name: "audio.wav", type: FileType.Unknown },
      tracks: [],
      comments: [],
    },
    errors: [{ kind: ErrorKind.UnknownFileType, line: 1, column: 16 }],
  });
});

Deno.test("disallow multiple commands on the same line", () => {
  assertEquals(parse(`CDTEXTFILE cdt.cdt FILE audio.wav WAV`), {
    sheet: { CDTextFile: "cdt.cdt", tracks: [], comments: [] },
    errors: [{ kind: ErrorKind.UnexpectedToken, line: 1, column: 20 }],
  });
});
