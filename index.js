/* Copyright 2019 Streampunk Media Ltd.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

const { Readable, Writable, Duplex } = require('stream');
const portAudioBindings = require("bindings")("naudiodon.node");

var SegfaultHandler = require('segfault-handler');
SegfaultHandler.registerHandler("crash.log");

exports.SampleFormatFloat32 = 1;
exports.SampleFormat8Bit = 8;
exports.SampleFormat16Bit = 16;
exports.SampleFormat24Bit = 24;
exports.SampleFormat32Bit = 32;

exports.getDevices = portAudioBindings.getDevices;
exports.getHostAPIs = portAudioBindings.getHostAPIs;
exports.getDefaultDevices = portAudioBindings.getDefaultDevices;

function AudioIO(options) {
  const audioIOAdon = portAudioBindings.create(options);
  let ioStream;

  const doRead = async size => {
    const result = await audioIOAdon.read(size);
    if (result.err)
      ioStream.destroy(result.err);
    else {
      if (result.finished)
        ioStream.push(null);
      else
        ioStream.push(result.buf);
    };
  };

  const doWrite = async (chunk, encoding, cb) => {
    const err = await audioIOAdon.write(chunk);
    cb(err);
  }

  const readable = 'inOptions' in options;
  const writable = 'outOptions' in options;
  if (readable && writable) {
    ioStream = new Duplex({
      allowHalfOpen: false,
      readableObjectMode: false,
      writableObjectMode: false,
      readableHighWaterMark: options.inOptions ? options.inOptions.highwaterMark || 16384 : 16384,
      writableHighWaterMark: options.outOptions ? options.outOptions.highwaterMark || 16384 : 16384,
      read: doRead,
      write: doWrite
    });
  } else if (readable) {
    ioStream = new Readable({
      highWaterMark: options.inOptions.highwaterMark || 16384,
      objectMode: false,
      read: doRead
    });
  } else {
    ioStream = new Writable({
      highWaterMark: options.outOptions.highwaterMark || 16384,
      decodeStrings: false,
      objectMode: false,
      write: doWrite
    });
  }

  ioStream.start = () => audioIOAdon.start();

  ioStream.quit = async cb => {
    await audioIOAdon.quit('WAIT');
    if (typeof cb === 'function')
      cb();
  }

  ioStream.abort = cb => {
    audioIOAdon.quit('ABORT', () => {
      if (typeof cb === 'function')
        cb();
    });
  }

  ioStream.on('close', async () => {
    ioStream.emit('closed');
  });
  ioStream.on('finish', async () => {
    await ioStream.quit()
    ioStream.emit('finished');
  });

  ioStream.on('error', err => console.error('AudioIO:', err));

  return ioStream;
}
exports.AudioIO = AudioIO;
