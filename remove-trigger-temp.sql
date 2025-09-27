-- 🚨 临时解决方案：完全禁用触发器
-- 如果触发器是问题根源，我们先让注册正常工作

-- 完全删除触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

SELECT '⚠️ 已删除所有触发器，现在注册应该不会报错' as message;
SELECT '📝 用户需要手动在管理后台创建 profiles 记录' as note;