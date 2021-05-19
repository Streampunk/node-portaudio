# Naudiodon

A [Node.js](http://nodejs.org/) [addon](http://nodejs.org/api/addons.html) that provides a wrapper around the [PortAudio](http://portaudio.com/) library, enabling an application to record and play audio with cross platform support. With this library, you can create [node.js streams](https://nodejs.org/dist/latest-v6.x/docs/api/stream.html) that can be piped to or from other streams, such as files and network connections. This library supports back-pressure.

This is a fork of [node-portaudio](/joeferner/node-portaudio), refactored by:

* changing from an event model to a stream model;
* using the new API for building native Addons [N-API](https://nodejs.org/dist/latest-v8.x/docs/api/n-api.html#n_api_n_api) to enable portability between node versions without recompiling.
* adding in local copies of libraries so that portaudio does not have to be installed preemptively.

Little of the original remains but I am very grateful for Joe Ferner for the inspiration and framework to get started.

This library has been tested on MacOS X 10.11, Windows 10, Linux Ubuntu Trusty and Raspbian Jessie (`armhf` architecture).

Note: This is a server side library. It is not intended as a means to play and record audio via a browser.

## Installation

Install [Node.js](http://nodejs.org/) for your platform and make sure that node is able to build native modules with [node-gyp](https://github.com/nodejs/node-gyp). This software has been developed against the long term stable (LTS) release. For ease of installation with other node packages, this package includes a copy of the dependent PortAudio library and so has no prerequisites.

Naudiodon is designed to be `require`d to use from your own application to provide async processing. For example:

    npm install naudiodon

For Raspberry Pi users, please note that this library is not intended for use with the internal sound card. Please use an external USB sound card or GPIO breakout board such as the [_Pi-DAC+ Full-HD Audio Card_](https://www.modmypi.com/raspberry-pi/breakout-boards/iqaudio/pi-dac-plus-full-hd-audio-card/?tag=pi-dac).

## Using naudiodon

### Listing devices

To get list of supported devices, call the `getDevices()` function.

```javascript
var portAudio = require('naudiodon');

console.log(portAudio.getDevices());
```

An example of the output is:

```javascript
[ { id: 0,
    name: 'Built-in Microph',
    maxInputChannels: 2,
    maxOutputChannels: 0,
    defaultSampleRate: 44100,
    defaultLowInputLatency: 0.00199546485260771,
    defaultLowOutputLatency: 0.01,
    defaultHighInputLatency: 0.012154195011337868,
    defaultHighOutputLatency: 0.1,
    hostAPIName: 'Core Audio' },
  { id: 1,
    name: 'Built-in Input',
    maxInputChannels: 2,
    maxOutputChannels: 0,
    defaultSampleRate: 44100,
    defaultLowInputLatency: 0.00199546485260771,
    defaultLowOutputLatency: 0.01,
    defaultHighInputLatency: 0.012154195011337868,
    defaultHighOutputLatency: 0.1,
    hostAPIName: 'Core Audio' },
  { id: 2,
    name: 'Built-in Output',
    maxInputChannels: 0,
    maxOutputChannels: 2,
    defaultSampleRate: 44100,
    defaultLowInputLatency: 0.01,
    defaultLowOutputLatency: 0.002108843537414966,
    defaultHighInputLatency: 0.1,
    defaultHighOutputLatency: 0.012267573696145125,
    hostAPIName: 'Core Audio' } ]
```

Note that the device `id` parameter index value can be used as to specify which device to use for playback or recording with optional parameter `deviceId`.

### Listing host APIs

To get list of host APIs, call the `getHostAPIs()` function.

```javascript
var portAudio = require('naudiodon');

console.log(portAudio.getHostAPIs());
```
An example of the output is:

```javascript
{ defaultHostAPI: 0,
  HostAPIs:
   [ { id: 0,
       name: 'MME',
       deviceCount: 8,
       defaultInput: 1,
       defaultOutput: 5 },
      { /* ... */ } ] }
```
Note that the `defaultInput` and `defaultOutput` values can be used as to specify which device to use for playback or recording with optional parameter `deviceId`.

### Getting default Devices

To get the default devices, call the `getDefaultDevices` function.

```js
var portAudio = require('naudiodon');

console.log(portAudio.getDefaultDevices());
```

An example of the output is:

```js
{
  defaultInputDevice: {
    id: 0,
    name: 'Built-in Microphone',
    maxInputChannels: 2,
    maxOutputChannels: 0,
    defaultSampleRate: 44100,
    defaultLowInputLatency: 0,
    defaultLowOutputLatency: 0,
    defaultHighInputLatency: 0,
    defaultHighOutputLatency: 0,
    hostAPIName: 'Core Audio'
  },
  defaultOutputDevice: {
    id: 1,
    name: 'Built-in Output',
    maxInputChannels: 0,
    maxOutputChannels: 2,
    defaultSampleRate: 44100,
    defaultLowInputLatency: 0,
    defaultLowOutputLatency: 0,
    defaultHighInputLatency: 0,
    defaultHighOutputLatency: 0,
    hostAPIName: 'Core Audio'
  }
}
```

### Playing audio

Playing audio involves streaming audio data to a new instance of `AudioIO` configured with `outOptions` - which returns a Node.js [Writable Stream](https://nodejs.org/dist/latest-v6.x/docs/api/stream.html#stream_writable_streams):

```javascript
const fs = require('fs');
const portAudio = require('naudiodon');

// Create an instance of AudioIO with outOptions (defaults are as below), which will return a WritableStream
var ao = new portAudio.AudioIO({
  outOptions: {
    channelCount: 2,
    sampleFormat: portAudio.SampleFormat16Bit,
    sampleRate: 48000,
    deviceId: -1, // Use -1 or omit the deviceId to select the default device
    closeOnError: true // Close the stream if an audio error is detected, if set false then just log the error
  }
});

// Create a stream to pipe into the AudioOutput
// Note that this does not strip the WAV header so a click will be heard at the beginning
var rs = fs.createReadStream('steam_48000.wav');

// Start piping data and start streaming
rs.pipe(ao);
ao.start();
```

### Recording audio

Recording audio involves streaming audio data from a new instance of `AudioIO` configured with `inOptions` - which returns a Node.js [Readable Stream](https://nodejs.org/dist/latest-v6.x/docs/api/stream.html#stream_readable_streams):

```javascript
var fs = require('fs');
var portAudio = require('../index.js');

// Create an instance of AudioIO with inOptions (defaults are as below), which will return a ReadableStream
var ai = new portAudio.AudioIO({
  inOptions: {
    channelCount: 2,
    sampleFormat: portAudio.SampleFormat16Bit,
    sampleRate: 44100,
    deviceId: -1, // Use -1 or omit the deviceId to select the default device
    closeOnError: true // Close the stream if an audio error is detected, if set false then just log the error
  }
});

// Create a write stream to write out to a raw audio file
var ws = fs.createWriteStream('rawAudio.raw');

//Start streaming
ai.pipe(ws);
ai.start();

```

Note that this produces a raw audio file - wav headers would be required to create a wav file. However this basic example produces a file may be read by audio software such as Audacity, using the sample rate and format parameters set when establishing the stream.

There is an additional `"timestamp"` property available on the buffers that are streamed from the input which represents a time value for the first sample in the returned buffer. It can be accessed as follows:
```javascript
ai.on('data', buf => console.log(buf.timestamp));
```

To stop the recording, call `ai.quit()`. For example:

```javascript
process.on('SIGINT', () => {
  console.log('Received SIGINT. Stopping recording.');
  ai.quit();
});
```

### Bi-directional audio

A bi-directional audio stream is available by creating an instance of `AudioIO` configured with both `inOptions` and `outOptions` - which returns a Node.js [Duplex stream](https://nodejs.org/dist/latest-v6.x/docs/api/stream.html#stream_duplex_and_transform_streams):

```javascript
var portAudio = require('../index.js');

// Create an instance of AudioIO with inOptions and outOptions, which will return a DuplexStream
var aio = new portAudio.AudioIO({
  inOptions: {
    channelCount: 2,
    sampleFormat: portAudio.SampleFormat16Bit,
    sampleRate: 44100,
    deviceId: -1 // Use -1 or omit the deviceId to select the default device
  },
  outOptions: {
    channelCount: 2,
    sampleFormat: portAudio.SampleFormat16Bit,
    sampleRate: 44100,
    deviceId: -1 // Use -1 or omit the deviceId to select the default device
  }
});

aio.start();
```

## Troubleshooting

### Linux - No Default Device Found

Ensure that when you compile portaudio that the configure scripts says "ALSA" yes.

### Mac - Carbon Component Manager

You may see or have seen the following message during initilisation of the audio library on MacOS:

```
WARNING:  140: This application, or a library it uses, is using the deprecated Carbon Component Manager
for hosting Audio Units. Support for this will be removed in a future release. Also, this makes the host
incompatible with version 3 audio units. Please transition to the API's in AudioComponent.h.
```

A locally compiled version of the portaudio library is now included with the latest version of naudiodon that uses more up-to-date APIs from Apple. The portaudio team are [aware of this issue](https://app.assembla.com/spaces/portaudio/tickets/218-pa-coreaudio-uses-some--quot-deprecated-quot--apis----this-is-by-design-but-need/details).

## Status, support and further development

Optimisation is still required for use with lower specification devices, such as Raspberry Pis.

Although the architecture of naudiodon is such that it could be used at scale in production environments, development is not yet complete. In its current state, it is recommended that this software is used in development environments and for building prototypes. Future development will make this more appropriate for production use.

Contributions can be made via pull requests and will be considered by the author on their merits. Enhancement requests and bug reports should be raised as github issues. For support, please contact [Streampunk Media](http://www.streampunk.media/).

## License

This software is released under the Apache 2.0 license. Copyright 2017 Streampunk Media Ltd.

This software uses libraries from the PortAudio project. The [license terms for PortAudio](http://portaudio.com/license.html) are stated to be an [MIT license](http://opensource.org/licenses/mit-license.php). Streampunk Media are grateful to Ross Bencina and Phil Burk for their excellent library.
