import { describe, it, expect } from 'vitest'
import { ErrorKind, FileType, TrackDataType, parse } from '../src'

describe('CATALOG command', () => {
  it('parse valid catalog', () => {
    expect(parse(`CATALOG 1234567890123`)).toEqual({
      sheet: { catalog: '1234567890123', files: [], comments: [] },
      errors: [],
    })

    expect(parse(`catalog 1234567890123`)).toEqual({
      sheet: { catalog: '1234567890123', files: [], comments: [] },
      errors: [],
    })

    expect(parse(`Catalog 1234567890123`)).toEqual({
      sheet: { catalog: '1234567890123', files: [], comments: [] },
      errors: [],
    })
  })

  it('invalid catalog format', () => {
    const {
      sheet: sheet1,
      errors: [error1],
    } = parse(`CATALOG abcdefghijklm`)
    expect(sheet1).toEqual({
      catalog: 'abcdefghijklm',
      files: [],
      comments: [],
    })
    expect(error1.kind).toBe(ErrorKind.InvalidCatalogFormat)
    expect(error1.position.line).toBe(1)
    expect(error1.position.column).toBe(9)

    const {
      sheet: sheet2,
      errors: [error2],
    } = parse(`CATALOG 1234`)
    expect(sheet2).toEqual({ catalog: '1234', files: [], comments: [] })
    expect(error2.kind).toBe(ErrorKind.InvalidCatalogFormat)
    expect(error2.position.line).toBe(1)
    expect(error2.position.column).toBe(9)
  })

  it('duplicated catalog', () => {
    const source = `CATALOG 1234567890123
CATALOG 0987654321098`

    const {
      sheet,
      errors: [error],
    } = parse(source)
    expect(sheet).toEqual({ catalog: '0987654321098', files: [], comments: [] })
    expect(error.kind).toBe(ErrorKind.DuplicatedCatalog)
    expect(error.position.line).toBe(2)
    expect(error.position.column).toBe(1)
  })

  it('missing catalog argument', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`CATALOG`)
    expect(sheet).toEqual({ files: [], comments: [] })
    expect(error.kind).toBe(ErrorKind.ExpectTokenUnquoted)
    expect(error.position.line).toBe(1)
    expect(error.position.column).toBe(8)
  })
})

describe('CDTEXTFILE command', () => {
  it('parse valid CD Text File', () => {
    expect(parse(`CDTEXTFILE C:\\a.cdt`)).toEqual({
      sheet: { CDTextFile: 'C:\\a.cdt', files: [], comments: [] },
      errors: [],
    })

    expect(parse(`cdtextfile /mnt/c/a.cdt`)).toEqual({
      sheet: { CDTextFile: '/mnt/c/a.cdt', files: [], comments: [] },
      errors: [],
    })

    expect(
      parse(`CdTextFile "C:\\Documents and Settings\\Administrator\\a.cdt"`)
    ).toEqual({
      sheet: {
        CDTextFile: 'C:\\Documents and Settings\\Administrator\\a.cdt',
        files: [],
        comments: [],
      },
      errors: [],
    })
  })

  it('missing CD Text File argument', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`CDTEXTFILE `)
    expect(sheet).toEqual({ files: [], comments: [] })
    expect(error.kind).toBe(ErrorKind.MissingArguments)
    expect(error.position.line).toBe(1)
    expect(error.position.column).toBe(12)
  })
})

describe('FILE command', () => {
  it('parse valid FILE command', () => {
    expect(parse(`FILE audio.iso BINARY`)).toEqual({
      sheet: {
        files: [{ name: 'audio.iso', type: FileType.Binary, tracks: [] }],
        comments: [],
      },
      errors: [],
    })

    expect(parse(`FILE audio.motorola MOTOROLA`)).toEqual({
      sheet: {
        files: [
          {
            name: 'audio.motorola',
            type: FileType.Motorola,
            tracks: [],
          },
        ],
        comments: [],
      },
      errors: [],
    })

    expect(parse(`FILE audio.aiff AIFF`)).toEqual({
      sheet: {
        files: [{ name: 'audio.aiff', type: FileType.Aiff, tracks: [] }],
        comments: [],
      },
      errors: [],
    })

    expect(parse(`FILE audio.wav WAVE`)).toEqual({
      sheet: {
        files: [{ name: 'audio.wav', type: FileType.Wave, tracks: [] }],
        comments: [],
      },
      errors: [],
    })

    expect(parse(`FILE audio.mp3 MP3`)).toEqual({
      sheet: {
        files: [{ name: 'audio.mp3', type: FileType.Mp3, tracks: [] }],
        comments: [],
      },
      errors: [],
    })

    expect(parse(`File C:\\audio.iso Binary`)).toEqual({
      sheet: {
        files: [{ name: 'C:\\audio.iso', type: FileType.Binary, tracks: [] }],
        comments: [],
      },
      errors: [],
    })

    expect(parse(`file "C:\\wonderful audio.iso" binary`)).toEqual({
      sheet: {
        files: [
          {
            name: 'C:\\wonderful audio.iso',
            type: FileType.Binary,
            tracks: [],
          },
        ],
        comments: [],
      },
      errors: [],
    })

    expect(parse(`CATALOG 1234567890123\nFILE audio.wav WAVE`)).toEqual({
      sheet: {
        catalog: '1234567890123',
        files: [{ name: 'audio.wav', type: FileType.Wave, tracks: [] }],
        comments: [],
      },
      errors: [],
    })

    expect(parse(`CDTEXTFILE C:\\a.cdt\nFILE audio.wav WAVE`)).toEqual({
      sheet: {
        CDTextFile: 'C:\\a.cdt',
        files: [{ name: 'audio.wav', type: FileType.Wave, tracks: [] }],
        comments: [],
      },
      errors: [],
    })

    expect(
      parse(`
      CATALOG 1234567890123
      CDTEXTFILE C:\\a.cdt
      FILE audio.wav WAVE`)
    ).toEqual({
      sheet: {
        catalog: '1234567890123',
        CDTextFile: 'C:\\a.cdt',
        files: [{ name: 'audio.wav', type: FileType.Wave, tracks: [] }],
        comments: [],
      },
      errors: [],
    })

    expect(parse(`PERFORMER ""\nFILE audio.wav WAVE`)).toEqual({
      sheet: {
        performer: '',
        files: [{ name: 'audio.wav', type: FileType.Wave, tracks: [] }],
        comments: [],
      },
      errors: [],
    })
  })

  it('missing file name argument', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE `)
    expect(sheet).toEqual({ files: [], comments: [] })
    expect(error.kind).toBe(ErrorKind.MissingArguments)
    expect(error.position.line).toBe(1)
    expect(error.position.column).toBe(6)
  })

  it('missing file type argument', () => {
    const { sheet, errors } = parse(`FILE audio.wav`)
    expect(sheet).toEqual({
      files: [{ name: 'audio.wav', type: FileType.Unknown, tracks: [] }],
      comments: [],
    })
    expect(errors[0].kind).toBe(ErrorKind.ExpectTokenUnquoted)
    expect(errors[0].position.line).toBe(1)
    expect(errors[0].position.column).toBe(15)
    expect(errors[1].kind).toBe(ErrorKind.UnknownFileType)
    expect(errors[1].position.line).toBe(1)
    expect(errors[1].position.column).toBe(15)
  })

  it('invalid file type argument', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE audio.wav WAV`)
    expect(sheet).toEqual({
      files: [{ name: 'audio.wav', type: FileType.Unknown, tracks: [] }],
      comments: [],
    })
    expect(error.kind).toBe(ErrorKind.UnknownFileType)
    expect(error.position.line).toBe(1)
    expect(error.position.column).toBe(16)
  })

  it('disallow multiple commands on the same line', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`CDTEXTFILE cdt.cdt FILE audio.wav WAV`)
    expect(sheet).toEqual({
      CDTextFile: 'cdt.cdt',
      files: [{ name: 'audio.wav', type: FileType.Unknown, tracks: [] }],
      comments: [],
    })
    expect(error.kind).toBe(ErrorKind.ExpectLineBreak)
    expect(error.position.line).toBe(1)
    expect(error.position.column).toBe(20)
  })

  it('invalid command location', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`PERFORMER ""\nFILE audio.wav WAVE`, {
      strictFileCommandPosition: true,
    })
    expect(sheet).toEqual({
      performer: '',
      files: [{ name: 'audio.wav', type: FileType.Wave, tracks: [] }],
      comments: [],
    })
    expect(error.kind).toBe(ErrorKind.InvalidFileCommandLocation)
    expect(error.position.line).toBe(2)
    expect(error.position.column).toBe(1)
  })
})

describe('FLAGS command', () => {
  it('parse valid FLAGS command', () => {
    expect(parse(`FILE "" WAVE\nTRACK 20 AUDIO\nFLAGS DCP`)).toEqual({
      sheet: {
        flags: {
          digitalCopyPermitted: true,
          fourChannelAudio: false,
          preEmphasisEnabled: false,
          scms: false,
        },
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                dataType: TrackDataType.Audio,
                indexes: [],
                trackNumber: 20,
              },
            ],
          },
        ],
        comments: [],
      },
      errors: [],
    })

    expect(parse(`FILE "" WAVE\nTRACK 20 AUDIO\nFLAGS 4CH\n`)).toEqual({
      sheet: {
        flags: {
          digitalCopyPermitted: false,
          fourChannelAudio: true,
          preEmphasisEnabled: false,
          scms: false,
        },
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                dataType: TrackDataType.Audio,
                indexes: [],
                trackNumber: 20,
              },
            ],
          },
        ],
        comments: [],
      },
      errors: [],
    })

    expect(parse(`FILE "" WAVE\nTRACK 20 AUDIO\nFLAGS PRE\n`)).toEqual({
      sheet: {
        flags: {
          digitalCopyPermitted: false,
          fourChannelAudio: false,
          preEmphasisEnabled: true,
          scms: false,
        },
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                dataType: TrackDataType.Audio,
                indexes: [],
                trackNumber: 20,
              },
            ],
          },
        ],
        comments: [],
      },
      errors: [],
    })

    expect(parse(`FILE "" WAVE\nTRACK 20 AUDIO\nFLAGS SCMS\n`)).toEqual({
      sheet: {
        flags: {
          digitalCopyPermitted: false,
          fourChannelAudio: false,
          preEmphasisEnabled: false,
          scms: true,
        },
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                dataType: TrackDataType.Audio,
                indexes: [],
                trackNumber: 20,
              },
            ],
          },
        ],
        comments: [],
      },
      errors: [],
    })

    expect(
      parse(`FILE "" WAVE\nTRACK 20 AUDIO\nFLAGS DCP PRE SCMS 4CH\n`)
    ).toEqual({
      sheet: {
        flags: {
          digitalCopyPermitted: true,
          fourChannelAudio: true,
          preEmphasisEnabled: true,
          scms: true,
        },
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                dataType: TrackDataType.Audio,
                indexes: [],
                trackNumber: 20,
              },
            ],
          },
        ],
        comments: [],
      },
      errors: [],
    })
  })

  it('unknown flag', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE "" WAVE\nTRACK 20 AUDIO\nFLAGS ABC\n`)
    expect(sheet).toEqual({
      flags: {
        digitalCopyPermitted: false,
        fourChannelAudio: false,
        preEmphasisEnabled: false,
        scms: false,
      },
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              dataType: TrackDataType.Audio,
              indexes: [],
              trackNumber: 20,
            },
          ],
        },
      ],
      comments: [],
    })
    expect(error.kind).toBe(ErrorKind.UnknownFlag)
    expect(error.position.line).toBe(3)
    expect(error.position.column).toBe(7)
  })

  it('unknown flag with parsed known flag', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE "" WAVE\nTRACK 20 AUDIO\nFLAGS SCMS ABC\n`)
    expect(sheet).toEqual({
      flags: {
        digitalCopyPermitted: false,
        fourChannelAudio: false,
        preEmphasisEnabled: false,
        scms: true,
      },
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              dataType: TrackDataType.Audio,
              indexes: [],
              trackNumber: 20,
            },
          ],
        },
      ],
      comments: [],
    })
    expect(error.kind).toBe(ErrorKind.UnknownFlag)
    expect(error.position.line).toBe(3)
    expect(error.position.column).toBe(12)
  })

  it('flag should be case-sensitive', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE "" WAVE\nTRACK 20 AUDIO\nFLAGS pre\n`)
    expect(sheet).toEqual({
      flags: {
        digitalCopyPermitted: false,
        fourChannelAudio: false,
        preEmphasisEnabled: false,
        scms: false,
      },
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              dataType: TrackDataType.Audio,
              indexes: [],
              trackNumber: 20,
            },
          ],
        },
      ],
      comments: [],
    })
    expect(error.kind).toBe(ErrorKind.UnknownFlag)
    expect(error.position.line).toBe(3)
    expect(error.position.column).toBe(7)
  })

  it('too many flags', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE "" WAVE\nTRACK 20 AUDIO\nFLAGS 4CH PRE SCMS DCP 4CH\n`)
    expect(sheet).toEqual({
      flags: {
        digitalCopyPermitted: true,
        fourChannelAudio: true,
        preEmphasisEnabled: true,
        scms: true,
      },
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              dataType: TrackDataType.Audio,
              indexes: [],
              trackNumber: 20,
            },
          ],
        },
      ],
      comments: [],
    })
    expect(error.kind).toBe(ErrorKind.TooManyFlags)
    expect(error.position.line).toBe(3)
    expect(error.position.column).toBe(24)
  })

  it('duplicated FLAGS command', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE "" WAVE\nTRACK 20 AUDIO\nFLAGS 4CH\nFLAGS DCP\n`)
    expect(sheet).toEqual({
      flags: {
        digitalCopyPermitted: true,
        // latter `FLAGS` command will override former `FLAGS` command
        fourChannelAudio: false,
        preEmphasisEnabled: false,
        scms: false,
      },
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              dataType: TrackDataType.Audio,
              indexes: [],
              trackNumber: 20,
            },
          ],
        },
      ],
      comments: [],
    })
    expect(error.kind).toBe(ErrorKind.DuplicatedFlagsCommand)
    expect(error.position.line).toBe(4)
    expect(error.position.column).toBe(1)
  })

  it('FLAGS command without arguments', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE "" WAVE\nTRACK 20 AUDIO\nFLAGS\n`)
    expect(sheet).toEqual({
      flags: {
        digitalCopyPermitted: false,
        fourChannelAudio: false,
        preEmphasisEnabled: false,
        scms: false,
      },
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              dataType: TrackDataType.Audio,
              indexes: [],
              trackNumber: 20,
            },
          ],
        },
      ],
      comments: [],
    })
    expect(error.kind).toBe(ErrorKind.NoFlags)
    expect(error.position.line).toBe(3)
    expect(error.position.column).toBe(6)
  })

  it('FLAGS command must come after TRACK command', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FLAGS PRE\n`)
    expect(sheet).toEqual({
      flags: {
        digitalCopyPermitted: false,
        fourChannelAudio: false,
        preEmphasisEnabled: true,
        scms: false,
      },
      files: [],
      comments: [],
    })
    expect(error.kind).toBe(ErrorKind.InvalidFlagsCommandLocation)
    expect(error.position.line).toBe(1)
    expect(error.position.column).toBe(1)
  })

  it('FLAGS command must come before INDEX command', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE "" WAVE\nTRACK 20 AUDIO\nINDEX 01 00:00:00\nFLAGS PRE\n`)
    expect(sheet).toEqual({
      flags: {
        digitalCopyPermitted: false,
        fourChannelAudio: false,
        preEmphasisEnabled: true,
        scms: false,
      },
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
              trackNumber: 20,
            },
          ],
        },
      ],
      comments: [],
    })
    expect(error.kind).toBe(ErrorKind.InvalidFlagsCommandLocation)
    expect(error.position.line).toBe(4)
    expect(error.position.column).toBe(1)
  })

  it("arguments can't be quoted", () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE "" WAVE\nTRACK 20 AUDIO\nFLAGS "PRE"\n`)
    expect(sheet).toEqual({
      flags: {
        digitalCopyPermitted: false,
        fourChannelAudio: false,
        preEmphasisEnabled: false,
        scms: false,
      },
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              dataType: TrackDataType.Audio,
              indexes: [],
              trackNumber: 20,
            },
          ],
        },
      ],
      comments: [],
    })
    expect(error.kind).toBe(ErrorKind.NoFlags)
    expect(error.position.line).toBe(3)
    expect(error.position.column).toBe(12)
  })
})

describe('INDEX command', () => {
  it('parse valid INDEX command', () => {
    expect(parse(`FILE "" WAVE\nTRACK 1 AUDIO\nINDEX 01 00:00:00`)).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType.Audio,
                indexes: [{ number: 1, startingTime: [0, 0, 0] }],
              },
            ],
          },
        ],
      },
      errors: [],
    })

    expect(
      parse(
        `FILE "" WAVE\nTRACK 1 AUDIO\nINDEX 00 00:00:00\nINDEX 01 123:45:56`
      )
    ).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType.Audio,
                indexes: [
                  { number: 0, startingTime: [0, 0, 0] },
                  { number: 1, startingTime: [123, 45, 56] },
                ],
              },
            ],
          },
        ],
      },
      errors: [],
    })

    expect(
      parse(`
      FILE "" WAVE
        TRACK 1 AUDIO
          INDEX 00 00:00:00
        TRACK 2 AUDIO
          INDEX 01 123:45:56`)
    ).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType.Audio,
                indexes: [{ number: 0, startingTime: [0, 0, 0] }],
              },
              {
                trackNumber: 2,
                dataType: TrackDataType.Audio,
                indexes: [{ number: 1, startingTime: [123, 45, 56] }],
              },
            ],
          },
        ],
      },
      errors: [],
    })
  })

  it('first index must be 0 or 1', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE "" WAVE\nTRACK 1 AUDIO\nINDEX 02 00:00:00`)
    expect(sheet).toEqual({
      comments: [],
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 2, startingTime: [0, 0, 0] }],
            },
          ],
        },
      ],
    })
    expect(error.kind).toBe(ErrorKind.InvalidFirstIndexNumber)
    expect(error.position.line).toBe(3)
    expect(error.position.column).toBe(7)
  })

  it('first index must start from 00:00:00', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE "" WAVE\nTRACK 1 AUDIO\nINDEX 00 00:00:01`)
    expect(sheet).toEqual({
      comments: [],
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 0, startingTime: [0, 0, 1] }],
            },
          ],
        },
      ],
    })
    expect(error.kind).toBe(ErrorKind.InvalidFirstIndexTime)
    expect(error.position.line).toBe(3)
    expect(error.position.column).toBe(10)
  })

  it('invalid index number range', () => {
    const {
      sheet,
      errors: [error],
    } = parse(
      `FILE "" WAVE\nTRACK 1 AUDIO\nINDEX 00 00:00:00\nINDEX a 00:02:00`
    )
    expect(sheet).toEqual({
      comments: [],
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [
                { number: 0, startingTime: [0, 0, 0] },
                { number: NaN, startingTime: [0, 2, 0] },
              ],
            },
          ],
        },
      ],
    })
    expect(error.kind).toBe(ErrorKind.InvalidIndexNumberRange)
    expect(error.position.line).toBe(4)
    expect(error.position.column).toBe(7)
  })

  it('index number must be sequential', () => {
    const {
      sheet,
      errors: [error],
    } = parse(
      `FILE "" WAVE\nTRACK 1 AUDIO\nINDEX 00 00:00:00\nINDEX 02 00:02:00`
    )
    expect(sheet).toEqual({
      comments: [],
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [
                { number: 0, startingTime: [0, 0, 0] },
                { number: 2, startingTime: [0, 2, 0] },
              ],
            },
          ],
        },
      ],
    })
    expect(error.kind).toBe(ErrorKind.InvalidIndexNumberSequence)
    expect(error.position.line).toBe(4)
    expect(error.position.column).toBe(7)
  })

  it('index number out of range', () => {
    const {
      sheet,
      errors: [error],
    } = parse(
      `FILE "" WAVE\nTRACK 1 AUDIO\nINDEX 00 00:00:00\nINDEX 100 00:02:00`
    )
    expect(sheet).toEqual({
      comments: [],
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [
                { number: 0, startingTime: [0, 0, 0] },
                { number: 100, startingTime: [0, 2, 0] },
              ],
            },
          ],
        },
      ],
    })
    expect(error.kind).toBe(ErrorKind.InvalidIndexNumberRange)
    expect(error.position.line).toBe(4)
    expect(error.position.column).toBe(7)
  })

  it('invalid index time format', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE "" WAVE\nTRACK 1 AUDIO\nINDEX 00 0:1:0`)
    expect(sheet).toEqual({
      comments: [],
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 0, startingTime: [0, 0, 0] }],
            },
          ],
        },
      ],
    })
    expect(error.kind).toBe(ErrorKind.InvalidTimeFormat)
    expect(error.position.line).toBe(3)
    expect(error.position.column).toBe(10)
  })

  it('frames too large', () => {
    const {
      sheet,
      errors: [error],
    } = parse(
      `FILE "" WAVE\nTRACK 1 AUDIO\nINDEX 00 00:00:00\nINDEX 01 00:00:75`
    )
    expect(sheet).toEqual({
      comments: [],
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [
                { number: 0, startingTime: [0, 0, 0] },
                { number: 1, startingTime: [0, 0, 75] },
              ],
            },
          ],
        },
      ],
    })
    expect(error.kind).toBe(ErrorKind.FramesTooLarge)
    expect(error.position.line).toBe(4)
    expect(error.position.column).toBe(10)
  })
})

describe('ISRC command', () => {
  it('parse valid ISRC command', () => {
    expect(parse(`FILE "" WAVE\nTRACK 1 AUDIO\nISRC abxyz1234567`)).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType.Audio,
                indexes: [],
                isrc: 'abxyz1234567',
              },
            ],
          },
        ],
      },
      errors: [],
    })

    expect(parse(`FILE "" WAVE\nTRACK 1 AUDIO\nISRC ABXYZ1234567`)).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType.Audio,
                indexes: [],
                isrc: 'ABXYZ1234567',
              },
            ],
          },
        ],
      },
      errors: [],
    })

    expect(parse(`FILE "" WAVE\nTRACK 1 AUDIO\nISRC 012341234567`)).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType.Audio,
                indexes: [],
                isrc: '012341234567',
              },
            ],
          },
        ],
      },
      errors: [],
    })
  })

  it('too short ISRC', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE "" WAVE\nTRACK 1 AUDIO\nISRC abc`)
    expect(sheet).toEqual({
      comments: [],
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [],
              isrc: 'abc',
            },
          ],
        },
      ],
    })
    expect(error.kind).toBe(ErrorKind.InvalidISRCFormat)
    expect(error.position.line).toBe(3)
    expect(error.position.column).toBe(6)
  })

  it('too short ISRC', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE "" WAVE\nTRACK 1 AUDIO\nISRC abcde012345678`)
    expect(sheet).toEqual({
      comments: [],
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [],
              isrc: 'abcde012345678',
            },
          ],
        },
      ],
    })
    expect(error.kind).toBe(ErrorKind.InvalidISRCFormat)
    expect(error.position.line).toBe(3)
    expect(error.position.column).toBe(6)
  })

  it('invalid ISRC format', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE "" WAVE\nTRACK 1 AUDIO\nISRC abcdef1234567`)
    expect(sheet).toEqual({
      comments: [],
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [],
              isrc: 'abcdef1234567',
            },
          ],
        },
      ],
    })
    expect(error.kind).toBe(ErrorKind.InvalidISRCFormat)
    expect(error.position.line).toBe(3)
    expect(error.position.column).toBe(6)
  })

  it('ISRC command must come after TRACK command', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`ISRC ABXYZ1234567`)
    expect(sheet).toEqual({
      comments: [],
      files: [],
    })
    expect(error.kind).toBe(ErrorKind.InvalidISRCCommandLocation)
    expect(error.position.line).toBe(1)
    expect(error.position.column).toBe(1)
  })

  it('ISRC command must come before INDEX command', () => {
    const {
      sheet,
      errors: [error],
    } = parse(
      `FILE "" WAVE\nTRACK 1 AUDIO\nINDEX 00 00:00:00\nISRC ABXYZ1234567`
    )
    expect(sheet).toEqual({
      comments: [],
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 0, startingTime: [0, 0, 0] }],
              isrc: 'ABXYZ1234567',
            },
          ],
        },
      ],
    })
    expect(error.kind).toBe(ErrorKind.InvalidISRCCommandLocation)
    expect(error.position.line).toBe(4)
    expect(error.position.column).toBe(1)
  })
})

describe('PERFORMER command', () => {
  it('parse valid PERFORMER command', () => {
    expect(parse(`PERFORMER abc`)).toEqual({
      sheet: {
        comments: [],
        files: [],
        performer: 'abc',
      },
      errors: [],
    })

    expect(parse(`FILE "" WAVE\nTRACK 1 AUDIO\nPERFORMER abc`)).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType.Audio,
                indexes: [],
                performer: 'abc',
              },
            ],
          },
        ],
      },
      errors: [],
    })

    expect(parse(`PERFORMER "abc def"`)).toEqual({
      sheet: {
        comments: [],
        files: [],
        performer: 'abc def',
      },
      errors: [],
    })

    expect(parse(`FILE "" WAVE\nTRACK 1 AUDIO\nPERFORMER "abc def"`)).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType.Audio,
                indexes: [],
                performer: 'abc def',
              },
            ],
          },
        ],
      },
      errors: [],
    })

    expect(parse(`PERFORMER 🍥🫕`)).toEqual({
      sheet: {
        comments: [],
        files: [],
        performer: '🍥🫕',
      },
      errors: [],
    })
  })

  it('performer too long', () => {
    const performer = 'x'.repeat(81)
    const {
      sheet,
      errors: [error],
    } = parse(`PERFORMER ${performer}`)
    expect(sheet).toEqual({
      comments: [],
      files: [],
      performer,
    })
    expect(error.kind).toBe(ErrorKind.TooLongPerformer)
    expect(error.position.line).toBe(1)
    expect(error.position.column).toBe(11)
  })
})

describe('POSTGAP command', () => {
  it('parse valid POSTGAP command', () => {
    expect(
      parse(`FILE "" WAVE\nTRACK 1 AUDIO\nINDEX 00 00:00:00\nPOSTGAP 00:02:00`)
    ).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType.Audio,
                indexes: [{ number: 0, startingTime: [0, 0, 0] }],
                postGap: [0, 2, 0],
              },
            ],
          },
        ],
      },
      errors: [],
    })

    expect(
      parse(`FILE "" WAVE\nTRACK 1 AUDIO\nINDEX 00 00:00:00\nPOSTGAP 123:45:56`)
    ).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType.Audio,
                indexes: [{ number: 0, startingTime: [0, 0, 0] }],
                postGap: [123, 45, 56],
              },
            ],
          },
        ],
      },
      errors: [],
    })
  })

  it('duplicated POSTGAP command', () => {
    const {
      sheet,
      errors: [error],
    } = parse(
      `FILE "" WAVE\nTRACK 1 AUDIO\nINDEX 00 00:00:00\nPOSTGAP 00:00:00\nPOSTGAP 00:01:00`
    )
    expect(sheet).toEqual({
      comments: [],
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 0, startingTime: [0, 0, 0] }],
              postGap: [0, 1, 0],
            },
          ],
        },
      ],
    })
    expect(error.kind).toBe(ErrorKind.DuplicatedPostGapCommand)
    expect(error.position.line).toBe(5)
    expect(error.position.column).toBe(1)
  })

  it('POSTGAP command must come after INDEX command', () => {
    const {
      sheet,
      errors: [error],
    } = parse(
      `FILE "" WAVE\nTRACK 1 AUDIO\nPOSTGAP 00:00:00\nINDEX 00 00:00:00`
    )
    expect(sheet).toEqual({
      comments: [],
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 0, startingTime: [0, 0, 0] }],
              postGap: [0, 0, 0],
            },
          ],
        },
      ],
    })
    expect(error.kind).toBe(ErrorKind.InvalidPostGapCommandLocation)
    expect(error.position.line).toBe(3)
    expect(error.position.column).toBe(1)
  })

  it('missing current track', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`POSTGAP 00:00:00\n`)
    expect(sheet).toEqual({
      comments: [],
      files: [],
    })
    expect(error.kind).toBe(ErrorKind.CurrentTrackRequired)
    expect(error.position.line).toBe(1)
    expect(error.position.column).toBe(1)
  })

  it('frame too large', () => {
    const {
      sheet,
      errors: [error],
    } = parse(
      `FILE "" WAVE\nTRACK 1 AUDIO\nINDEX 00 00:00:00\nPOSTGAP 00:02:75`
    )
    expect(sheet).toEqual({
      comments: [],
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 0, startingTime: [0, 0, 0] }],
              postGap: [0, 2, 75],
            },
          ],
        },
      ],
    })
    expect(error.kind).toBe(ErrorKind.FramesTooLarge)
    expect(error.position.line).toBe(4)
    expect(error.position.column).toBe(9)
  })
})

describe('PREGAP command', () => {
  it('parse valid PREGAP command', () => {
    expect(
      parse(`FILE "" WAVE\nTRACK 1 AUDIO\nPREGAP 00:02:00\nINDEX 00 00:00:00`)
    ).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType.Audio,
                indexes: [{ number: 0, startingTime: [0, 0, 0] }],
                preGap: [0, 2, 0],
              },
            ],
          },
        ],
      },
      errors: [],
    })

    expect(
      parse(`FILE "" WAVE\nTRACK 1 AUDIO\nPREGAP 123:45:56\nINDEX 00 00:00:00`)
    ).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType.Audio,
                indexes: [{ number: 0, startingTime: [0, 0, 0] }],
                preGap: [123, 45, 56],
              },
            ],
          },
        ],
      },
      errors: [],
    })
  })

  it('duplicated PREGAP command', () => {
    const {
      sheet,
      errors: [error],
    } = parse(
      `FILE "" WAVE\nTRACK 1 AUDIO\nPREGAP 00:00:00\nPREGAP 00:01:00\nINDEX 00 00:00:00`
    )
    expect(sheet).toEqual({
      comments: [],
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 0, startingTime: [0, 0, 0] }],
              preGap: [0, 1, 0],
            },
          ],
        },
      ],
    })
    expect(error.kind).toBe(ErrorKind.DuplicatedPreGapCommand)
    expect(error.position.line).toBe(4)
    expect(error.position.column).toBe(1)
  })

  it('POSTGAP command must come before INDEX command', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE "" WAVE\nTRACK 1 AUDIO\nINDEX 00 00:00:00\nPREGAP 00:00:00`)
    expect(sheet).toEqual({
      comments: [],
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 0, startingTime: [0, 0, 0] }],
              preGap: [0, 0, 0],
            },
          ],
        },
      ],
    })
    expect(error.kind).toBe(ErrorKind.InvalidPreGapCommandLocation)
    expect(error.position.line).toBe(4)
    expect(error.position.column).toBe(1)
  })

  it('missing current track', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`PREGAP 00:00:00\n`)
    expect(sheet).toEqual({
      comments: [],
      files: [],
    })
    expect(error.kind).toBe(ErrorKind.CurrentTrackRequired)
    expect(error.position.line).toBe(1)
    expect(error.position.column).toBe(1)
  })

  it('frame too large', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE "" WAVE\nTRACK 1 AUDIO\nPREGAP 00:02:75\nINDEX 00 00:00:00`)
    expect(sheet).toEqual({
      comments: [],
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 0, startingTime: [0, 0, 0] }],
              preGap: [0, 2, 75],
            },
          ],
        },
      ],
    })
    expect(error.kind).toBe(ErrorKind.FramesTooLarge)
    expect(error.position.line).toBe(3)
    expect(error.position.column).toBe(8)
  })
})

describe('REM command', () => {
  it('parse comments', () => {
    expect(parse(`REM\nREM`)).toEqual({
      sheet: {
        comments: ['', ''],
        files: [],
      },
      errors: [],
    })

    expect(parse(`REM a b cd`)).toEqual({
      sheet: {
        comments: ['a b cd'],
        files: [],
      },
      errors: [],
    })

    expect(parse(`REM "a b c d"`)).toEqual({
      sheet: {
        comments: ['a b c d'],
        files: [],
      },
      errors: [],
    })
  })
})

describe('SONGWRITER command', () => {
  it('parse valid SONGWRITER command', () => {
    expect(parse(`SONGWRITER abc`)).toEqual({
      sheet: {
        comments: [],
        files: [],
        songWriter: 'abc',
      },
      errors: [],
    })

    expect(parse(`FILE "" WAVE\nTRACK 1 AUDIO\nSONGWRITER abc`)).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType.Audio,
                indexes: [],
                songWriter: 'abc',
              },
            ],
          },
        ],
      },
      errors: [],
    })

    expect(parse(`SONGWRITER "abc def"`)).toEqual({
      sheet: {
        comments: [],
        files: [],
        songWriter: 'abc def',
      },
      errors: [],
    })

    expect(parse(`FILE "" WAVE\nTRACK 1 AUDIO\nSONGWRITER "abc def"`)).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType.Audio,
                indexes: [],
                songWriter: 'abc def',
              },
            ],
          },
        ],
      },
      errors: [],
    })

    expect(parse(`SONGWRITER 🍥🫕`)).toEqual({
      sheet: {
        comments: [],
        files: [],
        songWriter: '🍥🫕',
      },
      errors: [],
    })
  })

  it('song writer too long', () => {
    const songWriter = 'x'.repeat(81)
    const {
      sheet,
      errors: [error],
    } = parse(`SONGWRITER ${songWriter}`)
    expect(sheet).toEqual({
      comments: [],
      files: [],
      songWriter,
    })
    expect(error.kind).toBe(ErrorKind.TooLongSongWriter)
    expect(error.position.line).toBe(1)
    expect(error.position.column).toBe(12)
  })
})

describe('TITLE command', () => {
  it('parse valid TITLE command', () => {
    expect(parse(`TITLE abc`)).toEqual({
      sheet: {
        comments: [],
        files: [],
        title: 'abc',
      },
      errors: [],
    })

    expect(parse(`FILE "" WAVE\nTRACK 1 AUDIO\nTITLE abc`)).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType.Audio,
                indexes: [],
                title: 'abc',
              },
            ],
          },
        ],
      },
      errors: [],
    })

    expect(parse(`TITLE "abc def"`)).toEqual({
      sheet: {
        comments: [],
        files: [],
        title: 'abc def',
      },
      errors: [],
    })

    expect(parse(`FILE "" WAVE\nTRACK 1 AUDIO\nTITLE "abc def"`)).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType.Audio,
                indexes: [],
                title: 'abc def',
              },
            ],
          },
        ],
      },
      errors: [],
    })

    expect(parse(`TITLE 🍥🫕`)).toEqual({
      sheet: {
        comments: [],
        files: [],
        title: '🍥🫕',
      },
      errors: [],
    })
  })

  it('song writer too long', () => {
    const title = 'x'.repeat(81)
    const {
      sheet,
      errors: [error],
    } = parse(`TITLE ${title}`)
    expect(sheet).toEqual({
      comments: [],
      files: [],
      title,
    })
    expect(error.kind).toBe(ErrorKind.TooLongTitle)
    expect(error.position.line).toBe(1)
    expect(error.position.column).toBe(7)
  })
})

describe('TRACK command', () => {
  it('parse valid TRACK command', () => {
    expect(parse(`FILE "" WAVE\nTRACK 1 AUDIO`)).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType.Audio,
                indexes: [],
              },
            ],
          },
        ],
      },
      errors: [],
    })

    expect(parse(`FILE "" WAVE\nTRACK 1 audio`)).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType.Audio,
                indexes: [],
              },
            ],
          },
        ],
      },
      errors: [],
    })

    expect(parse(`FILE "" WAVE\nTRACK 99 CDG`)).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 99,
                dataType: TrackDataType.Cdg,
                indexes: [],
              },
            ],
          },
        ],
      },
      errors: [],
    })

    expect(parse(`FILE "" WAVE\nTRACK 99 Cdg`)).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 99,
                dataType: TrackDataType.Cdg,
                indexes: [],
              },
            ],
          },
        ],
      },
      errors: [],
    })

    expect(parse(`FILE "" WAVE\nTRACK 12 MODE1/2048`)).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 12,
                dataType: TrackDataType['Mode1/2048'],
                indexes: [],
              },
            ],
          },
        ],
      },
      errors: [],
    })

    expect(parse(`FILE "" WAVE\nTRACK 1 MODE1/2352`)).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType['Mode1/2352'],
                indexes: [],
              },
            ],
          },
        ],
      },
      errors: [],
    })

    expect(parse(`FILE "" WAVE\nTRACK 1 MODE2/2336`)).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType['Mode2/2336'],
                indexes: [],
              },
            ],
          },
        ],
      },
      errors: [],
    })

    expect(parse(`FILE "" WAVE\nTRACK 1 MODE2/2352`)).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType['Mode2/2352'],
                indexes: [],
              },
            ],
          },
        ],
      },
      errors: [],
    })

    expect(parse(`FILE "" WAVE\nTRACK 1 CDI/2336`)).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType['Cdi/2336'],
                indexes: [],
              },
            ],
          },
        ],
      },
      errors: [],
    })

    expect(parse(`FILE "" WAVE\nTRACK 1 CDI/2352`)).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType['Cdi/2352'],
                indexes: [],
              },
            ],
          },
        ],
      },
      errors: [],
    })
  })

  it('multiple tracks', () => {
    expect(
      parse(`
FILE "" WAVE
  TRACK 1 AUDIO
    PERFORMER pa
    TITLE ta
  TRACK 2 CDG
    PERFORMER pb
    TITLE tb
    `)
    ).toEqual({
      sheet: {
        comments: [],
        files: [
          {
            name: '',
            type: FileType.Wave,
            tracks: [
              {
                trackNumber: 1,
                dataType: TrackDataType.Audio,
                indexes: [],
                performer: 'pa',
                title: 'ta',
              },
              {
                trackNumber: 2,
                dataType: TrackDataType.Cdg,
                indexes: [],
                performer: 'pb',
                title: 'tb',
              },
            ],
          },
        ],
      },
      errors: [],
    })
  })

  it('unknown track data type', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE "" WAVE\nTRACK 1 XYZ`)
    expect(sheet).toEqual({
      comments: [],
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Unknown,
              indexes: [],
            },
          ],
        },
      ],
    })
    expect(error.kind).toBe(ErrorKind.UnknownTrackDataType)
    expect(error.position.line).toBe(2)
    expect(error.position.column).toBe(9)
  })

  it('track number lower than 1', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE "" WAVE\nTRACK 0 AUDIO`)
    expect(sheet).toEqual({
      comments: [],
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 0,
              dataType: TrackDataType.Audio,
              indexes: [],
            },
          ],
        },
      ],
    })
    expect(error.kind).toBe(ErrorKind.InvalidTrackNumberRange)
    expect(error.position.line).toBe(2)
    expect(error.position.column).toBe(7)
  })

  it('track number higher than 99', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE "" WAVE\nTRACK 100 AUDIO`)
    expect(sheet).toEqual({
      comments: [],
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 100,
              dataType: TrackDataType.Audio,
              indexes: [],
            },
          ],
        },
      ],
    })
    expect(error.kind).toBe(ErrorKind.InvalidTrackNumberRange)
    expect(error.position.line).toBe(2)
    expect(error.position.column).toBe(7)
  })

  it('track number must be sequential', () => {
    const {
      sheet,
      errors: [error],
    } = parse(`FILE "" WAVE\nTRACK 2 AUDIO\nTRACK 4 AUDIO`)
    expect(sheet).toEqual({
      comments: [],
      files: [
        {
          name: '',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 2,
              dataType: TrackDataType.Audio,
              indexes: [],
            },
            {
              trackNumber: 4,
              dataType: TrackDataType.Audio,
              indexes: [],
            },
          ],
        },
      ],
    })
    expect(error.kind).toBe(ErrorKind.InvalidTrackNumberSequence)
    expect(error.position.line).toBe(3)
    expect(error.position.column).toBe(7)
  })

  it('check at least one track', () => {
    const {
      sheet,
      errors: [error],
    } = parse('', {
      checkAtLeastOneTrack: true,
    })
    expect(sheet).toEqual({
      comments: [],
      files: [],
    })
    expect(error.kind).toBe(ErrorKind.TracksRequired)
    expect(error.position.line).toBe(1)
    expect(error.position.column).toBe(1)
  })
})
