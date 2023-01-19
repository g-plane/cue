import { assertEquals } from "https://deno.land/std@0.170.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.170.0/testing/bdd.ts";
import { type CueSheet, FileType } from "./types.ts";
import { dump } from "./dumper.ts";

Deno.test("empty cue sheet", () => {
  const sheet: CueSheet = {
    files: [],
    comments: [],
  };
  assertEquals(dump(sheet), "");
});

describe("CATALOG command", () => {
  it("basic", () => {
    const sheet: CueSheet = {
      catalog: "123456789012",
      files: [],
      comments: [],
    };
    assertEquals(dump(sheet), "CATALOG 123456789012\n");
  });
});

describe("CDTEXTFILE command", () => {
  it("basic", () => {
    const sheet: CueSheet = {
      CDTextFile: "foo.txt",
      files: [],
      comments: [],
    };
    assertEquals(dump(sheet), 'CDTEXTFILE "foo.txt"\n');
  });

  it("escape", () => {
    const sheet: CueSheet = {
      CDTextFile: 'foo"bar.txt',
      files: [],
      comments: [],
    };
    assertEquals(dump(sheet), 'CDTEXTFILE "foo\\"bar.txt"\n');
  });
});

describe("TITLE command", () => {
  it("basic", () => {
    const sheet: CueSheet = {
      title: "foo",
      files: [],
      comments: [],
    };
    assertEquals(dump(sheet), 'TITLE "foo"\n');
  });

  it("escape", () => {
    const sheet: CueSheet = {
      title: 'foo"bar',
      files: [],
      comments: [],
    };
    assertEquals(dump(sheet), 'TITLE "foo\\"bar"\n');
  });
});

describe("PERFORMER command", () => {
  it("basic", () => {
    const sheet: CueSheet = {
      performer: "foo",
      files: [],
      comments: [],
    };
    assertEquals(dump(sheet), 'PERFORMER "foo"\n');
  });

  it("escape", () => {
    const sheet: CueSheet = {
      performer: 'foo"bar',
      files: [],
      comments: [],
    };
    assertEquals(dump(sheet), 'PERFORMER "foo\\"bar"\n');
  });
});

describe("SONGWRITER command", () => {
  it("basic", () => {
    const sheet: CueSheet = {
      songWriter: "foo",
      files: [],
      comments: [],
    };
    assertEquals(dump(sheet), 'SONGWRITER "foo"\n');
  });

  it("escape", () => {
    const sheet: CueSheet = {
      songWriter: 'foo"bar',
      files: [],
      comments: [],
    };
    assertEquals(dump(sheet), 'SONGWRITER "foo\\"bar"\n');
  });
});

describe("FILE command", () => {
  it("basic", () => {
    const sheet: CueSheet = {
      files: [
        {
          name: "foo.wav",
          type: FileType.Wave,
          tracks: [],
        },
      ],
      comments: [],
    };
    assertEquals(dump(sheet), 'FILE "foo.wav" WAVE\n');
  });

  it("escape", () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo"bar.wav',
          type: FileType.Wave,
          tracks: [],
        },
      ],
      comments: [],
    };
    assertEquals(dump(sheet), 'FILE "foo\\"bar.wav" WAVE\n');
  });
});
