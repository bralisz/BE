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
