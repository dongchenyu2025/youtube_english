import React, { useRef } from 'react';
import { Subtitle } from '../types';
import { loadSubtitleFile, loadVideoFile } from '../utils/fileUtils';

interface FileUploaderProps {
  onVideoLoad: (videoUrl: string, title: string) => void;
  onSubtitleLoad: (subtitles: Subtitle[]) => void;
  onError: (message: string) => void;
  hasUploadedVideo?: boolean;
  hasUploadedSubtitles?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onVideoLoad,
  onSubtitleLoad,
  onError,
  hasUploadedVideo = false,
  hasUploadedSubtitles = false
}) => {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate video file type
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!validVideoTypes.includes(file.type)) {
      onError('请选择有效的视频文件 (MP4, WebM, OGG)');
      return;
    }

    try {
      const videoUrl = loadVideoFile(file);
      onVideoLoad(videoUrl, file.name);
    } catch (error) {
      onError('视频文件加载失败');
    }
  };

  const handleSubtitleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate subtitle file type
    if (!file.name.toLowerCase().endsWith('.srt')) {
      onError('请选择SRT格式的字幕文件');
      return;
    }

    try {
      const subtitles = await loadSubtitleFile(file);
      if (subtitles.length === 0) {
        onError('字幕文件为空或格式不正确');
        return;
      }
      onSubtitleLoad(subtitles);
    } catch (error) {
      onError('字幕文件解析失败，请检查文件格式');
    }
  };

  return (
    <div className="file-uploader">
      <div className="upload-section">
        <h3>上传文件</h3>

        {!hasUploadedVideo && (
          <div className="upload-group">
            <label htmlFor="video-upload" className="upload-label">
              📹 选择视频文件
            </label>
            <input
              id="video-upload"
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg"
              onChange={handleVideoUpload}
              style={{ display: 'none' }}
            />
            <button
              className="upload-button"
              onClick={() => videoInputRef.current?.click()}
            >
              选择视频 (MP4, WebM, OGG)
            </button>
          </div>
        )}

        {!hasUploadedSubtitles && (
          <div className="upload-group">
            <label htmlFor="subtitle-upload" className="upload-label">
              📝 选择字幕文件
            </label>
            <input
              id="subtitle-upload"
              ref={subtitleInputRef}
              type="file"
              accept=".srt"
              onChange={handleSubtitleUpload}
              style={{ display: 'none' }}
            />
            <button
              className="upload-button"
              onClick={() => subtitleInputRef.current?.click()}
            >
              选择字幕 (SRT)
            </button>
          </div>
        )}

        {(!hasUploadedVideo || !hasUploadedSubtitles) && (
          <>
            <div className="file-info">
              <h4>文件要求：</h4>
              <ul>
                <li>视频：MP4格式推荐，最大支持2GB</li>
                <li>字幕：SRT格式，UTF-8编码</li>
                <li>文件存放：可直接拖拽到此处或点击按钮选择</li>
              </ul>
            </div>

            <div className="demo-section">
              <h4>快速测试：</h4>
              <button
                className="demo-button"
                onClick={() => {
                  fetch('/subtitles/sample-bilingual.srt')
                    .then(response => response.text())
                    .then(content => {
                      const blob = new Blob([content], { type: 'text/plain' });
                      const file = new File([blob], 'sample-bilingual.srt', { type: 'text/plain' });
                      return loadSubtitleFile(file);
                    })
                    .then(subtitles => {
                      onSubtitleLoad(subtitles);
                    })
                    .catch(() => {
                      onError('无法加载示例字幕文件');
                    });
                }}
              >
                📝 载入示例中英字幕
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUploader;