const ENV_API_BASE = process.env.EXPO_PUBLIC_API_BASE;

// Enforce that API_BASE is provided via .env
if (!ENV_API_BASE) {
  console.error("🚨 EXPO_PUBLIC_API_BASE is missing! Please set EXPO_PUBLIC_API_BASE in your frontend/.env file.");
}

export const API_BASE = ENV_API_BASE;

console.log("🔧 Config loaded. API_BASE:", API_BASE);
