# Verificação de privacidade e segurança — 5 de agosto de 2026

## Resultado da revisão

A revisão identificou que as políticas atuais do Supabase ainda permitiam leitura anônima do JSON bruto de `site_settings` e dos itens publicados de `content_items`. Entre as chaves presentes nesses registros estavam metadados como `createdBy` e `updatedBy`.

A versão 1.1.1 corrige isso no código e inclui uma migration para o banco:

- a API pública usa listas explícitas de campos permitidos;
- o navegador deixa de consultar o JSON bruto para conteúdo público;
- as políticas públicas diretas são removidas;
- e-mails e metadados administrativos antigos são apagados dos registros;
- imagens externas passam por proxy com HTTPS, limite de tamanho, limite de redirecionamentos e lista de hosts;
- fontes internas, migrations e arquivos de desenvolvimento são excluídos do deploy por `.vercelignore`;
- arquivos históricos que continham configuração antiga foram removidos.

## Ordem obrigatória de publicação

1. Publique primeiro os novos arquivos do site na Vercel.
2. Depois execute `supabase/migrations/20260805213000_harden_public_content_and_billie_settings.sql` no Supabase.

Essa ordem mantém compatibilidade durante a atualização. A proteção do banco só estará completa depois da etapa 2.

## Chaves e console

A chave `sb_publishable_...` presente no front-end é uma chave publicável do Supabase e não concede privilégios administrativos sozinha; a segurança depende das políticas RLS. Nenhuma chave `service_role`, `sb_secret`, senha, chave privada ou token administrativo foi encontrada nos arquivos distribuídos.

O código não registra senhas, tokens de sessão ou chaves administrativas no console. Mensagens de erro técnicas podem continuar aparecendo para diagnóstico, mas não devem conter esses segredos. Não existe garantia absoluta contra vulnerabilidades futuras, por isso novas mudanças de autenticação e banco devem passar por revisão antes do deploy.

## Avisos adicionais do projeto Supabase

A auditoria automática do Supabase também apontou recomendações gerais já existentes, como ativar proteção contra senhas vazadas e revisar funções `SECURITY DEFINER` expostas por RPC. As duas funções públicas adicionadas nesta versão retornam apenas campos permitidos; os demais avisos devem ser revisados separadamente antes de futuras alterações de autenticação.
