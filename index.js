const lame = require('lame');
const through2 = require('through2');

function createSegments(segments) {
  let currentIndex = 0;
  // TODO: reduce down again to get rid of small 1s gaps
  return segments.reduce((accum, segment) => {
    const last = accum[accum.length - 1];
    if (last && last.pause && segment.pause) {
      last.duration += 1;
      last.pause += segment.pause
      last.buffer = null; // remove buffer
    } else if (last && last.buffer && segment.buffer) {
      last.duration += 1;
      last.buffer = Buffer.concat([last.buffer, segment.buffer]);
    } else {
      accum.push(Object.assign(segment, { id: currentIndex, duration: 1 }));
      currentIndex += 1;
    }
    return accum;
  },[]);
}

const createSplitter = () => {
  let oddByte = null;
  let channel = 0;
  return through2.obj(function (data, enc, callback) {
    let i = 0;
    let samples = Math.floor((data.length + (oddByte !== null ? 1 : 0)) / 2);
    let value;
    const values = [];

    // If there is a leftover byte from the previous block, combine it with the
    // first byte from this block
    if (oddByte !== null) {
      value = ((data.readInt8(i++) << 8) | oddByte) / 32767;
      channel = ++channel % 2;
    }

    for (; i < data.length; i += 2) {
      value = data.readInt16LE(i) / 32767;
      values.push(value);
      channel = ++channel % 2;
    }

    if (values.every(v => Math.abs(v) < 0.01)) {
      this.push({ pause: 1 });
    } else {
      this.push({ buffer: data });
    }


    oddByte = (i < data.length) ? data.readUInt8(i) : null;

    callback();
  });
}


module.exports = function splitAudioPause(readStream, options = {}) {
  return new Promise((resolve, reject) => {
    const decoder = new lame.Decoder();
    const splitBuffers = createSplitter();
    const audioComposition = [];
    decoder.on('error', reject);
    splitBuffers.on('data', data => audioComposition.push(data))
    splitBuffers.on('end', () => resolve(createSegments(audioComposition)))
    splitBuffers.on('error', reject);

    readStream
      .pipe(decoder)
      .pipe(splitBuffers)
      .on('error', reject);
  });
}
