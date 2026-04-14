'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { 
  Camera, 
  Mic, 
  X, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  Loader2,
  Upload,
  ChevronLeft,
  Zap,
  AlertTriangle,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useUser, useOrganization } from '@clerk/nextjs'

type ReportStep = 'capture' | 'review' | 'submitting' | 'success'
type Priority = 'critical' | 'high' | 'normal' | 'low'
type IssueType = 'leak' | 'damage' | 'malfunction' | 'safety' | 'cleaning' | 'other'

interface CapturedData {
  photos: string[]
  audioDescription?: string  // Voice memo transcribed to text
  location?: {
    area?: string
    floor?: string
    spot?: string
    coordinates?: [number, number]
  }
  timestamp: Date
  analysisId?: string  // ID from analysis endpoint
}

interface AIAnalysis {
  type: IssueType
  priority: Priority
  description: string
  suggestedTools?: string[]
  estimatedMinutes?: number
  confidence: number
}

interface IssueReporterProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  currentLocation?: {
    area?: string
    floor?: string
    coordinates?: [number, number]
  }
}

export function IssueReporter({ isOpen, onClose, onSubmit, currentLocation }: IssueReporterProps) {
  // Get Clerk user and organization info
  const { user } = useUser()
  const { organization } = useOrganization()
  
  const [step, setStep] = useState<ReportStep>('capture')
  const [capturedData, setCapturedData] = useState<CapturedData>({
    photos: [],
    location: currentLocation,
    timestamp: new Date()
  })
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)

  // Start camera stream
  const startCamera = async () => {
    try {
      setCameraError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      })
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Camera error:', error)
      setCameraError('Unable to access camera. Please check permissions.')
    }
  }

  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }

  // Take real photo from camera
  const handleTakePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context && video.videoWidth > 0) {
        // Set canvas size to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert to data URL
        const photoUrl = canvas.toDataURL('image/jpeg', 0.8)
        
        setCapturedData(prev => {
          const newPhotos = [...prev.photos, photoUrl]
          
          // Don't auto-analyze, let user take multiple photos
          // AI analysis will happen when user clicks Continue
          
          return {
            ...prev,
            photos: newPhotos
          }
        })
        
        // Play capture sound/haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }
      }
    }
  }

  // AI Analysis - now calls real backend
  const performAIAnalysis = async () => {
    setIsProcessing(true)
    
    try {
      // Prepare form data for multipart upload
      const formData = new FormData()
      
      // Add images as base64 or files
      if (capturedData.photos.length > 0) {
        for (let index = 0; index < capturedData.photos.length; index++) {
          const photo = capturedData.photos[index]
          // Convert base64 to blob if needed
          if (photo.startsWith('data:')) {
            const blob = await fetch(photo).then(r => r.blob())
            formData.append('images', blob, `photo_${index}.jpg`)
          }
        }
      }
      
      // Add other data
      if (capturedData.audioDescription) {
        formData.append('audio_description', capturedData.audioDescription)
      }
      
      if (capturedData.location) {
        formData.append('location', JSON.stringify(capturedData.location))
      }
      
      if (additionalNotes) {
        formData.append('manual_notes', additionalNotes)
      }
      
      // Call the analyze endpoint
      const response = await fetch('http://localhost:8001/api/tasks/analyze', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Analysis failed')
      }
      
      const analysisResult = await response.json()
      
      // Store analysis ID for confirmation step
      setCapturedData(prev => ({
        ...prev,
        analysisId: analysisResult.analysis_id
      }))
      
      // Convert backend format to frontend format
      const analysis: AIAnalysis = {
        type: analysisResult.ai_analysis.issue_type || 'other',
        priority: _mapPriorityNumberToString(analysisResult.priority),
        description: analysisResult.ai_analysis.description || 'Issue detected',
        suggestedTools: analysisResult.ai_analysis.suggested_tools || [],
        estimatedMinutes: analysisResult.ai_analysis.estimated_minutes || 30,
        confidence: analysisResult.ai_analysis.confidence || 0.5
      }
      
      setAiAnalysis(analysis)
      setStep('review')
    } catch (error) {
      console.error('AI analysis failed:', error)
      // Fallback to manual mode
      setAiAnalysis({
        type: 'other',
        priority: 'normal',
        description: 'AI analysis unavailable. Please provide details manually.',
        confidence: 0
      })
      setStep('review')
    } finally {
      setIsProcessing(false)
    }
  }
  
  // Helper function to map priority
  const _mapPriorityNumberToString = (priority: number): Priority => {
    if (priority >= 5) return 'critical'
    if (priority >= 4) return 'high'
    if (priority >= 3) return 'normal'
    return 'low'
  }

  // 提交报告 - 现在使用 confirm 端点
  const handleSubmitReport = async () => {
    setStep('submitting')
    
    try {
      // First, get the current venue_id from API
      const venueResponse = await fetch('/api/venues/current')
      if (!venueResponse.ok) {
        throw new Error('Unable to fetch venue information. Please ensure you are logged in and belong to a venue')
      }
      
      const venueData = await venueResponse.json()
      const venue_id = venueData.venue_id
      
      if (!venue_id) {
        throw new Error('Venue information not found. Please contact administrator')
      }
      
      console.log('Using venue_id:', venue_id, 'for venue:', venueData.venue_name)
      
      // Call the confirm endpoint to create the actual task in database
      const response = await fetch('http://localhost:8001/api/tasks/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analysis_id: capturedData.analysisId,
          clerk_user_id: user?.id || null,  // Clerk user ID for lookup
          venue_id: venue_id,  // Real venue ID from database
          user_id: user?.id || "anonymous",  // Fallback identifier
          organization_id: organization?.id || null,
          priority: aiAnalysis?.priority === 'critical' ? 5 : 
                    aiAnalysis?.priority === 'high' ? 4 : 
                    aiAnalysis?.priority === 'normal' ? 3 : 2,
          description: aiAnalysis?.description,
          additional_notes: additionalNotes
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create task')
      }
      
      const result = await response.json()
      
      console.log('Task created in database:', result)
      
      // Show success toast
      toast.success('Report submitted successfully!', {
        description: `Task ID: ${result.task_id}`,
        duration: 4000,
      })
      
      // Call the onSubmit callback with the created task
      await onSubmit(result.task || {
        id: result.task_id,
        status: result.status,
        ...capturedData
      })
      
      setStep('success')
      
      // Auto close after 2 seconds (faster feedback)
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (error: any) {
      console.error('Submit failed:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        data: capturedData
      })
      
      // Show error with beautiful toast
      toast.error(error.message || 'Failed to submit. Please try again', {
        description: 'Check console for details',
        duration: 5000,
      })
      setStep('review')
    }
  }

  const handleClose = () => {
    stopCamera()
    setStep('capture')
    setCapturedData({ photos: [], timestamp: new Date() })
    setAiAnalysis(null)
    setAdditionalNotes('')
    setCameraError(null)
    onClose()
  }

  // Start camera and get location when opening capture mode
  useEffect(() => {
    if (isOpen && step === 'capture') {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (!stream) {
          startCamera()
        }
      }, 100)
      
      // Get current location (only once when opening)
      if (navigator.geolocation && !capturedData.location?.coordinates) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCapturedData(prev => ({
              ...prev,
              location: {
                ...prev.location,
                coordinates: [position.coords.latitude, position.coords.longitude]
              }
            }))
          },
          (error) => {
            console.log('Location access denied:', error)
          },
          { enableHighAccuracy: true }
        )
      }
      
      return () => clearTimeout(timer)
    }
  }, [isOpen, step, stream])
  
  // Clean up camera when closing
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  if (!isOpen) return null

  // 拍照界面
  if (step === 'capture') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/50">
          <button onClick={handleClose} className="p-2 text-white">
            <X className="h-6 w-6" />
          </button>
          <h2 className="text-white font-semibold">Report Issue</h2>
          <div className="w-10" />
        </div>

        {/* Camera Preview */}
        <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
          {/* Real video stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Hidden canvas for photo capture */}
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          
          {/* Loading/Error states */}
          {!stream && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-center">
                <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                <p className="text-sm">Starting camera...</p>
              </div>
            </div>
          )}
          
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-center p-4">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
                <p className="text-sm mb-2">{cameraError}</p>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-orange-600 rounded-lg text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          
          {/* Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 border-2 border-white/50 rounded-lg">
              <div className="w-full h-full relative">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/30" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30" />
              </div>
            </div>
          </div>

          {/* Photo count and preview */}
          {capturedData.photos.length > 0 && (
            <>
              <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full">
                <span className="text-white text-sm">{capturedData.photos.length} photo{capturedData.photos.length > 1 ? 's' : ''}</span>
              </div>
              
              {/* Photo thumbnails */}
              <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto">
                {capturedData.photos.map((photo, index) => (
                  <div key={index} className="relative flex-shrink-0">
                    <img 
                      src={photo} 
                      alt={`Photo ${index + 1}`} 
                      className="w-16 h-16 rounded-lg object-cover border-2 border-white"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setCapturedData(prev => ({
                          ...prev,
                          photos: prev.photos.filter((_, i) => i !== index)
                        }))
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Location Info */}
        <div className="bg-black/50 px-4 py-2">
          <div className="flex items-center gap-2 text-white/80">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">
              {capturedData.location?.area || 'Zone B'} {capturedData.location?.floor || 'Level 3'} {capturedData.location?.spot || 'Equipment Room'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-black p-4 space-y-3">
          <button
            onClick={handleTakePhoto}
            className="w-full py-4 bg-orange-600 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-3 active:bg-orange-700"
          >
            <Camera className="h-6 w-6" />
            Take Photo
          </button>
          
          <button
            onClick={async () => {
              if (!isRecording) {
                try {
                  const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
                  const recorder = new MediaRecorder(audioStream)
                  const chunks: Blob[] = []
                  
                  recorder.ondataavailable = (e) => {
                    chunks.push(e.data)
                  }
                  
                  recorder.onstop = async () => {
                    const audioBlob = new Blob(chunks, { type: 'audio/webm' })
                    
                    // Send to API for transcription
                    setIsTranscribing(true)
                    try {
                      const formData = new FormData()
                      formData.append('audio', audioBlob, 'recording.webm')
                      
                      const response = await fetch('/api/voice/transcribe', {
                        method: 'POST',
                        body: formData
                      })
                      
                      if (response.ok) {
                        const data = await response.json()
                        setCapturedData(prev => ({ 
                          ...prev, 
                          audioDescription: data.transcript 
                        }))
                      } else {
                        console.error('Transcription failed')
                      }
                    } catch (error) {
                      console.error('Error transcribing audio:', error)
                    } finally {
                      setIsTranscribing(false)
                    }
                    
                    audioStream.getTracks().forEach(track => track.stop())
                  }
                  
                  recorder.start()
                  setMediaRecorder(recorder)
                  setIsRecording(true)
                  setAudioChunks(chunks)
                } catch (error) {
                  console.error('Microphone access denied:', error)
                }
              } else {
                if (mediaRecorder) {
                  mediaRecorder.stop()
                  setIsRecording(false)
                }
              }
            }}
            disabled={isTranscribing}
            className={cn(
              "w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2",
              isRecording 
                ? "bg-red-600 text-white animate-pulse"
                : isTranscribing
                ? "bg-gray-600 text-white"
                : capturedData.audioDescription
                ? "bg-green-600 text-white"
                : "bg-gray-800 text-white/80 border border-gray-700"
            )}
          >
            <Mic className="h-5 w-5" />
            {isRecording ? 'Recording... (Tap to stop)' : 
             isTranscribing ? 'Transcribing...' :
             capturedData.audioDescription ? 'Voice Recorded ✓' : 
             'Voice Memo'}
          </button>

          {capturedData.photos.length > 0 && (
            <button
              onClick={() => {
                performAIAnalysis()  // No longer needs photo parameter
                stopCamera() // Stop camera when moving to next step
              }}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
            >
              Continue ({capturedData.photos.length} photo{capturedData.photos.length > 1 ? 's' : ''})
            </button>
          )}
        </div>
      </div>
    )
  }

  // 确认界面
  if (step === 'review') {
    const getPriorityColor = (priority: Priority) => {
      switch (priority) {
        case 'critical': return 'bg-red-600 text-white'
        case 'high': return 'bg-orange-600 text-white'
        case 'normal': return 'bg-yellow-500 text-white'
        default: return 'bg-gray-500 text-white'
      }
    }

    const getPriorityIcon = (priority: Priority) => {
      switch (priority) {
        case 'critical': return <Zap className="h-4 w-4" />
        case 'high': return <AlertTriangle className="h-4 w-4" />
        default: return <Info className="h-4 w-4" />
      }
    }

    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <button 
            onClick={() => {
              setStep('capture')
              // Restart camera when going back
              setTimeout(() => {
                startCamera()
              }, 100)
            }} 
            className="p-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="font-semibold text-lg">Confirm Issue Details</h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Photos */}
          <div className="p-4">
            <div className="flex gap-2 overflow-x-auto">
              {capturedData.photos.map((photo, index) => (
                <div key={index} className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                  <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis */}
          {isProcessing ? (
            <div className="p-4 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
              <span className="ml-2 text-gray-600">AI analyzing...</span>
            </div>
          ) : aiAnalysis && (
            <div className="px-4 space-y-4">
              {/* Priority Badge */}
              <div className="flex items-center gap-3">
                <span className={cn(
                  "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
                  getPriorityColor(aiAnalysis.priority)
                )}>
                  {getPriorityIcon(aiAnalysis.priority)}
                  {aiAnalysis.priority === 'critical' ? 'Critical' :
                   aiAnalysis.priority === 'high' ? 'High Priority' :
                   aiAnalysis.priority === 'normal' ? 'Normal' : 'Low Priority'}
                </span>
                <span className="text-sm text-gray-500">
                  Confidence: {Math.round((aiAnalysis.confidence || 0) * 100)}%
                </span>
              </div>

              {/* Description */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-gray-600 mb-2">AI Analysis</h3>
                <p className="text-gray-900">{aiAnalysis.description}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Issue Type</p>
                  <p className="font-medium">
                    {aiAnalysis.type === 'leak' ? 'Water Leak' :
                     aiAnalysis.type === 'damage' ? 'Damage' :
                     aiAnalysis.type === 'malfunction' ? 'Malfunction' :
                     aiAnalysis.type === 'safety' ? 'Safety Hazard' : 'Other'}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Estimated Time</p>
                  <p className="font-medium">{aiAnalysis.estimatedMinutes || 30} min</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">
                  {capturedData.location?.area || 'Zone B'} {capturedData.location?.floor || 'Level 3'} {capturedData.location?.spot || 'Equipment Room'}
                </span>
              </div>

              {/* Audio Description */}
              {capturedData.audioDescription && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="h-4 w-4 text-blue-600" />
                    <p className="text-xs font-medium text-blue-600">Voice Description</p>
                  </div>
                  <p className="text-sm text-gray-700">{capturedData.audioDescription}</p>
                </div>
              )}

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={3}
                  placeholder="Add more details..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleSubmitReport}
            disabled={!aiAnalysis || isProcessing}
            className="w-full py-4 bg-orange-600 text-white rounded-xl font-semibold text-lg disabled:bg-gray-300"
          >
            Submit Report
          </button>
        </div>
      </div>
    )
  }

  // 提交中
  if (step === 'submitting' && isOpen) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-lg font-medium">Submitting...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    )
  }

  // 成功
  if (step === 'success' && isOpen) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Report Submitted Successfully</h2>
          <p className="text-gray-600">Task created. Staff will handle it soon</p>
        </div>
      </div>
    )
  }

  return null
}