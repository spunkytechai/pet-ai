export type AudioFeatures = {
  durationMs: number
  rms: number
  peak: number
  zeroCrossingRate: number
  voiced: boolean
  dynamicRange: number
  crestFactor: number
  spectralCentroidHz: number | null
  estimatedArousal: 'low' | 'moderate' | 'high' | 'unknown'
  acousticQuality: 'clear' | 'weak' | 'noisy' | 'unknown'
}

function readAscii(view: DataView, offset: number, length: number) {
  let value = ''
  for (let i = 0; i < length; i += 1) value += String.fromCharCode(view.getUint8(offset + i))
  return value
}

export function extractWavFeatures(bytes: Uint8Array): AudioFeatures | null {
  if (bytes.length < 44) return null
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  if (readAscii(view, 0, 4) !== 'RIFF' || readAscii(view, 8, 4) !== 'WAVE') return null

  let offset = 12, channels = 0, sampleRate = 0, bitsPerSample = 0, dataOffset = -1, dataSize = 0
  while (offset + 8 <= view.byteLength) {
    const id = readAscii(view, offset, 4)
    const size = view.getUint32(offset + 4, true)
    const start = offset + 8
    if (id === 'fmt ' && size >= 16 && start + 16 <= view.byteLength) {
      if (view.getUint16(start, true) !== 1) return null
      channels = view.getUint16(start + 2, true)
      sampleRate = view.getUint32(start + 4, true)
      bitsPerSample = view.getUint16(start + 14, true)
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

  let sumSquares = 0, peak = 0, crossings = 0, previous = 0, nonZero = 0
  let maxWindowRms = 0
  const windowFrames = Math.max(1, Math.floor(sampleRate * 0.25))
  let windowSumSquares = 0, windowCount = 0

  // Lightweight spectral centroid: sampled DFT bins avoid external ML/API dependencies.
  const fftSize = Math.min(1024, Math.max(128, 2 ** Math.floor(Math.log2(Math.min(frameCount, 1024)))))
  const hop = Math.max(1, Math.floor(frameCount / 8))
  let centroidSum = 0, centroidCount = 0

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
    windowSumSquares += sample * sample
    windowCount += 1
    if (windowCount === windowFrames || frame === frameCount - 1) {
      const windowRms = Math.sqrt(windowSumSquares / windowCount)
      maxWindowRms = Math.max(maxWindowRms, windowRms)
      windowSumSquares = 0
      windowCount = 0
    }
  }

  const rms = Math.sqrt(sumSquares / frameCount)
  const zeroCrossingRate = crossings / frameCount
  const durationMs = (frameCount / sampleRate) * 1000
  const voicedRatio = nonZero / frameCount
  const dynamicRange = rms > 0 ? maxWindowRms / rms : 0
  const crestFactor = rms > 0 ? peak / rms : 0

  // Compute centroid on up to 8 evenly spaced windows using a real DFT.
  for (let start = 0; start + fftSize <= frameCount && centroidCount < 8; start += hop) {
    let weighted = 0, magnitudeTotal = 0
    for (let k = 1; k < fftSize / 2; k += 1) {
      let real = 0, imag = 0
      for (let n = 0; n < fftSize; n += 1) {
        let sampleSum = 0
        for (let channel = 0; channel < channels; channel += 1) {
          sampleSum += view.getInt16(dataOffset + (start + n) * frameBytes + channel * 2, true)
        }
        const sample = sampleSum / channels / 32768
        const window = 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (fftSize - 1))
        const angle = (2 * Math.PI * k * n) / fftSize
        real += sample * window * Math.cos(angle)
        imag -= sample * window * Math.sin(angle)
      }
      const magnitudeBin = Math.sqrt(real * real + imag * imag)
      weighted += (k * sampleRate / fftSize) * magnitudeBin
      magnitudeTotal += magnitudeBin
    }
    if (magnitudeTotal > 0) {
      centroidSum += weighted / magnitudeTotal
      centroidCount += 1
    }
  }

  const spectralCentroidHz = centroidCount ? Number((centroidSum / centroidCount).toFixed(1)) : null
  const voiced = rms >= 0.015 && voicedRatio >= 0.08
  const estimatedArousal = !voiced ? 'unknown' : rms >= 0.12 || peak >= 0.85 ? 'high' : rms >= 0.055 ? 'moderate' : 'low'
  const acousticQuality = !voiced ? 'weak' : zeroCrossingRate > 0.22 || crestFactor > 12 ? 'noisy' : 'clear'

  return {
    durationMs: Math.round(durationMs),
    rms: Number(rms.toFixed(4)),
    peak: Number(peak.toFixed(4)),
    zeroCrossingRate: Number(zeroCrossingRate.toFixed(4)),
    voiced,
    dynamicRange: Number(dynamicRange.toFixed(2)),
    crestFactor: Number(crestFactor.toFixed(2)),
    spectralCentroidHz,
    estimatedArousal,
    acousticQuality,
  }
}
