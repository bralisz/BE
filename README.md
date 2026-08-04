<p align="center">
  <img src="https://i.imgur.com/tnBMpHr.png" alt="Banner do Billie Eilish TV" width="100%">
</p>

# Billie Eilish TV

**Um espaço feito por fãs, para fãs da Billie Eilish.**

O Billie Eilish TV é um projeto independente que reúne, organiza e apresenta conteúdos relacionados à carreira da Billie Eilish em uma experiência visual inspirada em plataformas de streaming. A proposta é facilitar a descoberta de filmes, documentários, apresentações, entrevistas, vídeos, notícias e outros momentos importantes em um só lugar.

> Este é um projeto de fãs, sem vínculo oficial com Billie Eilish, sua equipe, gravadoras, produtoras ou plataformas citadas.

## Acesse o site

**https://billieilishtv.site**

## O que o projeto oferece

- catálogo organizado por categorias;
- destaques e recomendações de conteúdo;
- páginas individuais para vídeos e produções;
- busca integrada;
- perfis personalizados para membros;
- lista de favoritos;
- área de configurações da conta;
- suporte a dispositivos móveis e instalação como PWA;
- painel administrativo para gerenciamento do catálogo.

## Proposta

O objetivo do Billie Eilish TV é criar um ponto de encontro digital para fãs explorarem a trajetória artística da Billie Eilish de forma organizada, bonita e acessível. O projeto valoriza a comunidade, a descoberta de conteúdos e a preservação de momentos marcantes da carreira da artista.

## Tecnologias

O site utiliza HTML, CSS e JavaScript no front-end, funções serverless na Vercel e Supabase para autenticação, banco de dados e recursos de conta.

## Organização do projeto

Cada área principal possui um README próprio explicando sua função:

- [`api/`](api/README.md) — funções serverless e integração segura com serviços;
- [`assets/`](assets/README.md) — estilos, scripts, imagens, ícones e recursos visuais;
- [`config/`](config/README.md) — configurações públicas do site;
- [`development/`](development/README.md) — fontes auxiliares para desenvolvimento;
- [`docs/`](docs/README.md) — capturas, referências e arquivos históricos;
- [`oauth/`](oauth/README.md) — tela de consentimento OAuth;
- [`scripts/`](scripts/README.md) — ferramentas de validação e manutenção;
- [`supabase/`](supabase/README.md) — banco, schema, segurança e migrations;
- [`atualizacoes/`](atualizacoes/README.md) — histórico editorial de cada versão.

## Primeira versão pública

A primeira GitHub Release do projeto é a **v1.0.0**. As notas completas estão em [`atualizacoes/v1.0.0/artigo.txt`](atualizacoes/v1.0.0/artigo.txt).

## Desenvolvimento e deploy

O projeto foi preparado para publicação na Vercel e utiliza o domínio oficial do projeto:

```text
https://billieilishtv.site
```

Antes de publicar uma alteração, execute:

```bash
node scripts/validate-project.js
node --check assets/js/site.js
```

Consulte os READMEs internos para detalhes técnicos de cada funcionalidade.

## Créditos

Projeto pessoal criado por **Miguel Rodrigues** para a comunidade de fãs da Billie Eilish.
