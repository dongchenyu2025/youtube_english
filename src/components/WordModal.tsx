'use client'

import { useState } from 'react'
import { X, Heart, HeartOff, Volume2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface WordModalProps {
  word: string | null
  isOpen: boolean
  onClose: () => void
}

export function WordModal({ word, isOpen, onClose }: WordModalProps) {
  const [isCollected, setIsCollected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [definition, setDefinition] = useState<string>('')

  // Supabase client is imported directly

  // Mock word definition - In production, you'd call a dictionary API
  const mockDefinitions: Record<string, string> = {
    'technology': 'n. 技术，科技',
    'artificial': 'adj. 人工的，人造的',
    'intelligence': 'n. 智力，智能',
    'responsibility': 'n. 责任，职责',
    'unprecedented': 'adj. 史无前例的，前所未有的',
    'development': 'n. 发展，开发',
    'innovation': 'n. 创新，革新',
    'machine': 'n. 机器，机械',
    'learning': 'n. 学习，学问',
    'transforming': 'v. 转换，改变',
    'industry': 'n. 工业，行业',
    'humanity': 'n. 人类，人性',
    'ethical': 'adj. 道德的，伦理的',
    'deployment': 'n. 部署，展开'
  }

  const handleCollectWord = async () => {
    if (!word) return

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('请先登录后再收藏单词')
        setLoading(false)
        return
      }

      if (isCollected) {
        // Remove from collection
        const { error } = await supabase
          .from('user_collections')
          .delete()
          .eq('user_id', user.id)
          .eq('word', word)

        if (error) throw error

        setIsCollected(false)
      } else {
        // Add to collection
        const { error } = await supabase
          .from('user_collections')
          .insert({
            user_id: user.id,
            word: word
          })

        if (error) throw error

        setIsCollected(true)
      }
    } catch (error) {
      console.error('Error updating collection:', error)
      alert('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const playPronunciation = () => {
    // Use Web Speech API for pronunciation
    if ('speechSynthesis' in window && word) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  if (!isOpen || !word) return null

  const wordDefinition = mockDefinitions[word.toLowerCase()] || '词典中未找到该单词'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        {/* Word header */}
        <div className="mb-4">
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{word}</h2>
            <button
              onClick={playPronunciation}
              className="text-blue-600 hover:text-blue-700 transition-colors"
              title="播放发音"
            >
              <Volume2 size={20} />
            </button>
          </div>

          {/* Phonetic */}
          <p className="text-gray-600 text-sm font-mono">
            /{word}/
          </p>
        </div>

        {/* Definition */}
        <div className="mb-6">
          <p className="text-gray-800">{wordDefinition}</p>
        </div>

        {/* Example sentence */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">例句</h3>
          <p className="text-gray-700 text-sm italic">
            This is an example sentence with the word "{word}".
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleCollectWord}
            disabled={loading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isCollected
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isCollected ? <HeartOff size={16} /> : <Heart size={16} />}
            <span>{loading ? '处理中...' : (isCollected ? '取消收藏' : '收藏单词')}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}