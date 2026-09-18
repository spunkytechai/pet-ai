'use client'

import { useEffect, useRef, useState } from 'react'
import { normalizeAudioForAnalysis } from './audio-utils'

type Props = { onAudioReady: (file: File) => void; disabled?: boolean }

export function AudioRecorder({ onAudioReady, disabled = false }: Props) {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startedAtRef = useRef(0)
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), [])

  useEffect(() => {
    if (!recording) return
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000)
      setSeconds(Math.min(elapsed, 30))
      if (elapsed >= 30) stop()
    }, 250)
    return () => window.clearInterval(timer)
  }, [recording])

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
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data) }
      recorder.onerror = () => setError('Recording failed. Please try again or upload a file.')
      recorder.onstop = async () => {
        const duration = Math.round((Date.now() - startedAtRef.current) / 1000)
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        if (blob.size) {
          try {
            const rawFile = new File([blob], 'pet-signal-' + Date.now() + '.' + ((recorder.mimeType || '').includes('mp4') ? 'm4a' : 'webm'), { type: blob.type })
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
    <div className="audio-recorder">
      <div className={'recorder-stage ' + (recording ? 'recording' : '')}>
        <div className="recorder-orb" aria-hidden="true"><span className="recorder-pulse" /></div>
        <div className="recorder-copy">
          <span className="tiny-label">{recording ? 'LISTENING NOW' : 'MICROPHONE READY'}</span>
          <strong>{recording ? 'Capture the moment.' : 'Record a pet sound.'}</strong>
          <p>{recording ? 'Keep your pet nearby and let the vocalization happen naturally.' : 'A short, clear clip gives PET AI better acoustic evidence.'}</p>
        </div>
        <div className="recorder-timer" aria-live="polite">{String(Math.floor(seconds / 60)).padStart(2,'0')}:{String(seconds % 60).padStart(2,'0')}</div>
      </div>
      <div className="recorder-wave" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ height: String(8 + ((i * 17) % 25)) + 'px' }} />)}</div>
      <button className={recording ? 'secondary recorder-button' : 'primary recorder-button'} onClick={recording ? stop : start} disabled={disabled} type="button">
        <span className={'recorder-button-dot ' + (recording ? 'stop' : '')} aria-hidden="true" />
        {recording ? 'Stop recording' : 'Record pet sound'}
      </button>
      <p className="muted recorder-hint">Maximum recommended clip: 30 seconds. You can also upload an audio file below.</p>
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  )
}