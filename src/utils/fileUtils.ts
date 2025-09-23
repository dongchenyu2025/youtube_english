// Legacy Subtitle type for SRT parsing (different from database type)
interface LegacySubtitle {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
  translation?: string;
}

export const parseSRT = (srtContent: string): LegacySubtitle[] => {
  const subtitles: LegacySubtitle[] = [];
  const blocks = srtContent.trim().split(/\n\s*\n/);

  blocks.forEach((block, index) => {
    const lines = block.trim().split('\n');
    if (lines.length < 3) return;

    // Parse time format: 00:00:01,500 --> 00:00:04,200
    const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    if (!timeMatch) return;

    const startTime = parseTimeString(timeMatch[1]);
    const endTime = parseTimeString(timeMatch[2]);

    // Join all text lines after the timestamp
    const textLines = lines.slice(2);

    // Separate English and Chinese text
    let englishText = '';
    let chineseText = '';

    // Method 1: If lines contain both English and Chinese mixed
    const allText = textLines.join('\n');

    // Method 2: Try to separate by detecting Chinese characters
    const englishLines: string[] = [];
    const chineseLines: string[] = [];

    textLines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Check if line contains Chinese characters
      if (/[\u4e00-\u9fff]/.test(trimmedLine)) {
        chineseLines.push(trimmedLine);
      } else {
        englishLines.push(trimmedLine);
      }
    });

    // If we found both English and Chinese lines, use them separately
    if (englishLines.length > 0 && chineseLines.length > 0) {
      englishText = englishLines.join(' ').trim();
      chineseText = chineseLines.join(' ').trim();
    } else if (englishLines.length > 0) {
      // Only English found
      englishText = englishLines.join(' ').trim();
      chineseText = '';
    } else if (chineseLines.length > 0) {
      // Only Chinese found, treat as translation
      englishText = '';
      chineseText = chineseLines.join(' ').trim();
    } else {
      // Fallback: use all text as English
      englishText = allText.trim();
      chineseText = '';
    }

    // If no clear separation found, try different patterns
    if (!englishText && !chineseText && allText.trim()) {
      englishText = allText.trim();
    }

    subtitles.push({
      id: index + 1,
      startTime,
      endTime,
      text: englishText || allText.trim(),
      translation: chineseText || undefined
    });
  });

  return subtitles;
};

const parseTimeString = (timeStr: string): number => {
  // Convert "00:00:01,500" to seconds
  const [time, milliseconds] = timeStr.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);

  return hours * 3600 + minutes * 60 + seconds + Number(milliseconds) / 1000;
};

export const loadSubtitleFile = async (file: File): Promise<LegacySubtitle[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const subtitles = parseSRT(content);
        resolve(subtitles);
      } catch (error) {
        reject(new Error('Failed to parse subtitle file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read subtitle file'));
    };

    reader.readAsText(file, 'utf-8');
  });
};

export const loadVideoFile = (file: File): string => {
  return URL.createObjectURL(file);
};