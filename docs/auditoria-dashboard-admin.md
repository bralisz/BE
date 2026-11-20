# Dashboard administrativo BETV

## Auditoria anterior à alteração

A revisão abrangeu a navegação, o código-fonte do admin, o JavaScript realmente servido pelo endpoint protegido e as camadas mobile, Workspace, Studio, mídia e tema. A base inclui a aba Posts do PR 49. O pacote servido e o arquivo de desenvolvimento tinham diferenças anteriores, incluindo o painel de doações. A referência para o inventário foi o pacote servido.

| Área ou item existente | Decisão | Destino e motivo |
|---|---|---|
| Visão geral, menu superior/lateral, menu móvel e contexto da seção | Reorganizar | Barra de sete ícones na home e em Estatísticas. Menu expansível em telas pequenas. Páginas internas conservam a navegação própria. |
| Busca de seções, Ctrl/Cmd + K, Ver site, avatar e saída | Manter | Busca no topo, marca BE abre o site, conta e saída na barra lateral. |
| Saudação genérica, slogan e repetição de “Visão geral” | Remover | A home usa o nome da conta e a data. |
| Novos usuários hoje e gráfico de usuários dos últimos sete dias | Reorganizar | Um cartão reúne total, média e pico, com a série real do banco e períodos Hoje e 7 dias. |
| Mais visto e mais salvo | Manter | Título e contagem em Destaques do catálogo. |
| Mais comentado | Mover | Estatísticas. |
| Capas repetidas dos rankings e espaços “Sem imagem” | Remover | Não ajudam a comparar as contagens. |
| Contadores por tipo, lista lateral de categorias e seletor de novo conteúdo | Reorganizar | Retirar os contadores da home. Catálogo completo e criação por tipo continuam disponíveis. |
| Destaques, seções, vídeos, vídeos sem seção, filmes, séries/episódios e álbuns | Manter | Listas internas, busca, filtros, edição, publicação e exclusão existentes. Categorias abre Seções do site. |
| Galeria de avatares e banners, Posts e página Billie Eilish | Manter | Submenu de conteúdo, incluindo a ordem Galeria → Posts. |
| Comunidade, fã em destaque e comunidades de fãs | Manter | Ajustes e telas internas existentes. |
| Usuários, denúncias, moderação, exportação e ações de conta | Manter | Tela de Usuários e fluxos internos. |
| Notificações, campanhas, histórico e envio | Manter | Acesso pelo sino da barra. |
| Log administrativo com até oito ações recentes | Mover | Configurações e operações, em painel recolhível. |
| Aviso de atualização, versão e controle de liberação | Mover | Configurações e operações, preservando o controle original. |
| Configurações de cor, Instagram, site, X e Discord | Mover | Formulário original em Configurações e operações. |
| Indicador de pagamentos aprovados, histórico de checkouts, busca, status, totais por moeda, ONG em destaque e maior doação | Reorganizar | Histórico, controles e análises na seção interna Apoios a ONGs. Eliminar o resumo duplicado da home. |
| Editores, rascunho local, restauração de sessão, prévia, legendas e mídia | Manter | Fluxos do editor existente. A home oferece atalhos para criação, edição e publicação. |
| Tabelas de conteúdos, perfis, denúncias e doações | Manter | Permanecem nas áreas de gestão correspondentes. |

Não há registro de uso individual dos menus nesta auditoria. Nenhuma área administrativa foi classificada como abandonada com base em suposição.

## Desenho e dados

A home tem cinco blocos. Cadastros usa o histórico entregue por `get_admin_dashboard_metrics`. O calendário mostra a data civil do dispositivo. Os destaques usam contagens do catálogo. A barra semanal indica quantos dias tiveram ao menos um cadastro. A lista editorial busca quatro registros de vídeos, filmes, séries ou álbuns por atualização, aplicando cada filtro antes do limite. O filtro Ocultos corresponde ao estado persistido de publicação. Rascunhos locais continuam no editor.

A home deixa de carregar histórico financeiro, logs, configurações e contagens de coleções ao abrir. A busca do catálogo solicita somente os campos apresentados. O editor recupera o registro completo ao abrir. O atalho Publicar chama o fluxo existente de validação e salvamento. Se houver rascunho local, o editor pede revisão.

## Verificação

1. Com as dependências do projeto instaladas, execute `node scripts/test-admin-overview.cjs` e `npm run test:admin-ui`.
2. Em um ambiente de prévia, entre com uma conta administrativa e abra `/admin#/admin/dashboard`. Compare desktop, tablet e celular. Use Tab, Ctrl/Cmd + K e Escape. No celular, abra e feche o menu.
3. Alterne Hoje e 7 dias. Compare os dados de cadastro com o indicador existente no Supabase. Confira os estados de erro e nova tentativa simulando indisponibilidade das consultas.
4. Alterne Todos, Publicados e Ocultos. Abra um conteúdo recente e confira se o editor apresenta o item selecionado. Use um item de teste para validar a ação Publicar, a persistência do status e a retomada de rascunhos.
5. Abra Estatísticas e Configurações. Confira histórico de doações, configuração do site, aviso de atualizações, log e acesso à Comunidade. Confira Galeria e Posts pelo menu de conteúdo.

As alterações no arquivo que serve o admin atualizam apenas o JavaScript de interface empacotado. A autenticação, as políticas de acesso, o esquema, os dados existentes e os contratos das APIs permanecem como estavam.
