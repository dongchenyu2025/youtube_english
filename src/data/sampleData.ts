import { VideoWithSubtitles } from '../types';
import { sampleWordCards } from './wordCardsData';

export const sampleVideoData: VideoWithSubtitles = {
  id: 'bookmark-001',
  title: 'Bookmark - 日常对话',
  description: 'Who said daily routines were boring? In this video, we learn 36 new words in the theme of daily routines. Join me in the countryside for a joyful English learning experience. Grab yourself a cuppa and relax ☕ 通过真实场景学习地道英语表达，掌握日常对话技巧。这个视频包含了丰富的生活化词汇和表达方式，非常适合中级英语学习者提升口语水平。',
  thumbnail_url: 'https://via.placeholder.com/320x180',
  cloudflare_stream_id: '08135affc82e60108cf1cb8214d2f2c1',
  created_at: new Date().toISOString(),
  wordCards: sampleWordCards,
  subtitles: [
    {
      id: 1,
      video_id: 'bookmark-001',
      start_time: 0.1,
      end_time: 5.3,
      english_text: "right now I'm reading this didion and babits it's great",
      chinese_text: "我现在正在读迪迪恩和巴比特的作品 很棒"
    },
    {
      id: 2,
      video_id: 'bookmark-001',
      start_time: 5.3,
      end_time: 7.266,
      english_text: "it's a really good read",
      chinese_text: "这本书真的很好看"
    },
    {
      id: 3,
      video_id: 'bookmark-001',
      start_time: 7.266,
      end_time: 11.633,
      english_text: "this is my favorite thing ever it's a bookmark",
      chinese_text: "这是我最喜欢的东西 是个书签"
    },
    {
      id: 4,
      video_id: 'bookmark-001',
      start_time: 11.8,
      end_time: 14.066,
      english_text: "it's a thong bookmark",
      chinese_text: "是个丁字裤书签"
    },
    {
      id: 5,
      video_id: 'bookmark-001',
      start_time: 14.066,
      end_time: 16.866,
      english_text: "and a dancer actually made this for me",
      chinese_text: "而且是一位舞者亲手为我做的"
    },
    {
      id: 6,
      video_id: 'bookmark-001',
      start_time: 16.866,
      end_time: 18.466,
      english_text: "and I remember when she gave it to me",
      chinese_text: "我记得她送我的时候"
    },
    {
      id: 7,
      video_id: 'bookmark-001',
      start_time: 18.466,
      end_time: 19.6,
      english_text: "I was like thank you",
      chinese_text: "我说了句谢谢"
    },
    {
      id: 8,
      video_id: 'bookmark-001',
      start_time: 19.6,
      end_time: 23.0,
      english_text: "this is not gonna fit me but I appreciate it",
      chinese_text: "这我穿不下 但还是很感谢"
    },
    {
      id: 9,
      video_id: 'bookmark-001',
      start_time: 23.0,
      end_time: 24.9,
      english_text: "and she's like no it's a bookmark",
      chinese_text: "她说不是 这是书签"
    },
    {
      id: 10,
      video_id: 'bookmark-001',
      start_time: 25.033,
      end_time: 28.566,
      english_text: "and so I think that's pretty cool and kinda sexy too",
      chinese_text: "所以我觉得这挺酷还有点小性感"
    },
    {
      id: 11,
      video_id: 'bookmark-001',
      start_time: 28.766,
      end_time: 29.7,
      english_text: "I wanna go",
      chinese_text: "我想去"
    }
  ]
};