// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import { watchMemes } from './src/lib/watch-memes.js';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	integrations: [mdx(), sitemap()],
	vite: { plugins: [watchMemes()] },
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Lora',
			cssVariable: '--font-lora',
			fallbacks: ['serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/lora-regular.ttf'],
						weight: '400 700',
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/lora-italic.ttf'],
						weight: '400 700',
						style: 'italic',
						display: 'swap',
					},
				],
			},
		},
	],
});
