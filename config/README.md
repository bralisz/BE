# Configuração pública do site

Esta pasta centraliza valores públicos usados pelo navegador, como domínio principal, URL do projeto Supabase e chave pública de acesso.

## Função do `site.js`

O arquivo `site.js` permite que o front-end encontre os serviços corretos sem espalhar a mesma configuração por vários arquivos.

## Pode conter

- domínio público do site;
- URL pública do projeto Supabase;
- publishable key ou chave `anon` destinada ao navegador.

## Nunca pode conter

- `service_role`;
- `sb_secret`;
- senha do banco;
- tokens administrativos;
- segredos de OAuth.

Credenciais privadas devem ficar somente nas variáveis de ambiente da Vercel ou nos serviços responsáveis.
