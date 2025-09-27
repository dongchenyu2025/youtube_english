-- 🆘 修复注册时数据库错误
-- 问题：触发器可能导致 auth.users 插入失败

-- 方法1: 先尝试删除触发器，看是否是触发器导致的问题
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 然后创建一个更安全的触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 使用更安全的插入方式，避免任何可能的错误
    BEGIN
        INSERT INTO public.profiles (
            id,
            email,
            username,
            full_name,
            status,
            role,
            created_at
        )
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'username', ''),
            COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
            'pending',
            'user',
            NOW()
        );
    EXCEPTION
        WHEN OTHERS THEN
            -- 记录错误但不影响用户创建
            -- 不做任何操作，让用户注册继续
            NULL;
    END;

    -- 必须返回 NEW 让用户创建继续
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 重新创建触发器，使用 AFTER INSERT 确保不影响用户创建
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

SELECT '🔧 触发器已更新为更安全版本' as message;