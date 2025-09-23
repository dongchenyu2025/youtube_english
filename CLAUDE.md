# Claude Code 开发记录

## 项目概述
滚动字幕英语学习应用 - 支持视频播放、字幕显示、中英对照模式的语言学习工具

## 核心功能实现

### 1. 视频上传与显示优化 ✅

**功能描述**
- 用户上传视频和字幕后，视频自动置顶显示
- 上传区域在文件上传完成后自动隐藏

**实现方案**
- 添加状态追踪：`hasUploadedVideo`, `hasUploadedSubtitles`
- 条件渲染上传组件和视频播放器
- 动态布局调整

**关键代码位置**
- `src/App.tsx:19-20` - 状态定义
- `src/App.tsx:159-169` - 条件渲染逻辑
- `src/components/FileUploader.tsx` - 上传组件隐藏逻辑

### 2. 中英对照字幕显示 ✅

**功能描述**
- 点击"中英对照"按钮时，同时显示英文和中文字幕
- 英文显示在上行（粗体、深色）
- 中文显示在下行（普通、灰色）

**遇到的问题**
1. 初始实现中文翻译不显示
2. React Fragment 导致的渲染问题
3. CSS 样式优先级和可见性问题

**解决方案**
```typescript
// 修复前的复杂逻辑
{displaySettings.showTranslation && subtitle.translation ? (...) : (...)}

// 修复后的简化逻辑
{displaySettings.showTranslation ? (
  <div className="bilingual-container">
    <div className="english-text">{subtitle.text}</div>
    {subtitle.translation && (
      <div className="chinese-text">{subtitle.translation}</div>
    )}
  </div>
) : (
  <div className="single-text">{subtitle.text}</div>
)}
```

**关键修改**
- `src/components/SubtitleDisplay.tsx:61-70` - 显示逻辑重构
- `src/App.css:241-256` - 双语容器样式
- `src/App.css:232-239` - 中文文本样式优化

### 3. SRT 字幕解析 ✅

**功能描述**
- 自动识别和分离中英文字幕内容
- 支持混合格式的 SRT 文件

**实现位置**
- `src/utils/fileUtils.ts:parseSRT()` - 解析逻辑
- `src/data/sampleData.ts` - 示例数据结构

### 4. 点读模式自动暂停 ✅

**功能描述**
- 点击字幕后，视频跳转到该字幕开始时间并播放
- 播放到字幕结束时间时，自动暂停视频
- 确保每次点击只播放当前选中的字幕片段

**遇到的问题**
1. 原始实现依赖 `timeupdate` 事件，存在精度问题
2. 点击字幕后视频持续播放，不会在字幕结束时自动停止
3. 时间检查的容错机制不够准确

**解决方案**
```typescript
// 双重时间检查机制
// 1. 基于 timeupdate 事件的检查
if (targetEndTimeRef.current && currentTime >= targetEndTimeRef.current && !hasTriggeredPauseRef.current) {
  hasTriggeredPauseRef.current = true;
  onSubtitleEnd();
}

// 2. 基于 setInterval 的高频检查 (50ms间隔)
const checkTime = () => {
  const currentTime = videoPlayerRef.current?.getCurrentTime() || 0;
  if (targetEndTimeRef.current && currentTime >= targetEndTimeRef.current && !hasTriggeredPauseRef.current) {
    hasTriggeredPauseRef.current = true;
    onSubtitleEnd();
  }
};
```

**关键修改**
- `src/hooks/useReadingMode.ts:44-62` - 添加高频时间检查机制
- `src/hooks/useReadingMode.ts:18-31` - 优化状态管理和目标时间跟踪
- `src/App.tsx:113-124` - 优化字幕点击处理逻辑
- `src/App.tsx:147-153` - 传递 videoPlayerRef 到 useReadingMode

**技术特点**
- **高精度**: 50ms 间隔检查确保不会漏过结束时间
- **可靠性**: 双重检查机制提供冗余保障
- **性能优化**: 只在点读模式启用且有目标时间时才启动高频检查

### 5. 动态高度填充与智能自动滚动 ✅

**功能描述**
- 字幕列表容器高度动态适应，从控制按钮下方到视频播放器底部填充所有可用空间
- 高亮字幕始终保持在可视区域的居中位置，实现平滑自动滚动
- 支持边界情况的智能处理，开头和结尾字幕合理定位

**核心技术实现**

1. **动态高度计算**
```typescript
const calculateSubtitleListHeight = useCallback(() => {
  const controlsRect = subtitleControlsRef.current.getBoundingClientRect();
  const videoRect = videoPlayerRef.current.getBoundingClientRect();
  const availableHeight = videoRect.bottom - controlsRect.bottom - 20;
  const calculatedHeight = Math.max(300, Math.min(availableHeight, maxHeight));
  setSubtitleListHeight(calculatedHeight);
}, []);
```

2. **智能滚动算法**
```typescript
const isSubtitleInCenter = useCallback((subtitleId: number): boolean => {
  // 检查元素是否完全可见
  const isFullyVisible = elementRelativeTop >= 0 && elementBottom <= containerHeight;
  if (!isFullyVisible) return false;

  // 判断是否在中心区域（15%容差）
  const centerThreshold = containerHeight * 0.15;
  return Math.abs(elementCenter - containerCenter) <= centerThreshold;
}, []);
```

3. **持续跟踪机制**
- **字幕变化时**: 立即滚动到新字幕位置
- **播放过程中**: 每200ms检查位置偏移
- **后台监控**: 每500ms进行兜底检查

**边界处理策略**
- **开头字幕（前3个）**: 滚动到顶部 + 60px间距
- **结尾字幕（后3个）**: 滚动到底部合适位置，不过度滚动
- **中间字幕**: 精确居中定位

**关键修改**
- `src/App.tsx:108-141` - 智能滚动算法实现
- `src/App.tsx:179-232` - 持续跟踪机制
- `src/App.css:196-204` - 滚动容器样式优化
- `src/App.css:225-244` - 自定义滚动条样式

**性能优化**
- 3px滚动阈值提高响应精度
- 防抖机制避免过度滚动
- requestAnimationFrame确保流畅动画
- 智能检查频率平衡性能与体验

**技术特点**
- **高精度**: 15%容差的居中检测
- **可靠性**: 多层检查机制保障
- **响应式**: 完美适配不同屏幕尺寸
- **用户友好**: 平滑动画和自定义滚动条

## 技术架构

### 状态管理
```
App.tsx (Root State)
├── videoData (VideoData)
├── displaySettings (DisplaySettings)
├── hasUploadedVideo (boolean)
└── hasUploadedSubtitles (boolean)
```

### 组件层次
```
App
├── FileUploader (条件渲染)
├── VideoPlayer (条件渲染)
├── VideoControls
├── SubtitleControls
└── SubtitleDisplay
```

### 数据流
```
User Action → State Update → Component Re-render → UI Update
     ↓
[中英对照] → displaySettings.showTranslation → SubtitleDisplay → Bilingual Layout
     ↓
[点读模式] → displaySettings.readingMode → handleSubtitleClick → useReadingMode → Auto Pause
```

## 开发命令

### 启动开发服务器
```bash
npm run dev
```
服务器地址：http://localhost:3001/

### 构建生产版本
```bash
npm run build
```

### 类型检查
```bash
npm run build  # 包含 TypeScript 编译检查
```

## 调试经验

### 常见问题
1. **页面空白** - 需要通过开发服务器访问，不能直接打开 index.html
2. **热更新不生效** - 检查文件保存和控制台错误信息
3. **TypeScript 错误** - 及时修复未使用的导入和变量

### 调试技巧
- 使用浏览器开发者工具查看控制台日志
- 利用 Vite 热更新快速测试修改
- 通过 `console.log` 调试状态传递

## 项目文件结构

```
src/
├── components/           # React 组件
│   ├── VideoPlayer.tsx
│   ├── VideoControls.tsx
│   ├── SubtitleDisplay.tsx    # 核心字幕显示组件
│   ├── SubtitleControls.tsx
│   └── FileUploader.tsx
├── hooks/               # 自定义 Hooks
│   ├── useSubtitleManager.ts
│   ├── useAutoScroll.ts
│   └── useReadingMode.ts
├── utils/               # 工具函数
│   └── fileUtils.ts     # SRT 解析逻辑
├── types/               # TypeScript 类型定义
│   └── index.ts
├── data/                # 示例数据
│   └── sampleData.ts
├── App.tsx             # 主应用组件
├── App.css            # 全局样式
└── main.tsx           # 应用入口
```

## 版本记录

### v1.4.0 (2025-09-23) - 字幕点击跳转与点读模式优化
- ✅ 新增字幕点击跳转功能：正常播放下点击任意字幕自动跳转到对应时间戳
- ✅ 暂停状态优化：视频暂停时点击字幕会自动开始播放
- ✅ 点读模式高亮保持：播放结束自动暂停时，高亮效果保持在当前字幕上
- ✅ 智能状态管理：模式切换时自动清理相关状态，避免显示混乱
- ✅ 统一高亮逻辑：优化字幕高亮和自动滚动的判断机制

**核心功能增强**
1. **字幕点击跳转**:
   - 正常模式：点击字幕 → 跳转时间戳 + 自动播放
   - 点读模式：点击字幕 → 跳转时间戳 + 播放到结尾自动暂停
2. **暂停状态处理**: 解决视频暂停时点击字幕不会开始播放的问题
3. **点读模式优化**: 自动暂停后高亮不再跳转到下一段字幕
4. **状态同步**: 添加智能状态清理机制，确保模式切换的一致性

**关键代码更新**
- `src/App.tsx:96-131` - 优化 `handleSubtitleClick` 字幕点击处理逻辑
- `src/App.tsx:23` - 新增 `readingModeActiveSubtitle` 状态管理点读模式选中字幕
- `src/App.tsx:137-144` - 统一的 `getActiveSubtitle` 高亮判断函数
- `src/App.tsx:93-105` - 智能状态清理机制
- `src/App.tsx:362` - 简化字幕项高亮判断逻辑

**技术特点**
- **智能判断**: 点读模式和正常模式使用不同的高亮逻辑
- **状态保持**: 点读模式暂停后高亮效果不会意外跳转
- **自动清理**: 模式切换和正常播放时自动清理过期状态
- **用户友好**: 所有字幕项始终显示为可点击状态

### v1.3.0 (2025-09-23) - 动态布局与智能滚动优化
- ✅ 实现字幕列表动态高度填充，最大化利用可用垂直空间
- ✅ 智能自动滚动，高亮字幕始终保持在列表中心位置
- ✅ 多层检查机制确保滚动的可靠性和流畅性
- ✅ 边界情况优化处理，开头和结尾字幕合理定位
- ✅ 自定义滚动条样式，提升视觉体验
- ✅ 响应式布局优化，完美适配桌面端和移动端

**解决的关键问题**
1. **动态高度适应**: 字幕容器根据视频播放器位置动态调整高度
2. **高亮字幕跟踪**: 播放过程中高亮字幕自动滚动到中心，不会消失在边界
3. **性能优化**: 多频率检查机制平衡流畅性与性能消耗
4. **边界智能处理**: 开头和结尾字幕避免强制居中，提供更自然的滚动体验

**核心技术突破**
- 实时位置检测算法，15%容差的精确居中判断
- 持续跟踪机制：字幕变化立即响应 + 200ms定期检查 + 500ms兜底保障
- 动态高度计算，最大化利用从控制按钮到视频底部的所有可用空间
- 平滑滚动动画，3px阈值确保高精度响应

### v1.2.0 (2025-09-23) - 简化测试版本创建
- ✅ 创建简化测试应用解决环境配置问题
- ✅ 修复Next.js + Supabase配置冲突
- ✅ 恢复原始Vite + React技术栈
- ✅ 实现直接本地文件测试功能
- ✅ 保持所有核心功能：视频播放、字幕同步、中英对照、点读模式

**解决的关键问题**
1. **环境配置冲突**: Next.js项目中Supabase环境变量导致页面无法加载
2. **技术栈简化**: 从复杂的Next.js + Supabase回归到简单的Vite + React
3. **测试便捷性**: 直接使用本地视频文件，无需数据库配置

**创建的简化测试应用**
- 文件路径：`src/App.tsx` (简化版)
- 服务器：Vite开发服务器 (`npx vite`)
- 访问地址：`http://localhost:3002`
- 测试文件：`/videos/bookmark.mp4` + `/subtitles/bookmark.srt`

### v1.1.0 (2025-09-22)
- ✅ 点读模式自动暂停功能
- ✅ 双重时间检查机制确保精确暂停
- ✅ 优化字幕点击响应逻辑
- ✅ 高频时间监听（50ms间隔）

### v1.0.0 (2025-01-22)
- ✅ 视频上传与自动置顶显示
- ✅ 中英对照字幕显示
- ✅ SRT 字幕文件解析
- ✅ 响应式布局支持
- ✅ TypeScript 类型安全

## 测试记录

### 2025-09-23 测试准备
**测试环境设置**
- ✅ 上传测试文件：`bookmark.mp4` (34MB) + `bookmark.srt` (中英对照)
- ✅ 启动Vite开发服务器：`http://localhost:3002`
- ✅ 简化版应用创建完成，包含所有核心功能

**测试完成功能**
- ✅ 视频播放功能 - 正常播放本地视频文件
- ✅ 字幕显示同步 - 实时高亮当前播放字幕
- ✅ 中英对照模式切换 - 双语显示切换正常
- ✅ 点读模式自动暂停 - 点击字幕播放至结束自动暂停
- ✅ 智能自动滚动 - 高亮字幕始终保持在列表中心
- ✅ 动态高度填充 - 字幕容器最大化利用可用空间
- ✅ 响应式布局适配 - 桌面端和移动端均正常工作

**测试文件格式示例**
```srt
1
00:00:00,100 --> 00:00:05,300
right now I'm reading this didion and babits it's great
我现在正在读迪迪恩和巴比特的作品 很棒
```

---

**开发工具**: Claude Code + Vite + React + TypeScript
**最后更新**: 2025-09-23 v1.4.0

## 当前版本状态

### 运行环境
- **开发服务器**: `http://localhost:3002` (Vite)
- **技术栈**: React + TypeScript + Vite
- **测试文件**: `/videos/bookmark.mp4` + `/subtitles/bookmark.srt`

### 核心功能状态
1. **✅ 基础播放**: 视频播放、暂停、进度控制
2. **✅ 字幕同步**: 实时高亮当前字幕
3. **✅ 中英对照**: 双语显示模式切换
4. **✅ 字幕点击跳转**: 正常播放和暂停状态下点击字幕自动跳转并播放
5. **✅ 点读模式**: 字幕点击跳转 + 自动暂停 + 高亮保持
6. **✅ 智能滚动**: 高亮字幕自动居中滚动
7. **✅ 动态布局**: 容器高度自适应屏幕空间
8. **✅ 响应式设计**: 桌面端和移动端适配

### 性能特点
- **高精度滚动**: 15%容差居中检测
- **多层保障**: 立即响应 + 定期检查 + 兜底机制
- **优化渲染**: requestAnimationFrame + 防抖机制
- **流畅体验**: 3px阈值精确滚动 + 平滑动画
- **智能状态管理**: 模式切换自动清理 + 状态同步机制
- **统一高亮逻辑**: 点读模式和正常模式的高亮智能判断