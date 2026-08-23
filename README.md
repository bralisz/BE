<p align="center">
  <img src="https://i.imgur.com/tnBMpHr.png" alt="Banner do Billie Eilish TV" width="100%">
</p>

# Billie Eilish TV

**Um espaço feito por fãs, para fãs da Billie Eilish.**

O Billie Eilish TV é um projeto independente que reúne conteúdos, comunidade, perfis, filmes, séries, vídeos e recursos para Smart TV em uma interface inspirada em serviços de streaming.

> Projeto de fãs, sem vínculo oficial com Billie Eilish, sua equipe, gravadoras, produtoras ou plataformas citadas.

## Site

**https://billieilishtv.site**

## Onde mexer

| Área | Arquivos principais |
| --- | --- |
| Estrutura da página pública | `index.html` |
| CSS principal | `assets/css/site.css` |
| JavaScript principal | `assets/js/site.js` |
| Comunidade | `assets/js/community.js` e `assets/css/community.css` |
| Idiomas | `assets/i18n/`, `assets/js/i18n.js` e `assets/js/locale-routing.js` |
| Smart TV / pareamento | `tv/`, `connect-tv/`, `assets/js/tv-controller.js` e `assets/css/tv-pairing.css` |
| API da Vercel | `api/index.js` e `server/` |
| Painel administrativo | `development/source/admin/` e `server/handlers/admin-runtime.js` |
| Banco e RLS | `supabase/schema.sql` e `migrations/` |
| Edge Functions | `supabase/functions/` |
| PWA | `site.webmanifest` e `sw.js` |

## Estrutura do projeto

- `assets/`: fontes editáveis de CSS, JavaScript, imagens, ícones e traduções; essa rota é bloqueada no deploy;
- `/_static/`: bundle público compacto gerado para o navegador;
- `api/`: entrada única das rotas de API na Vercel;
- `server/`: rotas, handlers e configurações executadas no servidor;
- `development/source/`: fontes legíveis usadas para manutenção e referência;
- `migrations/`: histórico versionado das alterações do Supabase;
- `supabase/`: schema consolidado e Edge Functions;
- `tv/` e `connect-tv/`: interface e conexão com Smart TVs;
- `oauth/`: tela de consentimento de integrações;
- `docs/`: documentação técnica e auditorias.

## Atenção ao editar

O `package.json` possui `npm run build:static` para reconstruir a árvore pública `/_static/` a partir de `assets/`. Os nomes de produção são simples, sem hashes. Alguns arquivos de `development/source/` possuem uma versão publicada ou empacotada em outro local. Por exemplo, o painel legível está em `development/source/admin/admin.js`, enquanto a versão servida está embutida em `server/handlers/admin-runtime.js`.

Antes de alterar um arquivo de desenvolvimento, confira se existe uma versão correspondente em `assets/` ou `server/` para evitar que a fonte e a versão publicada fiquem diferentes. Depois de editar `assets/`, execute `npm run build:static` antes do deploy.

## Banco de dados

As migrations já aplicadas não devem ser renomeadas, removidas ou reutilizadas. Novas alterações de banco devem receber um novo arquivo em `migrations/` com timestamp único.

O schema consolidado para consulta está em `supabase/schema.sql`.

## Segurança

- nunca salve chaves, tokens ou credenciais no repositório;
- mantenha validações sensíveis no servidor/Supabase, não apenas no navegador;
- preserve políticas RLS e verificações administrativas ao alterar consultas;
- preserve avisos de licença e atribuições de terceiros existentes no código.

O relatório de segurança disponível neste pacote está em `docs/SECURITY-AUDIT-20260805.md`.
