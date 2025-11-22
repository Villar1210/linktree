# 👑 Dashboard Admin - iVillar Platform - Complete Version
from flask import Blueprint, request, render_template, redirect, url_for, flash, session, jsonify
from models import db, User, UserType, UserStatus
from auth import auth_system
from sqlalchemy import desc
import json
import os

# Blueprint para admin
admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

def admin_required():
    """Decorator para verificar se é admin"""
    if 'user_id' not in session:
        flash('Você precisa fazer login para acessar esta área', 'error')
        return redirect(url_for('auth.login'))
    
    user = User.query.get(session['user_id'])
    if not user or user.user_type != UserType.ADMIN:
        flash('Acesso negado. Apenas administradores podem acessar esta área.', 'error')
        return redirect(url_for('index'))
    
    return None

def load_config():
    """Carrega configurações do arquivo JSON"""
    try:
        with open('data/config.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return {
            'email_principal': '',
            'email_vendas': '',
            'email_rh': '',
            'email_suporte': '',
            'smtp_server': 'smtp.gmail.com',
            'smtp_port': 587,
            'smtp_user': '',
            'smtp_password': '',
            'facebook_url': '',
            'facebook_page_id': '',
            'instagram_url': '',
            'instagram_username': '',
            'linkedin_url': '',
            'youtube_url': '',
            'whatsapp_daniel': '(11) 99123-4567',
            'whatsapp_vendas': '(11) 99876-5432',
            'whatsapp_suzano': '(11) 99555-0001',
            'whatsapp_mogi': '(11) 99555-0002',
            'daniel_message': 'Olá! Gostaria de mais informações sobre os imóveis disponíveis.',
            'vendas_message': 'Olá! Tenho interesse em conhecer os empreendimentos da iVillar.',
            'company_name': 'iVillar Platform',
            'company_cnpj': '00.000.000/0001-00',
            'company_phone': '(11) 3456-7890',
            'company_address': 'São Paulo, SP',
            'business_hours': '09:00 - 18:00',
            'primary_color': '#2563eb',
            'secondary_color': '#1e40af'
        }

def save_config(config_data):
    """Salva configurações no arquivo JSON"""
    try:
        os.makedirs('data', exist_ok=True)
        with open('data/config.json', 'w', encoding='utf-8') as f:
            json.dump(config_data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Erro ao salvar config: {e}")
        return False

@admin_bp.before_request
def check_admin():
    """Verificar admin antes de cada requisição"""
    result = admin_required()
    if result:
        return result

@admin_bp.route('/dashboard')
def dashboard():
    """Dashboard principal completo do administrador"""
    # Estatísticas gerais
    stats = {
        'total_users': User.query.count(),
        'clientes': User.query.filter_by(user_type=UserType.CLIENTE).count(),
        'corretores': User.query.filter_by(user_type=UserType.CORRETOR).count(),
        'imobiliarias': User.query.filter_by(user_type=UserType.IMOBILIARIA).count(),
        'usuarios_ativos': User.query.filter_by(status=UserStatus.ATIVO).count(),
        'usuarios_pendentes': User.query.filter_by(status=UserStatus.PENDENTE).count(),
        'total_properties': 6,  # Número atual de imóveis
        'total_leads': 0,
    }
    
    # Todos os usuários para a lista
    users = User.query.order_by(desc(User.created_at)).all()
    
    # Configurações atuais
    config = load_config()
    
    return render_template('admin/dashboard-complete.html', 
                         stats=stats,
                         users=users,
                         config=config)

@admin_bp.route('/users')
def users():
    """Listar todos os usuários"""
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    user_type_filter = request.args.get('type', '')
    status_filter = request.args.get('status', '')
    
    query = User.query
    
    # Filtros
    if search:
        query = query.filter(
            db.or_(
                User.nome.contains(search),
                User.email.contains(search)
            )
        )
    
    if user_type_filter and user_type_filter != 'all':
        query = query.filter(User.user_type == UserType(user_type_filter))
    
    if status_filter and status_filter != 'all':
        query = query.filter(User.status == UserStatus(status_filter))
    
    users = query.order_by(desc(User.created_at)).paginate(
        page=page, per_page=20, error_out=False
    )
    
    return render_template('admin/users.html', 
                         users=users,
                         search=search,
                         user_type_filter=user_type_filter,
                         status_filter=status_filter)

@admin_bp.route('/add-user', methods=['POST'])
def add_user():
    """Adicionar novo usuário"""
    nome = request.form.get('nome')
    email = request.form.get('email')
    tipo = request.form.get('tipo')
    senha = request.form.get('senha')
    
    # Verificar se email já existe
    if User.query.filter_by(email=email).first():
        flash('E-mail já cadastrado!', 'error')
        return redirect(url_for('admin.dashboard'))
    
    try:
        # Criar usuário usando o sistema de auth existente
        result = auth_system.register_user(email, senha, nome, UserType(tipo))
        
        if result['success']:
            # Aprovar automaticamente usuários criados pelo admin
            user = User.query.filter_by(email=email).first()
            if user:
                user.status = UserStatus.ATIVO
                db.session.commit()
            
            flash(f'Usuário {nome} adicionado e aprovado com sucesso!', 'success')
        else:
            flash(f'Erro ao adicionar usuário: {result.get("message", "Erro desconhecido")}', 'error')
    
    except Exception as e:
        flash(f'Erro ao adicionar usuário: {str(e)}', 'error')
    
    return redirect(url_for('admin.dashboard'))

@admin_bp.route('/user/<int:user_id>')
def user_detail(user_id):
    """Detalhes de um usuário específico"""
    user = User.query.get_or_404(user_id)
    return render_template('admin/user_detail.html', user=user)

@admin_bp.route('/user/<int:user_id>/approve', methods=['POST'])
def approve_user(user_id):
    """Aprovar usuário pendente"""
    user = User.query.get_or_404(user_id)
    
    if user.status == UserStatus.PENDENTE:
        user.status = UserStatus.ATIVO
        db.session.commit()
        flash(f'Usuário {user.nome} aprovado com sucesso!', 'success')
    else:
        flash('Usuário não está pendente de aprovação.', 'warning')
    
    return redirect(url_for('admin.dashboard'))

@admin_bp.route('/user/<int:user_id>/suspend', methods=['POST'])
def suspend_user(user_id):
    """Suspender usuário"""
    user = User.query.get_or_404(user_id)
    
    if user.user_type == UserType.ADMIN:
        flash('Não é possível suspender outro administrador.', 'error')
    else:
        user.status = UserStatus.SUSPENSO
        db.session.commit()
        flash(f'Usuário {user.nome} suspenso.', 'success')
    
    return redirect(url_for('admin.dashboard'))

@admin_bp.route('/user/<int:user_id>/activate', methods=['POST'])
def activate_user(user_id):
    """Ativar usuário"""
    user = User.query.get_or_404(user_id)
    
    user.status = UserStatus.ATIVO
    db.session.commit()
    flash(f'Usuário {user.nome} ativado.', 'success')
    
    return redirect(url_for('admin.dashboard'))

@admin_bp.route('/user/<int:user_id>/delete', methods=['POST'])
def delete_user(user_id):
    """Excluir usuário"""
    user = User.query.get_or_404(user_id)
    
    if user.user_type == UserType.ADMIN:
        flash('Não é possível excluir outro administrador.', 'error')
    else:
        try:
            db.session.delete(user)
            db.session.commit()
            flash(f'Usuário {user.nome} excluído com sucesso.', 'success')
        except Exception as e:
            db.session.rollback()
            flash(f'Erro ao excluir usuário: {str(e)}', 'error')
    
    return redirect(url_for('admin.dashboard'))

@admin_bp.route('/save-email-config', methods=['POST'])
def save_email_config():
    """Salvar configurações de e-mail"""
    config = load_config()
    
    # Atualizar configurações de e-mail
    config.update({
        'email_principal': request.form.get('email_principal', ''),
        'email_vendas': request.form.get('email_vendas', ''),
        'email_rh': request.form.get('email_rh', ''),
        'email_suporte': request.form.get('email_suporte', ''),
        'smtp_server': request.form.get('smtp_server', 'smtp.gmail.com'),
        'smtp_port': int(request.form.get('smtp_port', 587)),
        'smtp_user': request.form.get('smtp_user', ''),
    })
    
    # Salvar senha SMTP apenas se fornecida
    if request.form.get('smtp_password'):
        config['smtp_password'] = request.form.get('smtp_password')
    
    if save_config(config):
        flash('Configurações de e-mail salvas com sucesso!', 'success')
    else:
        flash('Erro ao salvar configurações de e-mail.', 'error')
    
    return redirect(url_for('admin.dashboard'))

@admin_bp.route('/save-social-config', methods=['POST'])
def save_social_config():
    """Salvar configurações de redes sociais"""
    config = load_config()
    
    # Atualizar configurações de redes sociais
    config.update({
        'facebook_url': request.form.get('facebook_url', ''),
        'facebook_page_id': request.form.get('facebook_page_id', ''),
        'instagram_url': request.form.get('instagram_url', ''),
        'instagram_username': request.form.get('instagram_username', ''),
        'linkedin_url': request.form.get('linkedin_url', ''),
        'youtube_url': request.form.get('youtube_url', ''),
    })
    
    if save_config(config):
        flash('Configurações de redes sociais salvas com sucesso!', 'success')
    else:
        flash('Erro ao salvar configurações de redes sociais.', 'error')
    
    return redirect(url_for('admin.dashboard'))

@admin_bp.route('/save-whatsapp-config', methods=['POST'])
def save_whatsapp_config():
    """Salvar configurações de WhatsApp"""
    config = load_config()
    
    # Atualizar configurações de WhatsApp
    config.update({
        'whatsapp_daniel': request.form.get('whatsapp_daniel', ''),
        'whatsapp_vendas': request.form.get('whatsapp_vendas', ''),
        'whatsapp_suzano': request.form.get('whatsapp_suzano', ''),
        'whatsapp_mogi': request.form.get('whatsapp_mogi', ''),
        'daniel_message': request.form.get('daniel_message', ''),
        'vendas_message': request.form.get('vendas_message', ''),
    })
    
    if save_config(config):
        flash('Configurações de WhatsApp salvas com sucesso!', 'success')
    else:
        flash('Erro ao salvar configurações de WhatsApp.', 'error')
    
    return redirect(url_for('admin.dashboard'))

@admin_bp.route('/save-general-config', methods=['POST'])
def save_general_config():
    """Salvar configurações gerais"""
    config = load_config()
    
    # Atualizar configurações gerais
    config.update({
        'company_name': request.form.get('company_name', ''),
        'company_cnpj': request.form.get('company_cnpj', ''),
        'company_phone': request.form.get('company_phone', ''),
        'company_address': request.form.get('company_address', ''),
        'business_hours': request.form.get('business_hours', ''),
        'primary_color': request.form.get('primary_color', '#2563eb'),
        'secondary_color': request.form.get('secondary_color', '#1e40af'),
    })
    
    if save_config(config):
        flash('Configurações gerais salvas com sucesso!', 'success')
    else:
        flash('Erro ao salvar configurações gerais.', 'error')
    
    return redirect(url_for('admin.dashboard'))

@admin_bp.route('/settings')
def settings():
    """Configurações do sistema"""
    return render_template('admin/settings.html')

@admin_bp.route('/api/stats')
def api_stats():
    """API para estatísticas em tempo real"""
    stats = {
        'total_users': User.query.count(),
        'active_users': User.query.filter_by(status=UserStatus.ATIVO).count(),
        'pending_users': User.query.filter_by(status=UserStatus.PENDENTE).count(),
        'corretores_ativos': User.query.filter_by(
            user_type=UserType.CORRETOR, 
            status=UserStatus.ATIVO
        ).count(),
    }
    
    return jsonify(stats)