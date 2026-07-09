/**
 * PM2 ecosystem — bare-metal fallback (Docker is primary).
 * Usage: pm2 start infra/pm2/ecosystem.config.cjs --env production
 */
module.exports = {
  apps: [
    {
      name: 'asoftech-app',
      script: 'node',
      args: 'server.js',
      cwd: '/opt/asoftech/.next/standalone',
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      listen_timeout: 10000,
      kill_timeout: 5000,
      wait_ready: true,
      merge_logs: true,
      error_file: '/var/log/asoftech/app-error.log',
      out_file: '/var/log/asoftech/app-out.log',
    },
  ],
}
