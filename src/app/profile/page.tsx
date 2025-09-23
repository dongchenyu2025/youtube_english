import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { getUserCollections } from '@/lib/api'
import { UserProfile } from '@/components/UserProfile'

export default async function ProfilePage() {
  const supabase = createServerSupabase()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  const collections = await getUserCollections(user.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <UserProfile user={user} collections={collections} />
    </div>
  )
}

export const metadata = {
  title: '个人中心 - 视频跟练英语学习平台',
  description: '查看您的学习进度和收藏的单词',
}