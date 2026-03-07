import { API_BASE as ENV_API_BASE } from '@env';

// Enforce that API_BASE is provided via .env
if (!ENV_API_BASE) {
  console.error("🚨 API_BASE is missing! Please set API_BASE in your frontend/.env file.");
}

export const API_BASE = ENV_API_BASE;

console.log("🔧 Config loaded. API_BASE:", API_BASE);