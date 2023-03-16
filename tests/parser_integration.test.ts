import { test, expect } from 'vitest'
import { FileType, TrackDataType, parse } from '../src'

test('example 1', () => {
  expect(
    parse(`
FILE "C:\\MYAUDIO.WAV" WAVE
 TRACK 01 AUDIO
  INDEX 01 00:00:00
 TRACK 02 AUDIO
  INDEX 01 05:50:65
 TRACK 03 AUDIO
  INDEX 01 09:47:50
 TRACK 04 AUDIO
  INDEX 01 15:12:53
 TRACK 05 AUDIO
  INDEX 01 25:02:40
 TRACK 06 AUDIO
  INDEX 01 27:34:05
 TRACK 07 AUDIO
  INDEX 01 31:58:53
 TRACK 08 AUDIO
  INDEX 01 35:08:65
    `)
  ).toEqual({
    sheet: {
      comments: [],
      files: [
        {
          name: 'C:\\MYAUDIO.WAV',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
            },
            {
              trackNumber: 2,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [5, 50, 65] }],
            },
            {
              trackNumber: 3,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [9, 47, 50] }],
            },
            {
              trackNumber: 4,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [15, 12, 53] }],
            },
            {
              trackNumber: 5,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [25, 2, 40] }],
            },
            {
              trackNumber: 6,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [27, 34, 5] }],
            },
            {
              trackNumber: 7,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [31, 58, 53] }],
            },
            {
              trackNumber: 8,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [35, 8, 65] }],
            },
          ],
        },
      ],
    },
    errors: [],
  })
})

test('example 2', () => {
  expect(
    parse(`
FILE "C:\\TRACK1.WAV" WAVE
  TRACK 01 AUDIO
    INDEX 01 00:00:00
FILE "C:\\TRACK2.WAV" WAVE
  TRACK 02 AUDIO
    INDEX 01 00:00:00
FILE "C:\\TRACK1.AIF" AIFF
  TRACK 03 AUDIO
    INDEX 01 00:00:00
FILE "C:\\TRACK2.AIF" AIFF
  TRACK 04 AUDIO
    INDEX 01 00:00:00
FILE "C:\\TRACK1.MP3" MP3
  TRACK 05 AUDIO
    INDEX 01 00:00:00
FILE "C:\\TRACK2.MP3" MP3
  TRACK 06 AUDIO
    INDEX 01 00:00:00
  `)
  ).toEqual({
    sheet: {
      comments: [],
      files: [
        {
          name: 'C:\\TRACK1.WAV',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
            },
          ],
        },
        {
          name: 'C:\\TRACK2.WAV',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 2,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
            },
          ],
        },
        {
          name: 'C:\\TRACK1.AIF',
          type: FileType.Aiff,
          tracks: [
            {
              trackNumber: 3,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
            },
          ],
        },
        {
          name: 'C:\\TRACK2.AIF',
          type: FileType.Aiff,
          tracks: [
            {
              trackNumber: 4,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
            },
          ],
        },
        {
          name: 'C:\\TRACK1.MP3',
          type: FileType.Mp3,
          tracks: [
            {
              trackNumber: 5,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
            },
          ],
        },
        {
          name: 'C:\\TRACK2.MP3',
          type: FileType.Mp3,
          tracks: [
            {
              trackNumber: 6,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
            },
          ],
        },
      ],
    },
    errors: [],
  })
})

test('example 3', () => {
  expect(
    parse(`
FILE "C:\\TRACK1.WAV" WAVE
  TRACK 01 AUDIO
    INDEX 01 00:00:00
  TRACK 02 AUDIO
    INDEX 01 05:50:65
  TRACK 03 AUDIO
    INDEX 01 09:47:50
  TRACK 04 AUDIO
    INDEX 01 15:12:53
FILE "C:\\TRACK2.WAV" WAVE
  TRACK 05 AUDIO
    INDEX 01 00:00:00
  TRACK 06 AUDIO
    INDEX 01 02:31:40
  TRACK 07 AUDIO
    INDEX 01 06:56:13
  TRACK 08 AUDIO
    INDEX 01 10:06:25
  `)
  ).toEqual({
    sheet: {
      comments: [],
      files: [
        {
          name: 'C:\\TRACK1.WAV',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
            },
            {
              trackNumber: 2,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [5, 50, 65] }],
            },
            {
              trackNumber: 3,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [9, 47, 50] }],
            },
            {
              trackNumber: 4,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [15, 12, 53] }],
            },
          ],
        },
        {
          name: 'C:\\TRACK2.WAV',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 5,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
            },
            {
              trackNumber: 6,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [2, 31, 40] }],
            },
            {
              trackNumber: 7,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [6, 56, 13] }],
            },
            {
              trackNumber: 8,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [10, 6, 25] }],
            },
          ],
        },
      ],
    },
    errors: [],
  })
})

test('example 4', () => {
  expect(
    parse(`
FILE "C:\\MYAUDIO1.WAV" WAVE
  TRACK 01 AUDIO
    INDEX 01 00:00:00
  TRACK 02 AUDIO
    INDEX 00 05:49:65
    INDEX 01 05:50:65
  TRACK 03 AUDIO
    INDEX 00 09:45:50
    INDEX 01 09:47:50
  TRACK 04 AUDIO
    INDEX 00 15:09:53
    INDEX 01 15:12:53
`)
  ).toEqual({
    sheet: {
      comments: [],
      files: [
        {
          name: 'C:\\MYAUDIO1.WAV',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
            },
            {
              trackNumber: 2,
              dataType: TrackDataType.Audio,
              indexes: [
                { number: 0, startingTime: [5, 49, 65] },
                { number: 1, startingTime: [5, 50, 65] },
              ],
            },
            {
              trackNumber: 3,
              dataType: TrackDataType.Audio,
              indexes: [
                { number: 0, startingTime: [9, 45, 50] },
                { number: 1, startingTime: [9, 47, 50] },
              ],
            },
            {
              trackNumber: 4,
              dataType: TrackDataType.Audio,
              indexes: [
                { number: 0, startingTime: [15, 9, 53] },
                { number: 1, startingTime: [15, 12, 53] },
              ],
            },
          ],
        },
      ],
    },
    errors: [],
  })
})

test('example 5', () => {
  expect(
    parse(`
FILE "C:\\MYAUDIO1.WAV" WAVE
  TRACK 01 AUDIO
    PREGAP 00:01:00
    INDEX 01 00:00:00
FILE "C:\\MYAUDIO2.WAV" WAVE
  TRACK 02 AUDIO
    PREGAP 00:02:00
    INDEX 01 00:00:00
FILE "C:\\MYAUDIO3.WAV" WAVE
  TRACK 03 AUDIO
    PREGAP 00:01:00
    INDEX 00 00:00:00
    INDEX 01 00:01:00
  `)
  ).toEqual({
    sheet: {
      comments: [],
      files: [
        {
          name: 'C:\\MYAUDIO1.WAV',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              preGap: [0, 1, 0],
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
            },
          ],
        },
        {
          name: 'C:\\MYAUDIO2.WAV',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 2,
              dataType: TrackDataType.Audio,
              preGap: [0, 2, 0],
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
            },
          ],
        },
        {
          name: 'C:\\MYAUDIO3.WAV',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 3,
              dataType: TrackDataType.Audio,
              preGap: [0, 1, 0],
              indexes: [
                { number: 0, startingTime: [0, 0, 0] },
                { number: 1, startingTime: [0, 1, 0] },
              ],
            },
          ],
        },
      ],
    },
    errors: [],
  })
})

test('example 6', () => {
  expect(
    parse(`
CATALOG 3898347789120
FILE "C:\\MYAUDIO1.WAV" WAVE
  TRACK 01 AUDIO
    ISRC ABCDE1234567
    INDEX 01 00:00:00
    INDEX 02 02:00:00
    INDEX 03 04:00:00
FILE "C:\\MYAUDIO2.WAV" WAVE
  TRACK 02 AUDIO
    ISRC XYZZY0000000
    INDEX 01 00:00:00
  TRACK 03 AUDIO
    ISRC 123456789012
    INDEX 00 03:00:00
    INDEX 01 03:02:00
    INDEX 02 05:34:32
    INDEX 03 08:12:49
    INDEX 04 10:01:74
  `)
  ).toEqual({
    sheet: {
      comments: [],
      files: [
        {
          name: 'C:\\MYAUDIO1.WAV',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              isrc: 'ABCDE1234567',
              indexes: [
                { number: 1, startingTime: [0, 0, 0] },
                { number: 2, startingTime: [2, 0, 0] },
                { number: 3, startingTime: [4, 0, 0] },
              ],
            },
          ],
        },
        {
          name: 'C:\\MYAUDIO2.WAV',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 2,
              dataType: TrackDataType.Audio,
              isrc: 'XYZZY0000000',
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
            },
            {
              trackNumber: 3,
              dataType: TrackDataType.Audio,
              isrc: '123456789012',
              indexes: [
                { number: 0, startingTime: [3, 0, 0] },
                { number: 1, startingTime: [3, 2, 0] },
                { number: 2, startingTime: [5, 34, 32] },
                { number: 3, startingTime: [8, 12, 49] },
                { number: 4, startingTime: [10, 1, 74] },
              ],
            },
          ],
        },
      ],
      catalog: '3898347789120',
    },
    errors: [],
  })
})

test('example 7', () => {
  expect(
    parse(`
FILE "C:\\MYDATA.ISO" BINARY
  TRACK 01 MODE1/2048
    INDEX 01 00:00:00
  POSTGAP 00:02:00
  `)
  ).toEqual({
    sheet: {
      comments: [],
      files: [
        {
          name: 'C:\\MYDATA.ISO',
          type: FileType.Binary,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType['Mode1/2048'],
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
              postGap: [0, 2, 0],
            },
          ],
        },
      ],
    },
    errors: [],
  })
})

test('example 8', () => {
  expect(
    parse(`
FILE "C:\\MYDATA.RAW" BINARY
  TRACK 01 MODE1/2352
    INDEX 01 00:00:00
  POSTGAP 00:02:00
`)
  ).toEqual({
    sheet: {
      comments: [],
      files: [
        {
          name: 'C:\\MYDATA.RAW',
          type: FileType.Binary,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType['Mode1/2352'],
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
              postGap: [0, 2, 0],
            },
          ],
        },
      ],
    },
    errors: [],
  })
})

test('example 9', () => {
  expect(
    parse(`
FILE "C:\\MYDATA.ISO" BINARY
  TRACK 01 MODE1/2048
    INDEX 01 00:00:00
    POSTGAP 00:02:00
FILE "C:\\MYAUDIO.WAV" WAVE
  TRACK 02 AUDIO
    PREGAP 00:02:00
    INDEX 01 00:00:00
  TRACK 03 AUDIO
    INDEX 01 05:50:65
  TRACK 04 AUDIO
    INDEX 01 09:47:50
  `)
  ).toEqual({
    sheet: {
      comments: [],
      files: [
        {
          name: 'C:\\MYDATA.ISO',
          type: FileType.Binary,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType['Mode1/2048'],
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
              postGap: [0, 2, 0],
            },
          ],
        },
        {
          name: 'C:\\MYAUDIO.WAV',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 2,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
              preGap: [0, 2, 0],
            },
            {
              trackNumber: 3,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [5, 50, 65] }],
            },
            {
              trackNumber: 4,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [9, 47, 50] }],
            },
          ],
        },
      ],
    },
    errors: [],
  })
})

test('example 10', () => {
  expect(
    parse(`
FILE "C:\\MYDATA1.ISO" BINARY
  TRACK 01 MODE1/2048
    INDEX 01 00:00:00
FILE "C:\\TRACK1.WAV" WAVE
  TRACK 02 AUDIO
    PREGAP 00:02:00
    INDEX 01 00:00:00
FILE "C:\\TRACK2.WAV" WAVE
  TRACK 03 AUDIO
    INDEX 01 00:00:00
FILE "C:\\TRACK3.WAV" WAVE
  TRACK 04 AUDIO
    INDEX 01 00:00:00
FILE "C:\\TRACK4.WAV" WAVE
  TRACK 05 AUDIO
    INDEX 01 00:00:00
 `)
  ).toEqual({
    sheet: {
      comments: [],
      files: [
        {
          name: 'C:\\MYDATA1.ISO',
          type: FileType.Binary,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType['Mode1/2048'],
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
            },
          ],
        },
        {
          name: 'C:\\TRACK1.WAV',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 2,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
              preGap: [0, 2, 0],
            },
          ],
        },
        {
          name: 'C:\\TRACK2.WAV',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 3,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
            },
          ],
        },
        {
          name: 'C:\\TRACK3.WAV',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 4,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
            },
          ],
        },
        {
          name: 'C:\\TRACK4.WAV',
          type: FileType.Wave,
          tracks: [
            {
              trackNumber: 5,
              dataType: TrackDataType.Audio,
              indexes: [{ number: 1, startingTime: [0, 0, 0] }],
            },
          ],
        },
      ],
    },
    errors: [],
  })
})

test('example 11', () => {
  expect(
    parse(`
TITLE "Nirvana - Nevermind"
PERFORMER "Nirvana"
SONGWRITER "Lyrics by Kurt Cobain and Music by Nirvana"
FILE "C:\\NIRVANA.BIN" BINARY
  TRACK 01 AUDIO
    TITLE "Smells like teen spirit"
    INDEX 00 00:00:00
    INDEX 01 00:00:37
  TRACK 02 AUDIO
    TITLE "In bloom"
    INDEX 00 05:01:67
    INDEX 01 05:02:32
  TRACK 03 AUDIO
    TITLE "Come as you are"
    INDEX 00 09:16:63
    INDEX 01 09:17:25
  TRACK 04 AUDIO
    TITLE "Breed"
    INDEX 01 12:56:22
  TRACK 05 AUDIO
    TITLE "Lithium"
    INDEX 00 15:59:35
    INDEX 01 16:00:17
  TRACK 06 AUDIO
    TITLE "Polly"
    INDEX 00 20:16:38
    INDEX 01 20:17:15
  TRACK 07 AUDIO
    TITLE "Territorial pissings"
    INDEX 00 23:11:17
    INDEX 01 23:14:17
  TRACK 08 AUDIO
    TITLE "Drain you"
    INDEX 01 25:37:10
  TRACK 09 AUDIO
    TITLE "Lounge act"
    INDEX 01 29:21:02
  TRACK 10 AUDIO
    TITLE "Stay away"
    INDEX 00 31:57:40
    INDEX 01 31:57:72
  TRACK 11 AUDIO
    TITLE "On a plain"
    INDEX 00 35:29:40
    INDEX 01 35:30:35
  TRACK 12 AUDIO
    TITLE "Something in the way"
    INDEX 00 38:44:55
  `)
  ).toEqual({
    sheet: {
      title: 'Nirvana - Nevermind',
      performer: 'Nirvana',
      songWriter: 'Lyrics by Kurt Cobain and Music by Nirvana',
      comments: [],
      files: [
        {
          name: 'C:\\NIRVANA.BIN',
          type: FileType.Binary,
          tracks: [
            {
              trackNumber: 1,
              dataType: TrackDataType.Audio,
              title: 'Smells like teen spirit',
              indexes: [
                { number: 0, startingTime: [0, 0, 0] },
                { number: 1, startingTime: [0, 0, 37] },
              ],
            },
            {
              trackNumber: 2,
              dataType: TrackDataType.Audio,
              title: 'In bloom',
              indexes: [
                { number: 0, startingTime: [5, 1, 67] },
                { number: 1, startingTime: [5, 2, 32] },
              ],
            },
            {
              trackNumber: 3,
              dataType: TrackDataType.Audio,
              title: 'Come as you are',
              indexes: [
                { number: 0, startingTime: [9, 16, 63] },
                { number: 1, startingTime: [9, 17, 25] },
              ],
            },
            {
              trackNumber: 4,
              dataType: TrackDataType.Audio,
              title: 'Breed',
              indexes: [{ number: 1, startingTime: [12, 56, 22] }],
            },
            {
              trackNumber: 5,
              dataType: TrackDataType.Audio,
              title: 'Lithium',
              indexes: [
                { number: 0, startingTime: [15, 59, 35] },
                { number: 1, startingTime: [16, 0, 17] },
              ],
            },
            {
              trackNumber: 6,
              dataType: TrackDataType.Audio,
              title: 'Polly',
              indexes: [
                { number: 0, startingTime: [20, 16, 38] },
                { number: 1, startingTime: [20, 17, 15] },
              ],
            },
            {
              trackNumber: 7,
              dataType: TrackDataType.Audio,
              title: 'Territorial pissings',
              indexes: [
                { number: 0, startingTime: [23, 11, 17] },
                { number: 1, startingTime: [23, 14, 17] },
              ],
            },
            {
              trackNumber: 8,
              dataType: TrackDataType.Audio,
              title: 'Drain you',
              indexes: [{ number: 1, startingTime: [25, 37, 10] }],
            },
            {
              trackNumber: 9,
              dataType: TrackDataType.Audio,
              title: 'Lounge act',
              indexes: [{ number: 1, startingTime: [29, 21, 2] }],
            },
            {
              trackNumber: 10,
              dataType: TrackDataType.Audio,
              title: 'Stay away',
              indexes: [
                { number: 0, startingTime: [31, 57, 40] },
                { number: 1, startingTime: [31, 57, 72] },
              ],
            },
            {
              trackNumber: 11,
              dataType: TrackDataType.Audio,
              title: 'On a plain',
              indexes: [
                { number: 0, startingTime: [35, 29, 40] },
                { number: 1, startingTime: [35, 30, 35] },
              ],
            },
            {
              trackNumber: 12,
              dataType: TrackDataType.Audio,
              title: 'Something in the way',
              indexes: [{ number: 0, startingTime: [38, 44, 55] }],
            },
          ],
        },
      ],
    },
    errors: [],
  })
})
