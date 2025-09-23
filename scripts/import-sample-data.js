const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://boyyfwfjqczykgufyasp.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveXlmd2ZqcWN6eWtndWZ5YXNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU1MDQyNSwiZXhwIjoyMDc0MTI2NDI1fQ.cCvbJ2CbzK9HPDLZYDBva6mTCVCosONKgcgV3EIY5XA'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// Sample video data from vedio_sample.txt - Generate UUID for id
const { randomUUID } = require('crypto')

const videoData = {
  id: randomUUID(), // Generate a proper UUID
  title: 'Bookmark - 日常对话',
  description: '通过真实场景学习地道英语表达',
  thumbnail_url: 'https://customer-d415834a4ce21fc998f3cecdab532988.cloudflarestream.com/08135affc82e60108cf1cb8214d2f2c1/thumbnails/thumbnail.jpg',
  cloudflare_stream_id: '08135affc82e60108cf1cb8214d2f2c1',
  created_at: new Date().toISOString()
}

const subtitlesData = [
  {
    video_id: videoData.id, // Use the generated UUID
    start_time: 0.1,
    end_time: 5.3,
    english_text: "right now I'm reading this didion and babits it's great",
    chinese_text: "我现在正在读迪迪恩和巴比特的作品 很棒"
  },
  {
    video_id: videoData.id,
    start_time: 5.3,
    end_time: 7.266,
    english_text: "it's a really good read",
    chinese_text: "这本书真的很好看"
  },
  {
    video_id: videoData.id,
    start_time: 7.266,
    end_time: 11.633,
    english_text: "this is my favorite thing ever it's a bookmark",
    chinese_text: "这是我最喜欢的东西 是个书签"
  },
  {
    video_id: videoData.id,
    start_time: 11.8,
    end_time: 14.066,
    english_text: "it's a thong bookmark",
    chinese_text: "是个丁字裤书签"
  },
  {
    video_id: videoData.id,
    start_time: 14.066,
    end_time: 16.866,
    english_text: "and a dancer actually made this for me",
    chinese_text: "而且是一位舞者亲手为我做的"
  },
  {
    video_id: videoData.id,
    start_time: 16.866,
    end_time: 18.466,
    english_text: "and I remember when she gave it to me",
    chinese_text: "我记得她送我的时候"
  },
  {
    video_id: videoData.id,
    start_time: 18.466,
    end_time: 19.6,
    english_text: "I was like thank you",
    chinese_text: "我说了句谢谢"
  },
  {
    video_id: videoData.id,
    start_time: 19.6,
    end_time: 23.0,
    english_text: "this is not gonna fit me but I appreciate it",
    chinese_text: "这我穿不下 但还是很感谢"
  },
  {
    video_id: videoData.id,
    start_time: 23.0,
    end_time: 24.9,
    english_text: "and she's like no it's a bookmark",
    chinese_text: "她说不是 这是书签"
  },
  {
    video_id: videoData.id,
    start_time: 25.033,
    end_time: 28.566,
    english_text: "and so I think that's pretty cool and kinda sexy too",
    chinese_text: "所以我觉得这挺酷还有点小性感"
  },
  {
    video_id: videoData.id,
    start_time: 28.766,
    end_time: 29.7,
    english_text: "I wanna go",
    chinese_text: "我想去"
  }
]

async function importSampleData() {
  try {
    console.log('开始导入视频数据...')

    // Check if video with this title already exists
    const { data: existingVideo } = await supabase
      .from('videos')
      .select('id')
      .eq('title', videoData.title)
      .single()

    if (existingVideo) {
      console.log('相同标题的视频已存在，先删除现有数据...')

      // Delete existing subtitles
      await supabase
        .from('subtitles')
        .delete()
        .eq('video_id', existingVideo.id)

      // Delete existing video
      await supabase
        .from('videos')
        .delete()
        .eq('id', existingVideo.id)
    }

    // Insert video
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .insert([videoData])
      .select()

    if (videoError) {
      throw new Error(`插入视频失败: ${videoError.message}`)
    }

    console.log('✅ 视频数据插入成功:', video[0].title)

    // Insert subtitles
    const { data: subtitles, error: subtitlesError } = await supabase
      .from('subtitles')
      .insert(subtitlesData)
      .select()

    if (subtitlesError) {
      throw new Error(`插入字幕失败: ${subtitlesError.message}`)
    }

    console.log(`✅ 字幕数据插入成功: ${subtitles.length} 条字幕`)
    console.log('🎉 数据导入完成！现在可以在网站上看到你的视频了。')

  } catch (error) {
    console.error('❌ 导入失败:', error.message)
    process.exit(1)
  }
}

// Run the import
importSampleData()