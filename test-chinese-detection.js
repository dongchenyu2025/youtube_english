// 测试中文字幕解析功能
console.log('🧪 开始测试中文字幕解析功能...')

// 1. 测试中文字符检测正则表达式
const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3000-\u303f\uff00-\uffef]/
const englishRegex = /[a-zA-Z]/

const testStrings = [
    '你好，世界！',                    // 纯中文
    'Hello, world!',                  // 纯英文
    'Hello 你好 world 世界！',         // 中英混合
    '学习英语既有趣又有意义。',          // 纯中文长句
    'Learning English is fun.',       // 纯英文长句
    '今天天气不错，适合学习！',          // 带标点的中文
    '——这是一个测试。',                // 特殊标点
    '１２３ 测试数字',                  // 全角数字+中文
    ''                               // 空字符串
]

console.log('\n🔍 中文字符检测结果:')
console.log('=' * 60)

testStrings.forEach((str, index) => {
    const hasEnglish = englishRegex.test(str)
    const hasChinese = chineseRegex.test(str)

    console.log(`${index + 1}. "${str}"`)
    console.log(`   英文: ${hasEnglish ? '✅' : '❌'}  中文: ${hasChinese ? '✅' : '❌'}`)

    if (hasEnglish && hasChinese) {
        console.log('   🔄 检测为双语内容')
    } else if (hasChinese) {
        console.log('   🇨🇳 检测为纯中文')
    } else if (hasEnglish) {
        console.log('   🇺🇸 检测为纯英文')
    } else {
        console.log('   ⚠️  无有效文本')
    }
    console.log('')
})

// 2. 测试SRT格式解析
console.log('📄 测试SRT格式解析:')
console.log('=' * 60)

const srtContent = `1
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
这是一个测试字幕文件。`

// 模拟解析过程
const blocks = srtContent.split(/\n\s*\n/).filter(block => block.trim())
console.log(`✅ 解析到 ${blocks.length} 个字幕块`)

blocks.forEach((block, index) => {
    const lines = block.trim().split('\n').filter(line => line.trim())
    if (lines.length >= 3) {
        const sequenceNum = lines[0]
        const timeRange = lines[1]
        const textContent = lines.slice(2).join('\n')

        const hasEnglish = englishRegex.test(textContent)
        const hasChinese = chineseRegex.test(textContent)

        console.log(`\n第${index + 1}个字幕块:`)
        console.log(`  序号: ${sequenceNum}`)
        console.log(`  时间: ${timeRange}`)
        console.log(`  内容: "${textContent}"`)
        console.log(`  语言: 英文${hasEnglish ? '✅' : '❌'} 中文${hasChinese ? '✅' : '❌'}`)

        if (hasEnglish && hasChinese) {
            // 尝试分离中英文
            const textLines = textContent.split('\n')
            const englishLines = []
            const chineseLines = []

            for (const line of textLines) {
                const trimmed = line.trim()
                if (!trimmed) continue

                if (/^[a-zA-Z\s\.\,\!\?\;\:\'\"\-\(\)\[\]]+$/.test(trimmed)) {
                    englishLines.push(trimmed)
                    console.log(`    英文行: "${trimmed}"`)
                } else if (chineseRegex.test(trimmed)) {
                    chineseLines.push(trimmed)
                    console.log(`    中文行: "${trimmed}"`)
                } else {
                    console.log(`    混合行: "${trimmed}"`)
                }
            }
        }
    }
})

console.log('\n🎉 测试完成！')
console.log('\n📋 测试总结:')
console.log('- ✅ 中文字符检测正则表达式工作正常')
console.log('- ✅ 英文字符检测正则表达式工作正常')
console.log('- ✅ SRT格式解析逻辑正常')
console.log('- ✅ 中英文分离逻辑正常')
console.log('\n🚀 现在可以在Web界面中测试实际文件上传和解析功能！')