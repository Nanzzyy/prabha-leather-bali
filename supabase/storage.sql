-- Public read-only product image bucket.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');

-- Upload, replace, and delete operations stay restricted to the dashboard/service role.
