-- Mantém o histórico local de migrations sincronizado com o projeto remoto.
-- Remove o vídeo que foi cadastrado acidentalmente, caso exista no ambiente.
delete from public.content_items
where collection = 'videos'
  and lower(trim(coalesce(data->>'title', ''))) = lower('Billie Eilish surpreende os fãs quando eles menos esperam!');
