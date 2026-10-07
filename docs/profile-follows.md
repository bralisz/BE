# Seguidores e seguindo

A tabela `public.profile_follows` é a fonte principal, com IDs imutáveis e chave única por vínculo. A migration recupera os vínculos antigos de `user_preferences.data.followingUsers` sem remover preferências. Essa recuperação deve ser aplicada uma única vez pelo histórico de migrations.

O frontend usa as RPCs do backup: `get_profile_follow_state` e `set_profile_follow`. A gravação recebe o estado desejado, permitindo repetição sem duplicação. Os contadores retornam na mesma chamada, sem recarregar o perfil nem salvar todo o JSON de preferências. As listas usam `get_profile_relationships`, carregando 20 perfis por página; o banco limita a 50.

O estado é reutilizado por 30 segundos, por usuário e perfil, com deduplicação de consultas simultâneas. As listas públicas têm cache HTTP de 15 segundos e cache compartilhado de 30 segundos. Não há polling nem assinatura Realtime de seguidores. Mudanças próprias aparecem imediatamente nos contadores; listas em cache e mudanças de outras pessoas podem levar alguns segundos para aparecer ao reabrir.

RLS permite excluir apenas vínculos próprios. A escrita exige login, rejeita usuários banidos e seguir o próprio perfil. RPCs públicas são SECURITY INVOKER; implementações no schema privado consultam perfis com RLS privada e retornam apenas contadores e identidade pública. Nenhuma chave secreta vai para o navegador.

Os vínculos ficam persistidos no Supabase entre sessões e dispositivos. Isso não cria uma cópia independente nem altera o plano de backups automáticos do projeto.

Verificação: build estático, sintaxe JavaScript, testes de cache/deduplicação/duplo clique/erros no frontend, paginação da API e teste transacional de seguir, repetir, listar e deixar de seguir no banco, com rollback das ações de teste.
