# Supabase: banco, autenticação e segurança

Esta pasta representa a estrutura de dados usada pelo Billie Eilish TV no Supabase.

## Conteúdo

- `schema.sql`: visão consolidada do schema do projeto;
- `migrations/`: alterações versionadas do banco, executadas em ordem;
- `MIGRATIONS.md`: orientações para manter o histórico local e remoto sincronizado.

## Funcionalidades atendidas

- autenticação e criação de contas;
- perfis, nomes de usuário, avatares e banners;
- permissões de membros e administradores;
- configurações públicas do site;
- catálogo administrável;
- políticas de Row Level Security;
- funções auxiliares usadas pelos fluxos de login e conta;
- Edge Function autenticada para criar doações Stripe com valor mínimo por ONG.

Nunca renomeie migrations que já foram aplicadas. Cada arquivo deve possuir uma versão numérica única para evitar conflitos nos ambientes de Preview e produção.

## Checkout de doações

A função `functions/create-donation-checkout` exige o segredo `STRIPE_SECRET_KEY` configurado no painel do Supabase. O valor mínimo é lido novamente do banco no servidor; o valor exibido no navegador não é considerado confiável.
