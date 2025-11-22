import os
from flask import Flask, render_template, request, redirect, url_for, flash
from werkzeug.utils import secure_filename
from markupsafe import escape
from flask_wtf.csrf import CSRFProtect
from models import db, Campanha
from forms import CampanhaForm

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'uma-chave-secreta')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///campanhas.db'
    app.config['UPLOAD_FOLDER'] = os.environ.get('UPLOAD_FOLDER', 'static/uploads')
    app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024
    db.init_app(app)
    CSRFProtect(app)
    return app

app = create_app()

@app.before_first_request
def create_tables():
    db.create_all()

@app.route('/campanha/nova', methods=['GET', 'POST'])
def nova_campanha():
    form = CampanhaForm()
    if form.validate_on_submit():
        # Validação e sanitização
        titulo = escape(form.titulo.data)
        subtitulo = escape(form.subtitulo.data)
        imagem_url = escape(form.imagem_url.data)
        video = escape(form.video.data)
        audio = escape(form.audio.data)
        cor_fundo = escape(form.cor_fundo.data)
        cor_texto = escape(form.cor_texto.data)
        desconto = escape(form.desconto.data)
        beneficios = escape(form.beneficios.data)
        condicoes = escape(form.condicoes.data)
        destaque = form.destaque.data
        ativo = form.ativo.data
        # Upload de imagem
        imagem_upload = form.imagem_upload.data
        imagem_path = ''
        if imagem_upload and allowed_file(imagem_upload.filename):
            filename = secure_filename(imagem_upload.filename)
            upload_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            imagem_upload.save(upload_path)
            imagem_path = upload_path
        campanha = Campanha(
            titulo=titulo,
            subtitulo=subtitulo,
            imagem=imagem_path or imagem_url,
            video=video,
            audio=audio,
            cor_fundo=cor_fundo,
            cor_texto=cor_texto,
            desconto=desconto,
            beneficios=beneficios,
            condicoes=condicoes,
            destaque=destaque,
            ativo=ativo
        )
        db.session.add(campanha)
        db.session.commit()
        flash('Campanha salva com sucesso!', 'success')
        return redirect(url_for('nova_campanha'))
    return render_template('admin_campanha_form.html', form=form, campanha=None)

if __name__ == '__main__':
    app.run(debug=True)
