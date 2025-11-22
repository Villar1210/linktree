# 🏠 Validador de Estrutura de Imóveis - iVillar Platform

import json
from datetime import datetime

def validate_property_structure(data):
    """
    Valida estrutura de dados de imóveis
    """
    required_fields = [
        'id', 'nome', 'tipo', 'preco', 'descricao', 'diferenciais'
    ]
    
    errors = []
    warnings = []
    
    # Validar campos obrigatórios
    for field in required_fields:
        if field not in data:
            errors.append(f"Campo obrigatório '{field}' não encontrado")
    
    # Validar estrutura específica
    if 'caracteristicas' in data:
        if not isinstance(data['caracteristicas'], list):
            errors.append("'caracteristicas' deve ser uma lista")
        elif len(data['caracteristicas']) == 0:
            warnings.append("Lista de características está vazia")
    
    if 'diferenciais' in data:
        if not isinstance(data['diferenciais'], list):
            errors.append("'diferenciais' deve ser uma lista")
        elif len(data['diferenciais']) == 0:
            warnings.append("Lista de diferenciais está vazia")
    
    if 'imagens' in data:
        if not isinstance(data['imagens'], list):
            errors.append("'imagens' deve ser uma lista")
        elif len(data['imagens']) == 0:
            warnings.append("Lista de imagens está vazia")
    
    # Validar preço
    if 'preco' in data:
        if not isinstance(data['preco'], (int, float, str)):
            errors.append("'preco' deve ser um número ou string")
    
    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings
    }

def validate_empreendimentos_file(file_path='data/empreendimentos-updated.json'):
    """
    Valida arquivo completo de empreendimentos
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Verificar se é um objeto com chave 'empreendimentos' ou uma lista direta
        if isinstance(data, dict) and 'empreendimentos' in data:
            properties_list = data['empreendimentos']
        elif isinstance(data, list):
            properties_list = data
        else:
            return {
                'valid': False,
                'errors': ['Arquivo deve conter uma lista de empreendimentos ou objeto com chave "empreendimentos"'],
                'warnings': []
            }
        
        all_errors = []
        all_warnings = []
        
        for i, property_data in enumerate(properties_list):
            result = validate_property_structure(property_data)
            
            if not result['valid']:
                all_errors.extend([f"Imóvel {i+1}: {error}" for error in result['errors']])
            
            all_warnings.extend([f"Imóvel {i+1}: {warning}" for warning in result['warnings']])
        
        return {
            'valid': len(all_errors) == 0,
            'errors': all_errors,
            'warnings': all_warnings,
            'total_properties': len(properties_list)
        }
    
    except FileNotFoundError:
        return {
            'valid': False,
            'errors': [f'Arquivo {file_path} não encontrado'],
            'warnings': []
        }
    except json.JSONDecodeError as e:
        return {
            'valid': False,
            'errors': [f'Erro ao decodificar JSON: {str(e)}'],
            'warnings': []
        }

def generate_property_report():
    """
    Gera relatório completo dos imóveis
    """
    result = validate_empreendimentos_file()
    
    print(f"\n{'='*50}")
    print("📊 RELATÓRIO DE VALIDAÇÃO DE IMÓVEIS")
    print(f"{'='*50}")
    print(f"Data/Hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print(f"Arquivo: data/empreendimentos-updated.json")
    
    if result['valid']:
        print("✅ Status: VÁLIDO")
        print(f"📍 Total de imóveis: {result['total_properties']}")
    else:
        print("❌ Status: INVÁLIDO")
        print(f"🚨 Erros encontrados: {len(result['errors'])}")
        
        for error in result['errors']:
            print(f"   • {error}")
    
    if result['warnings']:
        print(f"\n⚠️ Avisos ({len(result['warnings'])}):")
        for warning in result['warnings']:
            print(f"   • {warning}")
    
    print(f"\n{'='*50}")
    
    return result

if __name__ == "__main__":
    generate_property_report()