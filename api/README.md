# Funções serverless da API

Esta pasta contém as funções executadas no ambiente serverless da Vercel. Elas fazem a ponte entre o navegador, o Supabase e as operações que não devem ficar concentradas no front-end.

## Funcionalidades

- `account-status.js`: consulta o estado de uma conta durante os fluxos de acesso;
- `admin-runtime.js`: entrega recursos necessários ao painel administrativo;
- `admin-user.js`: executa operações administrativas relacionadas a usuários;
- `delete-account.js`: processa a exclusão segura da conta do usuário;
- `meta.js`: roteia endpoints públicos pequenos (versão do deploy, robots, sitemap e Wikipédia) em uma única Serverless Function;
- `drive-media.js`: entrega arquivos do Google Drive ao player interno;
- `export-account.js`: prepara a exportação dos dados da conta;
- `media.js`: atende solicitações relacionadas a arquivos e mídias do catálogo;
- `public-data.js`: disponibiliza dados públicos usados pelo site;
- `public-profile.js`: entrega somente os campos seguros de um perfil compartilhado por `@`;
- `runtime.js`: fornece o cliente público do Supabase usado pelo navegador;
- `site-page.js`: trata páginas e rotas públicas da aplicação.

## Segurança

Chaves administrativas, senhas do banco e credenciais `service_role` devem existir somente nas variáveis de ambiente da Vercel. Nenhum segredo deve ser colocado nos arquivos enviados ao navegador.
