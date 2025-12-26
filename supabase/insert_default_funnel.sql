-- Criar funil padrão e seus estágios
-- Execute este SQL DEPOIS de rodar o lumiar_schema.sql principal

-- Inserir funil padrão
INSERT INTO funnels (name, description, is_active)
VALUES ('Pipeline de Vendas Padrão', 'Funil padrão para gestão de oportunidades imobiliárias', TRUE);

-- Pegar o ID do funil recém-criado e inserir estágios
-- Substitua o UUID abaixo pelo ID retornado do INSERT acima (copie da lista de funnels)
-- OU rode este comando completo usando o último funil criado:

INSERT INTO stages (funnel_id, name, order_index, is_final_stage, is_win_stage, is_loss_stage)
SELECT 
  f.id,
  stage_name,
  stage_order,
  is_final,
  is_win,
  is_loss
FROM funnels f
CROSS JOIN (
  VALUES 
    ('Novo Lead', 0, FALSE, FALSE, FALSE),
    ('Qualificação', 1, FALSE, FALSE, FALSE),
    ('Proposta', 2, FALSE, FALSE, FALSE),
    ('Negociação', 3, FALSE, FALSE, FALSE),
    ('Fechado/Ganho', 4, TRUE, TRUE, FALSE),
    ('Perdido', 5, TRUE, FALSE, TRUE)
) AS stages(stage_name, stage_order, is_final, is_win, is_loss)
WHERE f.name = 'Pipeline de Vendas Padrão'
ORDER BY stage_order;
