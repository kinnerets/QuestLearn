import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'QuestLearn',
    short_name: 'QuestLearn',
    description: 'מסע למידה יומי עם קפי',
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F2EC',
    theme_color: '#FF2A85',
    dir: 'rtl',
    lang: 'he',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
