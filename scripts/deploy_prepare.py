# 🔄 Script de Deploy - iVillar Platform
import os
import shutil
from datetime import datetime
import json

def create_backup():
    """
    Cria backup dos arquivos importantes
    """
    backup_folder = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    if not os.path.exists('backups'):
        os.makedirs('backups')
    
    backup_path = os.path.join('backups', backup_folder)
    os.makedirs(backup_path)
    
    # Lista de arquivos para backup
    files_to_backup = [
        'app.py',
        'routes_admin.py',
        'templates/base.html',
        'templates/index.html',
        'templates/admin/dashboard.html',
        'data/empreendimentos.json',
        'data/config.json'
    ]
    
    backed_up = []
    
    for file in files_to_backup:
        if os.path.exists(file):
            # Criar diretório no backup se necessário
            backup_file_path = os.path.join(backup_path, file)
            backup_dir = os.path.dirname(backup_file_path)
            
            if backup_dir and not os.path.exists(backup_dir):
                os.makedirs(backup_dir)
            
            shutil.copy2(file, backup_file_path)
            backed_up.append(file)
            print(f"✅ Backup: {file}")
        else:
            print(f"⚠️ Arquivo não encontrado: {file}")
    
    print(f"\n📦 Backup criado em: {backup_path}")
    print(f"📊 Total de arquivos: {len(backed_up)}")
    
    return backup_path

def validate_deployment_files():
    """
    Valida arquivos essenciais para deploy
    """
    essential_files = [
        'routes_admin_complete.py',
        'templates/admin/dashboard-complete.html',
        'templates/base-fixed.html',
        'templates/index-updated.html',
        'data/empreendimentos-updated.json',
        'data/config.json'
    ]
    
    print("\n🔍 VALIDAÇÃO DE ARQUIVOS PARA DEPLOY")
    print("="*50)
    
    all_valid = True
    
    for file in essential_files:
        if os.path.exists(file):
            size = os.path.getsize(file)
            print(f"✅ {file} ({size} bytes)")
        else:
            print(f"❌ {file} - ARQUIVO AUSENTE")
            all_valid = False
    
    if all_valid:
        print("\n🎉 Todos os arquivos necessários estão presentes!")
    else:
        print("\n⚠️ Alguns arquivos essenciais estão ausentes!")
    
    return all_valid

def generate_deploy_checklist():
    """
    Gera checklist para deploy no VPS
    """
    checklist = [
        "1. 🔄 Fazer upload dos novos arquivos:",
        "   • routes_admin_complete.py (renomear para routes_admin.py)",
        "   • templates/admin/dashboard-complete.html",
        "   • templates/base-fixed.html (substituir base.html)",
        "   • templates/index-updated.html (substituir index.html)",
        "   • templates/empreendimento-detalhes.html",
        "   • templates/cidade-empreendimentos.html", 
        "   • data/empreendimentos-updated.json",
        "   • data/config.json",
        "",
        "2. 📝 Atualizar app.py com novas rotas:",
        "   • Importar routes_admin_complete como routes_admin",
        "   • Adicionar rotas para páginas individuais de imóveis",
        "   • Adicionar rotas para cidades",
        "",
        "3. 🔄 Reiniciar serviços:",
        "   • sudo systemctl restart nginx",
        "   • sudo systemctl restart gunicorn",
        "",
        "4. ✅ Testar funcionalidades:",
        "   • Login admin",
        "   • Painel administrativo completo",
        "   • Navegação mobile com 'Área do Membro' no rodapé",
        "   • Páginas individuais de imóveis",
        "   • Configurações de email, social e WhatsApp",
        "",
        "5. 📱 Verificar mobile:",
        "   • Navegação inferior (bottom navigation)",
        "   • Dropdown 'Área do Membro'",
        "   • Responsividade geral"
    ]
    
    print("\n📋 CHECKLIST DE DEPLOY")
    print("="*50)
    
    for item in checklist:
        print(item)
    
    return checklist

def main():
    """
    Função principal do script de deploy
    """
    print("🚀 iVillar Platform - Script de Deploy")
    print("="*50)
    
    # 1. Validar arquivos
    if not validate_deployment_files():
        print("\n❌ Deploy cancelado devido a arquivos ausentes!")
        return
    
    # 2. Criar backup
    backup_path = create_backup()
    
    # 3. Gerar checklist
    generate_deploy_checklist()
    
    # 4. Salvar relatório
    report = {
        'timestamp': datetime.now().isoformat(),
        'backup_path': backup_path,
        'files_validated': True,
        'status': 'ready_for_deploy'
    }
    
    with open('deploy_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 Relatório salvo em: deploy_report.json")
    print("\n🎯 Pronto para deploy no VPS!")

if __name__ == "__main__":
    main()