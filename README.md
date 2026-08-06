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


## Migração de segurança obrigatória

Publique primeiro os novos arquivos na Vercel e, em seguida, execute no Supabase a migration `supabase/migrations/20260805213000_harden_public_content_and_billie_settings.sql`. Ela impede leitura pública do JSON bruto das configurações e do catálogo, expondo apenas campos aprovados pelas funções públicas. A proteção do banco só fica completa depois dessa migration.

O relatório da revisão está em `docs/SECURITY-AUDIT-20260805.md`.
