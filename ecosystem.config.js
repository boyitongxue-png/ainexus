module.exports = {
  apps: [{
    name: 'ainexus',
    script: './dist/boot.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    merge_logs: true,
    max_memory_restart: '512M'
  }]
}
