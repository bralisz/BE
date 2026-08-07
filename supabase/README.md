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

### Visão administrativa de doações

A função `get_admin_donation_overview` só pode ser executada por usuários autenticados com função de administrador. Ela mantém no histórico todos os checkouts iniciados, incluindo criados e cancelados, mas calcula os indicadores agregados somente com pagamentos confirmados pela Stripe (`status = 'paid'`).

## Tradução automática

A função autenticada `functions/translate-content-record` traduz os campos textuais salvos em português para `en-us` e `es`. Ela usa no Supabase/Deno o mesmo método do `deep-translator`: consulta a versão móvel do Google Tradutor e extrai o resultado da página, sem exigir chave da API Google Cloud.

As traduções ficam persistidas no JSON `translations` do próprio conteúdo, evitando repetir a tradução em cada acesso. Não é necessário configurar `GOOGLE_TRANSLATE_API_KEY`.

Ao criar ou editar um conteúdo no painel, o site solicita automaticamente as duas traduções. O processamento possui divisão de textos longos, tentativas limitadas e pequenas pausas para reduzir bloqueios. Se o serviço estiver temporariamente indisponível ou limitar requisições, o conteúdo original em português continua sendo exibido como fallback.

Esse método depende da página pública do Google Tradutor e, por isso, pode sofrer limitação temporária ou mudanças externas. A implementação foi adaptada da estratégia `GoogleTranslator` do projeto `deep-translator` e sua atribuição está em `functions/translate-content-record/THIRD_PARTY_NOTICES.md`.

## Doações regionais

Cada ONG possui dois mínimos independentes no painel:

- `minimumDonationCents`: mínimo em BRL;
- `minimumDonationUsdCents`: mínimo em USD.

O navegador seleciona BRL para dispositivos identificados como estando na região Brasil e USD para as demais regiões. A moeda, o mínimo e o valor são validados novamente pela Edge Function antes da criação do Checkout da Stripe.
