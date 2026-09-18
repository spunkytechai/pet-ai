'use client'

function writeAscii(view: DataView, offset: number, value: string) {
  for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i))
}

function encodeWav(samples: Float32Array, sampleRate: number) {
  const bytesPerSample = 2
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample)
  const view = new DataView(buffer)
  writeAscii(view, 0, 'RIFF')
  view.setUint32(4, 36 + samples.length * bytesPerSample, true)
  writeAscii(view, 8, 'WAVE')
  writeAscii(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * bytesPerSample, true)
  view.setUint16(32, bytesPerSample, true)
  view.setUint16(34, 16, true)
  writeAscii(view, 36, 'data')
  view.setUint32(40, samples.length * bytesPerSample, true)
  let offset = 44
  for (let i = 0; i < samples.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
    offset += 2
  }
  return new Blob([buffer], { type: 'audio/wav' })
}

// Convert every browser/upload format into mono, 16 kHz, 16-bit PCM WAV.
// The server feature extractor intentionally consumes only this canonical format.
export async function normalizeAudioForAnalysis(file: File) {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext
  if (!AudioContextCtor) throw new Error('This browser cannot convert audio to PET AI supported analysis format.')

  const sourceContext = new AudioContextCtor()
  try {
    let decoded: AudioBuffer
    try {
      decoded = await sourceContext.decodeAudioData(await file.arrayBuffer())
    } catch {
      throw new Error('This audio format could not be decoded. Please record again or choose a WAV, MP3, M4A, or WebM file your browser can play.')
    }
    const targetRate = 16000
    const targetLength = Math.max(1, Math.ceil(decoded.duration * targetRate))
    const offline = new OfflineAudioContext(1, targetLength, targetRate)
    const source = offline.createBufferSource()
    source.buffer = decoded
    source.connect(offline.destination)
    source.start(0)
    const rendered = await offline.startRendering()
    const wav = encodeWav(rendered.getChannelData(0), targetRate)
    return new File([wav], 'pet-signal-' + Date.now() + '.wav', { type: 'audio/wav' })
  } finally {
    await sourceContext.close().catch(() => undefined)
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}
