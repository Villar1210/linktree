# 🏠 Dashboard Cliente - iVillar Platform  
from flask import Blueprint, request, render_template, redirect, url_for, flash, session, jsonify
from models import db, User, UserType, Property
from sqlalchemy import or_
from datetime import datetime, timedelta

# Blueprint para cliente
cliente_bp = Blueprint('cliente', __name__, url_prefix='/cliente')

def cliente_required():
    """Decorator para verificar se é cliente"""
    if 'user_id' not in session:
        flash('Você precisa fazer login para acessar esta área', 'error')
        return redirect(url_for('auth.login'))
    
    user = User.query.get(session['user_id'])
    if not user or user.user_type != UserType.CLIENTE:
        flash('Acesso negado. Apenas clientes podem acessar esta área.', 'error')
        return redirect(url_for('index'))
    
    return None

@cliente_bp.before_request
def check_cliente():
    """Verificar cliente antes de cada requisição"""
    result = cliente_required()
    if result:
        return result

@cliente_bp.route('/dashboard')
def dashboard():
    """Dashboard principal do cliente"""
    user = User.query.get(session['user_id'])
    cliente = user.cliente_profile
    
    if not cliente:
        flash('Perfil de cliente não encontrado.', 'error')
        return redirect(url_for('index'))
    
    # Estatísticas do cliente
    stats = {
        'favoritos': 0,  # Implementar sistema de favoritos
        'buscas_salvas': 0,  # Implementar buscas salvas
        'visitas_agendadas': 0,  # Implementar agendamentos
        'propostas_enviadas': 0,  # Implementar propostas
    }
    
    # Propriedades recomendadas baseadas no perfil
    recommended_properties = []
    if hasattr(db, 'Property'):
        query = Property.query.filter_by(status='disponivel')
        
        # Filtrar por faixa de preço se definida
        if cliente.faixa_preco_min:
            query = query.filter(
                or_(
                    Property.preco_venda >= cliente.faixa_preco_min,
                    Property.preco_aluguel >= cliente.faixa_preco_min * 0.005  # 0.5% do valor para aluguel
                )
            )
        
        if cliente.faixa_preco_max:
            query = query.filter(
                or_(
                    Property.preco_venda <= cliente.faixa_preco_max,
                    Property.preco_aluguel <= cliente.faixa_preco_max * 0.005
                )
            )
        
        # Filtrar por tipo de imóvel se definido
        if cliente.tipo_imovel_interesse:
            query = query.filter(Property.tipo.in_(cliente.tipo_imovel_interesse))
        
        recommended_properties = query.limit(6).all()
    
    # Últimas atividades (simulado)
    recent_activities = [
        {
            'tipo': 'busca',
            'descricao': 'Pesquisou por apartamentos na zona sul',
            'data': datetime.utcnow() - timedelta(hours=2)
        },
        {
            'tipo': 'favorito',
            'descricao': 'Adicionou imóvel aos favoritos',
            'data': datetime.utcnow() - timedelta(days=1)
        }
    ]
    
    return render_template('cliente/dashboard.html', 
                         user=user,
                         cliente=cliente,
                         stats=stats,
                         recommended_properties=recommended_properties,
                         recent_activities=recent_activities)

@cliente_bp.route('/favoritos')
def favoritos():
    """Lista de imóveis favoritos"""
    # Implementar sistema de favoritos
    favoritos = []
    
    return render_template('cliente/favoritos.html', 
                         favoritos=favoritos)

@cliente_bp.route('/buscas')
def buscas():
    """Buscas salvas do cliente"""
    # Implementar sistema de buscas salvas
    buscas_salvas = []
    
    return render_template('cliente/buscas.html', 
                         buscas_salvas=buscas_salvas)

@cliente_bp.route('/buscar')
def buscar():
    """Página de busca de imóveis"""
    tipo = request.args.get('tipo', '')
    cidade = request.args.get('cidade', '')
    preco_min = request.args.get('preco_min', type=float)
    preco_max = request.args.get('preco_max', type=float)
    quartos = request.args.get('quartos', type=int)
    
    # Construir query
    if hasattr(db, 'Property'):
        query = Property.query.filter_by(status='disponivel')
        
        if tipo:
            query = query.filter(Property.tipo == tipo)
        if cidade:
            query = query.filter(Property.cidade.ilike(f'%{cidade}%'))
        if preco_min:
            query = query.filter(Property.preco_venda >= preco_min)
        if preco_max:
            query = query.filter(Property.preco_venda <= preco_max)
        if quartos:
            query = query.filter(Property.quartos >= quartos)
        
        properties = query.all()
    else:
        properties = []
    
    return render_template('cliente/buscar.html',
                         properties=properties,
                         filters={
                             'tipo': tipo,
                             'cidade': cidade,
                             'preco_min': preco_min,
                             'preco_max': preco_max,
                             'quartos': quartos
                         })

@cliente_bp.route('/profile')
def profile():
    """Perfil do cliente"""
    user = User.query.get(session['user_id'])
    cliente = user.cliente_profile
    
    return render_template('cliente/profile.html', 
                         user=user,
                         cliente=cliente)

@cliente_bp.route('/profile/edit', methods=['GET', 'POST'])
def edit_profile():
    """Editar perfil do cliente"""
    user = User.query.get(session['user_id'])
    cliente = user.cliente_profile
    
    if request.method == 'POST':
        # Atualizar dados básicos
        user.nome = request.form.get('nome', user.nome)
        user.telefone = request.form.get('telefone', user.telefone)
        
        # Atualizar dados do cliente
        cliente.profissao = request.form.get('profissao', cliente.profissao)
        cliente.estado_civil = request.form.get('estado_civil', cliente.estado_civil)
        
        # Preferências de busca
        cliente.tipo_imovel_interesse = request.form.getlist('tipo_imovel_interesse')
        cliente.faixa_preco_min = float(request.form.get('faixa_preco_min', 0)) or cliente.faixa_preco_min
        cliente.faixa_preco_max = float(request.form.get('faixa_preco_max', 0)) or cliente.faixa_preco_max
        cliente.regioes_interesse = request.form.getlist('regioes_interesse')
        
        # Preferências de contato
        cliente.prefere_whatsapp = 'prefere_whatsapp' in request.form
        cliente.prefere_email = 'prefere_email' in request.form
        cliente.prefere_ligacao = 'prefere_ligacao' in request.form
        
        try:
            db.session.commit()
            flash('Perfil atualizado com sucesso!', 'success')
            return redirect(url_for('cliente.profile'))
        except Exception as e:
            db.session.rollback()
            flash('Erro ao atualizar perfil.', 'error')
    
    return render_template('cliente/edit_profile.html', 
                         user=user,
                         cliente=cliente)

@cliente_bp.route('/api/add-favorito', methods=['POST'])
def add_favorito():
    """Adicionar imóvel aos favoritos"""
    property_id = request.json.get('property_id')
    
    # Implementar lógica de favoritos
    # Por enquanto, apenas retorna sucesso
    
    return jsonify({'success': True, 'message': 'Imóvel adicionado aos favoritos!'})

@cliente_bp.route('/api/remove-favorito', methods=['POST'])
def remove_favorito():
    """Remover imóvel dos favoritos"""
    property_id = request.json.get('property_id')
    
    # Implementar lógica de favoritos
    
    return jsonify({'success': True, 'message': 'Imóvel removido dos favoritos!'})

@cliente_bp.route('/api/save-search', methods=['POST'])
def save_search():
    """Salvar busca personalizada"""
    search_params = request.json
    
    # Implementar lógica de buscas salvas
    
    return jsonify({'success': True, 'message': 'Busca salva com sucesso!'})