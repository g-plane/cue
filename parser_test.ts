import { assertEquals } from "https://deno.land/std@0.104.0/testing/asserts.ts";
import { ErrorKind } from "./errors.ts";
import { parse } from "./parser.ts";

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
