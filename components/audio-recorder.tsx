'use client'

import { useEffect, useRef, useState } from 'react'
import { normalizeAudioForAnalysis } from './audio-utils'

type Props = {
  onAudioReady: (file: File) => void
  disabled?: boolean
}

export function AudioRecorder({ onAudioReady, disabled = false }: Props) {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startedAtRef = useRef<number>(0)
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), [])

  function supportedMimeType() {
    const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || ''
  }

  async function start() {
    setError('')
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError('This browser does not support microphone recording. Please upload an audio file instead.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const mimeType = supportedMimeType()
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      recorderRef.current = recorder
      startedAtRef.current = Date.now()
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data)
      }
      recorder.onerror = () => setError('Recording failed. Please try again or upload a file.')
      recorder.onstop = async () => {
        const duration = Math.round((Date.now() - startedAtRef.current) / 1000)
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        if (blob.size) {
          try {
            const rawFile = new File([blob], `pet-signal-${Date.now()}.${(recorder.mimeType || '').includes('mp4') ? 'm4a' : 'webm'}`, { type: blob.type })
            const normalized = await normalizeAudioForAnalysis(rawFile)
            onAudioReady(normalized)
          } catch (conversionError) {
            setError(conversionError instanceof Error ? conversionError.message : 'Recorded audio could not be prepared for analysis.')
          }
        }
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        setSeconds(duration)
      }
      recorder.start()
      setSeconds(0)
      setRecording(true)
    } catch {
      setError('Microphone permission was not granted. You can upload an audio file instead.')
    }
  }

  function stop() {
    recorderRef.current?.stop()
    recorderRef.current = null
    setRecording(false)
  }

  return (
    <div>
      <button className={recording ? 'secondary' : 'primary'} onClick={recording ? stop : start} disabled={disabled} type="button">
        {recording ? `Stop recording · ${seconds}s` : 'Record pet sound'}
      </button>
      <p className="muted">Keep the microphone close enough to capture the vocalization clearly. Maximum recommended clip: 30 seconds.</p>
      {error && <p className="error">{error}</p>}
    </div>
  )
}
