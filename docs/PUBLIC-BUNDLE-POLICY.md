# Estrutura pública de produção

O código-fonte editável permanece em `assets/`, mas essa rota é bloqueada no deploy.

O navegador recebe somente a estrutura compacta de produção:

- `/_static/chunks/locale.js` — roteamento de idioma;
- `/_static/chunks/site.js` — aplicação principal;
- `/_static/chunks/tv.js` — controle/pareamento da Smart TV;
- `/_static/chunks/session.js` — widget de sessão da TV;
- `/_static/chunks/lazy.js` — carregamento auxiliar das páginas leves;
- `/_static/styles/site.css` — estilos principais;
- `/_static/styles/tv.css` — estilos do pareamento;
- `/_static/locales/` — traduções estáticas;
- `/_static/media/` — imagens e ícones locais.

Os nomes públicos não usam hashes. A invalidação de cache continua sendo feita pelo parâmetro de revisão das páginas e pela versão do Service Worker.

Após editar arquivos de `assets/`, execute `npm run build:static` para reconstruir `/_static` antes de publicar.

As rotas `/assets/*`, `/scripts/*`, `/development/*`, `/docs/*`, `/migrations/*`, `/supabase/*` e `/server/*` não devem ser servidas publicamente.
