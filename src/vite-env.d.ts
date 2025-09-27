/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_CLOUDFLARE_ACCOUNT_ID: string
  readonly VITE_CLOUDFLARE_STREAM_TOKEN: string
  readonly VITE_APP_ENV: 'development' | 'production' | 'staging'
  readonly NODE_ENV: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 声明全局 JSX 支持 <stream> 标签
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stream': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          controls?: boolean;
          autoplay?: boolean;
          muted?: boolean;
          poster?: string;
          preload?: 'none' | 'metadata' | 'auto';
          width?: number | string;
          height?: number | string;
        },
        HTMLElement
      >;
    }
  }
}