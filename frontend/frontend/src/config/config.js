import { API_BASE as ENV_API_BASE } from '@env';

// Hardcoded fallback since .env might not be refreshing in the packager
const HARDCODED_IP = "http://10.232.24.184:8000/api";

export const API_BASE = ENV_API_BASE || HARDCODED_IP;

console.log("🔧 Config loaded. API_BASE:", API_BASE);

// if emulator use:
// export const API_BASE = "http://10.0.2.2:8000/api";