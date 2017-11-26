# split audio silence

[![Greenkeeper badge](https://badges.greenkeeper.io/jcblw/split-audio-silence.svg)](https://greenkeeper.io/)

split audio silence takes an mp3 stream and is separates the audio buffer into multiple audio buffers and manifest to be able to stitch those files back together with the silence.

```js
import splitAudio from 'split-audio-silence';
import fs from 'fs';

const segments = await splitAudio(fs.createReadStream('./file.mp3'));
console.log(segments);

/*
[
  { buffer: <Buffer> },
  { pause: 4 },
  { buffer: <Buffer> }
]
*/

```

Buffers are at this time PCM data so if you would like to write them back into mp3 data
you could use node-lame to encode it back. Future iterations will make this process easier.

```js
import lame from 'lame';
import splitAudio from 'split-audio-silence';
import fs from 'fs';

const segments = await splitAudio(fs.createReadStream('./file.mp3'));

function createEncoder() {
  return new lame.Encoder({
    // input
    channels: 1,        // 2 channels (left and right)
    bitDepth: 16,       // 16-bit samples
    sampleRate: 44100,  // 44,100 Hz sample rate

    // output
    bitRate: 128,
    outSampleRate: 22050,
    mode: lame.STEREO // STEREO (default)
  });
}

segements.forEach(segment => {
  if (segment.buffer) {
    const bufferStream = new stream.PassThrough()
        .pipe(createEncoder())
        .pipe(fs.createWriteStream(`./${segements.id}.mp3}`));

    bufferStream.end(segment.buffer);
  }
});


```
