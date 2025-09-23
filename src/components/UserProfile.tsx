'use client'

import { useState } from 'react'
import { User, Trash2, Calendar, BookOpen, Heart } from 'lucide-react'
import { UserCollection } from '@/types'
import { supabase } from '@/lib/supabase'

interface UserProfileProps {
  user: any
  collections: UserCollection[]
}

export function UserProfile({ user, collections: initialCollections }: UserProfileProps) {
  const [collections, setCollections] = useState(initialCollections)
  const [loading, setLoading] = useState<string | null>(null)

  // Supabase client is imported directly

  const handleDeleteWord = async (word: string) => {
    setLoading(word)

    try {
      const response = await fetch(`/api/collections?word=${encodeURIComponent(word)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete word')
      }

      setCollections(prev => prev.filter(collection => collection.word !== word))
    } catch (error) {
      console.error('Error deleting word:', error)
      alert('删除失败，请重试')
    } finally {
      setLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* User Info */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">个人中心</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">注册时间</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(user.created_at)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Heart className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">收藏单词</p>
                <p className="font-semibold text-gray-900">
                  {collections.length} 个
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">学习进度</p>
                <p className="font-semibold text-gray-900">初级</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Word Collections */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">我的生词本</h2>
            <span className="text-sm text-gray-500">
              共 {collections.length} 个单词
            </span>
          </div>
        </div>

        <div className="p-6">
          {collections.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">还没有收藏任何单词</p>
              <p className="text-sm text-gray-400 mt-2">
                在观看视频时点击单词即可收藏
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {collection.word}
                      </h3>
                      <p className="text-xs text-gray-500">
                        收藏于 {formatDate(collection.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteWord(collection.word)}
                      disabled={loading === collection.word}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="删除单词"
                    >
                      {loading === collection.word ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}