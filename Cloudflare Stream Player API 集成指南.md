# 使用 Cloudflare Stream Player API

幸运的是，Cloudflare Stream 提供了官方的 Player API (播放器 API) 来解决这个问题。它相当于一个安全的"遥控器"，允许您的主页面代码与 iframe 内部的播放器进行通信。

通过这个 API，您可以：

- **监听** 播放器事件（如播放、暂停、时间更新 timeupdate）
- **控制** 播放器行为（如播放、暂停、跳转 seek）

这正是我们同步字幕功能所需要的全部能力！

## 逐步实施解决方案

假设我们正在修改您的 VideoPlayer React 组件。

### 第 1 步：在项目中引入 Stream Player API 脚本

您需要在您的应用中加载 Cloudflare 的播放器脚本。最简单的方法是将其添加到您项目的 `public/index.html` 文件的 `<head>` 标签内。

```html
<script defer src="https://embed.videodelivery.net/embed/r4.js"></script>
defer 属性确保脚本在 HTML 解析完毕后执行，不会阻塞页面加载。

第 2 步：修改 VideoPlayer 组件以使用 iframe 和 API
现在我们来重构您的 VideoPlayer 组件。

import React, { useEffect, useRef } from 'react';

// 假设 Stream 全局对象已经通过上面的 script 标签加载
// 我们可以通过 window.Stream 来访问它，或者直接使用 Stream
declare const Stream: any; 

const VideoPlayer = ({ videoId, onTimeUpdate, onReady }) => {
  const iframeRef = useRef(null); // 创建一个引用来指向 iframe 元素
  const playerRef = useRef(null); // 创建一个引用来保存播放器实例

  useEffect(() => {
    const iframeElement = iframeRef.current;
    if (!iframeElement) return;

    // 1. 初始化播放器
    // Stream() 函数会找到 iframe 并返回一个播放器实例
    const streamPlayer = Stream(iframeElement);
    playerRef.current = streamPlayer; // 保存播放器实例

    // 2. 监听 'timeupdate' 事件 (这是字幕同步的关键！)
    // 当视频播放时间变化时，这个事件会被触发
    const handleTimeUpdate = (event) => {
      // event.detail.currentTime 包含了视频的当前秒数
      if (onTimeUpdate) {
        onTimeUpdate(event.detail.currentTime);
      }
    };
    
    streamPlayer.addEventListener('timeupdate', handleTimeUpdate);
    
    // 可以在这里监听其他事件，比如 'play', 'pause', 'ended'
    streamPlayer.addEventListener('ready', () => {
      if (onReady) {
        onReady(streamPlayer); // 将播放器实例传递出去，以便父组件控制
      }
    });

    // 3. 组件卸载时清理事件监听器，防止内存泄漏
    return () => {
      streamPlayer.removeEventListener('timeupdate', handleTimeUpdate);
      // 移除其他事件监听器...
    };

  }, [videoId, onTimeUpdate, onReady]); // 当 videoId 变化时，重新初始化

  // Cloudflare Stream 的 iframe src 格式
  const videoSrc = `https://customer-pqultjblfor3dl6u.cloudflarestream.com/${videoId}/iframe`;

  return (
    <div>
      <iframe
        ref={iframeRef}
        src={videoSrc}
        style={{ border: 'none', position: 'absolute', top: 0, left: 0, height: '100%', width: '100%' }}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen={true}
      ></iframe>
    </div>
  );
};

export default VideoPlayer;

第 3 步：在父组件中集成字幕逻辑
现在，您的父组件可以这样使用 VideoPlayer，并将字幕逻辑连接起来。

const ParentComponent = () => {
  const playerApiRef = useRef(null); // 用来保存播放器 API 实例

  // 当视频时间更新时，执行字幕高亮逻辑
  const handleTimeUpdate = (currentTime) => {
    // 这里调用您现有的字幕高亮函数
    // highlightSubtitle(currentTime); 
    console.log('Current Time:', currentTime);
  };

  // 当用户点击某句字幕时，控制视频跳转
  const handleSubtitleClick = (startTime) => {
    if (playerApiRef.current) {
      playerApiRef.current.seek(startTime); // 使用 API 的 seek 方法跳转
    }
  };
  
  return (
    <div>
      <VideoPlayer
        videoId="f1dcfbd5d0d61b3b6ce862973c7c8c36" // 您的视频 ID
        onTimeUpdate={handleTimeUpdate}
        onReady={(player) => playerApiRef.current = player}
      />
      {/* 您的字幕显示组件 */}
      {/* <SubtitleDisplay onSubtitleClick={handleSubtitleClick} /> */}
    </div>
  );
};

总结
通过使用 Cloudflare Stream Player API，我们成功地在 iframe 外部建立了一个通信桥梁：

字幕高亮：通过监听 timeupdate 事件，我们能持续获取视频的当前时间，从而精确地高亮对应的字幕行。

点击字幕跳转：通过调用播放器实例的 .seek(time) 方法，我们可以命令 iframe 内部的视频跳转到指定时间。

这样就完美解决了 iframe 破坏字幕功能的问题，并且这是 Cloudflare 官方支持的最佳实践。