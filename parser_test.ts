import { assertEquals } from "https://deno.land/std@0.104.0/testing/asserts.ts";
import { ErrorKind } from "./errors.ts";
import { parse } from "./parser.ts";
import { FileType } from "./types.ts";

Deno.test("parse valid catalog", () => {
  assertEquals(parse(`CATALOG 1234567890123`), {
    sheet: { catalog: "1234567890123" },
    errors: [],
  });

  assertEquals(parse(`catalog 1234567890123`), {
    sheet: { catalog: "1234567890123" },
    errors: [],
  });

  assertEquals(parse(`Catalog 1234567890123`), {
    sheet: { catalog: "1234567890123" },
    errors: [],
  });
});

Deno.test("invalid catalog format", () => {
  assertEquals(parse(`CATALOG abcdefghijklm`), {
    sheet: { catalog: "abcdefghijklm" },
    errors: [{ kind: ErrorKind.InvalidCatalogFormat, line: 1, column: 9 }],
  });

  assertEquals(parse(`CATALOG 1234`), {
    sheet: { catalog: "1234" },
    errors: [{ kind: ErrorKind.InvalidCatalogFormat, line: 1, column: 9 }],
  });
});

Deno.test("duplicated catalog", () => {
  const source = `
CATALOG 1234567890123
CATALOG 0987654321098
`;

  assertEquals(parse(source), {
    sheet: { catalog: "0987654321098" },
    errors: [{ kind: ErrorKind.DuplicatedCatalog, line: 3, column: 1 }],
  });
});

Deno.test("missing catalog argument", () => {
  assertEquals(parse(`CATALOG`), {
    sheet: {},
    errors: [{ kind: ErrorKind.ExpectTokenUnquoted, line: 1, column: 8 }],
  });
});

Deno.test("parse valid CD Text File", () => {
  assertEquals(parse(`CDTEXTFILE C:\\a.cdt`), {
    sheet: { CDTextFile: "C:\\a.cdt" },
    errors: [],
  });

  assertEquals(parse(`cdtextfile /mnt/c/a.cdt`), {
    sheet: { CDTextFile: "/mnt/c/a.cdt" },
    errors: [],
  });

  assertEquals(
    parse(`CdTextFile "C:\\Documents and Settings\\Administrator\\a.cdt"`),
    {
      sheet: { CDTextFile: "C:\\Documents and Settings\\Administrator\\a.cdt" },
      errors: [],
    },
  );
});

Deno.test("missing CD Text File argument", () => {
  assertEquals(parse(`CDTEXTFILE `), {
    sheet: {},
    errors: [{ kind: ErrorKind.MissingArguments, line: 1, column: 12 }],
  });
});

Deno.test("parse valid FILE command", () => {
  assertEquals(parse(`FILE audio.iso BINARY`), {
    sheet: { file: { name: "audio.iso", type: FileType.Binary } },
    errors: [],
  });

  assertEquals(parse(`FILE audio.motorola MOTOROLA`), {
    sheet: { file: { name: "audio.motorola", type: FileType.Motorola } },
    errors: [],
  });

  assertEquals(parse(`FILE audio.aiff AIFF`), {
    sheet: { file: { name: "audio.aiff", type: FileType.Aiff } },
    errors: [],
  });

  assertEquals(parse(`FILE audio.wav WAVE`), {
    sheet: { file: { name: "audio.wav", type: FileType.Wave } },
    errors: [],
  });

  assertEquals(parse(`FILE audio.mp3 MP3`), {
    sheet: { file: { name: "audio.mp3", type: FileType.Mp3 } },
    errors: [],
  });

  assertEquals(parse(`File C:\\audio.iso Binary`), {
    sheet: { file: { name: "C:\\audio.iso", type: FileType.Binary } },
    errors: [],
  });

  assertEquals(parse(`file "C:\\wonderful audio.iso" binary`), {
    sheet: { file: { name: "C:\\wonderful audio.iso", type: FileType.Binary } },
    errors: [],
  });
});

Deno.test("missing FILE command file name argument", () => {
  assertEquals(parse(`FILE `), {
    sheet: {},
    errors: [{ kind: ErrorKind.MissingArguments, line: 1, column: 6 }],
  });
});

Deno.test("missing FILE command file type argument", () => {
  assertEquals(parse(`FILE audio.wav`), {
    sheet: { file: { name: "audio.wav", type: FileType.Unknown } },
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
    sheet: { file: { name: "audio.wav", type: FileType.Unknown } },
    errors: [{ kind: ErrorKind.UnknownFileType, line: 1, column: 16 }],
  });
});
