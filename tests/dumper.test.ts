import { describe, it, test, expect } from 'vitest'
import { type CueSheet, FileType, TrackDataType } from '../src/types'
import { dump } from '../src/dumper'

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
})
