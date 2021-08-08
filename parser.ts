import type { CueSheeet } from "./types.ts";

function stripBOM(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) {
    return text.slice(1);
  }

  return text;
}

enum TokenType {
  LineBreak,
  Unquoted,
  Quoted,
}

type Token =
  & { pos: number; line: number; column: number }
  & (
    | { type: TokenType.LineBreak }
    | { type: TokenType.Unquoted; text: string }
    | { type: TokenType.Quoted; text: string }
  );

const RE_TOKENIZER = /"(.*)"|(\S+?)(?:\s(?!\n)+|$)|\n/mg;

export function* tokenize(source: string): Generator<Token> {
  let line = 1, linePos = -1;
  for (const matches of source.matchAll(RE_TOKENIZER)) {
    const index = matches.index!;
    const column = index - linePos;

    if (matches[0].charCodeAt(0) === 10) {
      yield { pos: index, line, column, type: TokenType.LineBreak };
      line += 1;
      linePos = index;
    } else if (matches[2] != null) {
      const text = matches[2];
      yield { pos: index, line, column, type: TokenType.Unquoted, text };
    } else if (matches[1] != null) {
      const text = matches[1];
      yield { pos: index, line, column, type: TokenType.Unquoted, text };
    }
  }
}

export function parse(source: string): CueSheeet {
  for (const token of tokenize(stripBOM(source))) {
    //
  }

  const sheet: CueSheeet = {};

  return sheet;
}
