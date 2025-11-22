# 👑 Dashboard Admin - iVillar Platform
from flask import Blueprint, request, render_template, redirect, url_for, flash, session, jsonify
from models import db, User, UserType, UserStatus, Property, Lead, Campanha
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from functools import wraps
import csv
from io import StringIO
from flask import Response

# Blueprint para admin
admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

# --- Decorador para autenticação admin ---
def admin_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect(url_for('admin.admin_login'))
        return f(*args, **kwargs)
    return decorated_function

# Proteger todas as rotas do painel (exceto login/logout)
@admin_bp.before_app_request
def check_admin():
    if request.blueprint == 'admin':
        # Permitir login e logout sem autenticação
        if request.endpoint in ['admin.admin_login', 'admin.admin_logout', None]:
            return
        if not session.get('admin_logged_in'):
            return redirect(url_for('admin.admin_login'))

# Painel administrativo moderno (home do admin)
@admin_bp.route('/', methods=['GET'])
def admin_home():
    return redirect(url_for('admin.admin_dashboard'))

# Dashboard principal
@admin_bp.route('/dashboard', methods=['GET'])
@admin_login_required
def admin_dashboard():
    # MOCK: estatísticas
    stats = {
        'total_users': 10,
        'total_links': 25,
        'active_users': 7,
        'total_accesses': 123
    }
    return render_template('admin_dashboard.html', stats=stats)



# --- Remover função admin_required antiga e duplicidade de dashboard/users ---

# --- Autenticação admin simples ---
# Rota de login admin
@admin_bp.route('/login', methods=['GET', 'POST'])
def admin_login():
    error = None
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        # Usuário/senha fixos para exemplo. Substitua por consulta ao banco!
        if username == 'admin' and password == 'admin123':
            session['admin_logged_in'] = True
            flash('Login realizado com sucesso!', 'success')
            return redirect(url_for('admin.admin_home'))
        else:
            error = 'Usuário ou senha inválidos.'
    return render_template('admin_login.html', error=error)

# Logout admin
@admin_bp.route('/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    flash('Logout realizado com sucesso.', 'success')
    return redirect(url_for('admin.admin_login'))


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
    query = User.query
    # Filtro de busca por nome/email
    if search:
        query = query.filter(
            db.or_(
                User.nome.contains(search),
                User.email.contains(search)
            )
        )
    # Não aplicar filtro de tipo/status por padrão
    users = query.order_by(desc(User.created_at)).paginate(
        page=page, per_page=20, error_out=False
    )
    # (Removido: uso de 'admin_users.html')
    return render_template('admin/users.html', users=users, search=search)

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

# --- CRUD de Campanhas ---
@admin_bp.route('/campanhas', methods=['GET'])
@admin_login_required
def admin_campanhas():
    search = request.args.get('search', '')
    status = request.args.get('status', '')
    page = request.args.get('page', 1, type=int)
    per_page = 15
    query = Campanha.query
    if search:
        query = query.filter(Campanha.titulo.ilike(f'%{search}%'))
    if status and status != 'all':
        query = query.filter(Campanha.ativo == (status == 'ativa'))
    campanhas = query.order_by(Campanha.criado_em.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return render_template('admin_campanhas.html', campanhas=campanhas, search=search, status=status)

@admin_bp.route('/campanhas/nova', methods=['GET', 'POST'])
@admin_login_required
def admin_campanha_nova():
    import os
    if request.method == 'POST':
        imagem_url = request.form.get('imagem_url')
        imagem_upload = request.files.get('imagem_upload')
        imagem_path = ''
        if imagem_upload and imagem_upload.filename:
            filename = imagem_upload.filename
            upload_folder = os.path.join('static', 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            file_path = os.path.join(upload_folder, filename)
            imagem_upload.save(file_path)
            imagem_path = '/' + file_path.replace('\\', '/').replace(os.path.sep, '/')
        elif imagem_url:
            imagem_path = imagem_url
        campanha = Campanha(
            titulo=request.form.get('titulo'),
            subtitulo=request.form.get('subtitulo'),
            desconto=request.form.get('desconto'),
            beneficios=request.form.get('beneficios'),
            condicoes=request.form.get('condicoes'),
            imagem=imagem_path,
            video=request.form.get('video'),
            audio=request.form.get('audio'),
            cor_fundo=request.form.get('cor_fundo'),
            cor_texto=request.form.get('cor_texto'),
            destaque=bool(request.form.get('destaque')),
            ativo=bool(request.form.get('ativo'))
        )
        db.session.add(campanha)
        db.session.commit()
        flash('Campanha criada com sucesso!', 'success')
        return redirect(url_for('admin.admin_campanhas'))
    return render_template('admin_campanha_form.html', campanha=None)

@admin_bp.route('/campanhas/<int:id>/editar', methods=['GET', 'POST'])
@admin_login_required
def admin_campanha_editar(id):
    campanha = Campanha.query.get_or_404(id)
    import os
    if request.method == 'POST':
        imagem_url = request.form.get('imagem_url')
        imagem_upload = request.files.get('imagem_upload')
        if imagem_upload and imagem_upload.filename:
            filename = imagem_upload.filename
            upload_folder = os.path.join('static', 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            file_path = os.path.join(upload_folder, filename)
            imagem_upload.save(file_path)
            campanha.imagem = '/' + file_path.replace('\\', '/').replace(os.path.sep, '/')
        elif imagem_url:
            campanha.imagem = imagem_url
        campanha.titulo = request.form.get('titulo')
        campanha.subtitulo = request.form.get('subtitulo')
        campanha.desconto = request.form.get('desconto')
        campanha.beneficios = request.form.get('beneficios')
        campanha.condicoes = request.form.get('condicoes')
        campanha.video = request.form.get('video')
        campanha.audio = request.form.get('audio')
        campanha.cor_fundo = request.form.get('cor_fundo')
        campanha.cor_texto = request.form.get('cor_texto')
        campanha.destaque = bool(request.form.get('destaque'))
        campanha.ativo = bool(request.form.get('ativo'))
        db.session.commit()
        flash('Campanha atualizada!', 'success')
        return redirect(url_for('admin.admin_campanhas'))
    return render_template('admin_campanha_form.html', campanha=campanha)

@admin_bp.route('/campanhas/<int:id>/excluir', methods=['POST'])
@admin_login_required
def admin_campanha_excluir(id):
    campanha = Campanha.query.get_or_404(id)
    db.session.delete(campanha)
    db.session.commit()
    flash('Campanha excluída!', 'success')
    return redirect(url_for('admin.admin_campanhas'))

# --- CRUD de Imóveis ---
@admin_bp.route('/imoveis', methods=['GET'])
@admin_login_required
def admin_imoveis():
    search = request.args.get('search', '')
    tipo = request.args.get('tipo', '')
    status = request.args.get('status', '')
    page = request.args.get('page', 1, type=int)
    per_page = 15
    query = Property.query
    if search:
        query = query.filter(Property.nome.ilike(f'%{search}%'))
    if tipo and tipo != 'all':
        query = query.filter(Property.tipo == tipo)
    if status and status != 'all':
        query = query.filter(Property.status == status)
    imoveis = query.order_by(Property.criado_em.desc()).paginate(page=page, per_page=per_page, error_out=False)
    tipos = [row[0] for row in db.session.query(Property.tipo).distinct().all()]
    status_list = [row[0] for row in db.session.query(Property.status).distinct().all()]
    return render_template('admin_imoveis.html', imoveis=imoveis, search=search, tipo=tipo, status=status, tipos=tipos, status_list=status_list)

@admin_bp.route('/imoveis/novo', methods=['GET', 'POST'])
@admin_login_required
def admin_imovel_novo():
    import os
    if request.method == 'POST':
        # Imagem principal
        imagem_url = request.form.get('imagem_url')
        imagem_upload = request.files.get('imagem_upload')
        imagem_path = ''
        if imagem_upload and imagem_upload.filename:
            filename = imagem_upload.filename
            upload_folder = os.path.join('static', 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            file_path = os.path.join(upload_folder, filename)
            imagem_upload.save(file_path)
            imagem_path = '/' + file_path.replace('\\', '/').replace(os.path.sep, '/')
        elif imagem_url:
            imagem_path = imagem_url

        # Vídeo
        video_url = request.form.get('video')
        video_upload = request.files.get('video_upload')
        video_path = ''
        if video_upload and video_upload.filename:
            filename = video_upload.filename
            upload_folder = os.path.join('static', 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            file_path = os.path.join(upload_folder, filename)
            video_upload.save(file_path)
            video_path = '/' + file_path.replace('\\', '/').replace(os.path.sep, '/')
        elif video_url:
            video_path = video_url

        # PDF/Planta
        planta_pdf_url = request.form.get('planta_pdf')
        planta_pdf_upload = request.files.get('planta_pdf_upload')
        planta_pdf_path = ''
        if planta_pdf_upload and planta_pdf_upload.filename:
            filename = planta_pdf_upload.filename
            upload_folder = os.path.join('static', 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            file_path = os.path.join(upload_folder, filename)
            planta_pdf_upload.save(file_path)
            planta_pdf_path = '/' + file_path.replace('\\', '/').replace(os.path.sep, '/')
        elif planta_pdf_url:
            planta_pdf_path = planta_pdf_url

        # Galeria de imagens (upload múltiplo)
        galeria_files = request.files.getlist('galeria_upload')
        galeria_urls = []
        for galeria_file in galeria_files:
            if galeria_file and galeria_file.filename:
                filename = galeria_file.filename
                upload_folder = os.path.join('static', 'uploads')
                os.makedirs(upload_folder, exist_ok=True)
                file_path = os.path.join(upload_folder, filename)
                galeria_file.save(file_path)
                galeria_urls.append('/' + file_path.replace('\\', '/').replace(os.path.sep, '/'))
        galeria_str = ','.join(galeria_urls) if galeria_urls else ''

        imovel = Property(
            nome=request.form.get('nome'),
            tipo=request.form.get('tipo'),
            status=request.form.get('status'),
            preco=request.form.get('preco'),
            localizacao=request.form.get('localizacao'),
            quartos=request.form.get('quartos'),
            banheiros=request.form.get('banheiros'),
            area=request.form.get('area'),
            imagem=imagem_path,
            video=video_path,
            planta_pdf=planta_pdf_path,
            galeria=galeria_str,
            descricao=request.form.get('descricao'),
            destaque=bool(request.form.get('destaque')),
            ativo=bool(request.form.get('ativo'))
        )
        db.session.add(imovel)
        db.session.commit()
        flash('Imóvel cadastrado com sucesso!', 'success')
        return redirect(url_for('admin.admin_imoveis'))
    return render_template('admin_imovel_form.html', imovel=None)

@admin_bp.route('/imoveis/<int:id>/editar', methods=['GET', 'POST'])
@admin_login_required
def admin_imovel_editar(id):
    imovel = Property.query.get_or_404(id)
    import os
    if request.method == 'POST':
        # Imagem principal
        imagem_url = request.form.get('imagem_url')
        imagem_upload = request.files.get('imagem_upload')
        if imagem_upload and imagem_upload.filename:
            filename = imagem_upload.filename
            upload_folder = os.path.join('static', 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            file_path = os.path.join(upload_folder, filename)
            imagem_upload.save(file_path)
            imovel.imagem = '/' + file_path.replace('\\', '/').replace(os.path.sep, '/')
        elif imagem_url:
            imovel.imagem = imagem_url

        # Vídeo
        video_url = request.form.get('video')
        video_upload = request.files.get('video_upload')
        if video_upload and video_upload.filename:
            filename = video_upload.filename
            upload_folder = os.path.join('static', 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            file_path = os.path.join(upload_folder, filename)
            video_upload.save(file_path)
            imovel.video = '/' + file_path.replace('\\', '/').replace(os.path.sep, '/')
        elif video_url:
            imovel.video = video_url

        # PDF/Planta
        planta_pdf_url = request.form.get('planta_pdf')
        planta_pdf_upload = request.files.get('planta_pdf_upload')
        if planta_pdf_upload and planta_pdf_upload.filename:
            filename = planta_pdf_upload.filename
            upload_folder = os.path.join('static', 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            file_path = os.path.join(upload_folder, filename)
            planta_pdf_upload.save(file_path)
            imovel.planta_pdf = '/' + file_path.replace('\\', '/').replace(os.path.sep, '/')
        elif planta_pdf_url:
            imovel.planta_pdf = planta_pdf_url

        # Galeria de imagens (upload múltiplo)
        galeria_files = request.files.getlist('galeria_upload')
        galeria_urls = []
        for galeria_file in galeria_files:
            if galeria_file and galeria_file.filename:
                filename = galeria_file.filename
                upload_folder = os.path.join('static', 'uploads')
                os.makedirs(upload_folder, exist_ok=True)
                file_path = os.path.join(upload_folder, filename)
                galeria_file.save(file_path)
                galeria_urls.append('/' + file_path.replace('\\', '/').replace(os.path.sep, '/'))
        if galeria_urls:
            imovel.galeria = ','.join(galeria_urls)

        imovel.nome = request.form.get('nome')
        imovel.tipo = request.form.get('tipo')
        imovel.status = request.form.get('status')
        imovel.preco = request.form.get('preco')
        imovel.localizacao = request.form.get('localizacao')
        imovel.quartos = request.form.get('quartos')
        imovel.banheiros = request.form.get('banheiros')
        imovel.area = request.form.get('area')
        imovel.descricao = request.form.get('descricao')
        imovel.destaque = bool(request.form.get('destaque'))
        imovel.ativo = bool(request.form.get('ativo'))
        db.session.commit()
        flash('Imóvel atualizado!', 'success')
        return redirect(url_for('admin.admin_imoveis'))
    return render_template('admin_imovel_form.html', imovel=imovel)

@admin_bp.route('/imoveis/<int:id>/excluir', methods=['POST'])
@admin_login_required
def admin_imovel_excluir(id):
    imovel = Property.query.get_or_404(id)
    db.session.delete(imovel)
    db.session.commit()
    flash('Imóvel excluído!', 'success')
    return redirect(url_for('admin.admin_imoveis'))

# --- Listagem e edição de membros/usuários ---
from models import User, UserType, UserStatus

@admin_bp.route('/membros', methods=['GET'])
@admin_login_required
def admin_membros():
    search = request.args.get('search', '')
    tipo = request.args.get('tipo', '')
    status = request.args.get('status', '')
    page = request.args.get('page', 1, type=int)
    per_page = 15
    query = User.query
    if search:
        query = query.filter(
            db.or_(User.nome.ilike(f'%{search}%'), User.email.ilike(f'%{search}%'))
        )
    if tipo and tipo != 'all':
        query = query.filter(User.user_type == UserType(tipo))
    if status and status != 'all':
        query = query.filter(User.status == UserStatus(status))
    membros = query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return render_template('admin_membros.html', membros=membros, UserType=UserType, UserStatus=UserStatus, search=search, tipo=tipo, status=status)

@admin_bp.route('/membros/<int:id>/editar', methods=['GET', 'POST'])
@admin_login_required
def admin_membro_editar(id):
    membro = User.query.get_or_404(id)
    if request.method == 'POST':
        membro.nome = request.form.get('nome')
        membro.email = request.form.get('email')
        membro.user_type = UserType(request.form.get('user_type'))
        membro.status = UserStatus(request.form.get('status'))
        db.session.commit()
        flash('Membro atualizado com sucesso!', 'success')
        return redirect(url_for('admin.admin_membros'))
    return render_template('admin_membro_form.html', membro=membro, UserType=UserType, UserStatus=UserStatus)

@admin_bp.route('/membros/<int:id>/remover', methods=['POST'])
@admin_login_required
def admin_membro_remover(id):
    membro = User.query.get_or_404(id)
    if membro.user_type == UserType.ADMIN:
        flash('Não é possível remover outro administrador.', 'error')
    else:
        db.session.delete(membro)
        db.session.commit()
        flash('Membro removido com sucesso!', 'success')
    return redirect(url_for('admin.admin_membros'))

@admin_bp.route('/membros/exportar')
@admin_login_required
def exportar_membros():
    search = request.args.get('search', '')
    tipo = request.args.get('tipo', '')
    status = request.args.get('status', '')
    query = User.query
    if search:
        query = query.filter(
            db.or_(User.nome.ilike(f'%{search}%'), User.email.ilike(f'%{search}%'))
        )
    if tipo and tipo != 'all':
        query = query.filter(User.user_type == UserType(tipo))
    if status and status != 'all':
        query = query.filter(User.status == UserStatus(status))
    membros = query.order_by(User.created_at.desc()).all()
    si = StringIO()
    writer = csv.writer(si)
    writer.writerow(['ID', 'Nome', 'Email', 'Tipo', 'Status', 'Data Cadastro'])
    for m in membros:
        writer.writerow([
            m.id, m.nome, m.email, m.user_type.value, m.status.value,
            m.created_at.strftime('%d/%m/%Y') if m.created_at else ''
        ])
    output = si.getvalue()
    return Response(
        output,
        mimetype='text/csv',
        headers={"Content-Disposition": "attachment;filename=membros.csv"}
    )

@admin_bp.route('/imoveis/exportar')
@admin_login_required
def exportar_imoveis():
    search = request.args.get('search', '')
    tipo = request.args.get('tipo', '')
    status = request.args.get('status', '')
    query = Property.query
    if search:
        query = query.filter(Property.nome.ilike(f'%{search}%'))
    if tipo and tipo != 'all':
        query = query.filter(Property.tipo == tipo)
    if status and status != 'all':
        query = query.filter(Property.status == status)
    imoveis = query.order_by(Property.criado_em.desc()).all()
    si = StringIO()
    writer = csv.writer(si)
    writer.writerow(['ID', 'Nome', 'Tipo', 'Status', 'Preço', 'Localização', 'Quartos', 'Banheiros', 'Área', 'Destaque', 'Ativo', 'Data Cadastro'])
    for i in imoveis:
        writer.writerow([
            i.id, i.nome, i.tipo, i.status, f'{i.preco:.2f}', i.localizacao, i.quartos, i.banheiros, i.area,
            'Sim' if i.destaque else 'Não', 'Sim' if i.ativo else 'Não',
            i.criado_em.strftime('%d/%m/%Y') if i.criado_em else ''
        ])
    output = si.getvalue()
    return Response(
        output,
        mimetype='text/csv',
        headers={"Content-Disposition": "attachment;filename=imoveis.csv"}
    )

@admin_bp.route('/campanhas/exportar')
@admin_login_required
def exportar_campanhas():
    search = request.args.get('search', '')
    status = request.args.get('status', '')
    query = Campanha.query
    if search:
        query = query.filter(Campanha.titulo.ilike(f'%{search}%'))
    if status and status != 'all':
        query = query.filter(Campanha.ativo == (status == 'ativa'))
    campanhas = query.order_by(Campanha.criado_em.desc()).all()
    si = StringIO()
    writer = csv.writer(si)
    writer.writerow(['ID', 'Título', 'Subtítulo', 'Desconto', 'Benefícios', 'Condições', 'Destaque', 'Ativa', 'Data Cadastro'])
    for c in campanhas:
        writer.writerow([
            c.id, c.titulo, c.subtitulo, c.desconto, c.beneficios, c.condicoes,
            'Sim' if c.destaque else 'Não', 'Sim' if c.ativo else 'Não',
            c.criado_em.strftime('%d/%m/%Y') if c.criado_em else ''
        ])
    output = si.getvalue()
    return Response(
        output,
        mimetype='text/csv',
        headers={"Content-Disposition": "attachment;filename=campanhas.csv"}
    )