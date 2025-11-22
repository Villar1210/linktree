# ==================== ROTAS DE ADMINISTRAÇÃO EXPANDIDAS ====================

@app.route('/admin/dashboard')
@login_required
@requer_admin
@registrar_acesso('acesso_admin_dashboard', 'admin/dashboard')
def admin_dashboard():
    """Dashboard administrativo completo"""
    # Estatísticas gerais
    stats = {
        'total_usuarios': Usuario.query.count(),
        'usuarios_ativos': Usuario.query.filter_by(ativo=True).count(),
        'usuarios_inativos': Usuario.query.filter_by(ativo=False).count(),
        'total_acessos': Acesso.query.count(),
        'acessos_hoje': Acesso.query.filter(
            Acesso.data_hora >= datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        ).count(),
        'total_admins': Usuario.query.filter_by(cargo='Administrador').count(),
        'total_vendas': Usuario.query.filter_by(departamento='Vendas').count(),
        'redes_sociais': RedeSocial.query.count()
    }
    
    # Todos os usuários para gestão
    usuarios = Usuario.query.order_by(Usuario.data_criacao.desc()).all()
    
    # Carregar configurações atuais (simuladas para compatibilidade)
    config = carregar_configuracoes()
    
    return render_template('admin/dashboard-complete.html', 
                         stats=stats,
                         usuarios=usuarios,
                         config=config)


@app.route('/admin/add-user', methods=['POST'])
@login_required
@requer_admin
def admin_add_user():
    """Adicionar novo usuário via admin"""
    try:
        nome = request.form.get('nome', '').strip()
        email = request.form.get('email', '').strip().lower()
        cargo = request.form.get('tipo', 'Membro')  # Mapear 'tipo' para 'cargo'
        senha = request.form.get('senha', '')
        
        # Validações
        if not nome or not email or not senha:
            flash('Todos os campos são obrigatórios!', 'danger')
            return redirect(url_for('admin_dashboard'))
        
        # Verificar se email já existe
        if Usuario.query.filter_by(email=email).first():
            flash('E-mail já cadastrado!', 'danger')
            return redirect(url_for('admin_dashboard'))
        
        # Criar novo usuário
        novo_usuario = Usuario(
            nome=nome,
            email=email,
            cargo=cargo,
            departamento='Vendas' if cargo != 'Administrador' else 'TI',
            ativo=True  # Aprovar automaticamente usuários criados pelo admin
        )
        novo_usuario.set_senha(senha)
        
        # Criar configuração de segurança
        config_seguranca = ConfiguracaoSeguranca(usuario_id=novo_usuario.id)
        
        db.session.add(novo_usuario)
        db.session.add(config_seguranca)
        db.session.commit()
        
        logger.info(f"Usuário {nome} adicionado pelo admin {current_user.id}")
        flash(f'Usuário {nome} adicionado com sucesso!', 'success')
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erro ao adicionar usuário: {e}")
        flash(f'Erro ao adicionar usuário: {str(e)}', 'danger')
    
    return redirect(url_for('admin_dashboard'))


@app.route('/admin/approve-user/<int:user_id>', methods=['POST'])
@login_required
@requer_admin
def admin_approve_user(user_id):
    """Aprovar usuário"""
    try:
        usuario = Usuario.query.get_or_404(user_id)
        usuario.ativo = True
        db.session.commit()
        
        logger.info(f"Usuário {user_id} aprovado pelo admin {current_user.id}")
        flash(f'Usuário {usuario.nome} aprovado com sucesso!', 'success')
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erro ao aprovar usuário: {e}")
        flash('Erro ao aprovar usuário.', 'danger')
    
    return redirect(url_for('admin_dashboard'))


@app.route('/admin/suspend-user/<int:user_id>', methods=['POST'])
@login_required
@requer_admin
def admin_suspend_user(user_id):
    """Suspender usuário"""
    if user_id == current_user.id:
        flash('Você não pode suspender sua própria conta!', 'danger')
        return redirect(url_for('admin_dashboard'))
    
    try:
        usuario = Usuario.query.get_or_404(user_id)
        usuario.ativo = False
        db.session.commit()
        
        logger.info(f"Usuário {user_id} suspenso pelo admin {current_user.id}")
        flash(f'Usuário {usuario.nome} suspenso com sucesso!', 'success')
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erro ao suspender usuário: {e}")
        flash('Erro ao suspender usuário.', 'danger')
    
    return redirect(url_for('admin_dashboard'))


@app.route('/admin/delete-user/<int:user_id>', methods=['POST'])
@login_required
@requer_admin
def admin_delete_user(user_id):
    """Excluir usuário"""
    if user_id == current_user.id:
        flash('Você não pode excluir sua própria conta!', 'danger')
        return redirect(url_for('admin_dashboard'))
    
    try:
        usuario = Usuario.query.get_or_404(user_id)
        nome_usuario = usuario.nome
        
        db.session.delete(usuario)
        db.session.commit()
        
        logger.info(f"Usuário {user_id} excluído pelo admin {current_user.id}")
        flash(f'Usuário {nome_usuario} excluído com sucesso!', 'success')
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erro ao excluir usuário: {e}")
        flash('Erro ao excluir usuário.', 'danger')
    
    return redirect(url_for('admin_dashboard'))


@app.route('/admin/save-email-config', methods=['POST'])
@login_required
@requer_admin
def admin_save_email_config():
    """Salvar configurações de e-mail"""
    try:
        config = carregar_configuracoes()
        
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
        
        salvar_configuracoes(config)
        logger.info(f"Configurações de e-mail salvas pelo admin {current_user.id}")
        flash('Configurações de e-mail salvas com sucesso!', 'success')
        
    except Exception as e:
        logger.error(f"Erro ao salvar configurações de e-mail: {e}")
        flash('Erro ao salvar configurações de e-mail.', 'danger')
    
    return redirect(url_for('admin_dashboard'))


@app.route('/admin/save-social-config', methods=['POST'])
@login_required
@requer_admin
def admin_save_social_config():
    """Salvar configurações de redes sociais"""
    try:
        config = carregar_configuracoes()
        
        # Atualizar configurações de redes sociais
        config.update({
            'facebook_url': request.form.get('facebook_url', ''),
            'facebook_page_id': request.form.get('facebook_page_id', ''),
            'instagram_url': request.form.get('instagram_url', ''),
            'instagram_username': request.form.get('instagram_username', ''),
            'linkedin_url': request.form.get('linkedin_url', ''),
            'youtube_url': request.form.get('youtube_url', ''),
        })
        
        salvar_configuracoes(config)
        logger.info(f"Configurações de redes sociais salvas pelo admin {current_user.id}")
        flash('Configurações de redes sociais salvas com sucesso!', 'success')
        
    except Exception as e:
        logger.error(f"Erro ao salvar configurações de redes sociais: {e}")
        flash('Erro ao salvar configurações de redes sociais.', 'danger')
    
    return redirect(url_for('admin_dashboard'))


@app.route('/admin/save-whatsapp-config', methods=['POST'])
@login_required
@requer_admin
def admin_save_whatsapp_config():
    """Salvar configurações de WhatsApp"""
    try:
        config = carregar_configuracoes()
        
        # Atualizar configurações de WhatsApp
        config.update({
            'whatsapp_daniel': request.form.get('whatsapp_daniel', ''),
            'whatsapp_vendas': request.form.get('whatsapp_vendas', ''),
            'whatsapp_suzano': request.form.get('whatsapp_suzano', ''),
            'whatsapp_mogi': request.form.get('whatsapp_mogi', ''),
            'daniel_message': request.form.get('daniel_message', ''),
            'vendas_message': request.form.get('vendas_message', ''),
        })
        
        salvar_configuracoes(config)
        logger.info(f"Configurações de WhatsApp salvas pelo admin {current_user.id}")
        flash('Configurações de WhatsApp salvas com sucesso!', 'success')
        
    except Exception as e:
        logger.error(f"Erro ao salvar configurações de WhatsApp: {e}")
        flash('Erro ao salvar configurações de WhatsApp.', 'danger')
    
    return redirect(url_for('admin_dashboard'))


@app.route('/admin/save-general-config', methods=['POST'])
@login_required
@requer_admin
def admin_save_general_config():
    """Salvar configurações gerais"""
    try:
        config = carregar_configuracoes()
        
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
        
        salvar_configuracoes(config)
        logger.info(f"Configurações gerais salvas pelo admin {current_user.id}")
        flash('Configurações gerais salvas com sucesso!', 'success')
        
    except Exception as e:
        logger.error(f"Erro ao salvar configurações gerais: {e}")
        flash('Erro ao salvar configurações gerais.', 'danger')
    
    return redirect(url_for('admin_dashboard'))


# ==================== FUNÇÕES AUXILIARES PARA CONFIGURAÇÕES ====================

def carregar_configuracoes():
    """Carrega configurações do arquivo JSON"""
    try:
        with open('data/config.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return {
            'email_principal': 'contato@lumiar.com.br',
            'email_vendas': 'vendas@lumiar.com.br',
            'email_rh': 'rh@lumiar.com.br',
            'email_suporte': 'suporte@lumiar.com.br',
            'smtp_server': 'smtp.gmail.com',
            'smtp_port': 587,
            'smtp_user': '',
            'smtp_password': '',
            'facebook_url': 'https://facebook.com/lumiar',
            'facebook_page_id': 'lumiar',
            'instagram_url': 'https://instagram.com/lumiar',
            'instagram_username': '@lumiar',
            'linkedin_url': 'https://linkedin.com/company/lumiar',
            'youtube_url': 'https://youtube.com/@lumiar',
            'whatsapp_daniel': WHATSAPP_DANIEL,
            'whatsapp_vendas': WHATSAPP_VENDAS,
            'whatsapp_suzano': '5511999555001',
            'whatsapp_mogi': '5511999555002',
            'daniel_message': 'Olá! Gostaria de mais informações sobre os imóveis disponíveis.',
            'vendas_message': 'Olá! Tenho interesse em conhecer os empreendimentos da Lumiar.',
            'company_name': 'Construtora Lumiar',
            'company_cnpj': '12.345.678/0001-90',
            'company_phone': '(11) 3456-7890',
            'company_address': 'São Paulo, SP - Brasil',
            'business_hours': 'Segunda a Sexta: 09:00 - 18:00',
            'primary_color': '#2563eb',
            'secondary_color': '#1e40af'
        }


def salvar_configuracoes(config_data):
    """Salva configurações no arquivo JSON"""
    try:
        os.makedirs('data', exist_ok=True)
        with open('data/config.json', 'w', encoding='utf-8') as f:
            json.dump(config_data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        logger.error(f"Erro ao salvar configurações: {e}")
        return False