# 🏢 Dashboard Imobiliária - iVillar Platform
from flask import Blueprint, request, render_template, redirect, url_for, flash, session, jsonify
from models import db, User, UserType, UserStatus, CorretorProfile
from datetime import datetime, timedelta

# Blueprint para imobiliária
imobiliaria_bp = Blueprint('imobiliaria', __name__, url_prefix='/imobiliaria')

def imobiliaria_required():
    """Decorator para verificar se é imobiliária"""
    if 'user_id' not in session:
        flash('Você precisa fazer login para acessar esta área', 'error')
        return redirect(url_for('auth.login'))
    
    user = User.query.get(session['user_id'])
    if not user or user.user_type != UserType.IMOBILIARIA:
        flash('Acesso negado. Apenas imobiliárias podem acessar esta área.', 'error')
        return redirect(url_for('index'))
    
    if user.status != UserStatus.ATIVO:
        flash('Sua conta ainda está pendente de aprovação.', 'warning')
        return redirect(url_for('index'))
    
    return None

@imobiliaria_bp.before_request
def check_imobiliaria():
    """Verificar imobiliária antes de cada requisição"""
    result = imobiliaria_required()
    if result:
        return result

@imobiliaria_bp.route('/dashboard')
def dashboard():
    """Dashboard principal da imobiliária"""
    user = User.query.get(session['user_id'])
    imobiliaria = user.imobiliaria_profile
    
    if not imobiliaria:
        flash('Perfil de imobiliária não encontrado.', 'error')
        return redirect(url_for('index'))
    
    # Estatísticas da imobiliária
    stats = {
        'total_corretores': len(imobiliaria.corretores) if hasattr(imobiliaria, 'corretores') else 0,
        'corretores_ativos': len([c for c in (imobiliaria.corretores or []) if c.user.status == UserStatus.ATIVO]),
        'total_imoveis': 0,  # Será calculado baseado nos corretores
        'leads_mes': 0,
        'vendas_mes': 0,
        'limite_corretores': imobiliaria.limite_corretores,
        'limite_imoveis': imobiliaria.limite_imoveis,
        'plano_ativo': imobiliaria.plano_ativo,
    }
    
    # Calcular imóveis e leads da equipe
    total_imoveis = 0
    total_leads = 0
    if hasattr(imobiliaria, 'corretores'):
        for corretor in imobiliaria.corretores:
            if hasattr(corretor, 'properties'):
                total_imoveis += len(corretor.properties)
            if hasattr(corretor, 'leads'):
                total_leads += len(corretor.leads)
    
    stats['total_imoveis'] = total_imoveis
    stats['leads_mes'] = total_leads
    
    # Top corretores da imobiliária (consulta otimizada)
    from sqlalchemy.orm import joinedload
    top_corretores = []
    if hasattr(imobiliaria, 'corretores'):
        top_corretores = CorretorProfile.query.options(joinedload('user')).filter_by(imobiliaria_id=imobiliaria.id)
        top_corretores = top_corretores.order_by(CorretorProfile.vendas_realizadas_mes.desc().nullslast()).limit(5).all()
    
    # Atividades recentes
    recent_activities = [
        {
            'tipo': 'novo_corretor',
            'descricao': 'Novo corretor adicionado à equipe',
            'data': datetime.utcnow() - timedelta(hours=3)
        },
        {
            'tipo': 'lead',
            'descricao': 'Novo lead recebido',
            'data': datetime.utcnow() - timedelta(hours=5)
        }
    ]
    
    return render_template('imobiliaria/dashboard.html', 
                         user=user,
                         imobiliaria=imobiliaria,
                         stats=stats,
                         top_corretores=top_corretores,
                         recent_activities=recent_activities)

@imobiliaria_bp.route('/corretores')
def corretores():
    """Listar corretores da imobiliária"""
    user = User.query.get(session['user_id'])
    imobiliaria = user.imobiliaria_profile
    
    corretores = imobiliaria.corretores if hasattr(imobiliaria, 'corretores') else []
    
    return render_template('imobiliaria/corretores.html', 
                         corretores=corretores,
                         imobiliaria=imobiliaria)

@imobiliaria_bp.route('/corretor/<int:corretor_id>')
def corretor_detail(corretor_id):
    """Detalhes de um corretor específico"""
    user = User.query.get(session['user_id'])
    imobiliaria = user.imobiliaria_profile
    
    corretor = CorretorProfile.query.filter_by(
        id=corretor_id,
        imobiliaria_id=imobiliaria.id
    ).first_or_404()
    
    # Estatísticas do corretor
    stats = {
        'total_properties': len(corretor.properties) if hasattr(corretor, 'properties') else 0,
        'total_leads': len(corretor.leads) if hasattr(corretor, 'leads') else 0,
        'vendas_mes': corretor.vendas_realizadas_mes or 0,
        'meta_vendas': float(corretor.meta_vendas_mes or 0),
    }
    
    return render_template('imobiliaria/corretor_detail.html',
                         corretor=corretor,
                         stats=stats)

@imobiliaria_bp.route('/imoveis')
def imoveis():
    """Listar todos os imóveis da imobiliária"""
    user = User.query.get(session['user_id'])
    imobiliaria = user.imobiliaria_profile
    
    # Paginação de imóveis
    page = request.args.get('page', 1, type=int)
    per_page = 20
    from models import Property
    properties_query = Property.query.join(CorretorProfile).filter(CorretorProfile.imobiliaria_id == imobiliaria.id)
    properties_pagination = properties_query.paginate(page=page, per_page=per_page, error_out=False)
    return render_template('imobiliaria/imoveis.html',
                         properties=properties_pagination.items,
                         pagination=properties_pagination)

@imobiliaria_bp.route('/leads')
def leads():
    """Listar todos os leads da imobiliária"""
    user = User.query.get(session['user_id'])
    imobiliaria = user.imobiliaria_profile
    
    # Paginação de leads
    page = request.args.get('page', 1, type=int)
    per_page = 20
    from models import Lead
    leads_query = Lead.query.join(CorretorProfile).filter(CorretorProfile.imobiliaria_id == imobiliaria.id)
    leads_pagination = leads_query.paginate(page=page, per_page=per_page, error_out=False)
    return render_template('imobiliaria/leads.html',
                         leads=leads_pagination.items,
                         pagination=leads_pagination)

@imobiliaria_bp.route('/profile')
def profile():
    """Perfil da imobiliária"""
    user = User.query.get(session['user_id'])
    imobiliaria = user.imobiliaria_profile
    
    return render_template('imobiliaria/profile.html', 
                         user=user,
                         imobiliaria=imobiliaria)

@imobiliaria_bp.route('/profile/edit', methods=['GET', 'POST'])
def edit_profile():
    """Editar perfil da imobiliária"""
    user = User.query.get(session['user_id'])
    imobiliaria = user.imobiliaria_profile
    
    if request.method == 'POST':
        # Atualizar dados básicos
        user.telefone = request.form.get('telefone', user.telefone)
        
        # Atualizar dados da imobiliária
        imobiliaria.nome_fantasia = request.form.get('nome_fantasia', imobiliaria.nome_fantasia)
        imobiliaria.descricao = request.form.get('descricao', imobiliaria.descricao)
        imobiliaria.site = request.form.get('site', imobiliaria.site)
        
        # Endereço
        imobiliaria.cep = request.form.get('cep', imobiliaria.cep)
        imobiliaria.endereco = request.form.get('endereco', imobiliaria.endereco)
        imobiliaria.numero = request.form.get('numero', imobiliaria.numero)
        imobiliaria.complemento = request.form.get('complemento', imobiliaria.complemento)
        imobiliaria.bairro = request.form.get('bairro', imobiliaria.bairro)
        imobiliaria.cidade = request.form.get('cidade', imobiliaria.cidade)
        imobiliaria.estado = request.form.get('estado', imobiliaria.estado)
        
        # Configurações
        imobiliaria.tipos_imoveis = request.form.getlist('tipos_imoveis')
        imobiliaria.regioes_atuacao = request.form.getlist('regioes_atuacao')
        
        try:
            db.session.commit()
            flash('Perfil atualizado com sucesso!', 'success')
            return redirect(url_for('imobiliaria.profile'))
        except Exception as e:
            db.session.rollback()
            flash('Erro ao atualizar perfil.', 'error')
    
    return render_template('imobiliaria/edit_profile.html', 
                         user=user,
                         imobiliaria=imobiliaria)

@imobiliaria_bp.route('/api/stats')
def api_stats():
    """API para estatísticas da imobiliária"""
    user = User.query.get(session['user_id'])
    imobiliaria = user.imobiliaria_profile
    
    stats = {
        'total_corretores': len(imobiliaria.corretores) if hasattr(imobiliaria, 'corretores') else 0,
        'corretores_ativos': len([c for c in (imobiliaria.corretores or []) if c.user.status == UserStatus.ATIVO]),
        'plano_ativo': imobiliaria.plano_ativo,
        'limite_corretores': imobiliaria.limite_corretores,
    }
    
    return jsonify(stats)

@imobiliaria_bp.route('/invite-corretor', methods=['GET', 'POST'])
def invite_corretor():
    """Convidar novo corretor"""
    if request.method == 'POST':
        email = request.form.get('email')
        nome = request.form.get('nome')
        
        # Verificar se já existe
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Este email já está cadastrado no sistema.', 'error')
        else:
            # Implementar lógica de convite
            flash(f'Convite enviado para {email}!', 'success')
            return redirect(url_for('imobiliaria.corretores'))
    
    return render_template('imobiliaria/invite_corretor.html')