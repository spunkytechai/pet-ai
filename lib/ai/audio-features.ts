export type AudioFeatures = {
  durationMs: number
  rms: number
  peak: number
  zeroCrossingRate: number
  voiced: boolean
}

function readAscii(view: DataView, offset: number, length: number) {
  let value = ''
  for (let i = 0; i < length; i += 1) value += String.fromCharCode(view.getUint8(offset + i))
  return value
}

export function extractWavFeatures(bytes: Uint8Array): AudioFeatures | null {
  if (bytes.length < 44 || readAscii(new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), 0, 4) !== 'RIFF') return null

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  if (readAscii(view, 8, 4) !== 'WAVE') return null

  let offset = 12
  let channels = 0
  let sampleRate = 0
  let bitsPerSample = 0
  let dataOffset = -1
  let dataSize = 0

  while (offset + 8 <= view.byteLength) {
    const id = readAscii(view, offset, 4)
    const size = view.getUint32(offset + 4, true)
    const start = offset + 8
    if (id === 'fmt ' && size >= 16 && start + 16 <= view.byteLength) {
      const format = view.getUint16(start, true)
      channels = view.getUint16(start + 2, true)
      sampleRate = view.getUint32(start + 4, true)
      bitsPerSample = view.getUint16(start + 14, true)
      if (format !== 1) return null
    }
    if (id === 'data') {
      dataOffset = start
      dataSize = Math.min(size, view.byteLength - start)
      break
    }
    offset = start + size + (size % 2)
  }

  if (dataOffset < 0 || !channels || !sampleRate || bitsPerSample !== 16) return null

  const frameBytes = channels * 2
  const frameCount = Math.floor(dataSize / frameBytes)
  if (frameCount < 16) return null

  let sumSquares = 0
  let peak = 0
  let crossings = 0
  let previous = 0
  let nonZero = 0

  for (let frame = 0; frame < frameCount; frame += 1) {
    let sampleSum = 0
    for (let channel = 0; channel < channels; channel += 1) {
      sampleSum += view.getInt16(dataOffset + frame * frameBytes + channel * 2, true)
    }
    const sample = sampleSum / channels / 32768
    const magnitude = Math.abs(sample)
    sumSquares += sample * sample
    peak = Math.max(peak, magnitude)
    if (magnitude > 0.015) nonZero += 1
    if (frame > 0 && ((sample >= 0) !== (previous >= 0))) crossings += 1
    previous = sample
  }

  const rms = Math.sqrt(sumSquares / frameCount)
  const zeroCrossingRate = crossings / frameCount
  const durationMs = (frameCount / sampleRate) * 1000

  return {
    durationMs: Math.round(durationMs),
    rms: Number(rms.toFixed(4)),
    peak: Number(peak.toFixed(4)),
    zeroCrossingRate: Number(zeroCrossingRate.toFixed(4)),
    voiced: rms >= 0.015 && nonZero / frameCount >= 0.08,
  }
}
