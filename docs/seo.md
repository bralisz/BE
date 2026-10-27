# SEO da Billie Eilish TV

As páginas públicas passam por `server/api-routes/site-page.js`, que entrega
título, descrição, canonical, hreflang e JSON-LD no HTML inicial. A descoberta do catálogo continua pelo sitemap e pelos componentes
existentes do site. Não há um segundo catálogo ou lista textual inserida pelo
renderizador no layout público.

Aliases de biografia e álbuns apontam para o canonical correspondente. Rotas
de conta, notificações pessoais, administração, caminhos desconhecidos e
deployments de preview recebem `noindex`. O admin principal mantém a entrega
estática existente. O cliente preserva o título e a descrição recebidos do
servidor durante a inicialização.

As consultas do catálogo têm prazo de dez segundos para a RPC e quatro para
a compatibilidade legada, com cache em memória
de cinco minutos e cache HTTP. Se os dados estiverem indisponíveis, a página
continua entregando o layout regular e metadados padrão. Uma primeira
requisição sem cache pode demorar mais por depender do catálogo; acompanhar o
tempo de resposta após a publicação.

## Validação

Execute `npm run test:seo` para verificar HTML em cinco idiomas, canonical,
ausência de blocos visuais duplicados, escape de conteúdo, JSON-LD, indexação, navegação e fallback.
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

## SEO por conteúdo e idioma

Cada URL de vídeo resolve o registro correspondente pelo ID público e usa seu
título, descrição e miniatura. As traduções cadastradas para pt-BR, en-US, es,
fr e it são respeitadas; nomes de músicas marcados para preservar o título
continuam originais, seguindo a regra de exibição do site. A descrição não leva
marcação Markdown/HTML. Na ausência de tradução, usa os dados do mesmo registro.

Na navegação sem recarregar a página, o cliente aplica os dados do item aberto
e confirma os metadados com a mesma renderização usada nas visitas diretas,
por `/api/site-page?format=seo&path=...`. A resposta é pública, específica da
URL/idioma e não indexável. A mudança atualiza título, descrição, Open Graph,
Twitter, canonical, hreflang e JSON-LD. Respostas atrasadas de outro vídeo são
ignoradas. O título do documento é protegido da tradução automática da interface.

Conteúdos ausentes retornam 404; indisponibilidade temporária do catálogo retorna
503, sem apresentar o SEO da home como se fosse o conteúdo solicitado.

As páginas de conteúdo não consultam as configurações gerais para gerar seu SEO.
Falhas sem nenhum registro válido usam cache curto para permitir nova tentativa.

A consulta prioriza vídeos e reutiliza o cache por coleção, sem aguardar álbuns ou
filmes quando o vídeo solicitado já foi encontrado. O orçamento total das
consultas por requisição é de 14 segundos, abaixo do limite da função.
