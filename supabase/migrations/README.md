# Migrações do Supabase

Os nomes dos arquivos usam versões únicas e ordenadas. As seis primeiras versões
correspondem exatamente ao histórico já registrado no projeto `be-tv`; isso evita
o erro **Remote migration versions not found in local migrations directory** no
Supabase Preview.

A versão `20260802_account_exists.sql` também funciona como baseline idempotente
para que branches novas consigam recriar o schema sem copiar dados de produção.
Não renomeie nem remova migrações que já foram publicadas.
