// PM2 ecosystem configuration for Blood Pressure Monitoring Application
// Fixed to handle TypeScript execution properly

module.exports = {
  apps: [
    {
      name: 'blood-pressure-app',
      script: 'node_modules/.bin/tsx',
      args: 'server/index.ts',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 6060,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 6060,
        HOST: '0.0.0.0'
      },
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};