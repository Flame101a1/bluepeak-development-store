import {policies} from './policies.js?v=20261022-discord-login';
// This file is PUBLIC. Only the Tebex HEADLESS PUBLIC token belongs here.
// Never paste a Checkout API key, webhook secret, password, or other private credential.
export const config = {
 name: 'BluePeak Development', tagline: 'Premium FiveM Resources',
 publicToken: '1429n-9b7135e06d5ffa3578a92c0926771a3a1ea5de28',
 // Optional absolute deployed site URL, including repository path and trailing slash.
 // Leave empty to detect the GitHub Pages origin and repository path automatically.
 siteUrl: '',
 // Public Discord Application ID; no client secret or bot token belongs here.
 discordClientId: '1562955299302670406',
 logo: 'assets/brand/bluepeak-logo.png', hero: 'assets/brand/bluepeak-hero.png',
 discordUrl: 'https://discord.gg/8EbAp7rgbB', youtubeUrl: '', supportUrl: '', supportEmail: 'bluepeaksupportofficial@gmail.com',
 docsUrl: 'https://flame101a1.github.io/BLUEPEAK-DEVELOPMENT-DOCS/inventory/',
 bundleId: null,
 // Real category IDs only: {123456: 'Scripts'}. Other categories appear automatically.
 categoryLabels: {},
 cacheSeconds: 60,
 // Reorder or remove these homepage sections.
 sections: ['latest', 'categories', 'values', 'community'],
 // Policy wording lives in js/policies.js; blank values show a setup notice.
 policies,
 accent: '#00BFFF', secondary: '#A8DFFF'
};
