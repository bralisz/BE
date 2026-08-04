# Billie Eilish TV

Projeto estático/serverless para a Vercel, integrado ao Supabase e publicado em `https://billieilishtv.site`.

## Estrutura do projeto

```text
.
├── index.html                  # Aplicação principal
├── 404.html                    # Página de erro
├── api/                        # Funções serverless da Vercel
├── assets/
│   ├── css/site.css            # CSS usado em produção
│   ├── js/site.js              # JavaScript usado em produção
│   ├── js/lazy-loading.js      # Otimização de imagens
│   ├── icons/                  # Favicons e ícones do PWA
│   └── images/
│       ├── avatars/            # Avatares predefinidos
│       ├── auth/               # Fundos e imagens de login
│       ├── brand/              # Logos do projeto
│       └── pages/              # Imagens específicas de páginas
├── config/site.js              # Configuração pública central
├── oauth/consent/              # Tela de consentimento OAuth
├── supabase/                   # Schema e migrações do banco
├── development/source/         # Fragmentos antigos/editáveis, fora do deploy
├── docs/                       # Capturas e arquivos arquivados
├── scripts/validate-project.js # Validação básica da estrutura
├── site.webmanifest            # Manifesto PWA
└── vercel.json                 # Rotas, headers e deploy
```

## Configuração principal

Edite `config/site.js` para alterar o domínio público ou a conexão pública com o Supabase. Esse arquivo pode conter somente a **publishable key**. Nunca coloque `service_role`, `sb_secret` ou outras chaves privadas no navegador.

Na Vercel, configure:

```text
SITE_URL=https://billieilishtv.site
SUPABASE_URL=https://cxkevnnxibhezvospkce.supabase.co
SUPABASE_ANON_KEY=<publishable key>
```

## Supabase Auth

Em **Authentication → URL Configuration**:

```text
Site URL: https://billieilishtv.site
Redirect URLs:
https://billieilishtv.site/**
http://localhost:3000/**
http://localhost:5173/**
```

Callback usado no Google e no Discord:

```text
https://cxkevnnxibhezvospkce.supabase.co/auth/v1/callback
```

## Rotas

As rotas públicas não usam hash: `/login`, `/config`, `/suporte`, `/atualizacoes`, `/terms`, `/privacy`, `/cookies`, `/dmca`, `/@usuario` e `/:id`.

Somente o painel administrativo usa `#/admin/...`.

## Validação

Com Node.js instalado, execute:

```bash
node scripts/validate-project.js
node --check assets/js/site.js
```

## Deploy

Envie o conteúdo desta pasta como raiz do projeto na Vercel. Não envie somente a pasta `assets`; `index.html`, `api/` e `vercel.json` precisam permanecer na raiz.
