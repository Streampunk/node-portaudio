/**
 * The type used to specify one or more sample formats. Each value indicates
 * a possible format for sound data passed to and from the stream callback
 * The standard formats SampleFormatFloat32, SampleFormat8Bit, SampleFormat16Bit,
 * SampleFormat24Bit and SampleFormat32Bit are usually implemented by all implementations.

 * The floating point representation (Float32) uses +1.0 and -1.0 as the
 * maximum and minimum respectively.
 */
export const SampleFormatFloat32 = 1;
export const SampleFormat8Bit = 8;
export const SampleFormat16Bit = 16;
export const SampleFormat24Bit = 24;
export const SampleFormat32Bit = 32;

/** The details returned from getDevices for a particular device */
export interface DeviceInfo {
  readonly id: number
  readonly name: string
  readonly maxInputChannels: number
  readonly maxOutputChannels: number
  readonly defaultSampleRate: number
  /** Default latency values for interactive performance. */
  readonly defaultLowInputLatency: number
  readonly defaultLowOutputLatency: number
  /** Default latency values for robust non-interactive applications (eg. playing sound files). */
  readonly defaultHighInputLatency: number
  readonly defaultHighOutputLatency: number
  readonly hostAPIName: string
}

/** Get list of supported devices */
export function getDevices(): DeviceInfo[]

export interface DefaultDevices {
  defaultInputDevice: DeviceInfo
  defaultOutputDevice: DeviceInfo
}

/** Get default input and output device */
export function getDefaultDevices(): DefaultDevices

/** The details returned from getHostAPIs for a particular device */
export interface HostInfo {
  readonly id: number
  readonly name: string
  /** Identifiers for each supported host API. The values are guaranteed to be
   * unique and to never change, thus allowing code to be written that
   * conditionally uses host API specific extensions.
   * New type ids will be allocated when support for a host API reaches
   * "public alpha" status, prior to that developers should use the InDevelopment type id.
   */
  readonly type: 'InDevelopment' | 'DirectSound' | 'MME' | 'ASIO' | 'SoundManager' | 'CoreAudio' |
  'OSS' | 'ALSA' | 'AL' | 'BeOS' | 'WDMKS' | 'JACK' | 'WASAPI' | 'AudioScienceHPI' | 'Unknown'
  /** The number of devices belonging to this host API*/
  readonly deviceCount: number
  /**
   * The default input device for this host API. The value will be a
   * device index ranging from 0 to deviceCount - 1
   */
  readonly defaultInput: number
  /**
   * The default output device for this host API. The value will be a
   * device index ranging from 0 to deviceCount - 1
   */
  readonly defaultOutput: number
}

/** Get information about host APIs */
export function getHostAPIs(): {
  /**
   * The index of the default host API. The default host API will be the lowest common
   * denominator host API on the current platform and is unlikely to provide the best performance.
   * Will be a non-negative value ranging from 0 to (HostAPIs.length-1) indicating the default
   * host API index or a negative value if PortAudio is not initialized or an error is encountered.
   */
  defaultHostAPI: number
  /** Array of HostInfo objects containing information about a specific host API. */
  HostAPIs: HostInfo[]
}

export interface AudioOptions {
  /** Use -1 or omit the deviceId to select the default device. */
  deviceId?: number
  /** The required sampleRate. For full-duplex streams it must be the same sample rate for both input and output. */
  sampleRate?: number
  /** The number of channels of sound to be delivered to the stream callback
   * It can range from 1 to the value of maxInputChannels from
   * DeviceInfo for the device specified by the device parameter.
   */
  channelCount?: number
  sampleFormat?: 1 | 8 | 16 | 24 | 32
  /** The number of blocks to buffer for a blocking. */
  maxQueue?: number
  /**
   * The number of frames passed to the stream callback function,
   * or the preferred block granularity for a blocking read/write stream.
   * The special value 0 may be used to request that
   * the stream callback will receive an optimal (and possibly varying) number of
   * frames based on host requirements and the requested latency settings.
   * Note: With some host APIs, the use of non-zero framesPerBuffer for a callback
   * stream may introduce an additional layer of buffering which could introduce
   * additional latency. PortAudio guarantees that the additional latency
   * will be kept to the theoretical minimum however, it is strongly recommended
   * that a non-zero framesPerBuffer value only be used when your algorithm
   * requires a fixed number of frames per stream callback.
   */
  framesPerBuffer?: number
  /** The amount of data potentially buffered in streaming mode in bytes. */
  highwaterMark?: number
  /** Close the stream if an audio error is detected, if set false then just log the error. */
  closeOnError?: boolean
}

export interface IoStream {
  /**
   * Start streaming to and/or from the device.
   * @returns void when the stream has started.
   */
  start(): void
  /**
   * Quit the stream. Waits to process all pending bytes.
   * The optional callback will execute when the quit has completed.
   */
  quit(callback?: () => void): void
  /**
   * Abort the stream. Throws away any pending bytes.
   * The optional callback will execute when the abort has completed.
   */
  abort(callback?: () => void): void
}

/** Interface classes returned from AudioIO creation, dependant on which options are provided. */
export interface IoStreamRead extends IoStream, NodeJS.ReadableStream {}
export interface IoStreamWrite extends IoStream, NodeJS.WritableStream {}
export interface IoStreamDuplex extends IoStream, NodeJS.ReadableStream, NodeJS.WritableStream {}

/**
 * Create an AudioIO object. If both inOptions and outOptions are provided, a duplex stream is created.
 * When just inOptions are provided, a readStream is created. When just outOptions, a writeStream is created.
 * @param options object containing inOptions for readStreams, outOptions for writeStreams or both for duplex streams.
 */
export function AudioIO(options: { inOptions: AudioOptions }): IoStreamRead
export function AudioIO(options: { outOptions: AudioOptions }): IoStreamWrite
export function AudioIO(options: { inOptions: AudioOptions, outOptions: AudioOptions }): IoStreamDuplex
