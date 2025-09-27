import { SRTParser } from '../src/lib/srtParser.js'

// 创建测试内容
const testContent = `1
00:00:01,000 --> 00:00:03,500
Hello, world!
你好，世界！

2
00:00:04,000 --> 00:00:06,500
Welcome to our English learning platform.
欢迎来到我们的英语学习平台。

3
00:00:07,000 --> 00:00:10,000
This is a test subtitle file.
这是一个测试字幕文件。

4
00:00:10,500 --> 00:00:13,000
How are you today?
你今天怎么样？

5
00:00:13,500 --> 00:00:16,000
Learning English is fun and rewarding.
学习英语既有趣又有意义。`

console.log('🧪 开始测试中文字幕解析...')
console.log('=' * 50)

try {
  // 测试解析功能
  const result = SRTParser.parseSRT(testContent)

  console.log('✅ 解析结果:')
  console.log(`- 成功: ${result.success}`)
  console.log(`- 字幕数量: ${result.totalCount}`)

  if (result.error) {
    console.log(`- 警告: ${result.error}`)
  }

  console.log('\n📝 字幕内容预览:')
  result.data.slice(0, 3).forEach((subtitle, index) => {
    console.log(`\n第${index + 1}条字幕:`)
    console.log(`- 时间: ${subtitle.startTime}s → ${subtitle.endTime}s`)
    console.log(`- 英文: "${subtitle.english}"`)
    console.log(`- 中文: "${subtitle.chinese || '无'}"`)
  })

  // 测试中文检测
  console.log('\n🔍 中文字符检测测试:')
  const testStrings = [
    '你好，世界！',
    'Hello, world!',
    'Hello 你好 world 世界',
    '学习英语既有趣又有意义。',
    'Learning English is fun.'
  ]

  testStrings.forEach(str => {
    const hasEnglish = /[a-zA-Z]/.test(str)
    const hasChinese = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3000-\u303f\uff00-\uffef]/.test(str)
    console.log(`"${str}" → 英文:${hasEnglish}, 中文:${hasChinese}`)
  })

} catch (error) {
  console.error('❌ 测试失败:', error)
}

console.log('\n🏁 测试完成')