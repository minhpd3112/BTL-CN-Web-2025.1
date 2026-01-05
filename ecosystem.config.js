module.exports = {
    apps: [{
        name: 'edulearn-backend',
        script: 'dist/server.js',
        cwd: '/home/workspace/BTL-CN-Web-2025.1/backend',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '500M',
        env: {
            NODE_ENV: 'production',
            PORT: 5001
        },
        error_file: '/var/log/pm2/edulearn-error.log',
        out_file: '/var/log/pm2/edulearn-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }]
};
