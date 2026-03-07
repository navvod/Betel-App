import { API_BASE as ENV_API_BASE } from '@env';

export const API_BASE = ENV_API_BASE;

console.log("🔧 Config loaded. API_BASE:", API_BASE);

// if emulator use:
// export const API_BASE = "http://10.0.2.2:8000/api";
