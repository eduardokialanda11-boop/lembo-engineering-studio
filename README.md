# LEMBO Engineering Studio

LEMBO — Visual-to-Engineering



Construção do Frontend da Plataforma



Crie o frontend de uma plataforma SaaS profissional chamada LEMBO, cujo subtítulo e tecnologia principal são Visual-to-Engineering.



A LEMBO é uma plataforma de engenharia assistida por inteligência artificial que transforma fotografias, esboços e desenhos técnicos em pranchas profissionais de desenho técnico mecânico 2D, com interpretação didática e orientação para fabricação, montagem e instalação.



IMPORTANTE SOBRE A MARCA:



- Nome oficial: LEMBO.

- Subtítulo: Visual-to-Engineering.

- O nome LEMBO deve ter maior destaque na identidade visual.

- Visual-to-Engineering deve aparecer como subtítulo, assinatura ou descrição tecnológica.

- Utilizar obrigatoriamente o logotipo original anexado a esta solicitação.



Não criar uma nova marca nem substituir o logotipo fornecido.



---



1. IDENTIDADE VISUAL



Desenvolver uma identidade visual profissional, moderna, tecnológica e industrial.



Utilizar o logotipo original da LEMBO como referência principal.



Características que devem orientar o design:



- Azul-marinho como cor principal.

- Azul-claro como cor secundária.

- Branco e tons neutros para fundos.

- Detalhes em azul elétrico para elementos interativos.

- Tipografia moderna, elegante e de excelente legibilidade.

- Aparência de software profissional de engenharia industrial.



Preservar integralmente:



- O símbolo da engrenagem.

- O olho com circuitos eletrónicos.

- As proporções originais.

- As cores originais.

- A composição e a tipografia da marca.



O logotipo deve aparecer:



- Na tela de autenticação.

- No menu lateral.

- No painel principal.

- Na identificação da plataforma.



Não utilizar o logotipo como marca-d'água excessiva.



---



2. AUTENTICAÇÃO



Criar:



- Tela de login.

- Cadastro de usuários.

- Recuperação de senha.

- Interface de autenticação moderna.

- Apresentação da marca LEMBO.



Preparar a estrutura visual para futura integração com a autenticação existente no Supabase.



Não implementar autenticação fictícia.



---



3. PAINEL PRINCIPAL — DASHBOARD



Criar um painel profissional com:



- Menu lateral de navegação.

- Logotipo LEMBO.

- Subtítulo Visual-to-Engineering.

- Botão destacado "Novo projeto".

- Lista de projetos recentes.

- Pesquisa de projetos.

- Filtros por status.

- Identificação da data de criação.

- Miniatura da imagem original.

- Indicadores de projetos em andamento e concluídos.



O painel deve transmitir a experiência de uma plataforma industrial profissional.



---



4. CRIAÇÃO DE PROJETOS



Criar uma tela para iniciar novos projetos.



Incluir:



- Campo para nome do projeto.

- Campo de descrição.

- Área para upload de imagens.

- Suporte a fotografias, esboços e desenhos técnicos.

- Suporte aos formatos de imagem comuns.

- Pré-visualização da imagem carregada.

- Possibilidade de remover ou substituir a imagem.

- Campo para inserir dimensões conhecidas.

- Botão "Analisar projeto".



A interface deve ser simples e intuitiva.



O usuário não precisa ter conhecimentos de desenho técnico.



---



5. ANÁLISE TÉCNICA



Criar uma tela de processamento que apresente:



- Imagem original enviada.

- Identificação do objeto.

- Informações identificadas pela análise.

- Estado do processamento.

- Indicadores visuais de progresso.

- Mensagens claras durante o processamento.



Preparar a interface para receber os resultados reais da inteligência artificial através do backend Supabase.



Não simular resultados de inteligência artificial como se fossem reais.



---



6. PRANCHA TÉCNICA 2D



Esta é uma das áreas mais importantes da plataforma.



Criar um visualizador profissional de pranchas técnicas mecânicas 2D.



A prancha deve apresentar:



- Vista frontal.

- Vista lateral.

- Vista superior.

- Cotas e linhas de dimensão.

- Setas e referências.

- Identificação das peças.

- Legenda técnica.

- Escala.

- Identificação do projeto.

- Organização visual semelhante a uma prancha técnica profissional.



Incluir recursos de interface para:



- Ampliar e reduzir a prancha.

- Visualizar detalhes.

- Alternar entre as vistas.

- Selecionar peças.

- Consultar dimensões.

- Exportar a prancha em PDF.



A representação deve priorizar precisão, clareza e legibilidade.



---



7. INTERPRETAÇÃO DIDÁTICA



Criar uma área que explique os desenhos técnicos em linguagem simples.



O sistema deverá apresentar explicações sobre:



- O significado de cada vista.

- O que representam as linhas.

- O significado das setas.

- O significado dos símbolos.

- Como interpretar as cotas.

- A função de cada peça.

- Como compreender o desenho técnico.



O objetivo é permitir que pessoas sem formação em engenharia consigam compreender a prancha.



---



8. CONFIABILIDADE DAS DIMENSÕES



Criar uma identificação visual clara para quatro categorias:



1. Medidas observadas.

2. Medidas calculadas.

3. Medidas estimadas.

4. Medidas desconhecidas.



Não misturar essas categorias.



Não apresentar dimensões estimadas como medidas exatas.



Quando uma dimensão não puder ser determinada, indicar claramente que necessita de confirmação ou informação do usuário.



---



9. ORGANIZAÇÃO DOS PROJETOS



Criar uma página individual para cada projeto.



Incluir:



- Informações gerais.

- Imagem original.

- Resultado da análise.

- Prancha técnica 2D.

- Vistas disponíveis.

- Peças identificadas.

- Explicações didáticas.

- Etapas de montagem, quando disponíveis.

- Histórico e status do projeto.



A navegação deve ser intuitiva.



---



10. EXPERIÊNCIA DO USUÁRIO



A plataforma deve ser compreensível para:



- Indústrias e fábricas.

- Construtoras e montadoras.

- Serralherias.

- Oficinas.

- Profissionais de manutenção.

- Pequenos fabricantes.

- Pessoas sem formação técnica.



O usuário deve conseguir navegar pela plataforma sem precisar conhecer desenho técnico.



Priorizar uma experiência simples, visual e profissional.



---



11. REGRAS TÉCNICAS IMPORTANTES



- Trabalhar exclusivamente com desenhos técnicos 2D.

- Não criar visualizações 3D.

- Não criar quadro de materiais.

- Não inventar dimensões.

- Não apresentar informações técnicas fictícias como resultados reais.

- Não implementar processamento de IA falso.

- Não criar banco de dados novo.

- Não recriar as tabelas existentes.

- Não substituir o backend atual.

- Não modificar as Edge Functions existentes.

- Não alterar políticas RLS.

- Não expor chaves secretas no frontend.



---



12. ARQUITETURA E PREPARAÇÃO PARA INTEGRAÇÃO



O backend existente utiliza Supabase.



A estrutura já possui as tabelas:



- projects

- components

- assembly_steps



Também possui Storage e estrutura de Edge Functions.



O frontend deverá ser desenvolvido considerando essa arquitetura.



Preparar os pontos de integração para:



- Autenticação Supabase.

- Criação e consulta de projetos.

- Upload de imagens para Storage.

- Comunicação com as Edge Functions.

- Consulta dos componentes identificados.

- Consulta das etapas de montagem.

- Apresentação dos resultados técnicos.



Não inventar campos, tabelas ou contratos de API.



A integração será realizada em uma etapa posterior, após a aprovação da interface.



---



13. ESCOPO DESTA PRIMEIRA ETAPA



Nesta primeira entrega, desenvolver somente o frontend:



1. Identidade visual completa.

2. Navegação.

3. Dashboard.

4. Autenticação visual.

5. Criação de projetos.

6. Upload com pré-visualização.

7. Tela de análise.

8. Visualizador de desenhos técnicos 2D.

9. Área didática.

10. Estrutura de organização dos projetos.



Utilizar dados demonstrativos apenas para compor a apresentação visual, identificando-os claramente como exemplos.



Não conectar nem modificar o Supabase nesta primeira etapa.



Não realizar alterações no backend existente.



---



RESULTADO ESPERADO



Entregar uma interface SaaS completa, elegante, responsiva e profissional, com identidade própria da LEMBO.



A plataforma deve parecer um produto tecnológico real, preparado para uso industrial e apresentação a investidores, empresas e jurados de hackathons.



A experiência visual deve transmitir três conceitos:



ENGENHARIA + INTELIGÊNCIA ARTIFICIAL + PRECISÃO.



A LEMBO não deve parecer um simples aplicativo de upload de imagens. Deve parecer uma verdadeira plataforma de engenharia assistida por inteligência artificial.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/71d74109-ab72-4e31-af97-aadb15a21065).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
