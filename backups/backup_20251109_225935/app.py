from flask import Flask, render_template, jsonify, request, redirect, url_for, flash, session
from flask_migrate import Migrate
import json
import os
import requests
from datetime import datetime
from config import Config
from models import db, init_database, create_sample_data, User, UserType
from auth import auth_system

# Criar aplicação Flask
app = Flask(__name__)

# Configurações
app.config.from_object(Config)

# Inicializar banco de dados e migrações
migrate = Migrate(app, db)
init_database(app)

# Registrar blueprints
from routes_auth import auth_bp
from routes_admin import admin_bp  
from routes_corretor import corretor_bp
from routes_cliente import cliente_bp
from routes_imobiliaria import imobiliaria_bp

app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(corretor_bp) 
app.register_blueprint(cliente_bp)
app.register_blueprint(imobiliaria_bp)

# URLs do Google Drive (substitua pelos seus links públicos)
GOOGLE_DRIVE_JSON_URL = "https://drive.google.com/uc?export=download&id=SEU_ID_ARQUIVO"

def carregar_empreendimentos():
    """Carrega dados dos empreendimentos do Google Drive ou arquivo local"""
    try:
        # Tenta carregar do Google Drive primeiro
        if GOOGLE_DRIVE_JSON_URL != "https://drive.google.com/uc?export=download&id=SEU_ID_ARQUIVO":
            response = requests.get(GOOGLE_DRIVE_JSON_URL, timeout=5)
            if response.status_code == 200:
                return response.json()
    except:
        pass
    
    # Fallback para arquivo local
    try:
        with open('data/empreendimentos.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        # Dados de exemplo se não encontrar arquivo
        return {
            "empreendimentos": [
                {
                    "id": 1,
                    "nome": "Residencial Vila Madalena",
                    "tipo": "Apartamento",
                    "status": "Disponível",
                    "preco": "R$ 450.000",
                    "localizacao": "Vila Madalena, SP",
                    "quartos": 2,
                    "banheiros": 2,
                    "area": "65m²",
                    "imagem": "/static/images/vila-madalena.jpg",
                    "descricao": "Moderno apartamento em localização privilegiada",
                    "whatsapp_message": "Olá! Gostaria de saber mais sobre o Residencial Vila Madalena"
                },
                {
                    "id": 2,
                    "nome": "Casa Morumbi Premium",
                    "tipo": "Casa",
                    "status": "Lançamento",
                    "preco": "R$ 850.000",
                    "localizacao": "Morumbi, SP",
                    "quartos": 3,
                    "banheiros": 3,
                    "area": "180m²",
                    "imagem": "/static/images/morumbi.jpg",
                    "descricao": "Casa de alto padrão com acabamentos diferenciados",
                    "whatsapp_message": "Olá! Tenho interesse na Casa Morumbi Premium"
                },
                {
                    "id": 3,
                    "nome": "Cobertura Itaim Bibi",
                    "tipo": "Cobertura",
                    "status": "Em Obras",
                    "preco": "R$ 1.200.000",
                    "localizacao": "Itaim Bibi, SP",
                    "quartos": 4,
                    "banheiros": 4,
                    "area": "220m²",
                    "imagem": "/static/images/itaim.jpg",
                    "descricao": "Cobertura duplex com vista panorâmica",
                    "whatsapp_message": "Olá! Quero mais informações sobre a Cobertura Itaim Bibi"
                }
            ],
            "campanhas": [
                {
                    "titulo": "🚀 CAMPANHA RELÂMPAGO",
                    "subtitulo": "Desconto especial por tempo limitado!",
                    "desconto": "15% OFF",
                    "prazo": "Válido até 31/12/2024",
                    "empreendimentos": [1, 2]
                }
            ],
            "vagas": [
                {
                    "cargo": "Corretor de Imóveis",
                    "tipo": "Presencial/Híbrido",
                    "requisitos": "Experiência mínima de 2 anos",
                    "beneficios": "Comissão diferenciada + Benefícios",
                    "contato": "Fale com Daniel para mais informações"
                }
            ]
        }

@app.route('/')
def index():
    """Página principal com todos os botões"""
    dados = carregar_empreendimentos()
    
    # Verificar se o usuário está logado para personalizar a experiência
    user_info = None
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            user_info = {
                'nome': user.nome,
                'tipo': user.user_type.value,
                'email': user.email
            }
    
    return render_template('index.html', dados=dados, user_info=user_info)

@app.route('/empreendimentos')
def empreendimentos():
    """Página com lista de empreendimentos"""
    dados = carregar_empreendimentos()
    return render_template('empreendimentos.html', 
                         empreendimentos=dados.get('empreendimentos', []))

@app.route('/api/empreendimentos')
def api_empreendimentos():
    """API JSON com dados dos empreendimentos"""
    dados = carregar_empreendimentos()
    return jsonify(dados)

@app.route('/campanhas')
def campanhas():
    """Página de campanhas promocionais"""
    dados = carregar_empreendimentos()
    return render_template('campanhas.html', 
                         campanhas=dados.get('campanhas', []),
                         empreendimentos=dados.get('empreendimentos', []))

@app.route('/vagas')
def vagas():
    """Página de vagas disponíveis"""
    dados = carregar_empreendimentos()
    return render_template('vagas.html', 
                         vagas=dados.get('vagas', []))

@app.route('/contato')
def contato():
    """Página de contato"""
    return render_template('contato.html')

# Números de WhatsApp (substitua pelos números reais)
WHATSAPP_DANIEL = "5511999999999"  # Número do Daniel
WHATSAPP_VENDAS = "5511888888888"  # Número de vendas

@app.template_filter('whatsapp_link')
def whatsapp_link_filter(numero, mensagem="Olá!"):
    """Filtro para gerar links do WhatsApp"""
    mensagem_encoded = requests.utils.quote(mensagem)
    return f"https://wa.me/{numero}?text={mensagem_encoded}"

@app.route('/empreendimento/<int:id>')
def empreendimento_detalhes(id):
    """Página individual do empreendimento"""
    dados = carregar_empreendimentos()
    
    # Buscar empreendimento pelo ID
    empreendimento = None
    for emp in dados['empreendimentos']:
        if emp['id'] == id:
            empreendimento = emp
            break
    
    if not empreendimento:
        flash('Empreendimento não encontrado.', 'error')
        return redirect(url_for('empreendimentos'))
    
    # Informações do usuário logado (se existir)
    user_info = None
    if session.get('user_id'):
        user = User.query.get(session['user_id'])
        if user:
            user_info = {
                'nome': user.nome,
                'email': user.email,
                'tipo': user.tipo.value
            }
    
    return render_template('empreendimento-detalhes.html', 
                         empreendimento=empreendimento,
                         user_info=user_info)

@app.route('/suzano')
def suzano_empreendimentos():
    """Página específica para empreendimentos de Suzano"""
    dados = carregar_empreendimentos()
    
    # Filtrar empreendimentos de Suzano
    empreendimentos_suzano = [
        emp for emp in dados['empreendimentos'] 
        if 'Suzano' in emp['localizacao']
    ]
    
    user_info = None
    if session.get('user_id'):
        user = User.query.get(session['user_id'])
        if user:
            user_info = {
                'nome': user.nome,
                'email': user.email,
                'tipo': user.tipo.value
            }
    
    return render_template('cidade-empreendimentos.html', 
                         cidade='Suzano',
                         empreendimentos=empreendimentos_suzano,
                         user_info=user_info,
                         whatsapp_cidade='5511999665544')

@app.route('/mogi')
def mogi_empreendimentos():
    """Página específica para empreendimentos de Mogi das Cruzes"""
    dados = carregar_empreendimentos()
    
    # Filtrar empreendimentos de Mogi das Cruzes
    empreendimentos_mogi = [
        emp for emp in dados['empreendimentos'] 
        if 'Mogi' in emp['localizacao']
    ]
    
    user_info = None
    if session.get('user_id'):
        user = User.query.get(session['user_id'])
        if user:
            user_info = {
                'nome': user.nome,
                'email': user.email,
                'tipo': user.tipo.value
            }
    
    return render_template('cidade-empreendimentos.html', 
                         cidade='Mogi das Cruzes',
                         empreendimentos=empreendimentos_mogi,
                         user_info=user_info,
                         whatsapp_cidade='5511999554433')

@app.context_processor
def inject_whatsapp_numbers():
    """Injeta números de WhatsApp nos templates"""
    return {
        'WHATSAPP_DANIEL': WHATSAPP_DANIEL,
        'WHATSAPP_VENDAS': WHATSAPP_VENDAS
    }

@app.route('/init-sample-data')
def init_sample_data():
    """Rota para criar dados de exemplo (apenas em desenvolvimento)"""
    if app.config['DEBUG']:
        try:
            create_sample_data()
            return jsonify({
                'success': True, 
                'message': 'Dados de exemplo criados com sucesso!'
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Erro ao criar dados: {str(e)}'
            }), 500
    else:
        return jsonify({
            'success': False,
            'message': 'Disponível apenas em modo de desenvolvimento'
        }), 403

if __name__ == '__main__':
    # Criar pastas necessárias
    os.makedirs('static/images', exist_ok=True)
    os.makedirs('data', exist_ok=True)
    
    app.run(debug=True, host='0.0.0.0', port=5000)