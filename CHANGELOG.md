# Changelog

## 1.1.0 — 4 de agosto de 2026

### Escalabilidade e picos de login

- Agrupamento de consultas simultâneas do mesmo perfil para impedir requisições duplicadas durante a inicialização.
- Cache curto em memória para perfil e preferências do usuário.
- Um único canal privado do Supabase Realtime por usuário, compartilhado por perfil e preferências.
- Migração de `Postgres Changes` para `Broadcast` privado nas sincronizações entre dispositivos.
- Remoção de consultas redundantes de avatar e status no fluxo normal de login.
- Cache de borda para a página pública e os dados públicos, com revalidação em segundo plano.
- Coalescência de requisições em andamento nas funções serverless para reduzir rajadas contra o banco.
- Políticas RLS de perfil otimizadas para evitar reavaliação desnecessária por linha.
- Sincronização entre computador e celular mantida com menor quantidade de conexões e consultas.

### Interface

- Organização aprimorada da página de configurações.
- Favoritos destacados no perfil.
