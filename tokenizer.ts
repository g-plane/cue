import { ErrorKind } from "./errors.ts";
import type { Location } from "./types.ts";

export enum TokenKind {
  EOF,
  Unquoted,
  Quoted,
}

export interface TokenBase {
  kind: TokenKind;
  value: string;
  pos: number;
  line: number;
  column: number;
}

export interface TokenEOF extends TokenBase {
  kind: TokenKind.EOF;
}

export interface TokenUnquoted extends TokenBase {
  kind: TokenKind.Unquoted;
}

export interface TokenQuoted extends TokenBase {
  kind: TokenKind.Quoted;
}

export type Token = TokenEOF | TokenUnquoted | TokenQuoted;

export interface TokenStream {
  expectLinebreak(): void;
  eatLinebreak(): boolean;
  expectString(): TokenQuoted | TokenUnquoted;
  expectString(kind: TokenKind.Quoted): TokenQuoted;
  expectString(kind: TokenKind.Unquoted): TokenUnquoted;
  eatString(): TokenQuoted | TokenUnquoted | undefined;
  eatString(kind: TokenKind.Quoted): TokenQuoted | undefined;
  eatString(kind: TokenKind.Unquoted): TokenUnquoted | undefined;
  isEof(): boolean;
  getCurrentLocation(): Location;
}

export function tokenize(
  source: string,
  onError: (kind: ErrorKind, errorAt: Location) => void,
) {
  const len = source.length;
  let offset = 0, line = 1, column = 1;

  function skipWhitespaces() {
    while (
      offset < len && isNonLineBreakWhitespace(source.charCodeAt(offset))
    ) {
      offset += 1;
      column += 1;
    }
  }

  function next() {
    skipWhitespaces();

    let text = "";
    const pos = offset, startLine = line, startColumn = column;
    if (source.charCodeAt(offset) === 34 /* " */) {
      offset += 1;
      column += 1;
      while (offset < len && source.charCodeAt(offset) !== 34) {
        text += source[offset];
        offset += 1;
        column += 1;
      }
      if (offset >= len) {
        onError(
          ErrorKind.UnterminatedQuotedString,
          {
            pos: offset,
            line,
            column,
          },
        );
      } else {
        offset += 1;
        column += 1;
      }
      // tolerantly parsing
      return {
        kind: TokenKind.Quoted,
        value: text,
        pos,
        line: startLine,
        column: startColumn,
      };
    } else if (offset < len) {
      while (offset < len && !isWhitespace(source.charCodeAt(offset))) {
        text += source[offset];
        offset += 1;
        column += 1;
      }
      return {
        kind: TokenKind.Unquoted,
        value: text,
        pos,
        line: startLine,
        column: startColumn,
      };
    } else {
      return {
        kind: TokenKind.EOF,
        value: "",
        pos: offset,
        line: startLine,
        column: startColumn,
      };
    }
  }

  let currentToken = next();

  return {
    expectLinebreak() {
      if (!this.eatLinebreak()) {
        const currentTokenLen = currentToken.value.length;
        onError(
          ErrorKind.ExpectLineBreak,
          {
            pos: offset - currentTokenLen,
            line,
            column: column - currentTokenLen,
          },
        );
      }
    },
    eatLinebreak() {
      const currentChar = source.charCodeAt(offset),
        nextChar = source.charCodeAt(offset + 1);
      if (currentChar === 10 /* \n */) {
        offset += 1;
        line += 1;
        column = 1;
        currentToken = next();
        return true;
      } else if (currentChar === 13 && nextChar === 10 /* \r\n */) {
        offset += 2;
        line += 1;
        column = 1;
        currentToken = next();
        return true;
      } else {
        return false;
      }
    },
    expectString(kind?: TokenKind.Quoted | TokenKind.Unquoted) {
      const token = this.eatString();
      if (token) {
        return token;
      } else if (kind === TokenKind.Quoted) {
        onError(
          ErrorKind.ExpectTokenQuoted,
          { pos: offset, line, column },
        );
        return {
          kind: TokenKind.Quoted,
          value: "",
          pos: offset,
          line,
          column,
        };
      } else if (kind === TokenKind.Unquoted) {
        onError(
          ErrorKind.ExpectTokenUnquoted,
          { pos: offset, line, column },
        );
        return {
          kind: TokenKind.Unquoted,
          value: "",
          pos: offset,
          line,
          column,
        };
      } else {
        onError(ErrorKind.UnexpectedToken, {
          pos: offset,
          line,
          column,
        });
        return {
          kind: TokenKind.Unquoted,
          value: "",
          pos: offset,
          line,
          column,
        };
      }
    },
    eatString(kind?: TokenKind.Quoted | TokenKind.Unquoted) {
      const token = currentToken;
      if (
        token.kind === kind ||
        token.kind === TokenKind.Quoted ||
        token.kind === TokenKind.Unquoted
      ) {
        currentToken = next();
        return token;
      } else {
        return undefined;
      }
    },
    isEof() {
      return currentToken.kind === TokenKind.EOF;
    },
    getCurrentLocation() {
      return { pos: offset, line, column };
    },
  } as TokenStream;
}

function isNonLineBreakWhitespace(charCode: number): boolean {
  return charCode === 0xa || charCode === 0xd ? false : isWhitespace(charCode);
}

function isWhitespace(charCode: number): boolean {
  return (charCode >= 0x9 && charCode <= 0xd) ||
    charCode === 0x20 || charCode === 0x85 || charCode === 0xa0 ||
    charCode === 0x1680 || (charCode >= 0x2000 && charCode <= 0x200a) ||
    charCode === 0x2028 || charCode === 0x2029 || charCode === 0x202f ||
    charCode === 0x205f || charCode === 0x3000;
}
