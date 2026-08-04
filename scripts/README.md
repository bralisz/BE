# Scripts de manutenção

Esta pasta contém ferramentas usadas para conferir e manter a integridade do projeto.

## `validate-project.js`

Verifica se os arquivos essenciais do site existem e se arquivos JSON importantes possuem sintaxe válida.

Execute antes de publicar:

```bash
node scripts/validate-project.js
```

Também é recomendado validar o JavaScript principal:

```bash
node --check assets/js/site.js
```
