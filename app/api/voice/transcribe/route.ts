import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@deepgram/sdk'

// Initialize Deepgram client
const deepgram = createClient(process.env.DEEPGRAM_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Get the audio data from the request
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Transcribe with Deepgram
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      {
        model: 'nova-2',
        language: 'en',
        smart_format: true,
        punctuate: true,
      }
    )

    if (error) {
      console.error('Deepgram error:', error)
      return NextResponse.json(
        { error: 'Transcription failed' },
        { status: 500 }
      )
    }

    // Extract the transcript
    const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''

    return NextResponse.json({
      transcript,
      confidence: result?.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0,
      duration: result?.metadata?.duration || 0
    })

  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}