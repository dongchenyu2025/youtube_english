import { AuthForm } from '@/components/AuthForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            创建新账户
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            或者{' '}
            <a
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              登录已有账户
            </a>
          </p>
        </div>
        <AuthForm type="register" />
      </div>
    </div>
  )
}

export const metadata = {
  title: '注册 - 视频跟练英语学习平台',
  description: '创建新账户开始学习英语',
}