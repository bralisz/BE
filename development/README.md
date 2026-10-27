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

O painel administrativo usa `source/admin/admin.js` como fonte principal. O código entregue ao navegador é montado no servidor por `server/handlers/admin-runtime.js`.

Os ajustes atuais de interface mobile estão em `source/admin/mobile.js`, um módulo compartilhado acrescentado pelo handler somente à resposta administrativa autenticada. Edite esse arquivo diretamente; não substitua o bundle legado pelo conteúdo de `admin.js`, pois as duas versões têm diferenças anteriores.

A reformulação visual do admin fica em `source/admin/workspace.js`, também
acrescentada somente à resposta autenticada. Ela mantém os controles do runtime
e acrescenta navegação lateral no desktop, ajustes responsivos e busca de
seções por Ctrl+K. Não regenere o bundle legado para atualizar essa camada.

Valide com `npm run test:admin-ui` e `npm run test:seo`.

O dashboard inspirado nas referências visuais está em
`source/admin/studio.js`, aplicado após a camada workspace. Ele reorganiza
os mesmos elementos com dados reais, sem recriar formulários ou ações.
Os painéis de doação e ajustes ficam em seções expansíveis na visão geral.

A biblioteca de imagens, os ícones SVG e a navegação mobile por menu lateral
ficam em `source/admin/media.js`, entregue após studio somente ao admin
autenticado. Filtros e prévia ampliada usam os elementos existentes; operações
de adicionar, editar e excluir continuam nos handlers originais. A paleta do
studio usa azul, cinza e roxo.
