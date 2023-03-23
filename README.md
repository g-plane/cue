# cue

Library for processing Cue Sheet, with tolerant parser.

## Usage

### Parsing

```javascript
import { parse } from '@gplane/cue'

const { sheet, errors } = parse('')
```

You can get parsed Cue Sheet via `sheet`.

By default, parser is tolerant for syntax.
If there're syntax errors, you can get errors via `errors`,
while you still can get parsed result in `sheet`.

#### `fatal` option

Error will be thrown instead of being collected in `errors` if `fatal` option is set to `true`.

```javascript
import { parse } from '@gplane/cue'

const { sheet, errors } = parse('', { fatal: true })
```

#### `checkAtLeastOneTrack` option

It will require at least one track in the sheet if `checkAtLeastOneTrack` option is set to `true`.

```javascript
import { parse } from '@gplane/cue'

const { sheet, errors } = parse('', { checkAtLeastOneTrack: true })
```

#### `strictFileCommandPosition` option

Position of `FILE` command will be checked if `strictFileCommandPosition` option is set to `true`.

```javascript
import { parse } from '@gplane/cue'

const { sheet, errors } = parse('', { strictFileCommandPosition: true })
```

### Dumping

```javascript
import { dump } from '@gplane/cue'

const sheet = {
  /* ... */
}
const text = dump(sheet)
```

You can pass Cue Sheet object (for example, the `sheet` value returned from `parse` function) to it.

There're some limitations:

- Dumping comments by using `REM` command is not supported.
- It won't validate the Cue Sheet. For example, if file name of `FILE` command is an empty string, it will still be dumped without checking.

#### `lineBreak` option

Only `\n` or `\r\n` is allowed. Default value is `\n`.

```javascript
import { dump } from '@gplane/cue'

const sheet = {
  /* ... */
}
const text = dump(sheet, { lineBreak: '\r\n' })
```

#### `indentKind` option

Only `\t` or ` ` is allowed. Default value is ` `.

```javascript
import { dump } from '@gplane/cue'

const sheet = {
  /* ... */
}
const text = dump(sheet, { indentKind: '\t' })
// or
const text = dump(sheet, { indentKind: ' ' })
```

#### `indentSize` option

Only positive integer is allowed. Default value is `2`.

```javascript
import { dump } from '@gplane/cue'

const sheet = {
  /* ... */
}
const text = dump(sheet, { indentSize: 4 })
```

## References

- [Syntax Reference 1](https://web.archive.org/web/20151023011544/http://digitalx.org/cue-sheet/syntax/index.html)
- [Syntax Reference 2](https://web.archive.org/web/20070614044112/http://www.goldenhawk.com/download/cdrwin.pdf)

## License

MIT License

Copyright (c) 2021-present Pig Fang
