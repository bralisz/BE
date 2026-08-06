# create-donation-checkout

Cria uma Stripe Checkout Session com o valor escolhido pelo usuário.

A função consulta novamente a ONG no banco, valida o valor mínimo salvo em
`minimumDonationCents`, exige sessão autenticada, limita tentativas repetidas e
só então envia o valor para a Stripe.

## Segredo necessário

Configure `STRIPE_SECRET_KEY` nos segredos das Edge Functions do projeto
Supabase. Nunca coloque essa chave no JavaScript público ou no repositório.
