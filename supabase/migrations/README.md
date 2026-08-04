# Arquivos de migration

Cada arquivo SQL desta pasta representa uma mudança específica no banco e é executado em ordem crescente pela versão presente no início do nome.

## Padrão obrigatório

```text
AAAAMMDDhhmmss_descricao_da_mudanca.sql
```

Exemplo:

```text
20260804053000_profile_banner_settings.sql
```

Todas as versões atuais possuem 14 dígitos e são únicas. Os antigos arquivos `20260802_*` e `20260803_*` foram removidos porque o Supabase interpretava arquivos diferentes como a mesma versão, provocando erro de chave duplicada no Preview.

Não copie migrations antigas de volta para esta pasta e não altere versões que já estejam registradas remotamente.
