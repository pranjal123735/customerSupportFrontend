'use client'

import { useState } from 'react'
import { Mic, Volume2, Play, Square, Upload } from 'lucide-react'
import axios from 'axios'

export default function VoiceTest() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [transcription, setTranscription] = useState('')
  const [testText, setTestText] = useState('Hello! How can I help you today?')
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(false)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks = []

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/ogg' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop()
          setIsRecording(false)
        }
      }, 10000)

      // Store mediaRecorder reference for manual stop
      window.currentRecorder = mediaRecorder
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (window.currentRecorder && window.currentRecorder.state === 'recording') {
      window.currentRecorder.stop()
      setIsRecording(false)
    }
  }

  const testSpeechToText = async () => {
    if (!audioBlob) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.ogg')

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/api/voice/stt`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      setTranscription(response.data.transcription)
    } catch (error) {
      console.error('STT Error:', error)
      alert('Error converting speech to text')
    } finally {
      setLoading(false)
    }
  }

  const testTextToSpeech = async () => {
    if (!testText.trim()) return

    setLoading(true)
    setIsPlaying(true)
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/api/voice/tts`,
        { text: testText },
        {
          responseType: 'arraybuffer'
        }
      )

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }
      
      await audio.play()
    } catch (error) {
      console.error('TTS Error:', error)
      alert('Error converting text to speech')
      setIsPlaying(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Voice Testing</h3>
      
      {/* Speech to Text Testing */}
      <div className="mb-8">
        <h4 className="text-md font-medium text-gray-700 mb-3">Speech to Text</h4>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:opacity-50`}
            >
              {isRecording ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Start Recording
                </>
              )}
            </button>
            
            {audioBlob && (
              <button
                onClick={testSpeechToText}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                {loading ? 'Processing...' : 'Convert to Text'}
              </button>
            )}
          </div>
          
          {transcription && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Transcription:</strong> {transcription}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Text to Speech Testing */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3">Text to Speech</h4>
        
        <div className="space-y-4">
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Enter text to convert to speech..."
            className="w-full p-3 border border-gray-300 rounded-md text-sm"
            rows={3}
          />
          
          <button
            onClick={testTextToSpeech}
            disabled={loading || isPlaying || !testText.trim()}
            className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
          >
            {isPlaying ? (
              <>
                <Volume2 className="h-4 w-4 mr-2 animate-pulse" />
                Playing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                {loading ? 'Converting...' : 'Play Speech'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}