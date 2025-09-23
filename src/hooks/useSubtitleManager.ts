import { useMemo } from 'react';
import { Subtitle } from '../types';

export const useSubtitleManager = (subtitles: Subtitle[], currentTime: number) => {
  const currentSubtitle = useMemo(() => {
    return subtitles.find(
      subtitle => currentTime >= subtitle.start_time && currentTime < subtitle.end_time
    ) || null;
  }, [subtitles, currentTime]);

  const getCurrentSubtitleId = () => {
    return currentSubtitle?.id || null;
  };

  const getSubtitleByTime = (time: number) => {
    return subtitles.find(
      subtitle => time >= subtitle.start_time && time < subtitle.end_time
    ) || null;
  };

  const getSubtitleById = (id: number) => {
    return subtitles.find(subtitle => subtitle.id === id) || null;
  };

  const getNextSubtitle = () => {
    if (!currentSubtitle) return subtitles[0] || null;

    const currentIndex = subtitles.findIndex(s => s.id === currentSubtitle.id);
    return currentIndex < subtitles.length - 1 ? subtitles[currentIndex + 1] : null;
  };

  const getPreviousSubtitle = () => {
    if (!currentSubtitle) return null;

    const currentIndex = subtitles.findIndex(s => s.id === currentSubtitle.id);
    return currentIndex > 0 ? subtitles[currentIndex - 1] : null;
  };

  const isSubtitleActive = (subtitleId: number) => {
    return currentSubtitle?.id === subtitleId;
  };

  return {
    currentSubtitle,
    getCurrentSubtitleId,
    getSubtitleByTime,
    getSubtitleById,
    getNextSubtitle,
    getPreviousSubtitle,
    isSubtitleActive
  };
};