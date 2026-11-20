# BETV — plano de escalabilidade (10 mil+ usuários)

## Estado verificado em 20/11/2026
- Projeto Supabase `be-tv`, ativo; aproximadamente **7.051** registros em `public.profiles`.
- A API pública (`server/api-routes/public-data.js`) já usa bootstrap da Home, cache de CDN, versões de catálogo e invalidação administrativa. Este ajuste limita o mapa por instância a 128 entradas, conserva a coalescência de buscas simultâneas mesmo com TTL 0 e remove falhas do cache.
- A comunidade já usa `get_similar_fans_page` (lotes de 8), botão **+** e carregamento próximo à viewport; seguidores têm RPC paginada com `limit` máximo de 50; comentários de vídeo também são paginados.
- A entrega de imagens já usa `sharp`, formatos otimizados, lazy loading e Service Worker. Este ajuste diferencia URLs de origem estável de imagens ligadas a registros mutáveis; imagens alteradas no admin não ficam mais presas a cache imutável de 1 ano.
- Realtime já está seletivo: canal privado por usuário para sincronização de perfil/preferências e canal de comentários por vídeo exibido. Há limpeza de canais na saída.
- Auditoria de índices existentes: `profiles_username_key`, `profiles_username_search_idx`, `profile_follows_*_page_idx`, `video_comments_video_created_at_idx`, `profile_likes_profile_id_created_at_idx` e chaves primárias de preferências/conteúdo. **Não criar índices duplicados** sem `EXPLAIN (ANALYZE, BUFFERS)` e dados de desempenho.

## Testes
1. `npm run test:scale` — cache, concorrência, falha/retry, limite de memória e regressões de paginação/cache de imagem.
2. `npm run test:performance` — testes de regressão já existentes (requer dependências e bundles sincronizados).
3. `node scripts/load-test-public.mjs --url=http://localhost:3000 --users=10 --seconds=10` — prova de carga **limitada** para ambiente local.
4. Em staging, usar `--allow-remote`; nunca testar carga agressiva em produção. O script bloqueia `billieilishtv.site`.

Avaliar p50/p95/p99, erros HTTP, memória/CPU da instância, conexões Postgres, cache HIT/MISS no CDN, Supabase Database/Query Performance e custos por uso. Aumentar gradualmente 10 → 30 visitantes simulados neste script; usar ferramenta dedicada e ambiente isolado para 100, 500, 1.000 e 10.000 concorrentes. Não prometer capacidade antes da medição.

## Regras para continuar escalando
- **Público vs. privado:** somente cache compartilhado para páginas e dados públicos; nunca cachear preferências, sessões, JWT, favoritos de um usuário ou respostas autenticadas como se fossem públicas.
- **Home:** manter a versão do bootstrap e invalidar o cache nas atualizações de catálogo.
- **Comunidade:** manter páginas pequenas e não carregar todos os perfis no navegador; preferir cursor para grandes listas de seguidores quando o volume justificar.
- **Banco:** coletar planos reais de consulta antes de criar índices; índices demais aumentam o custo de escrita.
- **CDN:** preservar transformações dimensionadas de capas/avatares; usar nomes versionados quando os arquivos forem substituídos.
- **Realtime:** manter subscrições por usuário/vídeo, evitar tópicos globais e liberar os canais na navegação.
- **SLO sugerido para staging:** erros < 2%, p95 de API pública < 1000 ms sob a carga-alvo; ajustar os limites com base em dados reais.

Este conjunto de mudanças não altera o esquema do banco de produção, autenticação nem dados dos usuários.
