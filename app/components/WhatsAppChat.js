'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Mic, Square, RotateCcw, Volume2 } from 'lucide-react'
import axios from 'axios'

export default function WhatsAppChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your WhatsApp Voice Agent. You can type a message or record audio to chat with me.",
      sender: 'agent',
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [userId] = useState('user_' + Math.random().toString(36).substr(2, 9)) // Consistent user ID
  const messagesEndRef = useRef(null)
  const mediaRecorderRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const resetChat = () => {
    setMessages([
      {
        id: 1,
        text: "Hi! I'm your WhatsApp Voice Agent. You can type a message or record audio to chat with me.",
        sender: 'agent',
        timestamp: new Date(),
        type: 'text'
      }
    ])
    setInputText('')
    setAudioBlob(null)
  }

  const addMessage = (text, sender, type = 'text') => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date(),
      type
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }

  const sendTextMessage = async () => {
    if (!inputText.trim()) return

    // Add user message
    addMessage(inputText, 'user', 'text')
    const userMessage = inputText
    setInputText('')
    setIsProcessing(true)

    try {
      // Send message to advanced AI service with consistent userId
      // Convert messages to correct format: { role, content }
      const conversationHistory = messages
        .slice(-5)
        .filter(msg => msg.sender !== 'agent' || msg.id !== 1) // Exclude initial welcome message
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text.replace(/^🎵 "|"$/g, '').replace(/^🔊 /, '') // Clean voice message markers
        }));
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/api/voice/chat`,
        { 
          message: userMessage,
          conversationHistory: conversationHistory,
          userId: userId
        }
      )
      
      const aiResponse = response.data.response
      addMessage(aiResponse, 'agent', 'text')
      
    } catch (error) {
      console.error('Error sending message:', error)
      addMessage("Sorry, I'm having trouble processing your message. Please try again.", 'agent', 'text')
    } finally {
      setIsProcessing(false)
    }
  }

  const startRecording = async () => {
    try {
      console.log('🎤 Starting audio recording...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      // Use better audio format for recording
      const options = {
        mimeType: 'audio/webm;codecs=opus'
      }
      
      // Fallback for browsers that don't support webm
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/webm'
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/mp4'
      }
      
      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
          console.log('📊 Audio chunk received:', event.data.size, 'bytes')
        }
      }
      
      mediaRecorder.onstop = () => {
        console.log('🛑 Recording stopped, processing audio...')
        const blob = new Blob(chunks, { type: options.mimeType })
        console.log('📦 Final audio blob:', {
          size: blob.size,
          type: blob.type
        })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
        processVoiceMessage(blob)
      }
      
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      console.log('✅ Recording started with format:', options.mimeType)
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          console.log('⏰ Auto-stopping recording after 30 seconds')
          stopRecording()
        }
      }, 30000)
      
    } catch (error) {
      console.error('❌ Error starting recording:', error)
      alert('Could not access microphone. Please check permissions and try again.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processVoiceMessage = async (blob) => {
    // Add user voice message indicator
    addMessage('🎵 Voice message', 'user', 'voice')
    setIsProcessing(true)

    try {
      console.log('🎤 Processing voice message...');
      console.log('📊 Audio blob info:', {
        size: blob.size,
        type: blob.type
      });

      // Convert speech to text using real STT
      const formData = new FormData()
      formData.append('audio', blob, 'recording.webm')

      console.log('📤 Sending audio to backend for STT...');
      const sttResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/api/voice/stt`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      const transcription = sttResponse.data.transcription
      console.log('✅ STT Response:', transcription);
      
      // Update the voice message with transcription
      setMessages(prev => 
        prev.map(msg => 
          msg.id === prev[prev.length - 1].id 
            ? { ...msg, text: `🎵 "${transcription}"` }
            : msg
        )
      )

      // Generate AI response with consistent userId
      console.log('🤖 Sending transcription to AI...');
      
      // Convert messages to correct format: { role, content }
      const conversationHistory = messages
        .slice(-5)
        .filter(msg => msg.sender !== 'agent' || msg.id !== 1) // Exclude initial welcome message
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text.replace(/^🎵 "|"$/g, '').replace(/^🔊 /, '') // Clean voice message markers
        }));
      
      const chatResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/api/voice/chat`,
        { 
          message: transcription,
          conversationHistory: conversationHistory,
          userId: userId
        }
      )

      const aiResponse = chatResponse.data.response
      console.log('✅ AI Response:', aiResponse);
      
      // Convert response to speech and add as voice message
      console.log('🔊 Converting AI response to speech...');
      const ttsResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/api/voice/tts`,
        { text: aiResponse },
        { responseType: 'arraybuffer' }
      )

      const audioBlob = new Blob([ttsResponse.data], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      // Add agent voice response
      const agentMessage = addMessage(`🔊 ${aiResponse}`, 'agent', 'voice')
      agentMessage.audioUrl = audioUrl
      
      // Auto-play the response
      const audio = new Audio(audioUrl)
      audio.play().catch(console.error)
      
    } catch (error) {
      console.error('❌ Error processing voice message:', error)
      addMessage("Sorry, I couldn't process your voice message. Please try again or type your message.", 'agent', 'text')
    } finally {
      setIsProcessing(false)
    }
  }

  const playVoiceMessage = (audioUrl) => {
    const audio = new Audio(audioUrl)
    audio.play().catch(console.error)
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-whatsapp-green text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold">🤖</span>
          </div>
          <div>
            <h2 className="font-semibold">Voice Agent</h2>
            <p className="text-xs opacity-90">Online</p>
          </div>
        </div>
        <button
          onClick={resetChat}
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          title="Reset Chat"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-whatsapp-green text-white'
                  : 'bg-white text-gray-800 shadow'
              }`}
            >
              <div className="flex items-center space-x-2">
                <p className="text-sm">{message.text}</p>
                {message.type === 'voice' && message.audioUrl && (
                  <button
                    onClick={() => playVoiceMessage(message.audioUrl)}
                    className="p-1 hover:bg-gray-200 rounded-full"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm text-gray-500">Agent is typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-2">
          <div className="flex-1 flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-transparent"
              disabled={isProcessing || isRecording}
            />
            
            <button
              onClick={sendTextMessage}
              disabled={!inputText.trim() || isProcessing || isRecording}
              className="p-2 bg-whatsapp-green text-white rounded-full hover:bg-whatsapp-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`p-2 rounded-full transition-colors ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording ? (
              <Square className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {isRecording && (
          <div className="mt-2 text-center">
            <p className="text-sm text-red-500 animate-pulse">
              🔴 Recording... Tap stop when done
            </p>
          </div>
        )}
      </div>
    </div>
  )
}