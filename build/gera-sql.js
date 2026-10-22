// Gera o banco do painel do Grupo Larssen a partir dos produtos atuais (build/dados.js).
// Saídas: supabase/larssen.sql (estrutura + carga; fora do git porque tem o e-mail da equipe)
//         painel/catalogo.json (linhas, empresas e produtos; usado pelo modo demonstração do painel)
// Uso: node build/gera-sql.js
const fs = require("fs"), path = require("path");
const R = path.join(__dirname, "..");
const { LINHAS, EMPRESAS, PRODUTOS_ORIGINAIS } = require("./dados.js");
const PRODUTOS = PRODUTOS_ORIGINAIS;
const ETAPAS = ["floresta", "serraria", "beneficiamento", "autoclave"];
const produtos = PRODUTOS.map((p, i) => ({ id: p.id, linha: p.linha, nome: p.nome, uso: p.uso, madeira: p.madeira, bitolas: p.bitolas, carimbos: p.carimbos, foto: p.foto, fotos: [], descricao: "", destaque: ["dormentes-tratados", "pergolados", "decks", "assoalhos", "mouroes", "maravalha-aviario", "tesouras", "cavaco"].indexOf(p.id) + 1, ativo: true, ordem: (i + 1) * 10 }));
fs.mkdirSync(path.join(R, "painel"), { recursive: true });
fs.writeFileSync(path.join(R, "painel", "catalogo.json"), JSON.stringify({ gerado: new Date().toISOString().slice(0, 10), linhas: LINHAS.map(l => ({ id: l.id, nome: l.nome, empresa: l.empresa })), empresas: EMPRESAS.map(e => ({ id: e.id, nome: e.nome, curto: e.curto })), etapas: ETAPAS, produtos }));

const q = s => "'" + String(s).replace(/'/g, "''") + "'";
const arr = a => a.length ? "array[" + a.map(q).join(",") + "]::text[]" : "'{}'::text[]";
const BALDE = "https://cwsjddppdogvyitspbfr.supabase.co/storage/v1/object/public/larssen-fotos/";
const linhas = produtos.map(p => `(${[q(p.id), q(p.linha), q(p.nome), q(p.uso), q(p.madeira), arr(p.bitolas), arr(p.carimbos), q(p.foto), arr(p.fotos), q(p.descricao), p.destaque, "true", p.ordem].join(", ")})`);
const sql = `-- =====================================================================================
-- Painel de produtos do Grupo Larssen · rodar UMA vez no Supabase (projeto "Mejex Project"):
-- SQL Editor → New query → colar este arquivo inteiro → Run. Pode rodar de novo sem duplicar nada.
-- Gerado por build/gera-sql.js em ${new Date().toISOString().slice(0, 10)}.
-- =====================================================================================

-- ============ 1. ESTRUTURA ============
create table if not exists public.larssen_produtos (
  id           text primary key check (id ~ '^[a-z0-9][a-z0-9-]{1,60}$'),
  linha        text not null check (linha in (${LINHAS.map(l => q(l.id)).join(", ")})),
  nome         text not null check (char_length(nome) between 2 and 120),
  uso          text not null default '' check (char_length(uso) <= 200),
  madeira      text not null default '' check (char_length(madeira) <= 120),
  bitolas      text[] not null default '{}' check (cardinality(bitolas) <= 30),
  carimbos     text[] not null default '{}' check (carimbos <@ array[${ETAPAS.map(q).join(", ")}]::text[]),
  foto         text check (foto is null or foto = '' or foto ~ '^[a-z0-9_.-]+\\.(jpe?g|png|webp)$' or foto like '${BALDE}%'),
  fotos        text[] not null default '{}' check (cardinality(fotos) <= 12),
  descricao    text not null default '' check (char_length(descricao) <= 3000),
  destaque     int not null default 0 check (destaque between 0 and 99),
  ativo        boolean not null default true,
  ordem        int not null default 0,
  criado_em    timestamptz not null default now(),
  alterado_em  timestamptz not null default now(),
  alterado_por text
);
create table if not exists public.larssen_equipe (
  email     text primary key,
  nome      text,
  criado_em timestamptz not null default now()
);
create table if not exists public.larssen_historico (
  id     bigint generated always as identity primary key,
  tabela text not null,
  chave  text not null,
  acao   text not null,
  antes  jsonb not null,
  quem   text,
  quando timestamptz not null default now()
);

create or replace function public.larssen_eh_equipe() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.larssen_equipe where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
create or replace function public.larssen_carimbo() returns trigger
language plpgsql set search_path = public as $$
begin
  new.alterado_em := now();
  new.alterado_por := coalesce(auth.jwt() ->> 'email', new.alterado_por);
  return new;
end $$;
create or replace function public.larssen_guarda_historico() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.larssen_historico (tabela, chave, acao, antes, quem)
  values (tg_table_name, to_jsonb(old) ->> 'id', lower(tg_op), to_jsonb(old), auth.jwt() ->> 'email');
  return null;
end $$;
drop trigger if exists larssen_carimbo on public.larssen_produtos;
create trigger larssen_carimbo before insert or update on public.larssen_produtos for each row execute function public.larssen_carimbo();
drop trigger if exists larssen_historico on public.larssen_produtos;
create trigger larssen_historico after update or delete on public.larssen_produtos for each row execute function public.larssen_guarda_historico();

-- segurança: o site lê os produtos ativos; só a equipe vê os ocultos e altera
alter table public.larssen_produtos enable row level security;
alter table public.larssen_equipe enable row level security;
alter table public.larssen_historico enable row level security;
drop policy if exists "larssen: site le ativos" on public.larssen_produtos;
drop policy if exists "larssen: equipe le tudo" on public.larssen_produtos;
drop policy if exists "larssen: equipe insere" on public.larssen_produtos;
drop policy if exists "larssen: equipe altera" on public.larssen_produtos;
drop policy if exists "larssen: equipe exclui" on public.larssen_produtos;
drop policy if exists "larssen: equipe se ve" on public.larssen_equipe;
drop policy if exists "larssen: equipe le historico" on public.larssen_historico;
create policy "larssen: site le ativos" on public.larssen_produtos for select to anon, authenticated using (ativo);
create policy "larssen: equipe le tudo" on public.larssen_produtos for select to authenticated using (public.larssen_eh_equipe());
create policy "larssen: equipe insere" on public.larssen_produtos for insert to authenticated with check (public.larssen_eh_equipe());
create policy "larssen: equipe altera" on public.larssen_produtos for update to authenticated using (public.larssen_eh_equipe()) with check (public.larssen_eh_equipe());
create policy "larssen: equipe exclui" on public.larssen_produtos for delete to authenticated using (public.larssen_eh_equipe());
create policy "larssen: equipe se ve" on public.larssen_equipe for select to authenticated using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
create policy "larssen: equipe le historico" on public.larssen_historico for select to authenticated using (public.larssen_eh_equipe());
revoke all on public.larssen_produtos, public.larssen_equipe, public.larssen_historico from anon;
grant select on public.larssen_produtos to anon;
grant select, insert, update, delete on public.larssen_produtos to authenticated;
grant select on public.larssen_equipe, public.larssen_historico to authenticated;
revoke insert, update, delete on public.larssen_equipe, public.larssen_historico from authenticated;
revoke execute on function public.larssen_eh_equipe() from public, anon;
grant execute on function public.larssen_eh_equipe() to authenticated;
revoke execute on function public.larssen_carimbo() from public, anon, authenticated;
revoke execute on function public.larssen_guarda_historico() from public, anon, authenticated;

-- fotos novas enviadas pelo painel (as atuais continuam no próprio site)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('larssen-fotos', 'larssen-fotos', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png'];
drop policy if exists "larssen: equipe ve fotos" on storage.objects;
drop policy if exists "larssen: equipe envia fotos" on storage.objects;
drop policy if exists "larssen: equipe troca fotos" on storage.objects;
drop policy if exists "larssen: equipe apaga fotos" on storage.objects;
create policy "larssen: equipe ve fotos" on storage.objects for select to authenticated using (bucket_id = 'larssen-fotos' and public.larssen_eh_equipe());
create policy "larssen: equipe envia fotos" on storage.objects for insert to authenticated with check (bucket_id = 'larssen-fotos' and public.larssen_eh_equipe());
create policy "larssen: equipe troca fotos" on storage.objects for update to authenticated using (bucket_id = 'larssen-fotos' and public.larssen_eh_equipe());
create policy "larssen: equipe apaga fotos" on storage.objects for delete to authenticated using (bucket_id = 'larssen-fotos' and public.larssen_eh_equipe());

-- ============ 2. EQUIPE (e-mails que podem usar o painel) ============
insert into public.larssen_equipe (email, nome) values
  ('doumajolo10@gmail.com', 'Douglas (MAJEX)')
  -- , ('email.do.grupo@exemplo.com', 'Nome da pessoa')
on conflict (email) do nothing;

-- ============ 3. CARGA: os ${produtos.length} produtos do site ============
insert into public.larssen_produtos (id, linha, nome, uso, madeira, bitolas, carimbos, foto, fotos, descricao, destaque, ativo, ordem) values
${linhas.join(",\n")}
on conflict (id) do nothing;

select (select count(*) from public.larssen_produtos) as produtos, (select count(*) from public.larssen_equipe) as equipe;
`;
fs.mkdirSync(path.join(R, "supabase"), { recursive: true });
fs.writeFileSync(path.join(R, "supabase", "larssen.sql"), sql);
console.log("supabase/larssen.sql", Math.round(sql.length / 1024) + " KB · painel/catalogo.json ·", produtos.length, "produtos");
