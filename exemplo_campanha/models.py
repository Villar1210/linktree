from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Campanha(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(120), nullable=False)
    subtitulo = db.Column(db.String(120))
    imagem = db.Column(db.String(255))
    video = db.Column(db.String(255))
    audio = db.Column(db.String(255))
    cor_fundo = db.Column(db.String(7), default='#ffe6b3')
    cor_texto = db.Column(db.String(7), default='#222222')
    desconto = db.Column(db.String(60))
    beneficios = db.Column(db.String(255))
    condicoes = db.Column(db.String(255))
    destaque = db.Column(db.Boolean, default=False)
    ativo = db.Column(db.Boolean, default=True)
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)
