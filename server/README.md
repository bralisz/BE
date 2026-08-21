# Servidor e API

A pasta `server/` contém a lógica executada nas Functions da Vercel.

## Estrutura

- `api-routes/`: agrupadores das rotas públicas;
- `api-handlers/`: endpoints menores e utilitários públicos;
- `handlers/`: implementação de recursos maiores, como admin, conta e mídia;
- `config/`: configurações usadas no servidor.

A entrada pública é `api/index.js`, que encaminha as requisições para as rotas desta pasta.

## Arquivos importantes

- `api-routes/public-data.js`: dados públicos e cache do catálogo;
- `api-routes/tv-page.js`: página e compatibilidade de Smart TV;
- `handlers/drive-media.js`: resolução de mídia do Google Drive;
- `handlers/vk-media.js`: resolução de mídia do VK;
- `handlers/admin-runtime.js`: bundle servido ao painel administrativo;
- `handlers/delete-account.js`: exclusão de conta;
- `handlers/export-account.js`: exportação de dados do usuário.

## Ao editar

Evite retransmitir arquivos grandes pela Function quando a origem puder ser acessada diretamente. Preserve validações de origem, autenticação, cache e restrições de redirecionamento.
