export interface SubtitleEntry {
  startTime: number
  endTime: number
  english: string
  chinese?: string
}

export interface ParseResult {
  success: boolean
  data: SubtitleEntry[]
  error?: string
  totalCount: number
}

export class SRTParser {
  static parseTimeToSeconds(timeStr: string): number {
    const match = timeStr.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/)
    if (!match) {
      throw new Error(`Invalid time format: ${timeStr}`)
    }

    const [, hours, minutes, seconds, milliseconds] = match
    return (
      parseInt(hours) * 3600 +
      parseInt(minutes) * 60 +
      parseInt(seconds) +
      parseInt(milliseconds) / 1000
    )
  }

  static formatSecondsToTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms
      .toString()
      .padStart(3, '0')}`
  }

  static detectEncoding(buffer: ArrayBuffer): 'utf8' | 'gbk' {
    const bytes = new Uint8Array(buffer)

    // Check for UTF-8 BOM
    if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
      return 'utf8'
    }

    // Enhanced encoding detection
    // Check for UTF-8 valid sequences
    let utf8Valid = true
    let utf8Score = 0
    let gbkScore = 0

    for (let i = 0; i < Math.min(bytes.length, 2000); i++) {
      const byte = bytes[i]

      // ASCII characters (0-127) are valid in both UTF-8 and GBK
      if (byte <= 127) {
        continue
      }

      // UTF-8 multi-byte sequence validation
      if ((byte & 0xe0) === 0xc0) { // 110xxxxx - 2 byte sequence
        if (i + 1 < bytes.length && (bytes[i + 1] & 0xc0) === 0x80) {
          utf8Score += 2
          i += 1
        } else {
          utf8Valid = false
        }
      } else if ((byte & 0xf0) === 0xe0) { // 1110xxxx - 3 byte sequence
        if (i + 2 < bytes.length &&
            (bytes[i + 1] & 0xc0) === 0x80 &&
            (bytes[i + 2] & 0xc0) === 0x80) {
          utf8Score += 3
          i += 2
        } else {
          utf8Valid = false
        }
      } else if ((byte & 0xf8) === 0xf0) { // 11110xxx - 4 byte sequence
        if (i + 3 < bytes.length &&
            (bytes[i + 1] & 0xc0) === 0x80 &&
            (bytes[i + 2] & 0xc0) === 0x80 &&
            (bytes[i + 3] & 0xc0) === 0x80) {
          utf8Score += 4
          i += 3
        } else {
          utf8Valid = false
        }
      } else {
        // Invalid UTF-8 start byte, might be GBK
        utf8Valid = false
        // GBK first byte range: 0x81-0xfe
        if (byte >= 0x81 && byte <= 0xfe && i + 1 < bytes.length) {
          const nextByte = bytes[i + 1]
          // GBK second byte range: 0x40-0x7e, 0x80-0xfe
          if ((nextByte >= 0x40 && nextByte <= 0x7e) ||
              (nextByte >= 0x80 && nextByte <= 0xfe)) {
            gbkScore += 2
            i += 1
          }
        }
      }
    }

    // Decision logic
    if (utf8Valid && utf8Score > 0) {
      return 'utf8'
    }
    if (gbkScore > utf8Score) {
      return 'gbk'
    }

    // Default to UTF-8 if uncertain
    return 'utf8'
  }

  static parseSRT(content: string, timeOffset: number = 0): ParseResult {
    try {
      // Clean content: normalize line endings and remove BOM
      const cleanContent = content
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/^\ufeff/, '') // Remove BOM
        .trim()

      if (!cleanContent) {
        return {
          success: false,
          error: 'SRT文件内容为空',
          data: [],
          totalCount: 0
        }
      }

      // Split into subtitle blocks
      const blocks = cleanContent.split(/\n\s*\n/).filter(block => block.trim())

      if (blocks.length === 0) {
        return {
          success: false,
          error: 'SRT文件格式无效：未找到字幕块',
          data: [],
          totalCount: 0
        }
      }

      const subtitles: SubtitleEntry[] = []
      let errors: string[] = []

      for (let i = 0; i < blocks.length; i++) {
        try {
          const lines = blocks[i].trim().split('\n').filter(line => line.trim())

          if (lines.length < 3) {
            errors.push(`第${i + 1}个字幕块格式不完整`)
            continue
          }

          // Parse sequence number (optional validation)
          const sequenceNum = parseInt(lines[0].trim())
          if (isNaN(sequenceNum)) {
            errors.push(`第${i + 1}个字幕块序号无效: ${lines[0]}`)
            continue
          }

          // Parse time range
          const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/)
          if (!timeMatch) {
            errors.push(`第${i + 1}个字幕块时间格式无效: ${lines[1]}`)
            continue
          }

          const [, startTimeStr, endTimeStr] = timeMatch
          let startTime = this.parseTimeToSeconds(startTimeStr) + timeOffset
          let endTime = this.parseTimeToSeconds(endTimeStr) + timeOffset

          // Validate time range
          if (startTime >= endTime) {
            errors.push(`第${i + 1}个字幕块时间范围无效：开始时间不能大于或等于结束时间`)
            continue
          }

          if (startTime < 0 || endTime < 0) {
            errors.push(`第${i + 1}个字幕块时间不能为负数`)
            continue
          }

          // Parse subtitle text (lines 2 onwards)
          const textLines = lines.slice(2).join('\n').trim()
          if (!textLines) {
            errors.push(`第${i + 1}个字幕块文本内容为空`)
            continue
          }

          // Detect if content has both English and Chinese
          // Enhanced Chinese character detection
          const hasEnglish = /[a-zA-Z]/.test(textLines)
          const hasChinese = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3000-\u303f\uff00-\uffef]/.test(textLines)

          let english = textLines
          let chinese: string | undefined

          // If both languages detected, try to separate them
          if (hasEnglish && hasChinese) {
            const lines = textLines.split('\n')
            const englishLines: string[] = []
            const chineseLines: string[] = []

            for (const line of lines) {
              const trimmedLine = line.trim()
              if (!trimmedLine) continue

              if (/^[a-zA-Z\s\.\,\!\?\;\:\'\"\-\(\)\[\]]+$/.test(trimmedLine)) {
                englishLines.push(trimmedLine)
              } else if (/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3000-\u303f\uff00-\uffef]/.test(trimmedLine)) {
                chineseLines.push(trimmedLine)
              } else {
                // Mixed line, add to both
                englishLines.push(trimmedLine)
                chineseLines.push(trimmedLine)
              }
            }

            if (englishLines.length > 0) {
              english = englishLines.join(' ')
            }
            if (chineseLines.length > 0) {
              chinese = chineseLines.join('')
            }
          } else if (hasChinese && !hasEnglish) {
            // Pure Chinese content
            chinese = textLines
            english = textLines // Keep as fallback
          }

          subtitles.push({
            startTime,
            endTime,
            english: english.trim(),
            chinese: chinese?.trim()
          })

        } catch (blockError) {
          errors.push(`第${i + 1}个字幕块解析错误: ${blockError instanceof Error ? blockError.message : String(blockError)}`)
        }
      }

      // Sort by start time
      subtitles.sort((a, b) => a.startTime - b.startTime)

      // Validate for overlapping subtitles
      for (let i = 0; i < subtitles.length - 1; i++) {
        if (subtitles[i].endTime > subtitles[i + 1].startTime) {
          errors.push(`第${i + 1}和第${i + 2}个字幕存在时间重叠`)
        }
      }

      return {
        success: true,
        data: subtitles,
        error: errors.length > 0 ? `解析完成，但有${errors.length}个警告:\n${errors.join('\n')}` : undefined,
        totalCount: subtitles.length
      }

    } catch (error) {
      return {
        success: false,
        error: `SRT解析失败: ${error instanceof Error ? error.message : String(error)}`,
        data: [],
        totalCount: 0
      }
    }
  }

  static async parseFile(file: File, timeOffset: number = 0): Promise<ParseResult> {
    try {
      const buffer = await file.arrayBuffer()
      const detectedEncoding = this.detectEncoding(buffer)

      let content: string
      let actualEncoding = detectedEncoding

      // Try multiple encoding strategies
      if (detectedEncoding === 'gbk') {
        // Strategy 1: Try GBK with fallbacks
        try {
          content = new TextDecoder('gbk').decode(buffer)
          // Validate the decoded content has reasonable Chinese characters
          if (!/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(content)) {
            throw new Error('GBK decoding produced no Chinese characters')
          }
        } catch {
          try {
            // Try GB18030 (superset of GBK)
            content = new TextDecoder('gb18030').decode(buffer)
            actualEncoding = 'utf8' // Mark as successful alternative
          } catch {
            // Final fallback to UTF-8 with replacement
            content = new TextDecoder('utf-8', { fatal: false }).decode(buffer)
            actualEncoding = 'utf8'
          }
        }
      } else {
        // Strategy 2: UTF-8 with error handling
        try {
          content = new TextDecoder('utf-8', { fatal: true }).decode(buffer)
        } catch {
          // Fallback with replacement characters
          content = new TextDecoder('utf-8', { fatal: false }).decode(buffer)
        }
      }

      // Additional content validation and cleanup
      if (!content || content.trim().length === 0) {
        return {
          success: false,
          error: '文件内容为空或编码解析失败',
          data: [],
          totalCount: 0
        }
      }

      // Log encoding detection result for debugging
      console.log(`SRT文件编码检测: ${detectedEncoding}, 实际使用: ${actualEncoding}, 内容长度: ${content.length}`)

      return this.parseSRT(content, timeOffset)
    } catch (error) {
      return {
        success: false,
        error: `文件读取失败: ${error instanceof Error ? error.message : String(error)}`,
        data: [],
        totalCount: 0
      }
    }
  }

  static validateSubtitles(subtitles: SubtitleEntry[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (subtitles.length === 0) {
      errors.push('字幕列表为空')
      return { isValid: false, errors }
    }

    // Check each subtitle entry
    for (let i = 0; i < subtitles.length; i++) {
      const subtitle = subtitles[i]

      if (subtitle.startTime < 0) {
        errors.push(`第${i + 1}个字幕开始时间不能为负数`)
      }

      if (subtitle.endTime <= subtitle.startTime) {
        errors.push(`第${i + 1}个字幕结束时间必须大于开始时间`)
      }

      if (!subtitle.english?.trim()) {
        errors.push(`第${i + 1}个字幕英文内容不能为空`)
      }

      // Check for overlaps with next subtitle
      if (i < subtitles.length - 1) {
        const nextSubtitle = subtitles[i + 1]
        if (subtitle.endTime > nextSubtitle.startTime) {
          errors.push(`第${i + 1}和第${i + 2}个字幕时间重叠`)
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

export default SRTParser