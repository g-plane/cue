import type { CueSheeet } from "./types.ts";

function stripBOM(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) {
    return text.slice(1);
  }

  return text;
}

enum TokenType {
  EOF,
  LineBreak,
  Unquoted,
  Quoted,
}

type Token =
  & { pos: number; line: number; column: number }
  & (
    | { type: TokenType.EOF }
    | { type: TokenType.LineBreak }
    | { type: TokenType.Unquoted; text: string }
    | { type: TokenType.Quoted; text: string }
  );

const RE_TOKENIZER = /"(.*?)"|(\S+?)(?:\s(?!\n)+|$)|\n/mg;

type TokenStream = Generator<Token, Token>;

export function* tokenize(source: string): TokenStream {
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

  return { pos: source.length, line: -1, column: -1, type: TokenType.EOF };
}

export function parse(source: string): CueSheeet {
  for (const token of tokenize(stripBOM(source))) {
    console.log(token)
  }

  const sheet: CueSheeet = {};

  return sheet;
}
