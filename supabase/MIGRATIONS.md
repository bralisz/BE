# Migrações do Supabase

Todas as migrations deste projeto usam versões únicas de 14 dígitos, em ordem cronológica.
Esse formato mantém o diretório local compatível com o histórico remoto do projeto `be-tv`
e evita o erro **Remote migration versions not found in local migrations directory**.

A migration `20260802000000_account_exists.sql` funciona como baseline idempotente para
branches novas: ela recria o schema necessário sem copiar dados de produção.

O registro remoto legado `20260802_profile_banner_settings` foi normalizado para
`20260804053000_profile_banner_settings` apenas no histórico de migrations. O SQL não foi
reaplicado e nenhum dado foi removido.

Não renomeie nem exclua migrations que já aparecem no histórico remoto.

A migration `20260804164611_cross_device_user_preferences.sql` cria a tabela privada `user_preferences`, suas políticas RLS e habilita Realtime apenas para `profiles` e `user_preferences`.

- `20260804170608_scale_concurrent_users.sql`: troca a sincronização privada para Broadcast, une canais por usuário e otimiza as políticas de perfil para picos de acesso.
- `20260804181700_public_profile_view.sql`: cria a leitura pública restrita por `@`, expondo somente apresentação, favoritos e vídeos salvos.
- `20260806024500_enable_public_ongs.sql`: libera a coleção pública de ONGs para a página `/ong`.

- `20260806033000_enable_public_ong_page_banner.sql`: libera somente o banner principal configurado no dashboard para a página `/ong`.
- `20260806053117_secure_dynamic_ong_donations.sql`: adiciona o valor mínimo individual por ONG, valida o formato no banco e cria o registro privado usado pela Edge Function de checkout.

## `20260806055200_admin_donation_overview.sql`

- Preserva nome do usuário, @ e nome da ONG no registro do checkout.
- Adiciona status e campo futuro de confirmação de pagamento.
- Cria a função administrativa `get_admin_donation_overview`.
- Entrega histórico pesquisável e indicadores de valor, usuários e ONGs.

## `20260806070000_public_donation_supporters.sql`

- Cria a lista pública de apoiadores baseada somente em doações com status `paid`.
- Expõe apenas nome, @, avatar, banner e data do apoio; valores e dados de pagamento continuam privados.
- Remove usuários banidos ou sem perfil público completo da seção de apoiadores.
## `20260806073000_add_bralis_as_supporter.sql`

- Inclui o perfil público `@bralis` como apoiador inicial.
- Mantém a lista ordenada pela data mais recente do apoio.
- Futuros apoiadores com pagamentos confirmados aparecem antes dos anteriores.

