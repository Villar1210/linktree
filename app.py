from flask import Flask, render_template, jsonify
import json
import os
import requests
from datetime import datetime
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

app = Flask(__name__)

# Configurações
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'lumiar_secret_key_2024')

# Configurações do WhatsApp
WHATSAPP_DANIEL = os.getenv('WHATSAPP_DANIEL', "5511999999999")  # Número do Daniel
WHATSAPP_VENDAS = os.getenv('WHATSAPP_VENDAS', "5511888888888")  # Número de vendas

# URLs do Google Drive (substitua pelos seus links públicos)
GOOGLE_DRIVE_JSON_URL = os.getenv('GOOGLE_DRIVE_JSON_URL', "https://drive.google.com/uc?export=download&id=SEU_ID_ARQUIVO")

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
    return render_template('index.html', 
                         dados=dados,
                         whatsapp_daniel=WHATSAPP_DANIEL,
                         whatsapp_vendas=WHATSAPP_VENDAS)

@app.route('/empreendimentos')
def empreendimentos():
    """Página com lista de empreendimentos"""
    dados = carregar_empreendimentos()
    return render_template('empreendimentos.html', 
                         empreendimentos=dados.get('empreendimentos', []),
                         whatsapp_daniel=WHATSAPP_DANIEL,
                         whatsapp_vendas=WHATSAPP_VENDAS)

@app.route('/api/empreendimentos')
def api_empreendimentos():
    """API JSON com dados dos empreendimentos"""
    dados = carregar_empreendimentos()
    return jsonify(dados)

@app.route('/campanhas')
@app.route('/campanhas')
def campanhas():
    """Página de campanhas promocionais"""
    dados = carregar_empreendimentos()
    return render_template('campanhas.html', 
                         campanhas=dados.get('campanhas', []),
                         empreendimentos=dados.get('empreendimentos', []),
                         whatsapp_daniel=WHATSAPP_DANIEL,
                         whatsapp_vendas=WHATSAPP_VENDAS)

@app.route('/vagas')
def vagas():
    """Página de vagas disponíveis"""
    dados = carregar_empreendimentos()
    return render_template('vagas.html', 
                         vagas=dados.get('vagas', []),
                         whatsapp_daniel=WHATSAPP_DANIEL,
                         whatsapp_vendas=WHATSAPP_VENDAS)

@app.route('/contato')
def contato():
    """Página de contato"""
    return render_template('contato.html',
                         whatsapp_daniel=WHATSAPP_DANIEL,
                         whatsapp_vendas=WHATSAPP_VENDAS)

@app.template_filter('whatsapp_link')
def whatsapp_link_filter(numero, mensagem="Olá!"):
    """Filtro para gerar links do WhatsApp"""
    mensagem_encoded = requests.utils.quote(mensagem)
    return f"https://wa.me/{numero}?text={mensagem_encoded}"

@app.context_processor
def inject_whatsapp_numbers():
    """Injeta números de WhatsApp nos templates"""
    return {
        'WHATSAPP_DANIEL': WHATSAPP_DANIEL,
        'WHATSAPP_VENDAS': WHATSAPP_VENDAS
    }

if __name__ == '__main__':
    # Criar pastas necessárias
    os.makedirs('static/images', exist_ok=True)
    os.makedirs('data', exist_ok=True)
    
    # Configurações do servidor
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    app.run(debug=debug, host=host, port=port)