# Supabase

Esta pasta reúne o schema consolidado e as Edge Functions do Billie Eilish TV.

## Estrutura

- `schema.sql`: visão consolidada das tabelas, funções, triggers, grants e políticas RLS;
- `config.toml`: configuração local do Supabase;
- `MIGRATIONS.md`: notas sobre o histórico de migrations;
- `functions/create-donation-checkout/`: cria sessões de pagamento da Stripe;
- `functions/stripe-donation-status/`: consulta o estado de uma doação;
- `functions/translate-content-record/`: traduz conteúdo e textos da interface em inglês, espanhol e francês;
- `functions/translate-content-record-it/`: tradutor dedicado ao italiano.

As migrations versionadas ficam na pasta `migrations/` da raiz do projeto.

## Traduções

`translate-content-record` atende `en-us`, `es` e `fr`. O italiano (`it`) usa a função dedicada `translate-content-record-it`, evitando alterar a versão de produção já estabilizada do tradutor principal.

As traduções de conteúdo são salvas no objeto `translations` para evitar retradução em cada acesso. A implementação usa endpoints públicos do Google Tradutor e possui atribuição nos arquivos `THIRD_PARTY_NOTICES.md` das funções de tradução.

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
