import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase()
    const videoId = params.id

    // Fetch video details
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single()

    if (videoError) {
      if (videoError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Video not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching video:', videoError)
      return NextResponse.json(
        { error: 'Failed to fetch video' },
        { status: 500 }
      )
    }

    // Fetch subtitles
    const { data: subtitles, error: subtitlesError } = await supabase
      .from('subtitles')
      .select('*')
      .eq('video_id', videoId)
      .order('start_time', { ascending: true })

    if (subtitlesError) {
      console.error('Error fetching subtitles:', subtitlesError)
      return NextResponse.json(
        { error: 'Failed to fetch subtitles' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: {
        ...video,
        subtitles: subtitles || []
      }
    })

  } catch (error) {
    console.error('Error in video detail API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase()
    const videoId = params.id
    const body = await request.json()

    const { data: video, error } = await supabase
      .from('videos')
      .update({
        title: body.title,
        description: body.description,
        thumbnail_url: body.thumbnail_url
      })
      .eq('id', videoId)
      .select()
      .single()

    if (error) {
      console.error('Error updating video:', error)
      return NextResponse.json(
        { error: 'Failed to update video' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: video })

  } catch (error) {
    console.error('Error in video update API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase()
    const videoId = params.id

    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId)

    if (error) {
      console.error('Error deleting video:', error)
      return NextResponse.json(
        { error: 'Failed to delete video' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Video deleted successfully' })

  } catch (error) {
    console.error('Error in video delete API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}