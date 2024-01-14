import { describe, expect, it, test } from 'vitest'
import { dump } from '../src/dumper'
import { type CueSheet, FileType, TrackDataType } from '../src/types'

test('empty cue sheet', () => {
  const sheet: CueSheet = {
    files: [],
    comments: [],
  }
  expect(dump(sheet)).toBe('')
})

describe('CATALOG command', () => {
  it('basic', () => {
    const sheet: CueSheet = {
      catalog: '123456789012',
      files: [],
      comments: [],
    }
    expect(dump(sheet)).toBe('CATALOG 123456789012\n')
  })
})

describe('CDTEXTFILE command', () => {
  it('basic', () => {
    const sheet: CueSheet = {
      CDTextFile: 'foo.txt',
      files: [],
      comments: [],
    }
    expect(dump(sheet)).toBe('CDTEXTFILE "foo.txt"\n')
  })

  it('escape', () => {
    const sheet: CueSheet = {
      CDTextFile: 'foo"bar.txt',
      files: [],
      comments: [],
    }
    expect(dump(sheet)).toBe('CDTEXTFILE "foo\\"bar.txt"\n')
  })
})

describe('FILE command', () => {
  it('binary', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Binary,
          tracks: [],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe('FILE "foo.wav" BINARY\n')
  })

  it('motorola', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Motorola,
          tracks: [],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe('FILE "foo.wav" MOTOROLA\n')
  })

  it('aiff', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Aiff,
          tracks: [],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe('FILE "foo.wav" AIFF\n')
  })

  it('wave', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Wave,
          tracks: [],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe('FILE "foo.wav" WAVE\n')
  })

  it('mp3', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Mp3,
          tracks: [],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe('FILE "foo.wav" MP3\n')
  })

  it('escape', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo"bar.wav',
          type: FileType.Wave,
          tracks: [],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe('FILE "foo\\"bar.wav" WAVE\n')
  })
})

describe('FLAGS command', () => {
  it('digitalCopyPermitted', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              flags: {
                digitalCopyPermitted: true,
                fourChannelAudio: false,
                preEmphasisEnabled: false,
                scms: false,
              },
              indexes: [],
            },
          ],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe(
      'FILE "foo.wav" WAVE\n  TRACK 01 AUDIO\n    FLAGS DCP\n'
    )
  })

  it('fourChannelAudio', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              flags: {
                digitalCopyPermitted: false,
                fourChannelAudio: true,
                preEmphasisEnabled: false,
                scms: false,
              },
              indexes: [],
            },
          ],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe(
      'FILE "foo.wav" WAVE\n  TRACK 01 AUDIO\n    FLAGS 4CH\n'
    )
  })

  it('preEmphasisEnabled', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              flags: {
                digitalCopyPermitted: false,
                fourChannelAudio: false,
                preEmphasisEnabled: true,
                scms: false,
              },
              indexes: [],
            },
          ],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe(
      'FILE "foo.wav" WAVE\n  TRACK 01 AUDIO\n    FLAGS PRE\n'
    )
  })

  it('scms', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              flags: {
                digitalCopyPermitted: false,
                fourChannelAudio: false,
                preEmphasisEnabled: false,
                scms: true,
              },
              indexes: [],
            },
          ],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe(
      'FILE "foo.wav" WAVE\n  TRACK 01 AUDIO\n    FLAGS SCMS\n'
    )
  })

  it('many flags but not all', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              flags: {
                digitalCopyPermitted: true,
                fourChannelAudio: false,
                preEmphasisEnabled: true,
                scms: false,
              },
              indexes: [],
            },
          ],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe(
      'FILE "foo.wav" WAVE\n  TRACK 01 AUDIO\n    FLAGS DCP PRE\n'
    )
  })

  it('all flags', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              flags: {
                digitalCopyPermitted: true,
                fourChannelAudio: true,
                preEmphasisEnabled: true,
                scms: true,
              },
              indexes: [],
            },
          ],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe(
      'FILE "foo.wav" WAVE\n  TRACK 01 AUDIO\n    FLAGS DCP 4CH PRE SCMS\n'
    )
  })

  it('with index', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              flags: {
                digitalCopyPermitted: true,
                fourChannelAudio: true,
                preEmphasisEnabled: true,
                scms: true,
              },
              indexes: [
                {
                  number: 1,
                  startingTime: [0, 0, 0],
                },
              ],
            },
          ],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe(
      'FILE "foo.wav" WAVE\n  TRACK 01 AUDIO\n    FLAGS DCP 4CH PRE SCMS\n    INDEX 01 00:00:00\n'
    )
  })
})

describe('INDEX command', () => {
  it('basic', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [
                {
                  number: 1,
                  startingTime: [0, 0, 0],
                },
              ],
            },
          ],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe(
      'FILE "foo.wav" WAVE\n  TRACK 01 AUDIO\n    INDEX 01 00:00:00\n'
    )
  })

  it('index number', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [
                {
                  number: 23,
                  startingTime: [0, 0, 0],
                },
              ],
            },
          ],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe(
      'FILE "foo.wav" WAVE\n  TRACK 01 AUDIO\n    INDEX 23 00:00:00\n'
    )
  })

  it('starting time', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [
                {
                  number: 1,
                  startingTime: [2, 15, 72],
                },
              ],
            },
          ],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe(
      'FILE "foo.wav" WAVE\n  TRACK 01 AUDIO\n    INDEX 01 02:15:72\n'
    )
  })

  it('multiple indexes', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [
                {
                  number: 1,
                  startingTime: [0, 0, 0],
                },
                {
                  number: 2,
                  startingTime: [12, 5, 62],
                },
              ],
            },
          ],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe(
      'FILE "foo.wav" WAVE\n  TRACK 01 AUDIO\n    INDEX 01 00:00:00\n    INDEX 02 12:05:62\n'
    )
  })
})

describe('ISRC command', () => {
  it('basic', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              isrc: 'ABCDE1234567',
              indexes: [
                {
                  number: 1,
                  startingTime: [0, 0, 0],
                },
              ],
            },
          ],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe(
      'FILE "foo.wav" WAVE\n  TRACK 01 AUDIO\n    ISRC ABCDE1234567\n    INDEX 01 00:00:00\n'
    )
  })
})

describe('PERFORMER command', () => {
  it('basic', () => {
    const sheet: CueSheet = {
      performer: 'foo',
      files: [],
      comments: [],
    }
    expect(dump(sheet)).toBe('PERFORMER "foo"\n')
  })

  it('escape', () => {
    const sheet: CueSheet = {
      performer: 'foo"bar',
      files: [],
      comments: [],
    }
    expect(dump(sheet)).toBe('PERFORMER "foo\\"bar"\n')
  })

  it('within track', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              performer: 'foo',
              indexes: [],
            },
          ],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe(
      'FILE "foo.wav" WAVE\n  TRACK 01 AUDIO\n    PERFORMER "foo"\n'
    )
  })
})

describe('POSTGAP command', () => {
  it('basic', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              postGap: [4, 12, 68],
              indexes: [
                {
                  number: 1,
                  startingTime: [0, 0, 0],
                },
              ],
            },
          ],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe(
      'FILE "foo.wav" WAVE\n  TRACK 01 AUDIO\n    INDEX 01 00:00:00\n    POSTGAP 04:12:68\n'
    )
  })
})

describe('PREGAP command', () => {
  it('basic', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              preGap: [1, 5, 23],
              indexes: [
                {
                  number: 1,
                  startingTime: [1, 6, 0],
                },
              ],
            },
          ],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe(
      'FILE "foo.wav" WAVE\n  TRACK 01 AUDIO\n    PREGAP 01:05:23\n    INDEX 01 01:06:00\n'
    )
  })
})

describe('SONGWRITER command', () => {
  it('basic', () => {
    const sheet: CueSheet = {
      songWriter: 'foo',
      files: [],
      comments: [],
    }
    expect(dump(sheet)).toBe('SONGWRITER "foo"\n')
  })

  it('escape', () => {
    const sheet: CueSheet = {
      songWriter: 'foo"bar',
      files: [],
      comments: [],
    }
    expect(dump(sheet)).toBe('SONGWRITER "foo\\"bar"\n')
  })

  it('within track', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              songWriter: 'foo',
              indexes: [],
            },
          ],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe(
      'FILE "foo.wav" WAVE\n  TRACK 01 AUDIO\n    SONGWRITER "foo"\n'
    )
  })
})

describe('TITLE command', () => {
  it('basic', () => {
    const sheet: CueSheet = {
      title: 'foo',
      files: [],
      comments: [],
    }
    expect(dump(sheet)).toBe('TITLE "foo"\n')
  })

  it('escape', () => {
    const sheet: CueSheet = {
      title: 'foo"bar',
      files: [],
      comments: [],
    }
    expect(dump(sheet)).toBe('TITLE "foo\\"bar"\n')
  })

  it('within track', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              title: 'foo',
              indexes: [],
            },
          ],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe(
      'FILE "foo.wav" WAVE\n  TRACK 01 AUDIO\n    TITLE "foo"\n'
    )
  })
})

describe('TRACK command', () => {
  it('track number', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 25,
              dataType: TrackDataType.Audio,
              indexes: [],
            },
          ],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe('FILE "foo.wav" WAVE\n  TRACK 25 AUDIO\n')
  })

  it('audio', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
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
      comments: [],
    }
    expect(dump(sheet)).toBe('FILE "foo.wav" WAVE\n  TRACK 01 AUDIO\n')
  })

  it('cdg', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Cdg,
              indexes: [],
            },
          ],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe('FILE "foo.wav" WAVE\n  TRACK 01 CDG\n')
  })

  it('mode1/2048', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType['Mode1/2048'],
              indexes: [],
            },
          ],
        },
      ],
      comments: [],
    }
    expect(dump(sheet)).toBe('FILE "foo.wav" WAVE\n  TRACK 01 MODE1/2048\n')
  })

  it('mode1/2352', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
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
      comments: [],
    }
    expect(dump(sheet)).toBe('FILE "foo.wav" WAVE\n  TRACK 01 MODE1/2352\n')
  })

  it('mode2/2336', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
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
      comments: [],
    }
    expect(dump(sheet)).toBe('FILE "foo.wav" WAVE\n  TRACK 01 MODE2/2336\n')
  })

  it('mode2/2352', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
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
      comments: [],
    }
    expect(dump(sheet)).toBe('FILE "foo.wav" WAVE\n  TRACK 01 MODE2/2352\n')
  })

  it('cdi/2336', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
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
      comments: [],
    }
    expect(dump(sheet)).toBe('FILE "foo.wav" WAVE\n  TRACK 01 CDI/2336\n')
  })

  it('cdi/2352', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
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
      comments: [],
    }
    expect(dump(sheet)).toBe('FILE "foo.wav" WAVE\n  TRACK 01 CDI/2352\n')
  })
})

describe('dumper options', () => {
  describe('lineBreak', () => {
    it('LF', () => {
      const sheet: CueSheet = {
        files: [
          {
            name: 'foo.wav',
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
        comments: [],
      }
      expect(dump(sheet, { lineBreak: '\n' })).toBe(
        'FILE "foo.wav" WAVE\n  TRACK 01 AUDIO\n'
      )
    })

    it('CRLF', () => {
      const sheet: CueSheet = {
        files: [
          {
            name: 'foo.wav',
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
        comments: [],
      }
      expect(dump(sheet, { lineBreak: '\r\n' })).toBe(
        'FILE "foo.wav" WAVE\r\n  TRACK 01 AUDIO\r\n'
      )
    })
  })

  describe('indentKind', () => {
    it('space', () => {
      const sheet: CueSheet = {
        files: [
          {
            name: 'foo.wav',
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
        comments: [],
      }
      expect(dump(sheet, { indentKind: ' ' })).toBe(
        'FILE "foo.wav" WAVE\n  TRACK 01 AUDIO\n'
      )
    })

    it('tab', () => {
      const sheet: CueSheet = {
        files: [
          {
            name: 'foo.wav',
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
        comments: [],
      }
      expect(dump(sheet, { indentKind: '\t' })).toBe(
        'FILE "foo.wav" WAVE\n\tTRACK 01 AUDIO\n'
      )
    })

    it('tab with overrided indentSize', () => {
      const sheet: CueSheet = {
        files: [
          {
            name: 'foo.wav',
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
        comments: [],
      }
      expect(dump(sheet, { indentKind: '\t', indentSize: 4 })).toBe(
        'FILE "foo.wav" WAVE\n\tTRACK 01 AUDIO\n'
      )
    })
  })

  describe('indentSize', () => {
    it('2', () => {
      const sheet: CueSheet = {
        files: [
          {
            name: 'foo.wav',
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
        comments: [],
      }
      expect(dump(sheet, { indentSize: 2 })).toBe(
        'FILE "foo.wav" WAVE\n  TRACK 01 AUDIO\n'
      )
    })

    it('4', () => {
      const sheet: CueSheet = {
        files: [
          {
            name: 'foo.wav',
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
        comments: [],
      }
      expect(dump(sheet, { indentSize: 4 })).toBe(
        'FILE "foo.wav" WAVE\n    TRACK 01 AUDIO\n'
      )
    })
  })
})

describe('comments', () => {
  it('comments only', () => {
    const sheet: CueSheet = {
      files: [],
      comments: ['DATE 2024', 'GENRE anime']
    }
    expect(dump(sheet)).toBe('REM DATE 2024\nREM GENRE anime\n')
  })

  it('with other fields', () => {
    const sheet: CueSheet = {
      files: [
        {
          name: 'foo.wav',
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
      comments: ['DATE 2024', 'GENRE anime']
    }
    expect(dump(sheet)).toBe(
      `REM DATE 2024
REM GENRE anime
FILE "foo.wav" WAVE
  TRACK 01 AUDIO
`)
  })
})
