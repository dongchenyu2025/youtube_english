-- 深度诊断用户登录问题
-- 请在 Supabase SQL Editor 中执行

-- 1. 验证 ID 修复是否成功
SELECT
  '🔍 ID修复验证' as check_type,
  au.id as auth_user_id,
  au.email as auth_email,
  p.id as profile_id,
  p.email as profile_email,
  p.status as profile_status,
  CASE WHEN au.id = p.id THEN '✅ ID匹配' ELSE '❌ ID不匹配' END as id_status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email = 'dongchenyu2018@163.com';

-- 2. 检查用户的详细认证状态
SELECT
  '🔐 认证状态详情' as check_type,
  id,
  email,
  phone,
  email_confirmed_at,
  phone_confirmed_at,
  confirmation_sent_at,
  confirmed_at,
  recovery_sent_at,
  email_change_sent_at,
  new_email,
  banned_until,
  is_sso_user,
  deleted_at,
  is_anonymous,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'dongchenyu2018@163.com';

-- 3. 检查是否有密码相关问题
SELECT
  '🔑 密码状态检查' as check_type,
  id,
  email,
  encrypted_password IS NOT NULL as has_password,
  LENGTH(encrypted_password) as password_length,
  email_confirmed_at IS NOT NULL as email_confirmed,
  confirmed_at IS NOT NULL as account_confirmed
FROM auth.users
WHERE email = 'dongchenyu2018@163.com';