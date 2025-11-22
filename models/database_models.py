# ==================== MODELOS ADICIONAIS ====================

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# ==================== MODELO USUARIO BASE ====================

class Usuario(UserMixin, db.Model):
    """Modelo base de usuário com Flask-Login"""
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    senha_hash = db.Column(db.String(255), nullable=False)
    tipo = db.Column(db.String(20), nullable=False, default='cliente')  # admin, imobiliaria, gerente, corretor, cliente
    ativo = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    ultimo_login = db.Column(db.DateTime, nullable=True)
    
    def set_password(self, senha):
        """Define a senha do usuário com hash"""
        self.senha_hash = generate_password_hash(senha)
    
    def check_password(self, senha):
        """Verifica se a senha está correta"""
        return check_password_hash(self.senha_hash, senha)
    
    def is_admin(self):
        """Verifica se o usuário é administrador"""
        return self.tipo == 'admin'
    
    def is_imobiliaria(self):
        """Verifica se o usuário é imobiliária"""
        return self.tipo == 'imobiliaria'
    
    def is_gerente(self):
        """Verifica se o usuário é gerente"""
        return self.tipo == 'gerente'
    
    def is_corretor(self):
        """Verifica se o usuário é corretor"""
        return self.tipo == 'corretor'
    
    def is_cliente(self):
        """Verifica se o usuário é cliente"""
        return self.tipo == 'cliente'
    
    def __repr__(self):
        return f'<Usuario {self.nome} ({self.tipo})>'


# ==================== MODELOS PRINCIPAIS ====================

class Imobiliaria(db.Model):
    """Modelo de imobiliária"""
    __tablename__ = 'imobiliarias'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False, unique=True)
    cnpj = db.Column(db.String(18), nullable=False, unique=True)
    creci = db.Column(db.String(20), nullable=False)
    responsavel = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    endereco = db.Column(db.String(300), nullable=False)
    ativo = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    gerentes = db.relationship('Gerente', backref='imobiliaria', lazy=True, cascade='all, delete-orphan')
    empreendimentos = db.relationship('Empreendimento', backref='imobiliaria', lazy=True, cascade='all, delete-orphan')
    
    def get_total_gerentes(self):
        """Retorna o total de gerentes ativos"""
        return len([g for g in self.gerentes if g.ativo])
    
    def get_total_corretores(self):
        """Retorna o total de corretores de todos os gerentes"""
        total = 0
        for gerente in self.gerentes:
            total += len([c for c in gerente.corretores if c.ativo])
        return total
    
    def get_total_empreendimentos(self):
        """Retorna o total de empreendimentos ativos"""
        return len([e for e in self.empreendimentos if e.ativo])
    
    def __repr__(self):
        return f'<Imobiliaria {self.nome}>'


class Gerente(db.Model):
    """Modelo de gerente da imobiliária"""
    __tablename__ = 'gerentes'
    
    id = db.Column(db.Integer, primary_key=True)
    imobiliaria_id = db.Column(db.Integer, db.ForeignKey('imobiliarias.id'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=True)
    nome = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    creci = db.Column(db.String(20), nullable=False)
    ativo = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    usuario = db.relationship('Usuario', backref='gerente_profile', uselist=False)
    corretores = db.relationship('Corretor', backref='gerente', lazy=True, cascade='all, delete-orphan')
    
    def get_total_corretores(self):
        """Retorna o total de corretores ativos"""
        return len([c for c in self.corretores if c.ativo])
    
    def get_total_clientes(self):
        """Retorna o total de clientes de todos os corretores"""
        total = 0
        for corretor in self.corretores:
            total += len([c for c in corretor.clientes if c.ativo])
        return total
    
    def __repr__(self):
        return f'<Gerente {self.nome}>'


class Corretor(db.Model):
    """Modelo de corretor"""
    __tablename__ = 'corretores'
    
    id = db.Column(db.Integer, primary_key=True)
    gerente_id = db.Column(db.Integer, db.ForeignKey('gerentes.id'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=True)
    nome = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    creci = db.Column(db.String(20), nullable=False)
    comissao_percentual = db.Column(db.Float, default=3.0)  # Percentual de comissão
    ativo = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    usuario = db.relationship('Usuario', backref='corretor_profile', uselist=False)
    clientes = db.relationship('Cliente', backref='corretor', lazy=True)
    vendas = db.relationship('Venda', backref='corretor', lazy=True)
    
    def get_total_clientes(self):
        """Retorna o total de clientes ativos"""
        return len([c for c in self.clientes if c.ativo])
    
    def get_total_vendas(self):
        """Retorna o total de vendas"""
        return len(self.vendas)
    
    def get_comissao_total(self):
        """Calcula a comissão total das vendas"""
        total = 0
        for venda in self.vendas:
            if venda.status == 'Concluída':
                total += venda.valor * (self.comissao_percentual / 100)
        return total
    
    def __repr__(self):
        return f'<Corretor {self.nome}>'


class Cliente(db.Model):
    """Modelo de cliente"""
    __tablename__ = 'clientes'
    
    id = db.Column(db.Integer, primary_key=True)
    corretor_id = db.Column(db.Integer, db.ForeignKey('corretores.id'), nullable=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=True)
    nome = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    telefone = db.Column(db.String(20), nullable=False)
    cpf = db.Column(db.String(14), unique=True, nullable=True)
    tipo_cliente = db.Column(db.String(50), default='Potencial')  # Potencial, Negociando, Fechado, Desistiu
    interesse_tipo = db.Column(db.String(100), nullable=True)  # Apartamento, Casa, Cobertura
    interesse_regiao = db.Column(db.String(100), nullable=True)  # Zona Leste, Zona Sul, etc
    faixa_preco_min = db.Column(db.Float, nullable=True)
    faixa_preco_max = db.Column(db.Float, nullable=True)
    observacoes = db.Column(db.Text, nullable=True)
    ativo = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    ultimo_contato = db.Column(db.DateTime, nullable=True)
    
    # Relacionamentos
    usuario = db.relationship('Usuario', backref='cliente_profile', uselist=False)
    vendas = db.relationship('Venda', backref='cliente', lazy=True)
    
    def get_faixa_preco_formatada(self):
        """Retorna a faixa de preço formatada"""
        if self.faixa_preco_min and self.faixa_preco_max:
            return f"R$ {self.faixa_preco_min:,.2f} - R$ {self.faixa_preco_max:,.2f}"
        elif self.faixa_preco_min:
            return f"A partir de R$ {self.faixa_preco_min:,.2f}"
        elif self.faixa_preco_max:
            return f"Até R$ {self.faixa_preco_max:,.2f}"
        return "Não informado"
    
    def dias_sem_contato(self):
        """Retorna quantos dias sem contato"""
        if self.ultimo_contato:
            return (datetime.utcnow() - self.ultimo_contato).days
        return (datetime.utcnow() - self.data_criacao).days
    
    def __repr__(self):
        return f'<Cliente {self.nome}>'


class Empreendimento(db.Model):
    """Modelo de empreendimento"""
    __tablename__ = 'empreendimentos'
    
    id = db.Column(db.Integer, primary_key=True)
    imobiliaria_id = db.Column(db.Integer, db.ForeignKey('imobiliarias.id'), nullable=False)
    nome = db.Column(db.String(200), nullable=False)
    descricao = db.Column(db.Text, nullable=True)
    tipo = db.Column(db.String(50), nullable=False)  # Apartamento, Casa, Cobertura
    regiao = db.Column(db.String(100), nullable=False)  # Zona Leste, Zona Sul, etc
    endereco = db.Column(db.String(300), nullable=False)
    status = db.Column(db.String(50), default='Disponível')  # Disponível, Em Obras, Lançamento, Indisponível
    preco_base = db.Column(db.Float, nullable=False)
    quantidade_unidades = db.Column(db.Integer, default=1)
    unidades_vendidas = db.Column(db.Integer, default=0)
    quartos = db.Column(db.Integer, nullable=True)
    banheiros = db.Column(db.Integer, nullable=True)
    area_m2 = db.Column(db.Float, nullable=True)
    imagem_url = db.Column(db.String(500), nullable=True)
    data_lancamento = db.Column(db.DateTime, nullable=True)
    ativo = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    vendas = db.relationship('Venda', backref='empreendimento', lazy=True)
    
    def get_preco_formatado(self):
        """Retorna o preço formatado"""
        return f"R$ {self.preco_base:,.2f}"
    
    def get_percentual_vendido(self):
        """Retorna o percentual de unidades vendidas"""
        if self.quantidade_unidades > 0:
            return (self.unidades_vendidas / self.quantidade_unidades) * 100
        return 0
    
    def get_unidades_disponiveis(self):
        """Retorna o número de unidades disponíveis"""
        return self.quantidade_unidades - self.unidades_vendidas
    
    def is_disponivel(self):
        """Verifica se há unidades disponíveis"""
        return self.get_unidades_disponiveis() > 0 and self.ativo
    
    def __repr__(self):
        return f'<Empreendimento {self.nome}>'


class Venda(db.Model):
    """Modelo de venda/negociação"""
    __tablename__ = 'vendas'
    
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    corretor_id = db.Column(db.Integer, db.ForeignKey('corretores.id'), nullable=False)
    empreendimento_id = db.Column(db.Integer, db.ForeignKey('empreendimentos.id'), nullable=False)
    valor = db.Column(db.Float, nullable=False)
    valor_comissao = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(50), default='Em Negociação')  # Em Negociação, Proposta Enviada, Concluída, Cancelada
    forma_pagamento = db.Column(db.String(100), nullable=True)  # À vista, Financiado, Parcelado
    observacoes = db.Column(db.Text, nullable=True)
    data_proposta = db.Column(db.DateTime, default=datetime.utcnow)
    data_conclusao = db.Column(db.DateTime, nullable=True)
    
    def get_valor_formatado(self):
        """Retorna o valor formatado"""
        return f"R$ {self.valor:,.2f}"
    
    def get_comissao_formatada(self):
        """Retorna a comissão formatada"""
        if self.valor_comissao:
            return f"R$ {self.valor_comissao:,.2f}"
        return "Não calculada"
    
    def calcular_comissao(self):
        """Calcula a comissão baseada no percentual do corretor"""
        if self.corretor and self.corretor.comissao_percentual:
            self.valor_comissao = self.valor * (self.corretor.comissao_percentual / 100)
            return self.valor_comissao
        return 0
    
    def dias_em_negociacao(self):
        """Retorna quantos dias está em negociação"""
        data_fim = self.data_conclusao if self.data_conclusao else datetime.utcnow()
        return (data_fim - self.data_proposta).days
    
    def __repr__(self):
        return f'<Venda {self.cliente.nome} - {self.empreendimento.nome}>'


class ConfiguracaoEmpresa(db.Model):
    """Modelo de configurações da empresa"""
    __tablename__ = 'configuracoes_empresa'
    
    id = db.Column(db.Integer, primary_key=True)
    whatsapp_vendas = db.Column(db.String(20), nullable=False)
    whatsapp_gerente = db.Column(db.String(20), nullable=False)
    email_contato = db.Column(db.String(120), nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    horario_funcionamento = db.Column(db.String(100), nullable=True)
    endereco_empresa = db.Column(db.String(300), nullable=True)
    website = db.Column(db.String(200), nullable=True)
    nome_empresa = db.Column(db.String(200), nullable=True)
    logo_url = db.Column(db.String(500), nullable=True)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @classmethod
    def get_config(cls):
        """Retorna a configuração única da empresa"""
        config = cls.query.first()
        if not config:
            # Criar configuração padrão se não existir
            config = cls(
                whatsapp_vendas='5511999999999',
                whatsapp_gerente='5511888888888',
                email_contato='contato@empresa.com',
                telefone='(11) 99999-9999',
                horario_funcionamento='Seg-Sex 8h-18h | Sab 8h-14h',
                nome_empresa='Construtora Lumiar'
            )
            db.session.add(config)
            db.session.commit()
        return config
    
    def __repr__(self):
        return '<ConfiguracaoEmpresa>'


class LogSistema(db.Model):
    """Modelo para logs do sistema"""
    __tablename__ = 'logs_sistema'
    
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=True)
    acao = db.Column(db.String(100), nullable=False)
    detalhes = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(50), nullable=True)
    user_agent = db.Column(db.String(300), nullable=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    usuario = db.relationship('Usuario', backref='logs', lazy=True)
    
    @classmethod
    def registrar_acao(cls, usuario_id, acao, detalhes=None, ip_address=None, user_agent=None):
        """Registra uma ação no sistema"""
        log = cls(
            usuario_id=usuario_id,
            acao=acao,
            detalhes=detalhes,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.session.add(log)
        db.session.commit()
        return log
    
    def __repr__(self):
        return f'<LogSistema {self.acao} - {self.data_criacao}>'


# ==================== FUNÇÕES AUXILIARES ====================

def criar_usuario_admin(email='admin@lumiar.com', senha='admin123', nome='Administrador'):
    """Cria um usuário administrador padrão"""
    admin = Usuario.query.filter_by(email=email).first()
    if not admin:
        admin = Usuario(
            nome=nome,
            email=email,
            tipo='admin'
        )
        admin.set_password(senha)
        db.session.add(admin)
        db.session.commit()
        
        LogSistema.registrar_acao(
            usuario_id=admin.id,
            acao='Criação de usuário admin',
            detalhes='Usuário administrador criado automaticamente'
        )
    
    return admin


def init_db(app):
    """Inicializa o banco de dados"""
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
        
        # Criar usuário admin padrão
        criar_usuario_admin()
        
        # Criar configuração padrão
        ConfiguracaoEmpresa.get_config()
        
        print("✅ Banco de dados inicializado com sucesso!")


# ==================== ESTATÍSTICAS ====================

def get_dashboard_stats():
    """Retorna estatísticas para o dashboard"""
    stats = {
        'total_usuarios': Usuario.query.count(),
        'total_imobiliarias': Imobiliaria.query.filter_by(ativo=True).count(),
        'total_gerentes': Gerente.query.filter_by(ativo=True).count(),
        'total_corretores': Corretor.query.filter_by(ativo=True).count(),
        'total_clientes': Cliente.query.filter_by(ativo=True).count(),
        'total_empreendimentos': Empreendimento.query.filter_by(ativo=True).count(),
        'total_vendas': Venda.query.count(),
        'vendas_concluidas': Venda.query.filter_by(status='Concluída').count(),
        'vendas_em_andamento': Venda.query.filter_by(status='Em Negociação').count()
    }
    
    # Calcular valores totais
    vendas_concluidas = Venda.query.filter_by(status='Concluída').all()
    stats['valor_total_vendas'] = sum(venda.valor for venda in vendas_concluidas)
    stats['valor_total_comissoes'] = sum(venda.valor_comissao or 0 for venda in vendas_concluidas)
    
    return stats