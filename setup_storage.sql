-- Create the storage bucket 'resumes' if it doesn't exist
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

-- Enable RLS on storage.objects (if not already enabled)
alter table storage.objects enable row level security;

-- Policy: Allow public read access to files in 'resumes' bucket
drop policy if exists "Public Access Resumes" on storage.objects;
create policy "Public Access Resumes"
on storage.objects for select
using ( bucket_id = 'resumes' );

-- Policy: Allow authenticated users to upload files to 'resumes' bucket
drop policy if exists "Authenticated Upload Resumes" on storage.objects;
create policy "Authenticated Upload Resumes"
on storage.objects for insert
with check (
  bucket_id = 'resumes'
  and auth.role() = 'authenticated'
);

-- Optional: Allow users to delete their own uploads (if needed later)
drop policy if exists "Users can update own resumes" on storage.objects;
create policy "Users can update own resumes"
on storage.objects for update
using ( auth.uid() = owner )
with check ( bucket_id = 'resumes' );
