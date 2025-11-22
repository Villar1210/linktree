# Configuração Gunicorn - Lumiar Linktree
# Arquivo: gunicorn.conf.py

import multiprocessing

# Bind
bind = "127.0.0.1:5000"

# Workers
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000

# Timeouts
timeout = 30
keepalive = 2
graceful_timeout = 30
max_requests = 1000
max_requests_jitter = 100

# Restart workers after this many requests, to help prevent memory leaks
preload_app = True

# User/Group
user = "www-data"
group = "www-data"

# Logs
accesslog = "/var/www/linktree/logs/gunicorn_access.log"
errorlog = "/var/www/linktree/logs/gunicorn_error.log"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = "linktree_gunicorn"

# Daemonize
daemon = False  # Controlado pelo systemd

# PID file
pidfile = "/var/www/linktree/logs/gunicorn.pid"

# SSL (se necessário)
# keyfile = "/path/to/keyfile"
# certfile = "/path/to/certfile"

# Environment variables
raw_env = [
    'FLASK_ENV=production',
    'PYTHONPATH=/var/www/linktree',
]

# Preload application
def when_ready(server):
    server.log.info("Lumiar Linktree ready to serve requests")

def worker_init(worker):
    worker.log.info("Worker spawned (pid: %s)", worker.pid)

def worker_exit(server, worker):
    server.log.info("Worker exited (pid: %s)", worker.pid)

def pre_fork(server, worker):
    pass

def post_fork(server, worker):
    pass

def post_worker_init(worker):
    pass

def worker_abort(worker):
    worker.log.info("Worker received SIGABRT signal")

# Configurações de desenvolvimento (comentadas)
# Para desenvolvimento, descomente as linhas abaixo e comente as de produção

# Development settings
# bind = "127.0.0.1:5000"
# workers = 1
# reload = True
# timeout = 0
# loglevel = "debug"
# accesslog = "-"  # stdout
# errorlog = "-"   # stderr