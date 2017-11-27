# split audio silence

split audio silence takes an mp3 stream and is separates the audio buffer into multiple audio buffers and manifest to be able to stitch those files back together with the silence.

# usage

```js
import splitAudio from 'split-audio-silence';
import fs from 'fs';

const segments = await splitAudio(fs.createReadStream('./file.mp3'));
console.log(segments);

/* something like
[
  { buffer: <Buffer> },
  { pause: 4 },
  { buffer: <Buffer> }
]
*/

```

Buffers are at this time PCM data so if you would like to write them back into mp3 there is a method on the segments, `toMP3Stream`, that return a passthrough stream you can pipe from.

```js
import lame from 'lame'
import splitAudio from 'split-audio-silence'
import fs from 'fs'

const segments = await splitAudio(fs.createReadStream('./file.mp3'))

segments.forEach(segment => {
  if (!segment.isSilence) {
    const bufferStream = segment.toMP3Stream()
        .pipe(fs.createWriteStream(`./${segements.id}.mp3}`))
  }
})

```
