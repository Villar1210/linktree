# 🔧 Configurações do Sistema iVillar
import os
from datetime import timedelta

class Config:
    """Configurações base do sistema"""
    
    # Configurações básicas
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'ivillar-super-secret-key-2025-production'
    
    # Configurações do banco de dados
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///ivillar_platform.db'
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configurações de sessão
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    SESSION_COOKIE_SECURE = False  # True em produção com HTTPS
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # Configurações de upload de arquivos
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}
    
    # Configurações de email (para futuras implementações)
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'smtp.gmail.com'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    
    # Configurações da aplicação
    APP_NAME = 'iVillar Platform'
    APP_VERSION = '1.0.0'
    COMPANY_NAME = 'Construtora Lumiar'
    SUPPORT_EMAIL = 'suporte@ivillar.com.br'
    
    # URLs importantes
    FRONTEND_URL = os.environ.get('FRONTEND_URL') or 'https://linktree.ivillar.com.br'
    
    # Configurações de cache
    CACHE_TYPE = 'simple'
    CACHE_DEFAULT_TIMEOUT = 300
    
    # Configurações de rate limiting
    RATELIMIT_STORAGE_URL = 'memory://'
    
class DevelopmentConfig(Config):
    """Configurações para desenvolvimento"""
    DEBUG = True
    TESTING = False
    
    # Database local para desenvolvimento
    SQLALCHEMY_DATABASE_URI = 'sqlite:///dev_ivillar.db'
    
    # Sessão menos restritiva em desenvolvimento
    SESSION_COOKIE_SECURE = False

class ProductionConfig(Config):
    """Configurações para produção"""
    DEBUG = False
    TESTING = False
    
    # Segurança máxima em produção
    SESSION_COOKIE_SECURE = True
    
    # Database PostgreSQL para produção (exemplo)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'postgresql://user:password@localhost/ivillar_prod'

class TestingConfig(Config):
    """Configurações para testes"""
    TESTING = True
    DEBUG = True
    
    # Database em memória para testes
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    
    # Disable CSRF for testing
    WTF_CSRF_ENABLED = False

# Configuração baseada no ambiente
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}