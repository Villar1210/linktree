# --- Modelo User seguro e limpo ---
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    is_email_confirmed = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.email}>'
# 🗄️ Modelos de Banco de Dados - iVillar Platform
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
db = SQLAlchemy()


# 🗄️ Modelos de Banco de Dados - iVillar Platform
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import enum
from sqlalchemy import Enum

db = SQLAlchemy()

class UserType(enum.Enum):
    """Tipos de usuário do sistema"""
    CLIENTE = "cliente"
    CORRETOR = "corretor" 
    IMOBILIARIA = "imobiliaria"
    ADMIN = "admin"

class UserStatus(enum.Enum):
    """Status do usuário"""
    ATIVO = "ativo"
    INATIVO = "inativo"
    PENDENTE = "pendente"
    SUSPENSO = "suspenso"

class User(db.Model):
    """Modelo base para todos os usuários"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    user_type = db.Column(Enum(UserType), nullable=False, index=True)
    status = db.Column(Enum(UserStatus), default=UserStatus.ATIVO, nullable=False)
    
    # Dados básicos
    nome = db.Column(db.String(100), nullable=False)
    telefone = db.Column(db.String(20))
    foto_perfil = db.Column(db.String(200))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Dados de verificação
    email_verified = db.Column(db.Boolean, default=False)
    phone_verified = db.Column(db.Boolean, default=False)
    
    # Relacionamentos
    cliente_profile = db.relationship('ClienteProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    corretor_profile = db.relationship('CorretorProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    imobiliaria_profile = db.relationship('ImobiliariaProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.email}>'
    
    def to_dict(self):
        """Converter para dicionário"""
        return {
            'id': self.id,
            'email': self.email,
            'user_type': self.user_type.value,
            'status': self.status.value,
            'nome': self.nome,
            'telefone': self.telefone,
            'foto_perfil': self.foto_perfil,
            'email_verified': self.email_verified,
            'phone_verified': self.phone_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class ClienteProfile(db.Model):
    """Perfil específico para clientes"""
    __tablename__ = 'cliente_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Documentos
    cpf = db.Column(db.String(14), unique=True, index=True)
    rg = db.Column(db.String(20))
    
    # Endereço
    cep = db.Column(db.String(10))
    endereco = db.Column(db.String(200))
    numero = db.Column(db.String(10))
    complemento = db.Column(db.String(100))
    bairro = db.Column(db.String(100))
    cidade = db.Column(db.String(100))
    estado = db.Column(db.String(2))
    
    # Preferências de busca
    tipo_imovel_interesse = db.Column(db.JSON)  # ["apartamento", "casa", "terreno"]
    faixa_preco_min = db.Column(db.Numeric(15, 2))
    faixa_preco_max = db.Column(db.Numeric(15, 2))
    regioes_interesse = db.Column(db.JSON)  # ["centro", "zona_norte"]
    
    # Dados profissionais
    profissao = db.Column(db.String(100))
    renda_mensal = db.Column(db.Numeric(15, 2))
    estado_civil = db.Column(db.String(20))
    
    # Preferências de contato
    prefere_whatsapp = db.Column(db.Boolean, default=True)
    prefere_email = db.Column(db.Boolean, default=True)
    prefere_ligacao = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f'<ClienteProfile {self.user.nome}>'

class CorretorProfile(db.Model):
    """Perfil específico para corretores"""
    __tablename__ = 'corretor_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Dados profissionais
    creci = db.Column(db.String(20), unique=True, nullable=False, index=True)
    cpf = db.Column(db.String(14), unique=True, index=True)
    
    # Informações profissionais
    biografia = db.Column(db.Text)
    especializacoes = db.Column(db.JSON)  # ["residencial", "comercial", "rural"]
    regioes_atuacao = db.Column(db.JSON)  # ["centro", "zona_sul"]
    anos_experiencia = db.Column(db.Integer)
    
    # Dados da equipe/imobiliária
    imobiliaria_id = db.Column(db.Integer, db.ForeignKey('imobiliaria_profiles.id'))
    cargo = db.Column(db.String(100))  # "Corretor", "Gerente", "Diretor"
    
    # Métricas e metas
    meta_vendas_mes = db.Column(db.Numeric(15, 2))
    vendas_realizadas_mes = db.Column(db.Integer, default=0)
    comissao_padrao = db.Column(db.Numeric(5, 2))  # Percentual
    
    # Configurações
    ativo_para_leads = db.Column(db.Boolean, default=True)
    aceita_parcerias = db.Column(db.Boolean, default=True)
    
    # Dados bancários (para comissões)
    banco = db.Column(db.String(100))
    agencia = db.Column(db.String(20))
    conta = db.Column(db.String(20))
    pix = db.Column(db.String(100))
    
    def __repr__(self):
        return f'<CorretorProfile CRECI: {self.creci}>'

class ImobiliariaProfile(db.Model):
    """Perfil específico para imobiliárias"""
    __tablename__ = 'imobiliaria_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Dados da empresa
    razao_social = db.Column(db.String(200), nullable=False)
    nome_fantasia = db.Column(db.String(200))
    cnpj = db.Column(db.String(18), unique=True, nullable=False, index=True)
    creci_empresa = db.Column(db.String(20), unique=True, index=True)
    
    # Endereço comercial
    cep = db.Column(db.String(10))
    endereco = db.Column(db.String(200))
    numero = db.Column(db.String(10))
    complemento = db.Column(db.String(100))
    bairro = db.Column(db.String(100))
    cidade = db.Column(db.String(100))
    estado = db.Column(db.String(2))
    
    # Informações comerciais
    descricao = db.Column(db.Text)
    site = db.Column(db.String(200))
    logo = db.Column(db.String(200))
    
    # Dados do responsável
    responsavel_nome = db.Column(db.String(100), nullable=False)
    responsavel_cpf = db.Column(db.String(14))
    responsavel_creci = db.Column(db.String(20))
    
    # Configurações da empresa
    quantidade_corretores = db.Column(db.Integer, default=1)
    tipos_imoveis = db.Column(db.JSON)  # ["residencial", "comercial", "rural"]
    regioes_atuacao = db.Column(db.JSON)
    
    # Planos e limites
    plano_ativo = db.Column(db.String(50), default='basico')  # basico, premium, enterprise
    limite_imoveis = db.Column(db.Integer, default=50)
    limite_corretores = db.Column(db.Integer, default=5)
    
    # Relacionamentos
    corretores = db.relationship('CorretorProfile', backref='imobiliaria', foreign_keys=[CorretorProfile.imobiliaria_id])
    
    def __repr__(self):
        return f'<ImobiliariaProfile {self.nome_fantasia}>'

class PropertyType(enum.Enum):
    """Tipos de imóveis"""
    APARTAMENTO = "apartamento"
    CASA = "casa"
    TERRENO = "terreno"
    COMERCIAL = "comercial"
    RURAL = "rural"
    GALPAO = "galpao"

class PropertyStatus(enum.Enum):
    """Status do imóvel"""
    DISPONIVEL = "disponivel"
    VENDIDO = "vendido"
    ALUGADO = "alugado"
    RESERVADO = "reservado"
    INATIVO = "inativo"

class Property(db.Model):
    """Imóveis cadastrados na plataforma"""
    __tablename__ = 'properties'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)  # Ex: Apartamento, Casa, Cobertura
    status = db.Column(db.String(30), nullable=False, default='Disponível')
    preco = db.Column(db.Numeric(15,2), nullable=False)
    localizacao = db.Column(db.String(200))
    quartos = db.Column(db.Integer)
    banheiros = db.Column(db.Integer)
    area = db.Column(db.String(30))
    imagem = db.Column(db.String(200))  # Caminho/URL da imagem
    video = db.Column(db.String(300))   # URL/caminho do vídeo
    planta_pdf = db.Column(db.String(300))  # URL/caminho do PDF/planta
    galeria = db.Column(db.Text)  # Lista de imagens (JSON ou CSV)
    descricao = db.Column(db.Text)
    destaque = db.Column(db.Boolean, default=False)
    ativo = db.Column(db.Boolean, default=True)
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)
    atualizado_em = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Property {self.nome}>'

class Lead(db.Model):
    """Modelo para leads/interessados"""
    __tablename__ = 'leads'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Dados do lead
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), index=True)
    telefone = db.Column(db.String(20))
    mensagem = db.Column(db.Text)
    
    # Relacionamentos
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), index=True)
    property = db.relationship('Property', backref='leads')
    
    corretor_id = db.Column(db.Integer, db.ForeignKey('corretor_profiles.id'), index=True)
    corretor = db.relationship('CorretorProfile', backref='leads')
    
    # Status do lead
    status = db.Column(db.String(50), default='novo', index=True)  # novo, contactado, interessado, nao_interessado
    
    # Origem do lead
    origem = db.Column(db.String(50), index=True)  # linktree, site, whatsapp, etc
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Lead {self.nome}>'

class Campanha(db.Model):
    """Campanhas promocionais de imóveis"""
    __tablename__ = 'campanhas'

    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(120), nullable=False)
    subtitulo = db.Column(db.String(200))
    desconto = db.Column(db.String(60))  # Ex: '10% OFF + Brinde'
    beneficios = db.Column(db.String(300))  # Ex: 'FGTS aceito;Financiamento até 35 anos'
    condicoes = db.Column(db.String(300))  # Ex: 'Região leste'

    # Mídias e customização visual
    imagem = db.Column(db.String(300))  # URL ou caminho da imagem
    video = db.Column(db.String(300))   # URL do vídeo
    audio = db.Column(db.String(300))   # URL do áudio
    cor_fundo = db.Column(db.String(20))  # Ex: '#ff9800'
    cor_texto = db.Column(db.String(20))  # Ex: '#222222'

    destaque = db.Column(db.Boolean, default=False)
    ativo = db.Column(db.Boolean, default=True)
    data_inicio = db.Column(db.DateTime)
    data_fim = db.Column(db.DateTime)
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)
    atualizado_em = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def beneficios_lista(self):
        return self.beneficios.split(';') if self.beneficios else []

    def __repr__(self):
        return f'<Campanha {self.titulo}>'

# Função para inicializar o banco de dados
def init_database(app):
    """Inicializar banco de dados com dados básicos"""
    db.init_app(app)
    
    with app.app_context():
        # Criar todas as tabelas
        db.create_all()
        
        # Verificar se já existe usuário admin
        admin_user = User.query.filter_by(email='admin@ivillar.com.br').first()
        
        if not admin_user:
            # Importar sistema de auth para hash da senha
            from auth import auth_system
            
            # Criar usuário administrador padrão
            admin_user = User(
                email='admin@ivillar.com.br',
                password_hash=auth_system.hash_password('Admin@123'),
                user_type=UserType.ADMIN,
                nome='Administrador do Sistema',
                telefone='(11) 99999-9999',
                status=UserStatus.ATIVO,
                email_verified=True
            )
            
            db.session.add(admin_user)
            db.session.commit()
            
            print("✅ Usuário administrador criado:")
            print("   Email: admin@ivillar.com.br")
            print("   Senha: Admin@123")
            print("   (Altere a senha após o primeiro login)")

def create_sample_data():
    """Criar dados de exemplo para desenvolvimento"""
    from auth import auth_system
    
    # Criar corretor de exemplo
    corretor_user = User(
        email='corretor@lumiar.com.br',
        password_hash=auth_system.hash_password('Corretor@123'),
        user_type=UserType.CORRETOR,
        nome='João Silva',
        telefone='(11) 98765-4321',
        status=UserStatus.ATIVO,
        email_verified=True
    )
    db.session.add(corretor_user)
    db.session.flush()  # Para obter o ID
    
    # Perfil do corretor
    corretor_profile = CorretorProfile(
        user_id=corretor_user.id,
        creci='12345-F',
        cpf='123.456.789-10',
        biografia='Corretor especializado em imóveis residenciais há mais de 10 anos.',
        especializacoes=['residencial', 'comercial'],
        regioes_atuacao=['centro', 'zona_sul'],
        anos_experiencia=10,
        comissao_padrao=6.0,
        ativo_para_leads=True
    )
    db.session.add(corretor_profile)
    
    # Cliente de exemplo
    cliente_user = User(
        email='cliente@teste.com.br',
        password_hash=auth_system.hash_password('Cliente@123'),
        user_type=UserType.CLIENTE,
        nome='Maria Santos',
        telefone='(11) 91234-5678',
        status=UserStatus.ATIVO,
        email_verified=True
    )
    db.session.add(cliente_user)
    db.session.flush()
    
    # Perfil do cliente
    cliente_profile = ClienteProfile(
        user_id=cliente_user.id,
        cpf='987.654.321-00',
        faixa_preco_min=200000,
        faixa_preco_max=500000,
        tipo_imovel_interesse=['apartamento', 'casa'],
        profissao='Engenheira',
        renda_mensal=8000
    )
    db.session.add(cliente_profile)
    
    db.session.commit()
    
    print("✅ Dados de exemplo criados:")
    print("   Corretor: corretor@lumiar.com.br / Corretor@123")
    print("   Cliente: cliente@teste.com.br / Cliente@123")