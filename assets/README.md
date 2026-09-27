# Assets de produção

A pasta `assets/` reúne os arquivos que o site público usa diretamente.

## JavaScript

- `js/site.js`: bundle principal do site, catálogo, conta, perfil, player e navegação;
- `js/community.js`: Comunidade e recursos sociais;
- `js/i18n.js`: tradução da interface e conteúdo dinâmico;
- `js/locale-routing.js`: rotas e seleção de idioma;
- `js/lazy-loading.js`: carregamento sob demanda;
- `js/tv-controller.js`: controle da reprodução na TV;
- `js/tv-session-widget.js`: sessão da TV no desktop.

## CSS

- `css/site.css`: estilos gerais;
- `css/community.css`: Comunidade;
- `css/tv-pairing.css`: conexão e reprodução na TV;
- `css/tv-session-widget.css`: widget da sessão da TV.

## Recursos

- `i18n/`: arquivos de idioma, atualmente `pt-br`, `en-us`, `es`, `fr` e `it`;
- `icons/`: ícones e recursos do PWA;
- `images/`: imagens usadas pelo site.

Os arquivos daqui são considerados parte da versão publicada. Antes de mover ou renomear qualquer coisa, procure as referências no HTML, no servidor e nos scripts de build.