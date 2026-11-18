# LEMBO — relatório de integração real

## Resultado e limites
Frontend conectado ao contrato fornecido, sem alterar design, tabelas, RLS, migrations ou Edge Functions. Análise autenticada real permanece não verificada; não se declara funcionamento do modelo hospedado.

## Arquivos alterados
- `src/lib/integration.ts`: APIs tipadas e erros reais.
- `src/components/lembo/ProjectsProvider.tsx`: consultas centralizadas, atualização realtime, busca por ID e renovação de imagens privadas.
- `src/components/lembo/ProjectList.tsx`: sem exemplos automáticos, carregamento, erros e nova tentativa; distinção entre salvo e não salvo.
- `src/components/lembo/RealProjectResults.tsx`: peças, explicações registradas e montagem via consultas reais.
- `src/routes/app.projetos.$id.tsx`: recuperação do projeto por ID e telas de resultados reais; prancha demonstrativa nunca usada para projeto real.
- `src/lib/project-workflow.ts`: consulta das peças e montagem disponível mesmo sem status concluído; prancha continua protegida.
- `src/lib/project-state.ts`, `src/routes/app.novo.tsx`, `src/components/lembo/ProjectAnalysis.tsx`: preservação do File original e metadados na sessão; erro explícito de análise, sem envio especulativo.
- `src/routes/app.tsx`, `src/routes/app.analise.tsx`: mensagens e destinos coerentes com dados reais, sem link para exemplo inexistente na conta.
- Testes: integration, real-project-results, project-analysis, project-dialog e project-workflow.
- `AGENTS.md`, `roadmap.md`: regras e pendências.

## Funções implementadas
- `projectsApi.list`: usuário validado, filtro user_id, paginação, RLS.
- `projectsApi.get`: identificador e proprietário, resultado nulo se ausente, RLS.
- `projectsApi.create`: operação de rascunho independente, uma inserção em projects; não ligada automaticamente ao fluxo de análise.
- `storageApi.uploadImage`: original enviado uma vez a project-images, pasta do usuário, upsert false, validação de formato e vazio; erros de tamanho do Storage apresentados. Bucket privado, sem limite específico de tamanho nem tipos configurados; limite global não foi verificado nem inventado.
- `componentsApi.listByProject`, `assemblyApi.listByProject`: consultas paginadas por project_id, ordenação e RLS; nenhuma inserção.
- URLs privadas de project-images resolvidas por assinatura temporária, renovadas na atualização da lista.

## Tabelas e colunas
- projects: consultas de todas as colunas existentes (id, created_at, title, image_url, reference_measure, parts_data, user_id, status); rascunho grava title, image_url, reference_measure opcional, user_id, status preliminary e parts_data vazio. Nenhuma estrutura arbitrária foi adicionada a parts_data.
- components: consultas das colunas existentes; telas usam id, name, quantity, description, technical_description, user_measure, measurement_source, manufacturing_process, validation_status. dimensions é consultado mas não interpretado porque sua estrutura e confiabilidade não foram confirmadas.
- assembly_steps: consultas das colunas existentes; telas usam id, step_number, title, instruction, component_name, safety_notes, estimated_duration_minutes. Não interpreta tools_required/visual_reference sem contrato de formato.
- Storage: bucket project-images, privado, políticas por primeira pasta igual ao auth.uid().

## Contrato de dynamic-action
Código fornecido pelo usuário. Endpoint real respondeu OPTIONS HTTP 200; isso não verifica POST, secrets, modelo ou persistência.

Entrada JSON: image (data URL Base64; aliases aceitos pela função: imageBase64, image_data) e referenceMeasure (alias reference_measure). JPEG, PNG, WEBP; máximo 8 MiB. Autenticação por bearer da sessão. A função não lê name, description, dimensions, notes nem additionalInstructions como campos separados.

Frontend reúne nome, descrição, medidas em mm, referência, observações e instruções adicionais em referenceMeasure, com rótulos explícitos. Acima de 1000 caracteres a operação é recusada antes do envio, pois a função trunca o texto nesse limite. Não há descarte silencioso.

A função processa imagem e texto de referência no prompt; o título definitivo é produzido pela IA, não necessariamente o nome solicitado. Salva imagem original em project-images; projects recebe id, título produzido, caminho privado, referência textual, análise completa em parts_data, user_id e status preliminary/needs_more_information. Components e assembly_steps são gravados pela função. Frontend não repete nenhum upload ou inserção no fluxo de análise.

Retorno validado: success true, saved_to_database true, project_id UUID, image_path, model, analysis, technical_drawing_svg e persistence (project true e contagens de components/assembly_steps). Erros e resposta incompleta não apresentam sucesso; falhas ambíguas recomendam conferir a lista antes de repetir. POST nunca é repetido automaticamente.

O frontend substitui o rascunho local pelo project_id definitivo e navega para ele. Em recarga, interpreta parts_data com validação do schema. Desenho é renderizado com primitivas SVG validadas, sem injetar HTML do SVG recebido; mantém as quatro classes de medida separadas, zoom, seleção de vistas e impressão/PDF. Arquivos adicionais: analysis-contract.ts, EngineeringDrawing.tsx, analysis-contract.test.ts e fixture de contrato exclusiva dos testes.

## Campos persistidos e limitações
- Imagem: caminho privado em projects.image_url.
- Metadados informados: texto conjunto em projects.reference_measure, não colunas separadas.
- Resultado: object_summary, dimensions, technical_drawing, unknowns, safety_warnings e demais dados em projects.parts_data.
- Components: name, quantity, description, technical_description, image_emoji, dimensions, order_index e validation_status pending. user_measure, material, measurement_source, manufacturing_process e piece_image_url permanecem nulos segundo o código.
- Assembly: component_name, title, instruction, visual_type, visual_reference, step_number e step_type assembly. tools_required, safety_notes e estimated_duration_minutes permanecem nulos; avisos gerais ficam em parts_data.safety_warnings.
- Nome solicitado, descrição, dimensões fornecidas, observações e instruções não são persistidos separadamente. Atualização posterior da função seria necessária para suporte estruturado e preservação literal do nome, ou referência acima de 1000 caracteres. Nenhuma atualização foi realizada nesta etapa.
- O modelo literal configurado no código é gpt-6.1-terra; sua disponibilidade não foi verificada. Falha do modelo será exibida ao usuário sem simular resultado.
- A função não fornece progresso intermediário nem idempotência. Não inicia reanálise de projeto com resultado já salvo; erros de conexão exigem conferir a lista antes de repetir.

## Validação
- 52 testes passaram em 11 arquivos: acesso sem usuário, consulta por proprietário/ID, consultas de peças e montagem, upload correto e único, formato inválido, falha de tamanho, rascunho independente, erros e nova tentativa, prevenção de envio/duplicação sem contrato, navegação e regras existentes.
- Testes de API usam Supabase simulado: comprovam chamadas e regras, não operação real na conta.
- Banco real: colunas, políticas de acesso e bucket privado inspecionados em consultas somente leitura.
- Navegador real: /app redireciona para login; identidade visual preservada; nenhum erro de execução observado.
- Verificação automática mais recente: build OK.
- Supabase externo sem sessão fornecida: login bem-sucedido, listagem na conta, realtime com alteração real, upload, persistência e recarga autenticada NÃO verificados. Configurações hospedadas de cadastro/login não foram verificadas.

## Verificação adicional no navegador
Computador 1280x1800 e celular 390x844: fluxo controlado de login, formulário com imagem original e medida, exatamente uma chamada ao contrato, retorno do project_id definitivo, todas as abas de resultado, seleção de todas as vistas e recarga com parts_data. Nenhuma escrita ou upload adicional foi feito pelo frontend; nenhum erro de execução ou rolagem horizontal observado. Respostas interceptadas são exclusivamente um teste, não comprovam a conta ou IA reais. Interface não possui seletor de tema alternativo.

## Pendências
1. POST autenticado real, OpenAI, upload, persistência e releitura na conta: indisponível sem sessão no Supabase externo; não verificados.
2. Verificação das configurações hospedadas de auth e disponibilidade do modelo; não foram presumidas a partir do código.
3. Alterações posteriores na função para suporte estruturado de metadados ou idempotência, se desejadas; nenhuma modificação feita agora.
