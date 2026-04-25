// SVG Icons
const icons = {
  user: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>',
  users: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  message: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  send: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
  settings: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
  cpu: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>',
  clock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  zap: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  zapOff: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
  trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
  play: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
  square: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>',
  key: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>',
  globe: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  bot: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" x2="8" y1="16" y2="16"/><line x1="16" x2="16" y1="16" y2="16"/></svg>',
  sparkles: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>',
  activity: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
  eye: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  layers: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>',
  fileText: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>',
  wifi: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" x2="12.01" y1="20" y2="20"/></svg>',
  wifiOff: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="22" y1="2" y2="22"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a9 9 0 0 1 2-1.76"/><path d="M5 12.55a9 9 0 0 1 2-2.27"/><path d="M12 20h.01"/><path d="M19.5 16.5a9 9 0 0 0 2-2.27"/><path d="M22 8.82a9 9 0 0 0-2-1.76"/><path d="M15 5.24a9 9 0 0 0-3-1.24"/></svg>',
  database: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>',
  link: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  linkOff: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 0 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/></svg>',
  loader: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>',
  alertCircle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>',
  checkCircle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
  info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  cloud: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>',
  brain: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54"/></svg>',
  gem: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>',
  rocket: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
  star: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  hexagon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
  triangle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.73 4 2 20h20L10.27 4a2 2 0 0 0-3.54 0z"/></svg>'
};

// AI Providers Configuration with models
const AI_PROVIDERS = {
  mistral: {
    name: 'Mistral AI',
    desc: 'European AI',
    icon: 'cloud',
    baseUrl: 'https://api.mistral.ai/v1',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large (Latest)', desc: 'Most capable model' },
      { id: 'mistral-medium-latest', name: 'Mistral Medium (Latest)', desc: 'Balanced performance' },
      { id: 'mistral-small-latest', name: 'Mistral Small (Latest)', desc: 'Fast & efficient' },
      { id: 'open-mixtral-8x22b', name: 'Mixtral 8x22B', desc: 'Open source MoE' },
      { id: 'open-mixtral-8x7b', name: 'Mixtral 8x7B', desc: 'Lightweight MoE' },
      { id: 'open-mistral-7b', name: 'Mistral 7B', desc: 'Smallest model' },
      { id: 'codestral-latest', name: 'Codestral', desc: 'Code generation' }
    ],
    defaultModel: 'mistral-large-latest',
    defaultApiKey: 'bz2Mp9E67ep1QfmaHzXBSJaRVOfIkx8v'
  },
  openai: {
    name: 'OpenAI',
    desc: 'GPT Models',
    icon: 'sparkles',
    baseUrl: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', desc: 'Latest multimodal' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', desc: 'Fast & affordable' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', desc: 'Enhanced GPT-4' },
      { id: 'gpt-4', name: 'GPT-4', desc: 'Most capable' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', desc: 'Fast & efficient' }
    ],
    defaultModel: 'gpt-4o'
  },
  google: {
    name: 'Google AI Studio',
    desc: 'Gemini Models',
    icon: 'gem',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', desc: 'Advanced reasoning' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', desc: 'Fast responses' },
      { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', desc: 'General purpose' },
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Exp)', desc: 'Latest experimental' }
    ],
    defaultModel: 'gemini-1.5-pro'
  },
  anthropic: {
    name: 'Anthropic',
    desc: 'Claude Models',
    icon: 'brain',
    baseUrl: 'https://api.anthropic.com/v1',
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', desc: 'Latest & best' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', desc: 'Fast & efficient' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', desc: 'Most powerful' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', desc: 'Balanced' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', desc: 'Fastest' }
    ],
    defaultModel: 'claude-3-5-sonnet-20241022'
  },
  deepseek: {
    name: 'DeepSeek',
    desc: 'Chinese AI',
    icon: 'hexagon',
    baseUrl: 'https://api.deepseek.com/v1',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', desc: 'General purpose' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', desc: 'Code specialist' },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', desc: 'Advanced reasoning' }
    ],
    defaultModel: 'deepseek-chat'
  },
  glm: {
    name: 'GLM (智谱)',
    desc: 'Zhipu AI',
    icon: 'cpu',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: [
      { id: 'glm-4-plus', name: 'GLM-4 Plus', desc: 'Enhanced GLM-4' },
      { id: 'glm-4', name: 'GLM-4', desc: 'Flagship model' },
      { id: 'glm-4-air', name: 'GLM-4 Air', desc: 'Cost-effective' },
      { id: 'glm-4-flash', name: 'GLM-4 Flash', desc: 'Fast inference' },
      { id: 'glm-4-long', name: 'GLM-4 Long', desc: 'Long context' }
    ],
    defaultModel: 'glm-4'
  },
  xai: {
    name: 'xAI',
    desc: 'Grok Models',
    icon: 'rocket',
    baseUrl: 'https://api.x.ai/v1',
    models: [
      { id: 'grok-beta', name: 'Grok Beta', desc: 'Early access' },
      { id: 'grok-2-1212', name: 'Grok 2', desc: 'Latest model' },
      { id: 'grok-2-vision-1212', name: 'Grok 2 Vision', desc: 'Multimodal' }
    ],
    defaultModel: 'grok-beta'
  },
  meta: {
    name: 'Meta AI',
    desc: 'Llama Models',
    icon: 'triangle',
    baseUrl: 'https://api.meta.ai/v1',
    models: [
      { id: 'llama-3.3-70b-instruct', name: 'Llama 3.3 70B', desc: 'Latest instruct' },
      { id: 'llama-3.2-90b-vision', name: 'Llama 3.2 90B Vision', desc: 'Multimodal' },
      { id: 'llama-3.2-11b-vision', name: 'Llama 3.2 11B Vision', desc: 'Lightweight multimodal' },
      { id: 'llama-3.1-405b-instruct', name: 'Llama 3.1 405B', desc: 'Largest model' }
    ],
    defaultModel: 'llama-3.3-70b-instruct'
  },
  custom: {
    name: 'Custom',
    desc: 'Your API',
    icon: 'globe',
    baseUrl: '',
    models: [],
    defaultModel: ''
  }
};

// State
let accounts = [];
let selectedAccountId = null;
let currentTab = 'overview';
let connectionStatus = {}; // accountId -> { status, message }

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadAccounts();
  setupEventListeners();
});

function setupEventListeners() {
  window.electronAPI.onMessage((data) => {
    if (selectedAccountId === data.accountId) {
      renderMessages();
    }
  });
  
  window.electronAPI.onStatus((data) => {
    updateAccountStatus(data.accountId, data);
    connectionStatus[data.accountId] = data;
    if (selectedAccountId === data.accountId) {
      renderContent();
    }
  });
  
  window.electronAPI.onError((data) => {
    console.error('Error:', data);
    connectionStatus[data.accountId] = { connected: false, message: data.error };
    renderContent();
  });
}

// ============== Account Management ==============

async function loadAccounts() {
  accounts = await window.electronAPI.getAccounts();
  renderAccountsList();
  
  if (accounts.length > 0 && !selectedAccountId) {
    selectAccount(accounts[0].id);
  }
}

function renderAccountsList() {
  const container = document.getElementById('accountsList');
  
  if (accounts.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #666;">
        <p>No accounts yet</p>
        <p style="font-size: 12px; margin-top: 8px;">Click below to add one</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = accounts.map(acc => {
    const status = connectionStatus[acc.id] || { connected: acc.connected, message: '' };
    const statusClass = status.connecting ? 'connecting' : (status.connected ? 'connected' : 'disconnected');
    const statusText = status.connecting ? 'Connecting...' : (status.connected ? 'Connected' : 'Offline');
    
    return `
      <div class="account-item ${acc.id === selectedAccountId ? 'active' : ''}" onclick="selectAccount('${acc.id}')">
        <div class="account-header">
          <span class="account-name">${icons.user} ${acc.name}</span>
          <span class="account-status ${statusClass}">
            ${status.connecting ? icons.loader : (status.connected ? icons.wifi : icons.wifiOff)}
            ${statusText}
          </span>
        </div>
        ${acc.phone ? `<div class="account-phone">${acc.phone}</div>` : ''}
        ${status.message && !status.connected ? `<div class="account-phone" style="color: #ffbb33;">${status.message}</div>` : ''}
      </div>
    `;
  }).join('');
}

async function selectAccount(id) {
  selectedAccountId = id;
  renderAccountsList();
  renderContent();
}

function updateAccountStatus(accountId, status) {
  const acc = accounts.find(a => a.id === accountId);
  if (acc) {
    acc.connected = status.connected;
  }
  connectionStatus[accountId] = status;
  renderAccountsList();
}

// ============== Modal Management ==============

function showAddAccountModal() {
  document.getElementById('addAccountModal').classList.add('active');
  document.getElementById('newAccountName').value = '';
  document.getElementById('newApiId').value = '';
  document.getElementById('newApiHash').value = '';
  document.getElementById('newPhone').value = '';
}

function hideAddAccountModal() {
  document.getElementById('addAccountModal').classList.remove('active');
}

function showLoginModal(needCode = false) {
  document.getElementById('loginModal').classList.add('active');
  document.getElementById('phoneStep').style.display = needCode ? 'none' : 'block';
  document.getElementById('codeStep').style.display = needCode ? 'block' : 'none';
  document.getElementById('loginTitle').innerHTML = (needCode ? icons.key : icons.user) + ' ' + (needCode ? 'Enter Code' : 'Login to Telegram');
}

function hideLoginModal() {
  document.getElementById('loginModal').classList.remove('active');
}

// ============== Account Actions ==============

async function addAccount() {
  const name = document.getElementById('newAccountName').value.trim();
  const apiId = document.getElementById('newApiId').value.trim();
  const apiHash = document.getElementById('newApiHash').value.trim();
  const phone = document.getElementById('newPhone').value.trim();
  
  if (!name || !apiId || !apiHash) {
    alert('Please fill in name, API ID, and API Hash');
    return;
  }
  
  const result = await window.electronAPI.addAccount({ name, apiId, apiHash, phone });
  
  if (result.success) {
    hideAddAccountModal();
    await loadAccounts();
    selectAccount(result.account.id);
  } else {
    alert('Failed to add account');
  }
}

async function deleteAccount() {
  if (!selectedAccountId) return;
  
  if (!confirm('Are you sure you want to delete this account?')) return;
  
  await window.electronAPI.deleteAccount({ id: selectedAccountId });
  selectedAccountId = null;
  await loadAccounts();
}

async function connectAccount() {
  if (!selectedAccountId) return;
  
  // Show connecting status immediately
  connectionStatus[selectedAccountId] = { connecting: true, message: 'Connecting to Telegram...' };
  renderAccountsList();
  renderContent();
  
  try {
    const result = await window.electronAPI.connectAccount(selectedAccountId);
    
    if (result.needLogin) {
      connectionStatus[selectedAccountId] = { connected: false, message: 'Login required' };
      showLoginModal(false);
    } else if (!result.success) {
      connectionStatus[selectedAccountId] = { connected: false, message: result.error };
      alert('Failed to connect: ' + result.error);
    } else {
      connectionStatus[selectedAccountId] = { connected: true, message: 'Connected' };
    }
  } catch (error) {
    connectionStatus[selectedAccountId] = { connected: false, message: error.message };
    alert('Connection error: ' + error.message);
  }
  
  await loadAccounts();
  renderContent();
}

async function disconnectAccount() {
  if (!selectedAccountId) return;
  await window.electronAPI.disconnectAccount(selectedAccountId);
  connectionStatus[selectedAccountId] = { connected: false, message: 'Disconnected' };
  await loadAccounts();
  renderContent();
}

async function sendLoginPhone() {
  const phone = document.getElementById('loginPhone').value.trim();
  if (!phone) {
    alert('Please enter your phone number');
    return;
  }
  
  const result = await window.electronAPI.sendPhone(selectedAccountId, phone);
  
  if (result.success) {
    showLoginModal(true);
  } else {
    alert('Failed to send code: ' + result.error);
  }
}

async function verifyLoginCode() {
  const code = document.getElementById('loginCode').value.trim();
  if (!code) {
    alert('Please enter the verification code');
    return;
  }
  
  const result = await window.electronAPI.verifyCode(selectedAccountId, code);
  
  if (result.success) {
    hideLoginModal();
    connectionStatus[selectedAccountId] = { connected: true, message: 'Connected' };
    await loadAccounts();
    renderContent();
  } else {
    alert('Failed to verify: ' + result.error);
  }
}

// ============== Content Rendering ==============

function renderContent() {
  const container = document.getElementById('mainContent');
  const account = accounts.find(a => a.id === selectedAccountId);
  
  if (!account) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${icons.layers}</div>
        <div class="empty-title">No Account Selected</div>
        <div class="empty-desc">Add a Telegram account to get started</div>
      </div>
    `;
    return;
  }
  
  const status = connectionStatus[account.id] || { connected: account.connected, message: '' };
  
  container.innerHTML = `
    <div class="content-header">
      <h1 class="content-title">${icons.user} ${account.name}</h1>
      <div class="content-actions">
        ${status.connected 
          ? `<button class="btn btn-danger" onclick="disconnectAccount()">${icons.square} Disconnect</button>`
          : `<button class="btn btn-success" onclick="connectAccount()">${icons.link} Connect to Telegram</button>`
        }
        <button class="btn btn-secondary" onclick="deleteAccount()">${icons.trash} Delete</button>
      </div>
    </div>
    
    <div class="content-body">
      ${!status.connected && !status.connecting ? renderConnectBanner(account) : ''}
      ${status.connecting ? renderConnectingBanner() : ''}
      ${status.message && status.connected ? renderStatusMessage(status.message) : ''}
      ${renderTabs()}
      ${renderTabContent()}
    </div>
  `;
}

function renderConnectBanner(account) {
  return `
    <div class="connect-banner">
      <div class="connect-banner-title">
        ${icons.wifiOff}
        Account is Offline
      </div>
      <div class="connect-banner-desc">
        Click "Connect to Telegram" to start receiving and responding to messages.<br>
        You'll need to login with your phone number if this is the first time.
      </div>
      <button class="btn btn-success" onclick="connectAccount()">
        ${icons.link} Connect to Telegram
      </button>
    </div>
  `;
}

function renderConnectingBanner() {
  return `
    <div class="status-message info">
      ${icons.loader} Connecting to Telegram...
    </div>
  `;
}

function renderStatusMessage(message) {
  return `
    <div class="status-message success">
      ${icons.checkCircle} ${message}
    </div>
  `;
}

function renderTabs() {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: icons.activity },
    { id: 'tools', label: 'Tools', icon: icons.settings },
    { id: 'ai', label: 'AI Settings', icon: icons.bot },
    { id: 'messages', label: 'Messages', icon: icons.message }
  ];
  
  return `
    <div class="tabs">
      ${tabs.map(t => `
        <button class="tab ${t.id === currentTab ? 'active' : ''}" onclick="setTab('${t.id}')">
          ${t.icon} ${t.label}
        </button>
      `).join('')}
    </div>
  `;
}

function setTab(tab) {
  currentTab = tab;
  renderContent();
}

function renderTabContent() {
  const account = accounts.find(a => a.id === selectedAccountId);
  
  switch (currentTab) {
    case 'overview': return renderOverview(account);
    case 'tools': return renderTools(account);
    case 'ai': return renderAISettings(account);
    case 'messages': return renderMessages();
    default: return '';
  }
}

function renderOverview(account) {
  const status = connectionStatus[account.id] || { connected: account.connected };
  const provider = AI_PROVIDERS[account.aiProvider] || AI_PROVIDERS.mistral;
  
  return `
    <div class="card">
      <h3 class="card-title">${icons.activity} Connection Status</h3>
      <div class="card-grid">
        <div class="stat-card">
          <div class="stat-icon">${status.connected ? icons.wifi : icons.wifiOff}</div>
          <div class="stat-value">${status.connected ? 'Online' : 'Offline'}</div>
          <div class="stat-label">Status</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">${icons[provider.icon] || icons.cpu}</div>
          <div class="stat-value">${provider.name}</div>
          <div class="stat-label">AI Provider</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">${account.tools?.autoRespond ? icons.zap : icons.zapOff}</div>
          <div class="stat-value">${account.tools?.autoRespond ? 'ON' : 'OFF'}</div>
          <div class="stat-label">Auto-Respond</div>
        </div>
      </div>
    </div>
    
    <div class="card">
      <h3 class="card-title">${icons.bot} Current AI Model</h3>
      <div class="form-group">
        <label>Provider</label>
        <input type="text" value="${provider.name}" readonly>
      </div>
      <div class="form-group">
        <label>Model</label>
        <input type="text" value="${account.aiModel || provider.defaultModel}" readonly>
      </div>
    </div>
    
    <div class="card">
      <h3 class="card-title">${icons.key} API Credentials</h3>
      <div class="form-group">
        <label>API ID</label>
        <input type="text" value="${account.apiId}" readonly>
      </div>
      <div class="form-group">
        <label>API Hash</label>
        <input type="password" value="${account.apiHash}" readonly>
      </div>
    </div>
    
    <div class="instructions">
      <h4>
        ${icons.info}
        How it works
      </h4>
      <ol>
        <li><strong>Connect:</strong> Click "Connect to Telegram" and login with your phone number</li>
        <li><strong>Configure AI:</strong> Set up your AI provider and API key in "AI Settings"</li>
        <li><strong>Enable Tools:</strong> Toggle "Auto-Respond" to automatically reply to messages</li>
        <li><strong>Monitor:</strong> See incoming messages and AI responses in "Messages"</li>
      </ol>
    </div>
  `;
}

function renderTools(account) {
  const tools = account.tools || {};
  const status = connectionStatus[account.id] || { connected: account.connected };
  
  return `
    <div class="card">
      <h3 class="card-title">${icons.settings} Tool Controls</h3>
      
      <div class="toggle-row">
        <div class="toggle-info">
          <div class="toggle-icon">${icons.zap}</div>
          <div>
            <div class="toggle-label">Auto-Respond</div>
            <div class="toggle-desc">Automatically respond to incoming messages using AI</div>
          </div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" ${tools.autoRespond ? 'checked' : ''} onchange="toggleTool('autoRespond', this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>
      
      <div class="toggle-row">
        <div class="toggle-info">
          <div class="toggle-icon">${icons.clock}</div>
          <div>
            <div class="toggle-label">Schedule Wakeup</div>
            <div class="toggle-desc">Wake up at scheduled time to process unread messages</div>
          </div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" ${tools.scheduleWakeup ? 'checked' : ''} onchange="toggleTool('scheduleWakeup', this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
    
    <div class="card">
      <h3 class="card-title">${icons.clock} Wakeup Schedule</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Wakeup Time</label>
          <input type="time" id="wakeupTime" value="${tools.wakeupTime || '09:00'}" onchange="updateWakeupTime()">
        </div>
        <div class="form-group">
          <label>Check Interval (minutes)</label>
          <input type="number" id="wakeupInterval" value="${tools.wakeupInterval || 5}" min="1" max="60" onchange="updateWakeupTime()">
        </div>
      </div>
    </div>
    
    ${!status.connected ? `
      <div class="status-message warning">
        ${icons.alertCircle} Connect to Telegram to enable these tools
      </div>
    ` : ''}
  `;
}

function renderAISettings(account) {
  const currentProvider = account.aiProvider || 'mistral';
  const currentModel = account.aiModel || AI_PROVIDERS[currentProvider]?.defaultModel || '';
  
  return `
    <div class="card">
      <h3 class="card-title">${icons.bot} Select AI Provider</h3>
      <div class="ai-provider-grid">
        ${Object.entries(AI_PROVIDERS).map(([id, provider]) => `
          <div class="ai-provider-option ${currentProvider === id ? 'selected' : ''}" onclick="selectAIProvider('${id}')">
            <div class="ai-provider-icon">${icons[provider.icon] || icons.cpu}</div>
            <div class="ai-provider-name">${provider.name}</div>
            <div class="ai-provider-desc">${provider.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>
    
    ${renderModelSelection(account, currentProvider, currentModel)}
    
    <div class="card">
      <h3 class="card-title">${icons.key} API Configuration</h3>
      <div class="form-group">
        <label>Base URL</label>
        <input type="text" id="aiBaseUrl" value="${account.aiBaseUrl || AI_PROVIDERS[currentProvider]?.baseUrl || ''}" placeholder="https://api.example.com/v1">
      </div>
      <div class="form-group">
        <label>API Key</label>
        <input type="password" id="aiApiKey" value="${account.aiApiKey || AI_PROVIDERS[currentProvider]?.defaultApiKey || ''}" placeholder="Your API key...">
      </div>
      <button class="btn btn-primary" onclick="saveAIConfig()">${icons.check} Save AI Configuration</button>
    </div>
    
    <div class="card">
      <h3 class="card-title">${icons.fileText} System Prompt</h3>
      <div class="form-group">
        <label>How AI should respond to messages</label>
        <textarea id="systemPrompt" placeholder="You are a helpful assistant...">${account.systemPrompt || ''}</textarea>
      </div>
      <button class="btn btn-primary" onclick="saveSystemPrompt()">${icons.check} Save Prompt</button>
    </div>
  `;
}

function renderModelSelection(account, currentProvider, currentModel) {
  const provider = AI_PROVIDERS[currentProvider];
  if (!provider || !provider.models || provider.models.length === 0) {
    return `
      <div class="card">
        <h3 class="card-title">${icons.settings} Model Selection</h3>
        <div class="form-group">
          <label>Model Name</label>
          <input type="text" id="aiModel" value="${currentModel}" placeholder="Enter model name">
        </div>
      </div>
    `;
  }
  
  return `
    <div class="card">
      <h3 class="card-title">${icons.settings} Select Model</h3>
      <div class="form-group">
        <label>Available Models for ${provider.name}</label>
        <select id="aiModel" onchange="updateModelSelection()">
          <option value="">-- Select a model --</option>
          ${provider.models.map(model => `
            <option value="${model.id}" ${currentModel === model.id ? 'selected' : ''}>
              ${model.name} - ${model.desc}
            </option>
          `).join('')}
        </select>
      </div>
      <div id="modelInfo" style="background: #1a1a2e; border-radius: 8px; padding: 12px; margin-top: 12px;">
        ${getModelInfo(provider, currentModel)}
      </div>
    </div>
  `;
}

function getModelInfo(provider, modelId) {
  const model = provider.models.find(m => m.id === modelId);
  if (!model) return '<span style="color: #666;">Select a model to see details</span>';
  return `
    <div style="display: flex; align-items: center; gap: 8px;">
      <strong style="color: #0088cc;">${model.name}</strong>
      <span style="color: #666;">|</span>
      <span style="color: #888;">${model.desc}</span>
    </div>
  `;
}

function updateModelSelection() {
  const select = document.getElementById('aiModel');
  const modelId = select.value;
  const currentProvider = accounts.find(a => a.id === selectedAccountId)?.aiProvider || 'mistral';
  const provider = AI_PROVIDERS[currentProvider];
  
  const infoContainer = document.getElementById('modelInfo');
  if (infoContainer && provider) {
    infoContainer.innerHTML = getModelInfo(provider, modelId);
  }
}

async function renderMessages() {
  if (!selectedAccountId) return `<div class="card"><p>No account selected</p></div>`;
  
  const status = connectionStatus[selectedAccountId] || { connected: false };
  
  if (!status.connected) {
    return `
      <div class="card">
        <h3 class="card-title">${icons.message} Messages</h3>
        <div style="text-align: center; padding: 40px; color: #666;">
          <p>${icons.wifiOff}</p>
          <p style="margin-top: 16px;">Connect to Telegram to view messages</p>
        </div>
      </div>
    `;
  }
  
  const messages = await window.electronAPI.getMessages(selectedAccountId, 50);
  
  if (!messages || messages.length === 0) {
    return `
      <div class="card">
        <h3 class="card-title">${icons.message} Messages</h3>
        <p style="color: #666; text-align: center; padding: 40px;">
          No messages yet. Messages will appear here when you receive them.
        </p>
      </div>
    `;
  }
  
  return `
    <div class="card">
      <h3 class="card-title">${icons.message} Recent Messages</h3>
      <div class="messages-list">
        ${messages.map(msg => `
          <div class="message-item">
            <div class="message-header">
              <span class="message-from">${msg.isOut ? icons.send : icons.user} ${msg.isOut ? msg.chatName : msg.from}</span>
              <span class="message-time">${new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="message-text">${msg.text}</div>
            ${msg.aiResponse ? `
              <div class="ai-response">
                <div class="ai-response-label">${icons.sparkles} AI Response:</div>
                <div class="message-text">${msg.aiResponse}</div>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ============== Tool Actions ==============

async function toggleTool(tool, enabled) {
  await window.electronAPI.toggleTool(selectedAccountId, tool, enabled);
}

async function updateWakeupTime() {
  const time = document.getElementById('wakeupTime').value;
  const interval = parseInt(document.getElementById('wakeupInterval').value);
  await window.electronAPI.setWakeupTime(selectedAccountId, time, interval);
}

// ============== AI Actions ==============

async function selectAIProvider(provider) {
  const providerConfig = AI_PROVIDERS[provider];
  const def = {
    aiProvider: provider,
    aiBaseUrl: providerConfig?.baseUrl || '',
    aiModel: providerConfig?.defaultModel || ''
  };
  
  // Include default API key if available (for Mistral)
  if (providerConfig?.defaultApiKey) {
    def.aiApiKey = providerConfig.defaultApiKey;
  }
  
  await window.electronAPI.updateAIConfig(selectedAccountId, def);
  renderContent();
}

async function saveAIConfig() {
  const baseUrl = document.getElementById('aiBaseUrl').value;
  const apiKey = document.getElementById('aiApiKey').value;
  const modelSelect = document.getElementById('aiModel');
  const model = modelSelect ? modelSelect.value : '';
  
  await window.electronAPI.updateAIConfig(selectedAccountId, {
    aiBaseUrl: baseUrl,
    aiApiKey: apiKey,
    aiModel: model
  });
  
  alert('AI configuration saved!');
}

async function saveSystemPrompt() {
  const prompt = document.getElementById('systemPrompt').value;
  await window.electronAPI.updateSystemPrompt(selectedAccountId, prompt);
  alert('System prompt saved!');
}
