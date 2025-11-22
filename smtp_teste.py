import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

MAIL_SERVER = 'smtp.hostinger.com'
MAIL_PORT = 465
MAIL_USE_SSL = True
MAIL_USERNAME = 'recuperacao@ivillar.com.br'
import os
MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
MAIL_DEFAULT_SENDER = 'recuperacao@ivillar.com.br'

def send_test_email(to_email):
    subject = 'Teste de envio SMTP - iVillar Platform'
    body = '''\
Olá,

Este é um teste de envio SMTP direto do script Python.
Se você recebeu este e-mail, a autenticação está funcionando corretamente.

Atenciosamente,
Equipe iVillar
'''
    msg = MIMEMultipart()
    msg['From'] = MAIL_DEFAULT_SENDER
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    if MAIL_USE_SSL:
        server = smtplib.SMTP_SSL(MAIL_SERVER, MAIL_PORT)
    else:
        server = smtplib.SMTP(MAIL_SERVER, MAIL_PORT)
        server.starttls()
    server.login(MAIL_USERNAME, MAIL_PASSWORD)
    server.sendmail(MAIL_DEFAULT_SENDER, to_email, msg.as_string())
    server.quit()

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Uso: python smtp_teste.py email_destino")
        sys.exit(1)
    to_email = sys.argv[1]
    try:
        send_test_email(to_email)
        print(f"Email de teste enviado para {to_email} com sucesso!")
    except Exception as e:
        print(f"Erro ao enviar email: {e}")
