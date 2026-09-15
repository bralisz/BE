<p align="center">
  <img src="https://i.imgur.com/tnBMpHr.png" alt="Banner do Billie Eilish TV" width="100%">
</p>

# Billie Eilish TV

**Uma comunidade independente criada por fãs, para fãs da Billie Eilish.**

O Billie Eilish TV é uma plataforma de comunidade e entretenimento dedicada a reunir fãs em um único espaço. O site combina perfis de usuários, seguidores, comunidade, vídeos, filmes, séries, conteúdo multimídia, recursos para Smart TV e uma experiência inspirada em serviços de streaming.

A proposta é oferecer um lugar onde fãs possam **descobrir conteúdos, criar seu próprio perfil, acompanhar outros usuários, interagir com a comunidade e acessar a experiência do site em diferentes dispositivos**.

A comunidade/projeto já alcançou **mais de 50 mil usuários**.

> Projeto independente e feito por fãs, sem vínculo oficial com Billie Eilish, sua equipe, gravadoras, produtoras ou plataformas citadas.

## Site

**https://billieilishtv.site**

## Principais recursos

- 👤 **Perfis e comunidade** — perfis públicos, seguidores e seguindo;
- 🎬 **Entretenimento** — vídeos, filmes, séries e outros conteúdos multimídia;
- 📺 **Smart TV** — interface e recursos de conexão/pareamento com TV;
- 🌎 **Multilíngue** — suporte a português, inglês, espanhol, francês e italiano;
- 🔐 **Contas e privacidade** — autenticação, recuperação e gerenciamento de conta;
- 📱 **Experiência responsiva/PWA** — acesso pelo navegador em diferentes dispositivos.

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

## Privacidade e segurança

O repositório é público, então qualquer arquivo versionado deve ser tratado como potencialmente visível a terceiros. A revisão de segurança mais recente registrada no projeto verificou os arquivos públicos e não encontrou `service_role`, `sb_secret`, chaves secretas do Stripe, chaves privadas, senhas administrativas, tokens do GitHub ou tokens da Vercel incorporados nos arquivos de produção. Os segredos de servidor e das Edge Functions são obtidos por variáveis de ambiente. citedocs/SECURITY-AUDIT-20260823.md

A configuração publicável do Supabase que aparece no código do navegador é considerada configuração pública de cliente; ela não deve ser confundida com uma chave administrativa. O controle de acesso deve continuar sendo feito por RLS, autenticação e validações no servidor. citedocs/SECURITY-AUDIT-20260823.md

Também foram aplicadas proteções para evitar a exposição direta de fontes internas, migrations, documentação, configurações e arquivos administrativos pelo deploy público. As rotas correspondentes são bloqueadas pelo `vercel.json`. citevercel.json

**Importante:** uma auditoria não garante ausência de vulnerabilidades futuras. Nunca coloque no Git senhas, tokens, cookies, chaves privadas, credenciais de serviços ou dados pessoais de usuários. Dados de contas e operações administrativas devem permanecer protegidos no servidor/Supabase e pelas políticas RLS.

## Atenção ao editar

O `package.json` possui `npm run build:static` para reconstruir a árvore pública `/_static/` a partir de `assets/`. Os nomes de produção são simples, sem hashes. Alguns arquivos de `development/source/` possuem uma versão publicada ou empacotada em outro local. Por exemplo, o painel legível está em `development/source/admin/admin.js`, enquanto a versão servida está embutida em `server/handlers/admin-runtime.js`.

Antes de alterar um arquivo de desenvolvimento, confira se existe uma versão correspondente em `assets/` ou `server/` para evitar que a fonte e a versão publicada fiquem diferentes. Depois de editar `assets/`, execute `npm run build:static` antes do deploy.

## Banco de dados

As migrations já aplicadas não devem ser renomeadas, removidas ou reutilizadas. Novas alterações de banco devem receber um novo arquivo em `migrations/` com timestamp único.

O schema consolidado para consulta está em `supabase/schema.sql`.

## Segurança operacional

- nunca salve chaves, tokens ou credenciais no repositório;
- não versione dados pessoais, exports de contas ou dumps do banco;
- mantenha validações sensíveis no servidor/Supabase, não apenas no navegador;
- preserve políticas RLS e verificações administrativas ao alterar consultas;
- preserve avisos de licença e atribuições de terceiros existentes no código;
- ao criar uma nova API pública, retorne somente os campos necessários para aquela finalidade;
- revise arquivos públicos e bundles depois de alterações envolvendo autenticação, perfis ou banco de dados.

A auditoria de segurança mais recente está em `docs/SECURITY-AUDIT-20260823.md`.
