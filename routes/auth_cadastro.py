# ==================== ROTAS DE CADASTRO ====================

from flask import Flask, request, render_template, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
import logging
import re
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Importar modelos (assumindo que estão no arquivo models/database_models.py)
from models.database_models import (
    db, Usuario, Imobiliaria, Gerente, Corretor, Cliente, 
    LogSistema
)

app = Flask(__name__)

# ==================== FUNÇÕES AUXILIARES ====================

def validar_email(email):
    """Valida formato do email"""
    padrao = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(padrao, email) is not None

def validar_telefone(telefone):
    """Valida formato do telefone"""
    # Remove caracteres não numéricos
    apenas_numeros = re.sub(r'[^0-9]', '', telefone)
    # Aceita telefones com 10 ou 11 dígitos
    return len(apenas_numeros) in [10, 11]

def validar_cnpj(cnpj):
    """Validação básica de CNPJ"""
    apenas_numeros = re.sub(r'[^0-9]', '', cnpj)
    return len(apenas_numeros) == 14

def validar_cpf(cpf):
    """Validação básica de CPF"""
    apenas_numeros = re.sub(r'[^0-9]', '', cpf)
    return len(apenas_numeros) == 11

def formatar_telefone(telefone):
    """Formata telefone para padrão brasileiro"""
    apenas_numeros = re.sub(r'[^0-9]', '', telefone)
    if len(apenas_numeros) == 11:
        return f"({apenas_numeros[:2]}) {apenas_numeros[2:7]}-{apenas_numeros[7:]}"
    elif len(apenas_numeros) == 10:
        return f"({apenas_numeros[:2]}) {apenas_numeros[2:6]}-{apenas_numeros[6:]}"
    return telefone

def registrar_log_acao(acao, detalhes=None):
    """Registra ação no log do sistema"""
    try:
        usuario_id = current_user.id if current_user.is_authenticated else None
        ip_address = request.remote_addr
        user_agent = request.headers.get('User-Agent', '')[:300]  # Limitar tamanho
        
        LogSistema.registrar_acao(
            usuario_id=usuario_id,
            acao=acao,
            detalhes=detalhes,
            ip_address=ip_address,
            user_agent=user_agent
        )
    except Exception as e:
        logger.error(f"Erro ao registrar log: {e}")

# ==================== ROTAS DE CADASTRO ====================

@app.route('/auth/cadastro-cliente', methods=['GET', 'POST'])
def cadastro_cliente():
    """Cadastro de cliente"""
    if request.method == 'POST':
        try:
            # Capturar dados do formulário
            nome = request.form.get('nome', '').strip()
            email = request.form.get('email', '').strip().lower()
            telefone = request.form.get('telefone', '').strip()
            cpf = request.form.get('cpf', '').strip()
            tipo_cliente = request.form.get('tipo_cliente', 'Potencial')
            interesse_tipo = request.form.get('interesse_tipo', '')
            interesse_regiao = request.form.get('interesse_regiao', '')
            faixa_preco_min = request.form.get('faixa_preco_min', '').strip()
            faixa_preco_max = request.form.get('faixa_preco_max', '').strip()
            observacoes = request.form.get('observacoes', '').strip()

            # Validações obrigatórias
            if not nome or not email or not telefone:
                flash('Por favor, preencha todos os campos obrigatórios (Nome, Email e Telefone).', 'danger')
                return render_template('auth/cadastro-cliente.html')

            # Validar formato do email
            if not validar_email(email):
                flash('Por favor, insira um email válido.', 'danger')
                return render_template('auth/cadastro-cliente.html')

            # Validar telefone
            if not validar_telefone(telefone):
                flash('Por favor, insira um telefone válido (10 ou 11 dígitos).', 'danger')
                return render_template('auth/cadastro-cliente.html')

            # Validar CPF se fornecido
            if cpf and not validar_cpf(cpf):
                flash('Por favor, insira um CPF válido (11 dígitos).', 'danger')
                return render_template('auth/cadastro-cliente.html')

            # Verificar se cliente já existe
            cliente_existente = Cliente.query.filter_by(email=email).first()
            if cliente_existente:
                flash('Este email já está registrado como cliente!', 'warning')
                return render_template('auth/cadastro-cliente.html')

            # Verificar CPF se fornecido
            if cpf:
                cpf_existente = Cliente.query.filter_by(cpf=cpf).first()
                if cpf_existente:
                    flash('Este CPF já está registrado!', 'warning')
                    return render_template('auth/cadastro-cliente.html')

            # Converter faixas de preço
            preco_min = None
            preco_max = None
            
            if faixa_preco_min:
                try:
                    preco_min = float(faixa_preco_min.replace('.', '').replace(',', '.'))
                except ValueError:
                    flash('Faixa de preço mínima inválida.', 'danger')
                    return render_template('auth/cadastro-cliente.html')
            
            if faixa_preco_max:
                try:
                    preco_max = float(faixa_preco_max.replace('.', '').replace(',', '.'))
                except ValueError:
                    flash('Faixa de preço máxima inválida.', 'danger')
                    return render_template('auth/cadastro-cliente.html')

            # Validar faixas de preço
            if preco_min and preco_max and preco_min > preco_max:
                flash('A faixa de preço mínima não pode ser maior que a máxima.', 'danger')
                return render_template('auth/cadastro-cliente.html')

            # Criar novo cliente
            novo_cliente = Cliente(
                nome=nome,
                email=email,
                telefone=formatar_telefone(telefone),
                cpf=cpf if cpf else None,
                tipo_cliente=tipo_cliente,
                interesse_tipo=interesse_tipo,
                interesse_regiao=interesse_regiao,
                faixa_preco_min=preco_min,
                faixa_preco_max=preco_max,
                observacoes=observacoes,
                ultimo_contato=datetime.utcnow(),
                ativo=True
            )

            db.session.add(novo_cliente)
            db.session.commit()

            # Registrar log
            registrar_log_acao(
                acao='Cadastro de Cliente',
                detalhes=f'Cliente cadastrado: {nome} ({email})'
            )

            logger.info(f"Novo cliente cadastrado: {email}")
            flash('Cadastro realizado com sucesso! Um corretor entrará em contato em breve.', 'success')
            
            # Redirecionar para página de obrigado
            return redirect(url_for('index'))

        except Exception as e:
            db.session.rollback()
            logger.error(f"Erro ao cadastrar cliente: {e}")
            flash('Erro interno. Tente novamente em alguns minutos.', 'danger')

    # GET - Buscar dados para o formulário
    regioes = ['Zona Leste', 'Zona Sul', 'Zona Norte', 'Zona Oeste', 'Centro']
    tipos_imovel = ['Apartamento', 'Casa', 'Cobertura', 'Terreno', 'Comercial']
    
    return render_template('auth/cadastro-cliente.html', 
                         regioes=regioes, 
                         tipos_imovel=tipos_imovel)


@app.route('/auth/cadastro-corretor', methods=['GET', 'POST'])
@login_required
def cadastro_corretor():
    """Cadastro de corretor (apenas para gerentes e admins)"""
    # Verificar permissões
    if not (current_user.is_admin() or current_user.is_gerente()):
        flash('Acesso negado. Apenas gerentes podem cadastrar corretores.', 'danger')
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        try:
            # Capturar dados do formulário
            nome = request.form.get('nome', '').strip()
            email = request.form.get('email', '').strip().lower()
            telefone = request.form.get('telefone', '').strip()
            creci = request.form.get('creci', '').strip()
            comissao = request.form.get('comissao_percentual', '3.0').strip()
            senha = request.form.get('senha', '').strip()
            confirmar_senha = request.form.get('confirmar_senha', '').strip()

            # Validações obrigatórias
            if not all([nome, email, telefone, creci, senha]):
                flash('Por favor, preencha todos os campos obrigatórios.', 'danger')
                return render_template('auth/cadastro-corretor.html')

            # Validar formato do email
            if not validar_email(email):
                flash('Por favor, insira um email válido.', 'danger')
                return render_template('auth/cadastro-corretor.html')

            # Validar telefone
            if not validar_telefone(telefone):
                flash('Por favor, insira um telefone válido.', 'danger')
                return render_template('auth/cadastro-corretor.html')

            # Validar senhas
            if senha != confirmar_senha:
                flash('As senhas não coincidem.', 'danger')
                return render_template('auth/cadastro-corretor.html')

            if len(senha) < 6:
                flash('A senha deve ter pelo menos 6 caracteres.', 'danger')
                return render_template('auth/cadastro-corretor.html')

            # Validar comissão
            try:
                comissao_float = float(comissao.replace(',', '.'))
                if comissao_float < 0 or comissao_float > 15:
                    flash('A comissão deve estar entre 0% e 15%.', 'danger')
                    return render_template('auth/cadastro-corretor.html')
            except ValueError:
                flash('Percentual de comissão inválido.', 'danger')
                return render_template('auth/cadastro-corretor.html')

            # Encontrar gerente do usuário atual
            gerente = None
            if current_user.is_gerente():
                gerente = Gerente.query.filter_by(usuario_id=current_user.id).first()
            
            if not gerente and not current_user.is_admin():
                flash('Você não está vinculado a um gerente.', 'danger')
                return redirect(url_for('dashboard'))

            # Se for admin, usar o primeiro gerente disponível ou criar um
            if current_user.is_admin() and not gerente:
                gerente = Gerente.query.first()
                if not gerente:
                    flash('É necessário ter pelo menos um gerente cadastrado.', 'danger')
                    return render_template('auth/cadastro-corretor.html')

            # Verificar se email já existe
            usuario_existente = Usuario.query.filter_by(email=email).first()
            if usuario_existente:
                flash('Este email já está em uso!', 'warning')
                return render_template('auth/cadastro-corretor.html')

            corretor_existente = Corretor.query.filter_by(email=email).first()
            if corretor_existente:
                flash('Este email já está registrado como corretor!', 'warning')
                return render_template('auth/cadastro-corretor.html')

            # Criar usuário para o corretor
            novo_usuario = Usuario(
                nome=nome,
                email=email,
                tipo='corretor'
            )
            novo_usuario.set_password(senha)
            
            db.session.add(novo_usuario)
            db.session.flush()  # Para obter o ID

            # Criar corretor
            novo_corretor = Corretor(
                gerente_id=gerente.id,
                usuario_id=novo_usuario.id,
                nome=nome,
                email=email,
                telefone=formatar_telefone(telefone),
                creci=creci,
                comissao_percentual=comissao_float,
                ativo=True
            )

            db.session.add(novo_corretor)
            db.session.commit()

            # Registrar log
            registrar_log_acao(
                acao='Cadastro de Corretor',
                detalhes=f'Corretor cadastrado: {nome} ({email}) - Gerente: {gerente.nome}'
            )

            logger.info(f"Novo corretor cadastrado: {email}")
            flash('Corretor cadastrado com sucesso!', 'success')
            return redirect(url_for('dashboard'))

        except Exception as e:
            db.session.rollback()
            logger.error(f"Erro ao cadastrar corretor: {e}")
            flash('Erro interno. Tente novamente em alguns minutos.', 'danger')

    return render_template('auth/cadastro-corretor.html')


@app.route('/auth/cadastro-imobiliaria', methods=['GET', 'POST'])
def cadastro_imobiliaria():
    """Cadastro de imobiliária"""
    if request.method == 'POST':
        try:
            # Capturar dados do formulário
            nome = request.form.get('nome', '').strip()
            cnpj = request.form.get('cnpj', '').strip()
            creci = request.form.get('creci', '').strip()
            responsavel = request.form.get('responsavel', '').strip()
            email = request.form.get('email', '').strip().lower()
            telefone = request.form.get('telefone', '').strip()
            endereco = request.form.get('endereco', '').strip()
            
            # Dados opcionais do responsável
            email_responsavel = request.form.get('email_responsavel', '').strip().lower()
            telefone_responsavel = request.form.get('telefone_responsavel', '').strip()
            senha = request.form.get('senha', '').strip()
            confirmar_senha = request.form.get('confirmar_senha', '').strip()

            # Validações obrigatórias
            if not all([nome, cnpj, creci, responsavel, email, telefone, endereco]):
                flash('Por favor, preencha todos os campos obrigatórios.', 'danger')
                return render_template('auth/cadastro-imobiliaria.html')

            # Validar formato do email
            if not validar_email(email):
                flash('Por favor, insira um email válido.', 'danger')
                return render_template('auth/cadastro-imobiliaria.html')

            # Validar telefone
            if not validar_telefone(telefone):
                flash('Por favor, insira um telefone válido.', 'danger')
                return render_template('auth/cadastro-imobiliaria.html')

            # Validar CNPJ
            if not validar_cnpj(cnpj):
                flash('Por favor, insira um CNPJ válido (14 dígitos).', 'danger')
                return render_template('auth/cadastro-imobiliaria.html')

            # Validar dados do responsável se fornecidos
            criar_usuario_responsavel = False
            if email_responsavel and senha:
                if not validar_email(email_responsavel):
                    flash('Email do responsável inválido.', 'danger')
                    return render_template('auth/cadastro-imobiliaria.html')
                
                if senha != confirmar_senha:
                    flash('As senhas não coincidem.', 'danger')
                    return render_template('auth/cadastro-imobiliaria.html')
                
                if len(senha) < 6:
                    flash('A senha deve ter pelo menos 6 caracteres.', 'danger')
                    return render_template('auth/cadastro-imobiliaria.html')
                
                criar_usuario_responsavel = True

            # Verificar se imobiliária já existe
            imob_existente = Imobiliaria.query.filter_by(cnpj=cnpj).first()
            if imob_existente:
                flash('CNPJ já está registrado!', 'warning')
                return render_template('auth/cadastro-imobiliaria.html')

            email_existente = Imobiliaria.query.filter_by(email=email).first()
            if email_existente:
                flash('Este email já está registrado!', 'warning')
                return render_template('auth/cadastro-imobiliaria.html')

            # Criar usuário para o responsável se solicitado
            usuario_responsavel = None
            if criar_usuario_responsavel:
                usuario_existente = Usuario.query.filter_by(email=email_responsavel).first()
                if usuario_existente:
                    flash('Email do responsável já está em uso!', 'warning')
                    return render_template('auth/cadastro-imobiliaria.html')
                
                usuario_responsavel = Usuario(
                    nome=responsavel,
                    email=email_responsavel,
                    tipo='imobiliaria'
                )
                usuario_responsavel.set_password(senha)
                db.session.add(usuario_responsavel)
                db.session.flush()

            # Criar imobiliária
            nova_imobiliaria = Imobiliaria(
                nome=nome,
                cnpj=cnpj,
                creci=creci,
                responsavel=responsavel,
                email=email,
                telefone=formatar_telefone(telefone),
                endereco=endereco,
                ativo=True
            )

            db.session.add(nova_imobiliaria)
            db.session.flush()

            # Criar gerente principal se usuário foi criado
            if usuario_responsavel:
                gerente_principal = Gerente(
                    imobiliaria_id=nova_imobiliaria.id,
                    usuario_id=usuario_responsavel.id,
                    nome=responsavel,
                    email=email_responsavel,
                    telefone=telefone_responsavel if telefone_responsavel else telefone,
                    creci=creci,
                    ativo=True
                )
                db.session.add(gerente_principal)

            db.session.commit()

            # Registrar log
            registrar_log_acao(
                acao='Cadastro de Imobiliária',
                detalhes=f'Imobiliária cadastrada: {nome} (CNPJ: {cnpj})'
            )

            logger.info(f"Nova imobiliária cadastrada: {nome}")
            
            if criar_usuario_responsavel:
                flash('Imobiliária e usuário cadastrados com sucesso! Você pode fazer login agora.', 'success')
                return redirect(url_for('auth_signin'))
            else:
                flash('Imobiliária cadastrada com sucesso! Você será contatado em breve.', 'success')
                return redirect(url_for('index'))

        except Exception as e:
            db.session.rollback()
            logger.error(f"Erro ao cadastrar imobiliária: {e}")
            flash('Erro interno. Tente novamente em alguns minutos.', 'danger')

    return render_template('auth/cadastro-imobiliaria.html')


@app.route('/auth/cadastro-gerente', methods=['GET', 'POST'])
@login_required
def cadastro_gerente():
    """Cadastro de gerente (apenas para admins e imobiliárias)"""
    # Verificar permissões
    if not (current_user.is_admin() or current_user.is_imobiliaria()):
        flash('Acesso negado. Apenas administradores e imobiliárias podem cadastrar gerentes.', 'danger')
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        try:
            # Capturar dados
            nome = request.form.get('nome', '').strip()
            email = request.form.get('email', '').strip().lower()
            telefone = request.form.get('telefone', '').strip()
            creci = request.form.get('creci', '').strip()
            imobiliaria_id = request.form.get('imobiliaria_id', '').strip()
            senha = request.form.get('senha', '').strip()
            confirmar_senha = request.form.get('confirmar_senha', '').strip()

            # Validações
            if not all([nome, email, telefone, creci, senha]):
                flash('Por favor, preencha todos os campos obrigatórios.', 'danger')
                return render_template('auth/cadastro-gerente.html')

            if not validar_email(email) or not validar_telefone(telefone):
                flash('Email ou telefone inválido.', 'danger')
                return render_template('auth/cadastro-gerente.html')

            if senha != confirmar_senha or len(senha) < 6:
                flash('Senhas não coincidem ou muito curta (mín. 6 caracteres).', 'danger')
                return render_template('auth/cadastro-gerente.html')

            # Definir imobiliária
            if current_user.is_admin():
                if not imobiliaria_id:
                    flash('Selecione uma imobiliária.', 'danger')
                    return render_template('auth/cadastro-gerente.html')
                imobiliaria = Imobiliaria.query.get(imobiliaria_id)
            else:
                # Se é imobiliária, buscar pela sua própria
                gerente_atual = Gerente.query.filter_by(usuario_id=current_user.id).first()
                imobiliaria = gerente_atual.imobiliaria if gerente_atual else None

            if not imobiliaria:
                flash('Imobiliária não encontrada.', 'danger')
                return render_template('auth/cadastro-gerente.html')

            # Verificar duplicatas
            if Usuario.query.filter_by(email=email).first():
                flash('Email já está em uso!', 'warning')
                return render_template('auth/cadastro-gerente.html')

            # Criar usuário
            novo_usuario = Usuario(nome=nome, email=email, tipo='gerente')
            novo_usuario.set_password(senha)
            db.session.add(novo_usuario)
            db.session.flush()

            # Criar gerente
            novo_gerente = Gerente(
                imobiliaria_id=imobiliaria.id,
                usuario_id=novo_usuario.id,
                nome=nome,
                email=email,
                telefone=formatar_telefone(telefone),
                creci=creci,
                ativo=True
            )

            db.session.add(novo_gerente)
            db.session.commit()

            registrar_log_acao(
                acao='Cadastro de Gerente',
                detalhes=f'Gerente cadastrado: {nome} - Imobiliária: {imobiliaria.nome}'
            )

            flash('Gerente cadastrado com sucesso!', 'success')
            return redirect(url_for('dashboard'))

        except Exception as e:
            db.session.rollback()
            logger.error(f"Erro ao cadastrar gerente: {e}")
            flash('Erro interno. Tente novamente.', 'danger')

    # Buscar imobiliárias para o select (apenas para admins)
    imobiliarias = []
    if current_user.is_admin():
        imobiliarias = Imobiliaria.query.filter_by(ativo=True).all()

    return render_template('auth/cadastro-gerente.html', imobiliarias=imobiliarias)


# ==================== ROTAS AUXILIARES ====================

@app.route('/api/verificar-email', methods=['POST'])
def verificar_email():
    """API para verificar se email já existe"""
    email = request.json.get('email', '').strip().lower()
    
    if not validar_email(email):
        return jsonify({'disponivel': False, 'motivo': 'Email inválido'})
    
    # Verificar em todas as tabelas
    usuario_existente = Usuario.query.filter_by(email=email).first()
    cliente_existente = Cliente.query.filter_by(email=email).first()
    corretor_existente = Corretor.query.filter_by(email=email).first()
    imobiliaria_existente = Imobiliaria.query.filter_by(email=email).first()
    
    if any([usuario_existente, cliente_existente, corretor_existente, imobiliaria_existente]):
        return jsonify({'disponivel': False, 'motivo': 'Email já está em uso'})
    
    return jsonify({'disponivel': True})


@app.route('/api/verificar-cnpj', methods=['POST'])
def verificar_cnpj():
    """API para verificar se CNPJ já existe"""
    cnpj = request.json.get('cnpj', '').strip()
    
    if not validar_cnpj(cnpj):
        return jsonify({'disponivel': False, 'motivo': 'CNPJ inválido'})
    
    imobiliaria_existente = Imobiliaria.query.filter_by(cnpj=cnpj).first()
    
    if imobiliaria_existente:
        return jsonify({'disponivel': False, 'motivo': 'CNPJ já está registrado'})
    
    return jsonify({'disponivel': True})


@app.route('/api/verificar-cpf', methods=['POST'])
def verificar_cpf():
    """API para verificar se CPF já existe"""
    cpf = request.json.get('cpf', '').strip()
    
    if not validar_cpf(cpf):
        return jsonify({'disponivel': False, 'motivo': 'CPF inválido'})
    
    cliente_existente = Cliente.query.filter_by(cpf=cpf).first()
    
    if cliente_existente:
        return jsonify({'disponivel': False, 'motivo': 'CPF já está registrado'})
    
    return jsonify({'disponivel': True})


if __name__ == '__main__':
    app.run(debug=True)