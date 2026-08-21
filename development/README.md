# Fontes de desenvolvimento

`development/source/` guarda versões legíveis usadas para manutenção de partes grandes do frontend e do painel administrativo.

## Pastas

- `source/admin/`: painel administrativo e estilos;
- `source/core/`: autenticação, backend do navegador, idiomas e dados públicos;
- `source/fragments/`: blocos separados de recursos e estilos;
- `source/mobile/`: comportamento e estilos específicos do mobile.

## Importante

Esses arquivos não são propagados automaticamente para a versão publicada. O `package.json` não possui script de build.

`source/admin/admin.js` e `source/admin/admin-runtime-decoded.js` são cópias legíveis equivalentes neste pacote. A versão efetivamente entregue pelo endpoint administrativo fica codificada em `server/handlers/admin-runtime.js`.

Ao editar uma fonte daqui, confira a versão correspondente em `assets/` ou `server/`.
