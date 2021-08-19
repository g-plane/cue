import { ErrorKind, translateErrorMessage } from "./errors.ts";
import { FileType } from "./types.ts";
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

const RE_TOKENIZER = /"(.*?)"|(\S+?)(?:[^\S\n]+|(?=\n)|$)|\n|\s+/g;

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

  return {
    pos: source.length,
    line,
    column: source.length - linePos,
    type: TokenType.EOF,
  };
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
      throw new SyntaxError(
        `${translateErrorMessage(kind)} (${errorAt.line}:${errorAt.column})`,
        { cause: { kind, errorAt } },
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
    const next = tokens.next();
    const token = next.value;
    if (next.done || token.type === TokenType.EOF) {
      break;
    } else if (token.type === TokenType.Unquoted) {
      const command = parseCommand(token, tokens, context);
      context.sheet = { ...context.sheet, ...command };
    } else if (token.type === TokenType.LineBreak) {
      continue;
    } else {
      raise(ErrorKind.UnexpectedToken, token);
    }
  }

  return { sheet: context.sheet, errors };
}

function parseCommand(
  commandToken: TokenUnquoted,
  tokens: TokenStream,
  context: Context,
) {
  switch (commandToken.text.toUpperCase()) {
    case "CATALOG":
      if (context.sheet.catalog) {
        context.raise(ErrorKind.DuplicatedCatalog, commandToken);
      }
      return parseCatalog(tokens, context);
    case "CDTEXTFILE":
      return parseCDTextFile(tokens, context);
    case "FILE":
      return parseFile(tokens, context);
  }
}

const RE_CATALOG = /^\d{13}$/;

function parseCatalog(
  tokens: TokenStream,
  context: Context,
): Pick<CueSheeet, "catalog"> {
  const tokenCatalog = expectToken(tokens, TokenType.Unquoted, context);

  if (!RE_CATALOG.test(tokenCatalog.text)) {
    context.raise(ErrorKind.InvalidCatalogFormat, tokenCatalog);
  }

  return { catalog: tokenCatalog.text };
}

function parseCDTextFile(
  tokens: TokenStream,
  context: Context,
): Pick<CueSheeet, "CDTextFile"> {
  const token = tokens.next().value;
  if (token.type !== TokenType.Unquoted && token.type !== TokenType.Quoted) {
    context.raise(ErrorKind.MissingArguments, token);
    return {};
  }

  return { CDTextFile: token.text };
}

function parseFile(
  tokens: TokenStream,
  context: Context,
): Pick<CueSheeet, "file"> {
  const fileNameToken = tokens.next().value;
  if (
    fileNameToken.type !== TokenType.Unquoted &&
    fileNameToken.type !== TokenType.Quoted
  ) {
    context.raise(ErrorKind.MissingArguments, fileNameToken);
    return {};
  }

  const fileTypeToken = expectToken(tokens, TokenType.Unquoted, context);
  let fileType: FileType;
  const typeText = fileTypeToken.text.toUpperCase();
  if (typeText === "BINARY") {
    fileType = FileType.Binary;
  } else if (typeText === "MOTOROLA") {
    fileType = FileType.Motorola;
  } else if (typeText === "AIFF") {
    fileType = FileType.Aiff;
  } else if (typeText === "WAVE") {
    fileType = FileType.Wave;
  } else if (typeText === "MP3") {
    fileType = FileType.Mp3;
  } else {
    context.raise(ErrorKind.UnknownFileType, fileTypeToken);
    return {};
  }

  return { file: { name: fileNameToken.text, type: fileType } };
}
