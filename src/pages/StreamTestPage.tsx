import React, { useState, useRef } from 'react'
import VideoPlayer, { VideoPlayerRef } from '../components/VideoPlayer'

const StreamTestPage: React.FC = () => {
  const playerRef = useRef<VideoPlayerRef>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // 测试用的视频 ID
  const testStreamId = "demo-video-id" // 这会触发演示视频
  const realStreamId = "f1dcfbd5d645e471579a33a5c9e006dd" // 使用控制台显示的真实 Stream ID

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time)
  }

  const handleDurationChange = (dur: number) => {
    setDuration(dur)
  }

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleLoadedMetadata = () => {
    console.log('✅ 视频元数据加载完成')
  }

  const testControls = () => {
    const player = playerRef.current
    if (!player) return

    console.log('🎮 测试播放器控制')
    console.log('当前时间:', player.getCurrentTime())
    console.log('总时长:', player.getDuration())
    console.log('是否播放中:', player.isPlaying())
  }

  const seekToTime = (time: number) => {
    playerRef.current?.seekTo(time)
  }

  const togglePlayback = () => {
    const player = playerRef.current
    if (!player) return

    if (player.isPlaying()) {
      player.pause()
    } else {
      player.play()
    }
  }

  const setPlaybackSpeed = (rate: number) => {
    playerRef.current?.setPlaybackRate(rate)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Stream Web Component 测试</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stream Web Component 测试 (演示视频) */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">✨ Web Component (演示)</h2>
            <VideoPlayer
              ref={playerRef}
              cloudflareStreamId={testStreamId}
              useWebComponent={true}
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={handleDurationChange}
              onPlay={handlePlay}
              onPause={handlePause}
              onLoadedMetadata={handleLoadedMetadata}
              className="mb-4"
            />
            <div className="text-xs text-gray-500">使用演示视频测试 Web Component</div>
          </div>

          {/* Stream Web Component 测试 (真实Stream ID) */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">✨ Web Component (真实)</h2>
            <VideoPlayer
              cloudflareStreamId={realStreamId}
              useWebComponent={true}
              onTimeUpdate={() => {}}
              onDurationChange={() => {}}
              onPlay={() => {}}
              onPause={() => {}}
              onLoadedMetadata={() => {}}
              className="mb-4"
            />
            <div className="text-xs text-gray-500">
              真实Stream ID: {realStreamId}
              <br />
              <span className="text-blue-600">查看控制台输出了解加载过程</span>
            </div>
          </div>

          {/* iframe API 对比测试 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🌐 iframe API (真实)</h2>
            <VideoPlayer
              cloudflareStreamId={realStreamId}
              useWebComponent={false} // 使用 iframe + API 方案
              onTimeUpdate={() => {}}
              onDurationChange={() => {}}
              onPlay={() => {}}
              onPause={() => {}}
              onLoadedMetadata={() => {}}
              className="mb-4"
            />
            <div className="text-xs text-gray-500">iframe方案作为对比</div>
          </div>
        </div>

        {/* 主要控制面板 */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🎮 播放控制 (左侧演示视频)</h2>

          {/* 播放状态 */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">播放状态</h3>
            <div className="text-sm space-y-1">
              <div>当前时间: {currentTime.toFixed(2)}s</div>
              <div>总时长: {duration.toFixed(2)}s</div>
              <div>播放状态: {isPlaying ? '▶️ 播放中' : '⏸️ 已暂停'}</div>
              <div className="text-xs text-gray-500">
                {duration > 0 ? '✅ 视频已加载' : '⏳ 视频加载中...'}
              </div>
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={togglePlayback}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {isPlaying ? '⏸️ 暂停' : '▶️ 播放'}
              </button>
              <button
                onClick={() => seekToTime(30)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                跳转到30s
              </button>
              <button
                onClick={() => seekToTime(60)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                跳转到60s
              </button>
              <button
                onClick={testControls}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                测试API
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">播放速度:</span>
              <button
                onClick={() => setPlaybackSpeed(0.5)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                0.5x
              </button>
              <button
                onClick={() => setPlaybackSpeed(1)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                1x
              </button>
              <button
                onClick={() => setPlaybackSpeed(1.5)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                1.5x
              </button>
              <button
                onClick={() => setPlaybackSpeed(2)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                2x
              </button>
              </div>
            </div>
          </div>

          {/* iframe API 对比测试 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🌐 Stream Player API (对比)</h2>
            <VideoPlayer
              cloudflareStreamId={testStreamId}
              useWebComponent={false} // 使用 iframe + API 方案
              onTimeUpdate={() => {}}
              onDurationChange={() => {}}
              onPlay={() => {}}
              onPause={() => {}}
              onLoadedMetadata={() => {}}
              className="mb-4"
            />

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">技术说明</h3>
              <div className="text-sm text-gray-600">
                <p>这是旧的 iframe + API 方案，用于对比。</p>
                <p>Web Component 方案有以下优势：</p>
                <ul className="list-disc list-inside mt-2">
                  <li>无跨域限制，直接DOM控制</li>
                  <li>更准确的时间同步</li>
                  <li>更好的字幕高亮支持</li>
                  <li>原生视频元素体验</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 字幕同步测试区域 */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📝 字幕同步测试</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-lg mb-2">
                当前时间: <span className="font-mono text-blue-600">{currentTime.toFixed(2)}s</span>
              </div>
              <div className="text-sm text-gray-600">
                这个时间会实时更新，用于测试字幕同步精度
              </div>
            </div>

            {/* 模拟字幕高亮测试 */}
            <div className="mt-4 space-y-2">
              <div className={`p-2 rounded ${currentTime >= 0 && currentTime < 5 ? 'bg-yellow-200' : 'bg-white'}`}>
                [00:00 - 00:05] Hello, welcome to our video learning platform.
              </div>
              <div className={`p-2 rounded ${currentTime >= 5 && currentTime < 10 ? 'bg-yellow-200' : 'bg-white'}`}>
                [00:05 - 00:10] Today we'll explore advanced English conversation.
              </div>
              <div className={`p-2 rounded ${currentTime >= 10 && currentTime < 15 ? 'bg-yellow-200' : 'bg-white'}`}>
                [00:10 - 00:15] Let's start with some basic pronunciation exercises.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">🔍 测试说明</h3>
          <div className="text-sm text-blue-700">
            <p>1. <strong>Web Component 测试</strong>: 左侧使用新的 Stream Web Component，支持原生DOM控制</p>
            <p>2. <strong>API 对比测试</strong>: 右侧使用旧的 iframe + API 方案作对比</p>
            <p>3. <strong>字幕同步</strong>: 底部显示实时时间更新，测试字幕高亮精度</p>
            <p>4. <strong>控制测试</strong>: 使用播放、暂停、跳转等功能测试播放器控制</p>
            <p className="mt-2 font-semibold">📝 预期结果: Web Component 方案应该有更流畅的控制体验和更精确的时间同步</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StreamTestPage