import sys
from email_utils import send_reset_email

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python test_email.py email_destino")
        sys.exit(1)
    to_email = sys.argv[1]
    test_link = "https://ivillar.com.br/reset/teste"
    try:
        send_reset_email(to_email, test_link)
        print(f"Email de teste enviado para {to_email} com sucesso!")
    except Exception as e:
        print(f"Erro ao enviar email: {e}")
