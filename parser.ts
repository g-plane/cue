import { ErrorKind, translateErrorMessage } from "./errors.ts";
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

type BaseToken = { pos: number; line: number; column: number };
type TokenEOF = BaseToken & { type: TokenType.EOF };
type TokenLineBreak = BaseToken & { type: TokenType.LineBreak };
type TokenUnquoted = BaseToken & { type: TokenType.Unquoted; text: string };
type TokenQuoted = BaseToken & { type: TokenType.Quoted; text: string };

type Token = TokenEOF | TokenLineBreak | TokenUnquoted | TokenQuoted;

const RE_TOKENIZER = /"(.*?)"|(\S+?)(?:[^\S\n]+|(?=\n)|$)|\n/g;

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

interface ParserState {
  inTrack: boolean;
}

interface Context {
  sheet: CueSheeet;

  state: ParserState;

  /**
   * Raise a parsing error.
   */
  raise(
    kind: ErrorKind,
    errorAt: { pos: number; line: number; column: number },
  ): void;
}

function expectToken(
  tokens: TokenStream,
  type: TokenType.EOF,
  context: Context,
): TokenEOF;
function expectToken(
  tokens: TokenStream,
  type: TokenType.LineBreak,
  context: Context,
): TokenLineBreak;
function expectToken(
  tokens: TokenStream,
  type: TokenType.Unquoted,
  context: Context,
): TokenUnquoted;
function expectToken(
  tokens: TokenStream,
  type: TokenType.Quoted,
  context: Context,
): TokenQuoted;
function expectToken(
  tokens: TokenStream,
  type: TokenType,
  context: Context,
): Token {
  const token = tokens.next().value;
  if (token.type !== type) {
    switch (type) {
      case TokenType.EOF:
        context.raise(ErrorKind.ExpectTokenEOF, token);
        break;
      case TokenType.LineBreak:
        context.raise(ErrorKind.ExpectTokenLineBreak, token);
        break;
      case TokenType.Unquoted:
        context.raise(ErrorKind.ExpectTokenUnquoted, token);
        break;
      case TokenType.Quoted:
        context.raise(ErrorKind.ExpectTokenQuoted, token);
        break;
    }
  }

  return token;
}

type ParsingError = { kind: ErrorKind; line: number; column: number };

interface ParserOptions {
  fatal?: boolean;
}

export function parse(source: string, options: ParserOptions = {}) {
  const tokens = tokenize(stripBOM(source));

  const errors: ParsingError[] = [];
  const raise: Context["raise"] = options.fatal
    ? ((kind, errorAt) => {
      throw new Error(
        `${translateErrorMessage(kind)} (${errorAt.line}:${errorAt.column})`,
      );
    })
    : ((kind, errorAt) => {
      errors.push({ kind, line: errorAt.line, column: errorAt.column });
    });

  const context: Context = {
    sheet: {},
    state: {
      inTrack: false,
    },
    raise,
  };

  while (true) {
    const command = parseCommand(tokens, context);
    context.sheet = { ...context.sheet, ...command };

    const nextToken = tokens.next();
    if (nextToken.value.type === TokenType.EOF || nextToken.done) {
      break;
    } else if (nextToken.value.type !== TokenType.LineBreak) {
      raise(ErrorKind.ExpectEnding, nextToken.value);
    }
  }

  return { sheet: context.sheet, errors };
}

function parseCommand(tokens: TokenStream, context: Context) {
  const tokenCommandName = expectToken(tokens, TokenType.Unquoted, context);
  switch (tokenCommandName.text.toUpperCase()) {
    case "CATALOG":
      return parseCatalog(tokens, context);
  }
}

const RE_CATALOG = /^\d{13}$/;

function parseCatalog(tokens: TokenStream, context: Context) {
  const tokenCatalog = expectToken(tokens, TokenType.Unquoted, context);

  if (!RE_CATALOG.test(tokenCatalog.text)) {
    context.raise(ErrorKind.InvalidCatalogFormat, tokenCatalog);
  }

  if (context.sheet.catalog) {
    context.raise(ErrorKind.DuplicatedCatalog, tokenCatalog);
  }

  return { catalog: tokenCatalog.text };
}
