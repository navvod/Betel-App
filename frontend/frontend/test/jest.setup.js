// Mock EXPO_PUBLIC_API_BASE for testing environment
process.env.EXPO_PUBLIC_API_BASE = 'http://localhost:8000/api';

// Suppress console.log and console.error in tests to keep output clean
// Comment these lines if you need to debug specific test issues
// jest.spyOn(console, 'log').mockImplementation(() => {});
// jest.spyOn(console, 'error').mockImplementation(() => {});
