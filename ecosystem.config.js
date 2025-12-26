module.exports = {
    apps: [{
        name: 'linktree',
        script: 'npx',
        args: 'serve -s dist -l 3000',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production'
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }]
}
