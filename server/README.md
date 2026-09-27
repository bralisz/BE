# Servidor e API

A pasta `server/` concentra a lógica executada no backend da aplicação.

## Estrutura

- `api-routes/`: rotas agrupadas por recurso;
- `api-handlers/`: endpoints e handlers menores;
- `handlers/`: recursos maiores, como conta, mídia e administração;
- `config/`: configurações compartilhadas do servidor.

A entrada pública fica em `api/index.js`, que encaminha as requisições para essas pastas.

## Arquivos principais

- `api-routes/public-data.js`: catálogo e dados públicos;
- `api-routes/tv-page.js`: página e compatibilidade da TV;
- `handlers/drive-media.js`: mídia do Google Drive;
- `handlers/vk-media.js`: mídia do VK;
- `handlers/admin-runtime.js`: código entregue ao painel administrativo;
- `handlers/delete-account.js`: exclusão de conta;
- `handlers/export-account.js`: exportação de dados.

O código desta pasta é ativo. Ao reorganizar qualquer arquivo, atualize todas as referências antes de fazer o commit.