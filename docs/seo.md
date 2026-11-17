# SEO da Billie Eilish TV

As páginas públicas passam por `server/api-routes/site-page.js`, que entrega
título, descrição, canonical, hreflang e JSON-LD no HTML inicial. A descoberta do catálogo continua pelo sitemap e pelos componentes
existentes do site. O renderizador acrescenta detalhes textuais somente na página do conteúdo correspondente,
sem inserir catálogos duplicados na página inicial.

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

## Descoberta de capas e integridade do sitemap

O sitemap inclui a capa cadastrada de cada vídeo ou álbum com a extensão de
imagens do Google, preservando as cinco versões de idioma e seus alternates.
Aceita apenas URLs HTTP/HTTPS; imagens ausentes não recebem uma capa inventada.
O JSON-LD também associa a imagem principal e o conteúdo à URL canonical da página.

As consultas do sitemap têm limites de 8 segundos para a RPC e 4 segundos para
a compatibilidade legada. Quando alguma coleção falha ou retorna um formato
inválido, a resposta é 503 com `Retry-After` e `no-store`, em vez de publicar
um catálogo incompleto como sucesso. Coleções vazias válidas continuam aceitas.
`npm run test:seo` inclui a validação de XML, imagens, idiomas, falhas e recuperação.

Referência: https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps

## Identidade do projeto e Instagram

O JSON-LD identifica a organização de fãs Billie Eilish TV (nome alternativo
BETV) como responsável pelo WebSite e usa `sameAs` para vincular o Instagram
confirmado pelo proprietário: https://www.instagram.com/billieilishtv_/ .
O endereço não inclui parâmetros de rastreamento. A artista permanece uma
entidade separada, como assunto do conteúdo; o perfil é do projeto de fãs.
A associação não garante posição nas buscas ou a exibição do Instagram.

## Acesso público e metadados de vídeos (novembro de 2026)

Visitantes sem sessão podem abrir o catálogo e as rotas de vídeo diretamente,
inclusive por links compartilhados nas redes sociais, sem escolher antes
"Acessar como convidado". Entrar e Criar conta continuam direcionando para
`/login`. Configurações, operações pessoais e dados da conta permanecem
sujeitos às verificações existentes de autenticação.

Se um vídeo de entrevista ou apresentação tiver a categoria correspondente
mas não uma descrição cadastrada, o SEO utiliza uma descrição contextual no
idioma da página. Títulos curtos que não mencionem a artista recebem um
contexto específico para entrevistas ou shows, preservando o título original
do registro no início. Quando existe descrição cadastrada, ela prevalece.
Os dados estruturados recebem `genre` somente quando a categoria do vídeo
é reconhecível; não são inventados datas, URLs de reprodução ou locais.

O comportamento foi coberto por verificações de convidado e por exemplos
de entrevistas e apresentações em pt-BR, en-US, es, fr e it.

## Páginas individuais indexáveis e ficha técnica

Vídeos, apresentações, entrevistas, podcasts e videoclipes recebem um endereço
amigável e estável com a categoria, um slug derivado do título original e o ID
público ao final para evitar colisões. Exemplo:
`/pt-br/show/coachella-2023-legendado-12345678`.
As cinco versões de idioma preservam a mesma identificação do item e declaram
`canonical` e `hreflang` corretamente. Os endereços numéricos anteriores
continuam funcionando; agora apontam pelo canonical para o novo endereço.
Slugs abreviados, quando únicos, redirecionam para a URL completa.

O HTML entregue pelo servidor inclui título, sinopse quando cadastrada,
ficha técnica com dados disponíveis e setlist ordenada em texto sem depender
do JavaScript do usuário. São usados apenas dados públicos realmente
registrados: não preenche nomes de músicas, locais, datas nem participantes
com informação inventada. O JSON-LD de vídeos usa `VideoObject`, e os shows
com setlist usam `ItemList` com faixas em ordem.

O editor autenticado de vídeos exibe campos opcionais para local, cidade, país,
direção, produção, apresentação, convidados e setlist (uma música por linha).
Itens antigos não precisam ser editados para continuar funcionando; ficam
sem essas seções se os dados não estiverem disponíveis.

O sitemap publica os novos caminhos amigáveis e os alternates em cinco
idiomas, com a imagem cadastrada. O código de navegação SPA atualiza o URL,
a URL compartilhada, o canonical e o texto da página ao abrir outro vídeo.
`npm run test:seo` agora também valida rotas amigáveis, sanitização de HTML,
setlists, conteúdo visível e redirecionamentos.
