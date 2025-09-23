const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://boyyfwfjqczykgufyasp.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveXlmd2ZqcWN6eWtndWZ5YXNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU1MDQyNSwiZXhwIjoyMDc0MTI2NDI1fQ.cCvbJ2CbzK9HPDLZYDBva6mTCVCosONKgcgV3EIY5XA'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function checkDatabaseData() {
  try {
    console.log('检查数据库中的视频数据...')

    // Get all videos
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })

    if (videosError) {
      throw new Error(`获取视频失败: ${videosError.message}`)
    }

    console.log(`\n📹 数据库中的视频 (${videos.length} 个):`)
    videos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`)
      console.log(`   ID: ${video.id}`)
      console.log(`   Cloudflare Stream ID: ${video.cloudflare_stream_id}`)
      console.log(`   创建时间: ${video.created_at}`)
      console.log(`   缩略图: ${video.thumbnail_url || '无'}`)
      console.log('   ---')
    })

    // Check specifically for "Bookmark" video
    const bookmarkVideo = videos.find(v => v.title.includes('Bookmark'))
    if (bookmarkVideo) {
      console.log('\n✅ 找到 Bookmark 视频!')
      console.log(`视频 ID: ${bookmarkVideo.id}`)

      // Get subtitles for this video
      const { data: subtitles, error: subtitlesError } = await supabase
        .from('subtitles')
        .select('*')
        .eq('video_id', bookmarkVideo.id)
        .order('start_time', { ascending: true })

      if (subtitlesError) {
        console.log(`❌ 获取字幕失败: ${subtitlesError.message}`)
      } else {
        console.log(`📝 字幕数量: ${subtitles.length} 条`)
        if (subtitles.length > 0) {
          console.log(`首条字幕: "${subtitles[0].english_text}"`)
          console.log(`中文翻译: "${subtitles[0].chinese_text}"`)
        }
      }

      console.log(`\n🔗 访问链接: http://localhost:3001/videos/${bookmarkVideo.id}`)
    } else {
      console.log('\n❌ 未找到 Bookmark 视频')
    }

  } catch (error) {
    console.error('❌ 检查失败:', error.message)
    process.exit(1)
  }
}

// Run the check
checkDatabaseData()