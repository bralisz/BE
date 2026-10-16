# Fontes de desenvolvimento

`development/source/` guarda código separado para manutenção de partes grandes do frontend e do painel administrativo.

## Pastas

- `source/admin/`: painel administrativo;
- `source/core/`: backend do navegador, idiomas e dados públicos;
- `source/fragments/`: recursos e estilos que ficam separados por função;
- `source/mobile/`: comportamento e estilos específicos do mobile.

## Importante

Esses arquivos não entram automaticamente no build público. O build atual publica os arquivos de `assets/` e gera a pasta `_static/`.

Por isso, não mova ou renomeie arquivos daqui assumindo que são equivalentes aos arquivos publicados. Antes de alterar uma fonte, confira onde ela é usada e qual arquivo público recebe a mudança.

O painel mantém a fonte legada `source/admin/admin.js`. O código entregue ao navegador é montado no servidor por `server/handlers/admin-runtime.js`, que contém uma versão anterior do bundle com diferenças próprias.

A interface responsiva está em `source/admin/interface.js`, acrescentada pelo handler somente à resposta administrativa autenticada. Esse módulo organiza navegação, busca de páginas, tabelas e formulários no celular e no PC, preservando os handlers de dados do bundle legado. Ele substitui os antigos patches de layout do editor. Edite esse arquivo diretamente; não substitua o bundle legado pelo conteúdo de `admin.js`, pois as duas versões têm diferenças anteriores.
