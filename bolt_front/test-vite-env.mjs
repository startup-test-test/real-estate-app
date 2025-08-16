import { spawn } from 'child_process';

console.log('System environment variables:');
console.log('VITE_DEV_RENDER_SIMULATOR_API:', process.env.VITE_DEV_RENDER_SIMULATOR_API);

const vite = spawn('npx', ['vite', '--debug'], {
  env: {
    ...process.env,
    VITE_DEV_RENDER_SIMULATOR_API: 'https://real-estate-app-1-iii4.onrender.com'
  },
  stdio: 'inherit'
});

setTimeout(() => {
  vite.kill();
  console.log('\nVite server stopped for testing');
}, 3000);
