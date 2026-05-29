create table pasien_irna (
  id int primary key, -- Ini akan mewakili Nomor Bed (1 sampai 40)
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  nama_pasien text default '',
  no_rm text default '',
  diagnosa text default '',
  dpjp text default '',
  dokter_konsul text default '',
  shift text default 'Pagi', -- Pagi / Sore / Malam
  
  -- Framework SBAR
  sbar_situation text default '',
  sbar_background text default '',
  sbar_assessment text default '',
  sbar_recommendation text default '',
  
  -- 6 Sasaran Keselamatan Pasien (Patient Safety Checklist)
  safety_gelang_identitas boolean default false,
  safety_komunikasi_efektif boolean default false,
  safety_keamanan_obat boolean default false,
  safety_tepat_prosedur boolean default false,
  safety_risiko_infeksi boolean default false, -- Cuci tangan 6 langkah
  safety_risiko_jatuh boolean default false
);

-- Mengaktifkan fitur Real-time untuk tabel ini
alter publish to supabase_realtime add table pasien_irna;