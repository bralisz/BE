# SEO da Billie Eilish TV

As páginas públicas passam por `server/api-routes/site-page.js`, que entrega
título, descrição, canonical, hreflang e JSON-LD no HTML inicial. As páginas
de entrada e de álbuns incluem links HTML para registros públicos do catálogo.
O conteúdo vem das mesmas consultas públicas já usadas pelo projeto; registros
inativos não aparecem. A página inicial mostra até 24 links e a página de
álbuns até 120, enquanto o sitemap continua oferecendo a descoberta do restante.

Aliases de biografia e álbuns apontam para o canonical correspondente. Rotas
de conta, notificações pessoais, administração, caminhos desconhecidos e
deployments de preview recebem `noindex`. O admin principal mantém a entrega
estática existente. O cliente preserva o título e a descrição recebidos do
servidor durante a inicialização.

As consultas de SEO têm prazo de quatro segundos por tentativa, cache em memória
de cinco minutos e cache HTTP. Se os dados estiverem indisponíveis, a página
continua entregando apresentação e links para biografia e álbuns. Uma primeira
requisição sem cache pode demorar mais por depender do catálogo; acompanhar o
tempo de resposta após a publicação.

## Validação

Execute `npm run test:seo` para verificar HTML em cinco idiomas, canonical,
links públicos, escape de conteúdo, JSON-LD, indexação, navegação e fallback.
Os arquivos publicados de CSS e JavaScript estão em `_static`; mantenha-os
sincronizados com `assets` e atualize as revisões dos URLs alterados.

## Depois da publicação

No Google Search Console da propriedade `https://billieilishtv.site`, enviar
`https://billieilishtv.site/sitemap.xml` e inspecionar a página inicial, um vídeo
e um álbum. Confirmar o canonical escolhido e o HTML renderizado, validar os
dados estruturados no Rich Results Test e acompanhar impressões e cliques.
O sitemap e o robots.txt já existentes continuam ativos.

Essas alterações ajudam a descoberta e a compreensão do conteúdo, mas não
garantem indexação, posição ou aumento de visitas. Conteúdo original com
descrições úteis e divulgação continuam necessários.
