do $$
declare
  function_identity text;
begin
  for function_identity in
    select pg_get_function_identity_arguments(p.oid)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'match_historical_project_chunks'
  loop
    execute format(
      'drop function if exists public.match_historical_project_chunks(%s)',
      function_identity
    );
  end loop;
end $$;

do $$
begin
  if to_regclass('public.historical_project_chunks') is not null then
    drop policy if exists "Read own org history chunks"
      on public.historical_project_chunks;
    drop policy if exists "Write own org history chunks"
      on public.historical_project_chunks;
  end if;
end $$;

drop index if exists public.historical_project_chunks_embedding_idx;
drop index if exists public.historical_project_chunks_tsv_idx;
drop table if exists public.historical_project_chunks;
drop extension if exists vector;
