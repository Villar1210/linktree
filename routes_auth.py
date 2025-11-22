from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from models import db, User
from itsdangerous import URLSafeTimedSerializer
from flask import current_app
from functools import wraps

# --- Blueprint de autenticação limpo ---
auth_bp = Blueprint('auth', __name__, template_folder='templates/auth')

# --- Função para enviar e-mail de confirmação ---
def send_confirmation_email(user):
    token = generate_confirmation_token(user)
    confirm_link = url_for('auth.confirm_email', token=token, _external=True)
    subject = 'Confirmação de e-mail - iVillar Platform'
    body = f'Olá,\n\nClique no link para confirmar seu e-mail: {confirm_link}\nSe não foi você, ignore esta mensagem.'
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = current_app.config.get('MAIL_DEFAULT_SENDER', 'no-reply@ivillar.com.br')
    msg['To'] = user.email
    try:
        server = smtplib.SMTP(current_app.config['MAIL_SERVER'], current_app.config['MAIL_PORT'])
        if current_app.config.get('MAIL_USE_TLS'):
            server.starttls()
        server.login(current_app.config['MAIL_USERNAME'], current_app.config['MAIL_PASSWORD'])
        server.sendmail(msg['From'], [msg['To']], msg.as_string())
        server.quit()
    except Exception as e:
        print(f'Erro ao enviar e-mail de confirmação: {e}')

# --- Token de confirmação ---
def generate_confirmation_token(user):
    s = get_serializer()
    return s.dumps(user.id, salt='email-confirm')

def verify_confirmation_token(token, expiration=86400):
    s = get_serializer()
    try:
        user_id = s.loads(token, salt='email-confirm', max_age=expiration)
    except Exception:
        return None
    return User.query.get(user_id)

# --- Rota de confirmação de e-mail ---
@auth_bp.route('/confirm-email/<token>')
def confirm_email(token):
    user = verify_confirmation_token(token)
    if not user:
        flash('Token inválido ou expirado.', 'error')
        return redirect(url_for('auth.login'))
    if user.is_email_confirmed:
        flash('E-mail já confirmado. Faça login.', 'info')
        return redirect(url_for('auth.login'))
    user.is_email_confirmed = True
    db.session.commit()
    flash('E-mail confirmado com sucesso! Agora você pode acessar sua conta.', 'success')
    return redirect(url_for('auth.login'))
# --- Decorator para proteção de rotas ---
from functools import wraps
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Faça login para acessar esta página.', 'warning')
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function
# --- Blueprint de autenticação limpo ---
from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from models import db, User
from itsdangerous import URLSafeTimedSerializer
from flask import current_app

auth_bp = Blueprint('auth', __name__, template_folder='templates/auth')

# --- Login ---
@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email'].strip().lower()
        password = request.form['password']
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            if not user.is_email_confirmed:
                flash('Confirme seu e-mail antes de acessar. Verifique sua caixa de entrada.', 'error')
                return render_template('auth/login.html')
            if not user.is_active:
                flash('Usuário inativo.', 'error')
                return render_template('auth/login.html')
            session['user_id'] = user.id
            return redirect(url_for('admin.dashboard'))
        flash('E-mail ou senha inválidos.', 'error')
    return render_template('auth/login.html')

# --- Logout ---
@auth_bp.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('Logout realizado com sucesso.', 'success')
    return redirect(url_for('auth.login'))

# --- Registro ---
@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email'].strip().lower()
        name = request.form['name'].strip()
        password = request.form['password']
        if User.query.filter_by(email=email).first():
            flash('E-mail já cadastrado.', 'error')
            return render_template('auth/register.html')
        user = User(email=email, name=name)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        send_confirmation_email(user)
        flash('Cadastro realizado! Verifique seu e-mail para confirmar a conta.', 'success')
        return redirect(url_for('auth.login'))
    return render_template('auth/register.html')

# --- Recuperação de senha (esqueci/reset) ---
@auth_bp.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form['email'].strip().lower()
        user = User.query.filter_by(email=email).first()
        if user:
            send_reset_email(user)
        flash('Se o e-mail estiver cadastrado, enviaremos instruções para redefinir a senha.', 'info')
        return redirect(url_for('auth.login'))
    return render_template('auth/forgot_password.html')

@auth_bp.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    user = verify_reset_token(token)
    if not user:
        flash('Token inválido ou expirado.', 'error')
        return redirect(url_for('auth.forgot_password'))
    if request.method == 'POST':
        password = request.form['password']
        user.set_password(password)
        db.session.commit()
        flash('Senha redefinida com sucesso!', 'success')
        return redirect(url_for('auth.login'))
    return render_template('auth/reset_password.html')

# --- Utilitários de token e e-mail ---
def get_serializer():
    return URLSafeTimedSerializer(current_app.config['SECRET_KEY'])

def generate_reset_token(user):
    s = get_serializer()
    return s.dumps(user.id, salt='password-reset')

def verify_reset_token(token, expiration=3600):
    s = get_serializer()
    try:
        user_id = s.loads(token, salt='password-reset', max_age=expiration)
    except Exception:
        return None
    return User.query.get(user_id)

import smtplib
from email.mime.text import MIMEText
def send_reset_email(user):
    token = generate_reset_token(user)
    reset_link = url_for('auth.reset_password', token=token, _external=True)
    subject = 'Recuperação de senha'
    body = f'Olá,\n\nClique no link para redefinir sua senha: {reset_link}\nSe não solicitou, ignore este e-mail.'
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = current_app.config.get('MAIL_DEFAULT_SENDER', 'no-reply@ivillar.com.br')
    msg['To'] = user.email
    try:
        server = smtplib.SMTP(current_app.config['MAIL_SERVER'], current_app.config['MAIL_PORT'])
        if current_app.config.get('MAIL_USE_TLS'):
            server.starttls()
        server.login(current_app.config['MAIL_USERNAME'], current_app.config['MAIL_PASSWORD'])
        server.sendmail(msg['From'], [msg['To']], msg.as_string())
        server.quit()
    except Exception as e:
        print(f'Erro ao enviar e-mail: {e}')

# --- IMPORTS E DEFINIÇÃO DO BLUEPRINT ---
from flask import Blueprint, request, render_template, redirect, url_for, flash, session, jsonify
from models import db, User, UserType, UserStatus, ClienteProfile, CorretorProfile, ImobiliariaProfile
from auth import auth_system
from datetime import datetime
import re

# Blueprint para autenticação
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# --- Teste de envio de e-mail de recuperação ---
@auth_bp.route('/test-send-email')
def test_send_email():
    from email_utils import MAIL_DEFAULT_SENDER
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    test_email = 'vilar.daniel@gmail.com'  # E-mail real para teste
    subject = 'Teste de envio SMTP – iVillar Platform'
    body = '''\
Olá,

Este é um teste de envio SMTP direto do script Python.
Se você recebeu este e-mail, a autenticação está funcionando corretamente.

Você recebeu o segundo email de confirmação que está ok.

Atenciosamente,
Equipe iVillar
'''
    msg = MIMEMultipart()
    msg['From'] = MAIL_DEFAULT_SENDER
    msg['To'] = test_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))
    try:
        from mail_config import MAIL_SERVER, MAIL_PORT, MAIL_USE_SSL, MAIL_USERNAME, MAIL_PASSWORD
        if MAIL_USE_SSL:
            server = smtplib.SMTP_SSL(MAIL_SERVER, MAIL_PORT)
        else:
            server = smtplib.SMTP(MAIL_SERVER, MAIL_PORT)
            server.starttls()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.sendmail(MAIL_DEFAULT_SENDER, test_email, msg.as_string())
        server.quit()
        return 'E-mail de teste enviado com sucesso!'
    except Exception as e:
        return f'Erro ao enviar e-mail: {e}'
# --- Esqueci minha senha (robusto) ---
from datetime import timedelta

@auth_bp.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        if not email:
            flash('Informe o email cadastrado.', 'error')
            return render_template('auth/forgot_password.html')
        user = User.query.filter_by(email=email).first()
        if not user:
            flash('Se o email existir, você receberá instruções para redefinir a senha.', 'info')
            return render_template('auth/forgot_password.html')
        import secrets
        token = secrets.token_urlsafe(48)
        expires_at = datetime.utcnow() + timedelta(hours=1)
        # Invalida tokens antigos não usados
        reset_link = url_for('auth.reset_password', token=token, _external=True)

        try:
            send_reset_email(user.email, reset_link)
            flash('Se o email existir, você receberá instruções para redefinir a senha.', 'info')
        except Exception as e:
            pass


        # Atualizar último login
        user.last_login = datetime.utcnow()
        db.session.commit()

        flash(f'Bem-vindo(a), {user.nome}!', 'success')

        # Redirecionar baseado no tipo de usuário
        if user.user_type == UserType.ADMIN:
            return redirect(url_for('admin.dashboard'))
        elif user.user_type == UserType.CORRETOR:
            return redirect(url_for('corretor.dashboard'))
        elif user.user_type == UserType.IMOBILIARIA:
            return redirect(url_for('imobiliaria.dashboard'))
        elif user.user_type == UserType.CLIENTE:
            return redirect(url_for('cliente.dashboard'))
        else:
            return redirect(url_for('index'))

    return render_template('auth/login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """Página de cadastro - escolher tipo de usuário"""
    if request.method == 'POST':
        user_type = request.form.get('user_type')
        
        if user_type == 'cliente':
            return redirect(url_for('auth.register_cliente'))
        elif user_type == 'corretor':
            return redirect(url_for('auth.register_corretor'))
        elif user_type == 'imobiliaria':
            return redirect(url_for('auth.register_imobiliaria'))
        else:
            flash('Selecione um tipo de usuário válido', 'error')
    
    return render_template('auth/register.html')

@auth_bp.route('/register/cliente', methods=['GET', 'POST'])
def register_cliente():
    """Cadastro de cliente"""
    if request.method == 'POST':
        # Dados básicos
        nome = request.form.get('nome', '').strip()
        email = request.form.get('email', '').strip().lower()
        telefone = request.form.get('telefone', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        # Dados específicos do cliente
        cpf = request.form.get('cpf', '').strip()
        
        # Validações
        errors = []
        
        if not all([nome, email, password, cpf]):
            errors.append('Todos os campos obrigatórios devem ser preenchidos')
        
        if password != confirm_password:
            errors.append('Senhas não coincidem')
        
        # Validar senha
        password_validation = auth_system.validate_password(password)
        if not password_validation['valid']:
            errors.extend(password_validation['errors'])
        
        # Validar CPF
        if not auth_system.validate_cpf(cpf):
            errors.append('CPF inválido')
        
        # Verificar se email já existe
        if User.query.filter_by(email=email).first():
            errors.append('Este email já está cadastrado')
        
        # Verificar se CPF já existe
        existing_cpf = ClienteProfile.query.filter_by(cpf=cpf).first()
        if existing_cpf:
            errors.append('Este CPF já está cadastrado')
        
        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('auth/register_cliente.html', form_data=request.form)
        
        try:
            # Criar usuário
            user = User(
                email=email,
                password_hash=auth_system.hash_password(password),
                user_type=UserType.CLIENTE,
                nome=nome,
                telefone=telefone,
                status=UserStatus.ATIVO
            )
            db.session.add(user)
            db.session.flush()  # Para obter o ID
            
            # Criar perfil do cliente
            cliente_profile = ClienteProfile(
                user_id=user.id,
                cpf=cpf
            )
            db.session.add(cliente_profile)
            
            db.session.commit()
            
            flash('Cadastro realizado com sucesso! Faça login para continuar.', 'success')
            return redirect(url_for('auth.login'))
            
        except Exception as e:
            db.session.rollback()
            flash('Erro interno do servidor. Tente novamente.', 'error')
            print(f"Erro no cadastro de cliente: {str(e)}")
    
    return render_template('auth/register_cliente.html')

@auth_bp.route('/register/corretor', methods=['GET', 'POST'])
def register_corretor():
    """Cadastro de corretor"""
    if request.method == 'POST':
        # Dados básicos
        nome = request.form.get('nome', '').strip()
        email = request.form.get('email', '').strip().lower()
        telefone = request.form.get('telefone', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        # Dados específicos do corretor
        cpf = request.form.get('cpf', '').strip()
        creci = request.form.get('creci', '').strip()
        
        # Validações
        errors = []
        
        if not all([nome, email, password, cpf, creci]):
            errors.append('Todos os campos obrigatórios devem ser preenchidos')
        
        if password != confirm_password:
            errors.append('Senhas não coincidem')
        
        # Validar senha
        password_validation = auth_system.validate_password(password)
        if not password_validation['valid']:
            errors.extend(password_validation['errors'])
        
        # Validar CPF
        if not auth_system.validate_cpf(cpf):
            errors.append('CPF inválido')
        
        # Verificar se email já existe
        if User.query.filter_by(email=email).first():
            errors.append('Este email já está cadastrado')
        
        # Verificar se CPF já existe
        existing_cpf = CorretorProfile.query.filter_by(cpf=cpf).first()
        if existing_cpf:
            errors.append('Este CPF já está cadastrado')
        
        # Verificar se CRECI já existe
        existing_creci = CorretorProfile.query.filter_by(creci=creci).first()
        if existing_creci:
            errors.append('Este CRECI já está cadastrado')
        
        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('auth/register_corretor.html', form_data=request.form)
        
        try:
            # Criar usuário
            user = User(
                email=email,
                password_hash=auth_system.hash_password(password),
                user_type=UserType.CORRETOR,
                nome=nome,
                telefone=telefone,
                status=UserStatus.PENDENTE  # Corretor precisa de aprovação
            )
            db.session.add(user)
            db.session.flush()
            
            # Criar perfil do corretor
            corretor_profile = CorretorProfile(
                user_id=user.id,
                cpf=cpf,
                creci=creci,
                ativo_para_leads=False  # Ativo apenas após aprovação
            )
            db.session.add(corretor_profile)
            
            db.session.commit()
            
            flash('Cadastro enviado com sucesso! Sua conta será analisada e você receberá um email de confirmação.', 'success')
            return redirect(url_for('auth.login'))
            
        except Exception as e:
            db.session.rollback()
            flash('Erro interno do servidor. Tente novamente.', 'error')
            print(f"Erro no cadastro de corretor: {str(e)}")
    
    return render_template('auth/register_corretor.html')

@auth_bp.route('/register/imobiliaria', methods=['GET', 'POST'])
def register_imobiliaria():
    """Cadastro de imobiliária"""
    if request.method == 'POST':
        # Dados básicos
        email = request.form.get('email', '').strip().lower()
        telefone = request.form.get('telefone', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        # Dados da empresa
        razao_social = request.form.get('razao_social', '').strip()
        nome_fantasia = request.form.get('nome_fantasia', '').strip()
        cnpj = request.form.get('cnpj', '').strip()
        creci_empresa = request.form.get('creci_empresa', '').strip()
        
        # Dados do responsável
        responsavel_nome = request.form.get('responsavel_nome', '').strip()
        responsavel_cpf = request.form.get('responsavel_cpf', '').strip()
        
        # Validações
        errors = []
        
        required_fields = [email, password, razao_social, cnpj, responsavel_nome, responsavel_cpf]
        if not all(required_fields):
            errors.append('Todos os campos obrigatórios devem ser preenchidos')
        
        if password != confirm_password:
            errors.append('Senhas não coincidem')
        
        # Validar senha
        password_validation = auth_system.validate_password(password)
        if not password_validation['valid']:
            errors.extend(password_validation['errors'])
        
        # Validar CNPJ
        if not auth_system.validate_cnpj(cnpj):
            errors.append('CNPJ inválido')
        
        # Validar CPF do responsável
        if not auth_system.validate_cpf(responsavel_cpf):
            errors.append('CPF do responsável inválido')
        
        # Verificar se email já existe
        if User.query.filter_by(email=email).first():
            errors.append('Este email já está cadastrado')
        
        # Verificar se CNPJ já existe
        existing_cnpj = ImobiliariaProfile.query.filter_by(cnpj=cnpj).first()
        if existing_cnpj:
            errors.append('Este CNPJ já está cadastrado')
        
        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('auth/register_imobiliaria.html', form_data=request.form)
        
        try:
            # Criar usuário
            user = User(
                email=email,
                password_hash=auth_system.hash_password(password),
                user_type=UserType.IMOBILIARIA,
                nome=nome_fantasia or razao_social,
                telefone=telefone,
                status=UserStatus.PENDENTE  # Imobiliária precisa de aprovação
            )
            db.session.add(user)
            db.session.flush()
            
            # Criar perfil da imobiliária
            imobiliaria_profile = ImobiliariaProfile(
                user_id=user.id,
                razao_social=razao_social,
                nome_fantasia=nome_fantasia,
                cnpj=cnpj,
                creci_empresa=creci_empresa,
                responsavel_nome=responsavel_nome,
                responsavel_cpf=responsavel_cpf
            )
            db.session.add(imobiliaria_profile)
            
            db.session.commit()
            
            flash('Cadastro enviado com sucesso! Sua conta será analisada e você receberá um email de confirmação.', 'success')
            return redirect(url_for('auth.login'))
            
        except Exception as e:
            db.session.rollback()
            flash('Erro interno do servidor. Tente novamente.', 'error')
            print(f"Erro no cadastro de imobiliária: {str(e)}")
    
    return render_template('auth/register_imobiliaria.html')

@auth_bp.route('/logout')
def logout():
    """Fazer logout"""
    session.clear()
    flash('Logout realizado com sucesso', 'success')
    return redirect(url_for('index'))

@auth_bp.route('/profile')
def profile():
    """Página de perfil do usuário"""
    if 'user_id' not in session:
        flash('Você precisa fazer login para acessar esta página', 'error')
        return redirect(url_for('auth.login'))
    
    user = User.query.get(session['user_id'])
    if not user:
        session.clear()
        flash('Usuário não encontrado', 'error')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/profile.html', user=user)

# API Endpoints para AJAX
@auth_bp.route('/api/check-email', methods=['POST'])
def check_email():
    """Verificar se email já está em uso (API)"""
    email = request.json.get('email', '').strip().lower()
    
    if not email:
        return jsonify({'available': False, 'message': 'Email é obrigatório'})
    
    # Validar formato
    if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
        return jsonify({'available': False, 'message': 'Formato de email inválido'})
    
    # Verificar se existe
    existing_user = User.query.filter_by(email=email).first()
    
    if existing_user:
        return jsonify({'available': False, 'message': 'Este email já está cadastrado'})
    
    return jsonify({'available': True, 'message': 'Email disponível'})

@auth_bp.route('/api/validate-document', methods=['POST'])
def validate_document():
    """Validar CPF ou CNPJ (API)"""
    document = request.json.get('document', '').strip()
    doc_type = request.json.get('type', '')  # 'cpf' ou 'cnpj'
    
    if not document:
        return jsonify({'valid': False, 'message': 'Documento é obrigatório'})
    
    if doc_type == 'cpf':
        valid = auth_system.validate_cpf(document)
        message = 'CPF válido' if valid else 'CPF inválido'
        
        # Verificar se CPF já existe
        if valid:
            existing_cpf = ClienteProfile.query.filter_by(cpf=document).first() or \
                          CorretorProfile.query.filter_by(cpf=document).first()
            if existing_cpf:
                return jsonify({'valid': False, 'message': 'Este CPF já está cadastrado'})
                
    elif doc_type == 'cnpj':
        valid = auth_system.validate_cnpj(document)
        message = 'CNPJ válido' if valid else 'CNPJ inválido'
        
        # Verificar se CNPJ já existe
        if valid:
            existing_cnpj = ImobiliariaProfile.query.filter_by(cnpj=document).first()
            if existing_cnpj:
                return jsonify({'valid': False, 'message': 'Este CNPJ já está cadastrado'})
    else:
        return jsonify({'valid': False, 'message': 'Tipo de documento inválido'})
    
    return jsonify({'valid': valid, 'message': message})