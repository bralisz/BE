# Assets de produção

A pasta `assets/` contém arquivos carregados diretamente pelo site público.

## JavaScript

- `js/site.js`: bundle principal do site, conta, catálogo, perfil, player e navegação;
- `js/community.js`: página Comunidade, rankings e interações sociais;
- `js/i18n.js`: tradução da interface;
- `js/locale-routing.js`: rotas por idioma;
- `js/lazy-loading.js`: carregamento otimizado de mídia;
- `js/tv-controller.js`: controle e envio de conteúdo para a TV;
- `js/tv-session-widget.js`: estado da sessão da Smart TV no desktop.

## CSS

- `css/site.css`: estilos gerais do site e dos players;
- `css/community.css`: estilos da Comunidade;
- `css/tv-pairing.css`: tela de conexão e reprodução na TV;
- `css/tv-session-widget.css`: widget de sessão da TV.

## Outros recursos

- `i18n/`: dicionários `en-us`, `es` e `fr`;
- `icons/`: ícones do navegador e PWA;
- `images/`: imagens organizadas por uso no site.

## Ao editar

Alterações nesta pasta afetam diretamente a versão pública. Evite deixar comentários de changelog no CSS/JS; prefira comentários curtos apenas quando explicarem uma regra que não seja óbvia.
