import { API_BASE as ENV_API_BASE } from '@env';

// Use the ENV value if available, otherwise fallback to your current PC IP
export const API_BASE = ENV_API_BASE || "http://192.168.8.199:8000/api";

console.log("🔧 Config loaded. API_BASE:", API_BASE);

// if emulator use:
// export const API_BASE = "http://10.0.2.2:8000/api";
