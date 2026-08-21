# create-donation-checkout

Edge Function responsável por iniciar uma Stripe Checkout Session para doações.

## Fluxo

1. valida a requisição e a sessão autenticada;
2. carrega a ONG novamente no Supabase;
3. valida moeda, valor e mínimo configurado;
4. aplica proteção contra tentativas repetidas;
5. cria a sessão na Stripe;
6. registra o checkout para acompanhamento administrativo.

## Configuração

Configure `STRIPE_SECRET_KEY` nos secrets das Edge Functions do Supabase.

A chave é privada e não deve aparecer em `assets/`, `index.html`, migrations ou arquivos enviados ao navegador.
