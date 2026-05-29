import { createClient } from '@supabase/supabase-js';

// Ganti URL dan Anon Key ini dengan yang ada di Dashboard Supabase Anda
const SUPABASE_URL = 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const dbService = {
  // 1. Ambil semua data 40 Bed saat aplikasi pertama kali dibuka
  async getAllBeds() {
    const { data, error } = await supabase
      .from('pasien_irna')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Gagal mengambil data:', error);
      return [];
    }
    return data;
  },

  // 2. Update data handover pasien berdasarkan Nomor Bed
  async updateBedData(bedId, updateData) {
    const { data, error } = await supabase
      .from('pasien_irna')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', bedId);

    if (error) {
      console.error(`Gagal update Bed ${bedId}:`, error);
      throw error;
    }
    return data;
  }
};