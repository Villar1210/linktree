# 🔐 Sistema de Autenticação Avançado - iVillar Platform
from flask import session, redirect, url_for, request, flash, jsonify
from functools import wraps
import bcrypt
import jwt
import datetime
from typing import Optional, Dict, Any
import re

class AuthSystem:
    """Sistema de autenticação completo para múltiplos tipos de usuário"""
    
    def __init__(self, app=None, secret_key=None):
        self.app = app
        self.secret_key = secret_key or 'ivillar-super-secret-key-2025'
        
        # Configurações de segurança
        self.password_min_length = 8
        self.password_require_uppercase = True
        self.password_require_lowercase = True
        self.password_require_numbers = True
        self.password_require_special = True
        
        # Tipos de usuário permitidos
        self.user_types = {
            'corretor': {
                'name': 'Corretor de Imóveis',
                'permissions': ['view_properties', 'manage_clients', 'create_contracts', 'view_commissions'],
                'redirect_after_login': '/dashboard/corretor'
            },
            'cliente': {
                'name': 'Cliente',
                'permissions': ['view_properties', 'save_favorites', 'contact_brokers'],
                'redirect_after_login': '/dashboard/cliente'
            },
            'imobiliaria': {
                'name': 'Imobiliária',
                'permissions': ['manage_brokers', 'view_all_properties', 'financial_reports', 'admin_panel'],
                'redirect_after_login': '/dashboard/imobiliaria'
            },
            'admin': {
                'name': 'Administrador',
                'permissions': ['full_access'],
                'redirect_after_login': '/admin/dashboard'
            }
        }
    
    def hash_password(self, password: str) -> str:
        """Criptografar senha com bcrypt"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Verificar senha criptografada"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def validate_password(self, password: str) -> Dict[str, Any]:
        """Validar força da senha"""
        errors = []
        
        if len(password) < self.password_min_length:
            errors.append(f'Senha deve ter pelo menos {self.password_min_length} caracteres')
        
        if self.password_require_uppercase and not re.search(r'[A-Z]', password):
            errors.append('Senha deve conter pelo menos uma letra maiúscula')
        
        if self.password_require_lowercase and not re.search(r'[a-z]', password):
            errors.append('Senha deve conter pelo menos uma letra minúscula')
        
        if self.password_require_numbers and not re.search(r'\d', password):
            errors.append('Senha deve conter pelo menos um número')
        
        if self.password_require_special and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append('Senha deve conter pelo menos um caractere especial')
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'strength': self._calculate_password_strength(password)
        }
    
    def _calculate_password_strength(self, password: str) -> str:
        """Calcular força da senha"""
        score = 0
        
        if len(password) >= 8:
            score += 1
        if len(password) >= 12:
            score += 1
        if re.search(r'[A-Z]', password):
            score += 1
        if re.search(r'[a-z]', password):
            score += 1
        if re.search(r'\d', password):
            score += 1
        if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            score += 1
        
        if score <= 2:
            return 'fraca'
        elif score <= 4:
            return 'média'
        else:
            return 'forte'
    
    def validate_email(self, email: str) -> bool:
        """Validar formato do email"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def validate_cpf(self, cpf: str) -> bool:
        """Validar CPF brasileiro"""
        # Remove caracteres não numéricos
        cpf = re.sub(r'[^0-9]', '', cpf)
        
        # Verifica se tem 11 dígitos
        if len(cpf) != 11:
            return False
        
        # Verifica se não são todos iguais
        if cpf == cpf[0] * 11:
            return False
        
        # Validação do CPF
        def calculate_digit(cpf_partial):
            sum_val = sum(int(digit) * weight for digit, weight in zip(cpf_partial, range(len(cpf_partial) + 1, 1, -1)))
            remainder = sum_val % 11
            return 0 if remainder < 2 else 11 - remainder
        
        first_digit = calculate_digit(cpf[:9])
        second_digit = calculate_digit(cpf[:10])
        
        return cpf[-2:] == f"{first_digit}{second_digit}"
    
    def validate_cnpj(self, cnpj: str) -> bool:
        """Validar CNPJ brasileiro"""
        # Remove caracteres não numéricos
        cnpj = re.sub(r'[^0-9]', '', cnpj)
        
        # Verifica se tem 14 dígitos
        if len(cnpj) != 14:
            return False
        
        # Verifica se não são todos iguais
        if cnpj == cnpj[0] * 14:
            return False
        
        # Validação do CNPJ
        def calculate_digit(cnpj_partial, weights):
            sum_val = sum(int(digit) * weight for digit, weight in zip(cnpj_partial, weights))
            remainder = sum_val % 11
            return 0 if remainder < 2 else 11 - remainder
        
        weights_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        weights_2 = [6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9]
        
        first_digit = calculate_digit(cnpj[:12], weights_1)
        second_digit = calculate_digit(cnpj[:13], weights_2)
        
        return cnpj[-2:] == f"{first_digit}{second_digit}"
    
    def generate_token(self, user_data: Dict[str, Any]) -> str:
        """Gerar JWT token"""
        payload = {
            'user_id': user_data['id'],
            'email': user_data['email'],
            'user_type': user_data['user_type'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
            'iat': datetime.datetime.utcnow()
        }
        return jwt.encode(payload, self.secret_key, algorithm='HS256')
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verificar e decodificar JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def login_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fazer login do usuário"""
        # Gerar token
        token = self.generate_token(user_data)
        
        # Salvar na sessão
        session['user_id'] = user_data['id']
        session['user_email'] = user_data['email']
        session['user_type'] = user_data['user_type']
        session['user_name'] = user_data.get('nome', user_data['email'])
        session['auth_token'] = token
        session['logged_in'] = True
        
        # Definir redirect baseado no tipo de usuário
        redirect_url = self.user_types.get(user_data['user_type'], {}).get('redirect_after_login', '/')
        
        return {
            'success': True,
            'message': 'Login realizado com sucesso',
            'token': token,
            'redirect_url': redirect_url,
            'user_type': user_data['user_type']
        }
    
    def logout_user(self) -> Dict[str, Any]:
        """Fazer logout do usuário"""
        session.clear()
        return {
            'success': True,
            'message': 'Logout realizado com sucesso',
            'redirect_url': '/auth/login'
        }
    
    def is_logged_in(self) -> bool:
        """Verificar se usuário está logado"""
        return session.get('logged_in', False)
    
    def get_current_user(self) -> Optional[Dict[str, Any]]:
        """Obter dados do usuário atual"""
        if not self.is_logged_in():
            return None
        
        return {
            'id': session.get('user_id'),
            'email': session.get('user_email'),
            'name': session.get('user_name'),
            'user_type': session.get('user_type'),
            'permissions': self.user_types.get(session.get('user_type'), {}).get('permissions', [])
        }
    
    def has_permission(self, permission: str) -> bool:
        """Verificar se usuário tem permissão específica"""
        user = self.get_current_user()
        if not user:
            return False
        
        return permission in user.get('permissions', []) or 'full_access' in user.get('permissions', [])
    
    def require_login(self, f):
        """Decorator para rotas que requerem login"""
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not self.is_logged_in():
                if request.is_json:
                    return jsonify({'error': 'Login necessário'}), 401
                flash('Você precisa fazer login para acessar esta página', 'warning')
                return redirect(url_for('auth.login', next=request.url))
            return f(*args, **kwargs)
        return decorated_function
    
    def require_user_type(self, user_types):
        """Decorator para rotas que requerem tipo específico de usuário"""
        if isinstance(user_types, str):
            user_types = [user_types]
        
        def decorator(f):
            @wraps(f)
            def decorated_function(*args, **kwargs):
                if not self.is_logged_in():
                    if request.is_json:
                        return jsonify({'error': 'Login necessário'}), 401
                    return redirect(url_for('auth.login'))
                
                current_user = self.get_current_user()
                if current_user['user_type'] not in user_types and 'admin' not in user_types:
                    if request.is_json:
                        return jsonify({'error': 'Acesso negado'}), 403
                    flash('Você não tem permissão para acessar esta página', 'error')
                    return redirect('/')
                
                return f(*args, **kwargs)
            return decorated_function
        return decorator
    
    def require_permission(self, permission):
        """Decorator para rotas que requerem permissão específica"""
        def decorator(f):
            @wraps(f)
            def decorated_function(*args, **kwargs):
                if not self.has_permission(permission):
                    if request.is_json:
                        return jsonify({'error': 'Permissão insuficiente'}), 403
                    flash('Você não tem permissão para realizar esta ação', 'error')
                    return redirect('/')
                return f(*args, **kwargs)
            return decorated_function
        return decorator

# Instância global do sistema de auth
auth_system = AuthSystem()