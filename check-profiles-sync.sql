-- 继续诊断：检查 profiles 表数据
-- 请在 Supabase SQL Editor 中执行

-- 1. 检查 auth.users 和 profiles 的完整同步状态
SELECT
  '🔍 Auth用户和Profiles同步检查' as check_type,
  au.id as auth_user_id,
  au.email as auth_email,
  au.email_confirmed_at,
  au.confirmed_at,
  p.id as profile_id,
  p.email as profile_email,
  p.status as profile_status,
  p.role as profile_role,
  p.created_at as profile_created_at,
  p.approved_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email = 'dongchenyu2018@163.com';

-- 2. 检查 profiles 表中是否存在该用户
SELECT
  '📧 Profiles表记录检查' as check_type,
  id,
  email,
  status,
  role,
  created_at,
  approved_at,
  approved_by
FROM profiles
WHERE email = 'dongchenyu2018@163.com';