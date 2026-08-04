# Migrações do Supabase

Este diretório contém somente migrations com timestamps únicos de 14 dígitos.
As versões publicadas correspondem ao histórico remoto do projeto `be-tv`, evitando
divergências durante `supabase db push` e Supabase Preview/Branching.

A baseline `20260802000000_account_exists.sql` recria o schema necessário em branches
novas. As migrations posteriores aplicam apenas alterações incrementais.

Não reutilize timestamps, não crie arquivos com versões de 8 dígitos e não renomeie
migrations que já tenham sido publicadas.
