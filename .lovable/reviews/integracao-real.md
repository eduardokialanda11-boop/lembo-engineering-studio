# LEMBO — relatório de integração real

## Resultado e limites
Implementação parcial, sem alterar design, tabelas, RLS, migrations ou Edge Functions. Não é correto declarar a integração de IA concluída.

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
Nome informado pelo usuário: dynamic-action. O código não está no repositório; a única migration existente ativa realtime. Não há conexão de gerenciamento disponível e o plano de diagnóstico não atende este Supabase externo. Não foi possível confirmar implantação, entrada, saída, campos processados ou persistidos. Não houve tentativa de adivinhar JSON/multipart nem chamada com dados incompletos.

`analysisApi.start` continua bloqueada com erro explícito (não NotConnectedError). Não chama supabase.functions.invoke enquanto faltar o contrato. Nenhum upload, projeto, componente ou etapa é criado no fluxo de análise. O uso do project_id retornado aguarda comprovação do retorno real; não foi implementado um parser especulativo.

## Metadados
A sessão mantém imagem original, nome, descrição, dimensões e observações. O tipo de entrada também prevê referência de medida e instruções adicionais. Nada disso é declarado processado ou persistido pela IA. O formulário continua criando apenas uma referência local, claramente identificada como temporária. Não foi conectado um rascunho automático ao banco: dynamic-action já seria responsável pela persistência e pré-inserção pode duplicar o projeto. Rascunho independente e upload têm APIs implementadas, mas não foram adicionados novos comandos visuais fora do escopo.

Campos que precisam de atualização posterior na função só podem ser listados após ler seu código. Descrição e observações não têm colunas próprias em projects; não foram inventadas colunas nem uma estrutura de parts_data para escondê-las.

## Validação
- 42 testes passaram em 10 arquivos: acesso sem usuário, consulta por proprietário/ID, consultas de peças e montagem, upload correto e único, formato inválido, falha de tamanho, rascunho independente, erros e nova tentativa, prevenção de envio/duplicação sem contrato, navegação e regras existentes.
- Testes de API usam Supabase simulado: comprovam chamadas e regras, não operação real na conta.
- Banco real: colunas, políticas de acesso e bucket privado inspecionados em consultas somente leitura.
- Navegador real: /app redireciona para login; identidade visual preservada; nenhum erro de execução observado.
- Verificação automática mais recente: build OK.
- Supabase externo sem sessão fornecida: login bem-sucedido, listagem na conta, realtime com alteração real, upload, persistência e recarga autenticada NÃO verificados. Configurações hospedadas de cadastro/login não foram verificadas.

## Pendências
1. Enviar código atual de dynamic-action sem segredos para comprovar entrada, saída, upload e persistência; então ligar invoke exatamente à função e navegar pelo project_id confirmado.
2. Exercitar operações e resultados dentro da conta. Não há sessão gerenciada disponível para este Supabase externo.
3. Prancha técnica real: nenhum formato comprovado de desenho recebido; não substituída por desenho demonstrativo.
