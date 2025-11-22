from flask_wtf import FlaskForm
from wtforms import StringField, BooleanField, FileField, SubmitField, TextAreaField
from wtforms.validators import DataRequired, Optional

class CampanhaForm(FlaskForm):
    titulo = StringField('Título', validators=[DataRequired()])
    subtitulo = StringField('Subtítulo', validators=[Optional()])
    imagem_url = StringField('URL da Imagem', validators=[Optional()])
    imagem_upload = FileField('Upload de Imagem', validators=[Optional()])
    video = StringField('Vídeo', validators=[Optional()])
    audio = StringField('Áudio', validators=[Optional()])
    cor_fundo = StringField('Cor de Fundo', default='#ffe6b3')
    cor_texto = StringField('Cor do Texto', default='#222222')
    desconto = StringField('Desconto', validators=[Optional()])
    beneficios = StringField('Benefícios', validators=[Optional()])
    condicoes = StringField('Condições', validators=[Optional()])
    destaque = BooleanField('Destaque')
    ativo = BooleanField('Ativo', default=True)
    submit = SubmitField('Salvar')
