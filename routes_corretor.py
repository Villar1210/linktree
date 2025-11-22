# 💼 Dashboard Corretor - iVillar Platform
from flask import Blueprint, request, render_template, redirect, url_for, flash, session, jsonify
from models import db, User, UserType, UserStatus
from datetime import datetime

# Blueprint para corretor
corretor_bp = Blueprint('corretor', __name__, url_prefix='/corretor')

def corretor_required():
    """Decorator para verificar se é corretor"""
    if 'user_id' not in session:
        flash('Você precisa fazer login para acessar esta área', 'error')
        return redirect(url_for('auth.login'))
    
    user = User.query.get(session['user_id'])
    if not user or user.user_type != UserType.CORRETOR:
        flash('Acesso negado. Apenas corretores podem acessar esta área.', 'error')
        return redirect(url_for('index'))
    
    if user.status != UserStatus.ATIVO:
        flash('Sua conta ainda está pendente de aprovação.', 'warning')
        return redirect(url_for('index'))
    
    return None

@corretor_bp.before_request
def check_corretor():
    """Verificar corretor antes de cada requisição"""
    result = corretor_required()
    if result:
        return result

@corretor_bp.route('/dashboard')
def dashboard():
    """Dashboard principal do corretor"""
    user = User.query.get(session['user_id'])
    corretor = user.corretor_profile
    
    if not corretor:
        flash('Perfil de corretor não encontrado.', 'error')
        return redirect(url_for('index'))
    
    # Estatísticas do corretor
    stats = {
        'total_properties': len(corretor.properties) if hasattr(corretor, 'properties') else 0,
        'total_leads': len(corretor.leads) if hasattr(corretor, 'leads') else 0,
        'leads_novos': len([l for l in (corretor.leads or []) if getattr(l, 'status', '') == 'novo']),
        'vendas_mes': corretor.vendas_realizadas_mes or 0,
        'meta_vendas': float(corretor.meta_vendas_mes or 0),
        'comissao_media': float(corretor.comissao_padrao or 6.0),
    }
    
    # Calcular percentual da meta
    if stats['meta_vendas'] > 0:
        stats['percentual_meta'] = (stats['vendas_mes'] / stats['meta_vendas']) * 100
    else:
        stats['percentual_meta'] = 0
    
    # Últimos leads
    recent_leads = []
    if hasattr(corretor, 'leads'):
        recent_leads = sorted(
            corretor.leads, 
            key=lambda x: getattr(x, 'created_at', datetime.min), 
            reverse=True
        )[:5]
    
    # Propriedades ativas
    active_properties = []
    if hasattr(corretor, 'properties'):
        active_properties = [p for p in corretor.properties if getattr(p, 'status', '') == 'disponivel']
    
    return render_template('corretor/dashboard.html', 
                         user=user,
                         corretor=corretor,
                         stats=stats,
                         recent_leads=recent_leads,
                         active_properties=active_properties)

@corretor_bp.route('/leads')
def leads():
    """Listar leads do corretor"""
    user = User.query.get(session['user_id'])
    corretor = user.corretor_profile
    
    page = request.args.get('page', 1, type=int)
    status_filter = request.args.get('status', 'todos')
    
    # Como não temos Lead model completo ainda, vamos simular
    leads = []
    
    return render_template('corretor/leads.html', 
                         leads=leads,
                         status_filter=status_filter)

@corretor_bp.route('/properties')
def properties():
    """Listar imóveis do corretor"""
    user = User.query.get(session['user_id'])
    corretor = user.corretor_profile
    
    # Propriedades do corretor (simulado por enquanto)
    properties = []
    
    return render_template('corretor/properties.html', 
                         properties=properties)

@corretor_bp.route('/profile')
def profile():
    """Perfil do corretor"""
    user = User.query.get(session['user_id'])
    corretor = user.corretor_profile
    
    return render_template('corretor/profile.html', 
                         user=user,
                         corretor=corretor)

@corretor_bp.route('/profile/edit', methods=['GET', 'POST'])
def edit_profile():
    """Editar perfil do corretor"""
    user = User.query.get(session['user_id'])
    corretor = user.corretor_profile
    
    if request.method == 'POST':
        # Atualizar dados básicos
        user.nome = request.form.get('nome', user.nome)
        user.telefone = request.form.get('telefone', user.telefone)
        
        # Atualizar dados do corretor
        corretor.biografia = request.form.get('biografia', corretor.biografia)
        corretor.especializacoes = request.form.getlist('especializacoes')
        corretor.regioes_atuacao = request.form.getlist('regioes_atuacao')
        corretor.anos_experiencia = int(request.form.get('anos_experiencia', 0)) or corretor.anos_experiencia
        
        try:
            db.session.commit()
            flash('Perfil atualizado com sucesso!', 'success')
            return redirect(url_for('corretor.profile'))
        except Exception as e:
            db.session.rollback()
            flash('Erro ao atualizar perfil.', 'error')
    
    return render_template('corretor/edit_profile.html', 
                         user=user,
                         corretor=corretor)

@corretor_bp.route('/api/stats')
def api_stats():
    """API para estatísticas do corretor"""
    user = User.query.get(session['user_id'])
    corretor = user.corretor_profile
    
    stats = {
        'total_properties': len(corretor.properties) if hasattr(corretor, 'properties') else 0,
        'total_leads': len(corretor.leads) if hasattr(corretor, 'leads') else 0,
        'vendas_mes': corretor.vendas_realizadas_mes or 0,
        'meta_vendas': float(corretor.meta_vendas_mes or 0),
    }
    
    return jsonify(stats)