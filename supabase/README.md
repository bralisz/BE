# Supabase

Esta pasta reúne o schema consolidado e as Edge Functions do Billie Eilish TV.

## Estrutura

- `schema.sql`: visão consolidada das tabelas, funções, triggers, grants e políticas RLS;
- `config.toml`: configuração local do Supabase;
- `MIGRATIONS.md`: notas sobre o histórico de migrations;
- `functions/create-donation-checkout/`: cria sessões de pagamento da Stripe;
- `functions/stripe-donation-status/`: consulta o estado de uma doação;
- `functions/translate-content-record/`: traduz conteúdo e textos da interface.

As migrations versionadas ficam na pasta `migrations/` da raiz do projeto.

## Traduções

`translate-content-record` aceita atualmente:

- `en-us` → inglês;
- `es` → espanhol;
- `fr` → francês.

As traduções de conteúdo são salvas no objeto `translations` para evitar retradução em cada acesso. A implementação usa endpoints públicos do Google Tradutor e possui atribuição em `functions/translate-content-record/THIRD_PARTY_NOTICES.md`.

## Doações

`create-donation-checkout` valida a sessão, busca novamente a ONG no banco e confere valor mínimo e moeda antes de criar o Checkout da Stripe.

Segredo necessário:

- `STRIPE_SECRET_KEY`.

Nunca coloque essa chave em JavaScript público ou no repositório.

## Regras de manutenção

- não renomeie migrations já aplicadas;
- crie uma nova migration para cada mudança de banco;
- revise RLS e grants ao criar tabelas, views, RPCs ou funções;
- mantenha dados administrativos fora das funções públicas;
- use `schema.sql` como referência consolidada, não como substituto do histórico de migrations.
