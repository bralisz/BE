# Changelog

## 1.1.1 — 5 de agosto de 2026

### Página Billie Eilish

- Banner compacto da Home configurável por link no painel administrativo.
- Prévia do banner e da foto no editor.
- Mensagens públicas de atualização simplificadas.
- Créditos obrigatórios reunidos em uma seção discreta e recolhida.

### Privacidade e segurança

- O catálogo e as configurações públicas agora são lidos por funções com campos permitidos explicitamente.
- O JSON bruto de `content_items` e `site_settings` deixa de ficar acessível para visitantes.
- E-mails e metadados administrativos antigos são removidos dos registros.
- URLs públicas passam por validação e imagens externas continuam protegidas pelo proxy de mídia.
- Arquivos internos, fontes de desenvolvimento, migrations e documentação técnica deixam de ser publicados como rotas estáticas.
- Backups antigos com configuração administrativa foram removidos do pacote.

## 1.1.0 — 4 de agosto de 2026

### Perfis públicos compartilháveis

- Rotas `/@usuario` abertas para visitantes, sem exigir login.
- Visitantes veem somente o botão Home; ele direciona para o login.
- Usuários autenticados continuam vendo Home, Notificações e Configurações.
- A resposta pública contém apenas nome, @, aparência escolhida, favoritos e vídeos salvos.
- E-mail, identificadores internos, permissões, dados de login e demais preferências não são expostos.
- Perfis sem uma foto escolhida são exibidos sem avatar.

### Escalabilidade e picos de login

- Agrupamento de consultas simultâneas do mesmo perfil para impedir requisições duplicadas durante a inicialização.
- Cache curto em memória para perfil e preferências do usuário.
- Um único canal privado do Supabase Realtime por usuário, compartilhado por perfil e preferências.
- Migração de `Postgres Changes` para `Broadcast` privado nas sincronizações entre dispositivos.
- Remoção de consultas redundantes de avatar e status no fluxo normal de login.
- Cache de borda para a página pública e os dados públicos, com revalidação em segundo plano.
- Coalescência de requisições em andamento nas funções serverless para reduzir rajadas contra o banco.
- Políticas RLS de perfil otimizadas para evitar reavaliação desnecessária por linha.
- Sincronização entre computador e celular mantida com menor quantidade de conexões e consultas.

### Interface

- Organização aprimorada da página de configurações.
- Favoritos destacados no perfil.
