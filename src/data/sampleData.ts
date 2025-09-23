import { VideoWithSubtitles } from '../types';

export const sampleVideoData: VideoWithSubtitles = {
  id: 'sample-vlog-001',
  title: 'Daily Vlog: A Walk in Central Park',
  description: 'A beautiful walk through Central Park on a gorgeous fall day',
  thumbnail_url: 'https://via.placeholder.com/320x180',
  cloudflare_stream_id: 'sample-stream-id', // This would be a real Cloudflare Stream ID
  created_at: new Date().toISOString(),
  subtitles: [
    {
      id: 1,
      video_id: 'sample-vlog-001',
      start_time: 0.0,
      end_time: 3.5,
      english_text: "Hello everyone, welcome back to my channel!",
      chinese_text: "大家好，欢迎回到我的频道！"
    },
    {
      id: 2,
      video_id: 'sample-vlog-001',
      start_time: 3.5,
      end_time: 7.2,
      english_text: "Today I'm taking you on a beautiful walk through Central Park.",
      chinese_text: "今天我要带你们在中央公园美美地散个步。"
    },
    {
      id: 3,
      video_id: 'sample-vlog-001',
      start_time: 7.2,
      end_time: 10.8,
      english_text: "The weather is absolutely gorgeous, and I couldn't resist coming out here.",
      chinese_text: "天气绝对美丽，我忍不住要出来走走。"
    },
    {
      id: 4,
      video_id: 'sample-vlog-001',
      start_time: 10.8,
      end_time: 14.5,
      english_text: "Look at these amazing fall colors! The leaves are just stunning.",
      chinese_text: "看看这些令人惊叹的秋色！叶子真是太美了。"
    },
    {
      id: 5,
      video_id: 'sample-vlog-001',
      start_time: 14.5,
      end_time: 18.0,
      english_text: "I love how peaceful it is here, even in the middle of New York City.",
      chinese_text: "我喜欢这里的宁静，即使是在纽约市中心。"
    },
    {
      id: 6,
      video_id: 'sample-vlog-001',
      start_time: 18.0,
      end_time: 22.3,
      english_text: "There are so many people out enjoying the sunshine today.",
      chinese_text: "今天有很多人出来享受阳光。"
    },
    {
      id: 7,
      video_id: 'sample-vlog-001',
      start_time: 22.3,
      end_time: 26.1,
      english_text: "This is my favorite spot by the lake. I come here whenever I need to think.",
      chinese_text: "这是我在湖边最喜欢的地方。每当我需要思考时，我就会来这里。"
    },
    {
      id: 8,
      video_id: 'sample-vlog-001',
      start_time: 26.1,
      end_time: 30.0,
      english_text: "Alright guys, that's it for today's quick walk. Thanks for joining me!",
      chinese_text: "好了伙伴们，今天的快速漫步就到这里。谢谢大家的陪伴！"
    }
  ]
};