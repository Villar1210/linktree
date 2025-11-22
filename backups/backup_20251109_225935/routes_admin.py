# 👑 Dashboard Admin - iVillar Platform
from flask import Blueprint, request, render_template, redirect, url_for, flash, session, jsonify
from models import db, User, UserType, UserStatus, ClienteProfile, CorretorProfile, ImobiliariaProfile, Property, Lead
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import json

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

@admin_bp.before_request
def check_admin():
    """Verificar admin antes de cada requisição"""
    result = admin_required()
    if result:
        return result

@admin_bp.route('/dashboard')
def dashboard():
    """Dashboard principal do administrador"""
    # Estatísticas gerais
    stats = {
        'total_users': User.query.count(),
        'clientes': User.query.filter_by(user_type=UserType.CLIENTE).count(),
        'corretores': User.query.filter_by(user_type=UserType.CORRETOR).count(),
        'imobiliarias': User.query.filter_by(user_type=UserType.IMOBILIARIA).count(),
        'usuarios_ativos': User.query.filter_by(status=UserStatus.ATIVO).count(),
        'usuarios_pendentes': User.query.filter_by(status=UserStatus.PENDENTE).count(),
        'total_properties': Property.query.count() if hasattr(db, 'Property') else 0,
        'total_leads': Lead.query.count() if hasattr(db, 'Lead') else 0,
    }
    
    # Últimos usuários cadastrados
    recent_users = User.query.order_by(desc(User.created_at)).limit(5).all()
    
    # Usuários pendentes de aprovação
    pending_users = User.query.filter_by(status=UserStatus.PENDENTE).all()
    
    # Estatísticas por período (últimos 30 dias)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_registrations = db.session.query(
        func.date(User.created_at).label('date'),
        func.count(User.id).label('count')
    ).filter(
        User.created_at >= thirty_days_ago
    ).group_by(
        func.date(User.created_at)
    ).order_by('date').all()
    
    return render_template('admin/dashboard.html', 
                         stats=stats,
                         recent_users=recent_users,
                         pending_users=pending_users,
                         recent_registrations=recent_registrations)

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
    
    return redirect(url_for('admin.user_detail', user_id=user_id))

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
    
    return redirect(url_for('admin.user_detail', user_id=user_id))

@admin_bp.route('/user/<int:user_id>/activate', methods=['POST'])
def activate_user(user_id):
    """Ativar usuário"""
    user = User.query.get_or_404(user_id)
    
    user.status = UserStatus.ATIVO
    db.session.commit()
    
    flash(f'Usuário {user.nome} ativado.', 'success')
    
    return redirect(url_for('admin.user_detail', user_id=user_id))

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