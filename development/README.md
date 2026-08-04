# Fontes auxiliares de desenvolvimento

Esta pasta reúne módulos separados e fragmentos usados como referência durante o desenvolvimento do Billie Eilish TV.

## Para que serve

Os arquivos ajudam a organizar funcionalidades maiores, testar refatorações e manter versões legíveis de partes que, em produção, estão reunidas nos arquivos principais.

## Áreas

- `source/admin/`: interface e lógica do painel administrativo;
- `source/core/`: recursos centrais, dados públicos e comunicação com o back-end;
- `source/fragments/`: módulos de suporte, privacidade, notificações e atualizações;
- `source/mobile/`: comportamentos e estilos específicos para dispositivos móveis.

O site publicado carrega principalmente `assets/js/site.js` e `assets/css/site.css`. Alterar somente esta pasta não modifica automaticamente a versão de produção.
