# Migrations

Esta pasta contém o histórico versionado das alterações do banco Supabase.

## Regra principal

Nunca edite, renomeie ou reutilize uma migration que já foi aplicada em produção. Para qualquer nova alteração, crie outro arquivo com timestamp único.

## Nomes

O padrão usado é:

`YYYYMMDDHHMMSS_descricao_da_alteracao.sql`

## Antes de criar uma migration

- confira se a mudança já existe em uma migration anterior;
- preserve dados existentes sempre que possível;
- revise RLS, grants e funções públicas;
- evite expor e-mail, UUID interno, papel administrativo ou preferências privadas em RPCs públicas;
- atualize `supabase/schema.sql` quando quiser manter a visão consolidada do banco alinhada ao histórico.

O resumo do histórico também está em `supabase/MIGRATIONS.md`.
