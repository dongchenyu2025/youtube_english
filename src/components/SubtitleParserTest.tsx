import React, { useState } from 'react'
import { SRTParser } from '../lib/srtParser'

// 完整的字幕解析测试组件
const SubtitleParserTest: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runCompleteTest = async () => {
    setIsLoading(true)

    try {
      // 测试用的SRT内容（包含中英双语）
      const testSRTContent = `1
00:00:01,000 --> 00:00:03,500
Hello everyone, welcome!
大家好，欢迎！

2
00:00:04,000 --> 00:00:06,500
Today we will learn about artificial intelligence.
今天我们将学习人工智能。

3
00:00:07,000 --> 00:00:09,000
Machine learning is a subset of AI.
机器学习是人工智能的一个子集。

4
00:00:09,500 --> 00:00:12,000
It enables computers to learn without being explicitly programmed.
它使计算机能够在没有明确编程的情况下学习。

5
00:00:12,500 --> 00:00:15,000
Deep learning uses neural networks with multiple layers.
深度学习使用具有多个层次的神经网络。`

      console.log('🧪 开始完整字幕解析测试...')

      // 调用解析器
      const result = SRTParser.parseSRT(testSRTContent)

      console.log('📊 解析结果:', result)

      // 设置测试结果到状态
      setTestResult({
        success: result.success,
        totalCount: result.totalCount,
        errors: result.error,
        samples: result.data.slice(0, 3), // 只显示前3条作为样例
        statistics: {
          totalSubtitles: result.data.length,
          billingualCount: result.data.filter(s => s.english && s.chinese).length,
          englishOnlyCount: result.data.filter(s => s.english && !s.chinese).length,
          chineseOnlyCount: result.data.filter(s => !s.english && s.chinese).length
        }
      })

    } catch (error) {
      console.error('❌ 测试失败:', error)
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }

    setIsLoading(false)
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🧪 中文字幕解析测试页面</h1>

      <button
        onClick={runCompleteTest}
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? '⏳ 测试中...' : '🚀 运行完整测试'}
      </button>

      {testResult && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <h2>📋 测试结果</h2>

          <div style={{ marginBottom: '15px' }}>
            <strong>解析状态:</strong> {testResult.success ? '✅ 成功' : '❌ 失败'}
          </div>

          {testResult.success && (
            <>
              <div style={{ marginBottom: '15px' }}>
                <strong>字幕统计:</strong>
                <ul>
                  <li>总计: {testResult.statistics?.totalSubtitles || 0} 条</li>
                  <li>双语: {testResult.statistics?.billingualCount || 0} 条</li>
                  <li>仅英文: {testResult.statistics?.englishOnlyCount || 0} 条</li>
                  <li>仅中文: {testResult.statistics?.chineseOnlyCount || 0} 条</li>
                </ul>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <strong>样例预览:</strong>
                {testResult.samples?.map((subtitle: any, index: number) => (
                  <div key={index} style={{
                    margin: '10px 0',
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px'
                  }}>
                    <div><strong>第{index + 1}条 ({subtitle.startTime}s → {subtitle.endTime}s)</strong></div>
                    <div>🇺🇸 英文: "{subtitle.english}"</div>
                    <div>🇨🇳 中文: "{subtitle.chinese || '无'}"</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {testResult.errors && (
            <div style={{ color: 'orange', marginBottom: '15px' }}>
              <strong>警告信息:</strong> {testResult.errors}
            </div>
          )}

          {testResult.error && (
            <div style={{ color: 'red', marginBottom: '15px' }}>
              <strong>错误信息:</strong> {testResult.error}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <p>📝 <strong>测试说明:</strong></p>
        <ul>
          <li>此测试验证SRT解析器是否能正确处理中英双语字幕</li>
          <li>测试内容包括5条双语字幕，每条都有对应的中英文</li>
          <li>验证时间码解析、文本分离和字符编码处理</li>
          <li>如果显示"✅ 成功"和正确的统计数据，说明修复生效</li>
        </ul>
      </div>
    </div>
  )
}

export default SubtitleParserTest