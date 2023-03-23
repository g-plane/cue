import { describe, it, test, expect } from 'vitest'
import { type CueSheet, FileType } from '../src/types'
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
  it('basic', () => {
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
