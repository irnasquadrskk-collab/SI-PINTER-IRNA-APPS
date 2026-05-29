import React, { useState, useEffect } from 'react';
import { dbService, supabase } from './services/dbService';
import Header from './components/Header';
import BedGrid from './components/BedGrid';
import PatientForm from './components/PatientForm';
import PatientDetail from './components/PatientDetail';

function App() {
  const [beds, setBeds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShift, setSelectedShift] = useState('Semua');
  const [activeBed, setActiveBed] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data awal dari Supabase
  useEffect(() => {
    const fetchData = async () => {
      const initialData = await dbService.getAllBeds();
      setBeds(initialData);
      setLoading(false);
    };
    fetchData();

    // LOGIKA REAL-TIME: Dengar perubahan data dari perangkat perawat lain
    const subscription = supabase
      .channel('public:pasien_irna')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pasien_irna' }, (payload) => {
        setBeds((prevBeds) =>
          prevBeds.map((bed) => (bed.id === payload.new.id ? payload.new : bed))
        );
        // Jika bed yang sedang dibuka di-update oleh orang lain, perbarui tampilannya
        if (activeBed && activeBed.id === payload.new.id) {
          setActiveBed(payload.new);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [activeBed]);

  // Fungsi menyimpan perubahan dari Form Input
  const handleSavePatient = async (bedId, updatedData) => {
    try {
      await dbService.updateBedData(bedId, updatedData);
      setIsEditing(false);
      // State 'beds' otomatis ter-update berkat real-time listener di atas
    } catch (err) {
      alert('Gagal menyimpan data, periksa jaringan internet Anda.');
    }
  };

  // Filter Pasien berdasarkan Pencarian (Nama/RM/DPJP) & Filter Shift
  const filteredBeds = beds.filter((bed) => {
    const matchesSearch =
      bed.nama_pasien?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bed.no_rm?.includes(searchTerm) ||
      bed.dpjp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bed.id.toString() === searchTerm; // Bisa cari langsung nomor bed

    const matchesShift = selectedShift === 'Semua' || bed.shift === selectedShift;

    return matchesSearch && matchesShift;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg font-semibold text-slate-600 animate-pulse">Memuat Data SI-PINTER IRNA...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans antialiased">
      {/* Bagian Atas / Navigasi */}
      <Header 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        selectedShift={selectedShift} 
        setSelectedShift={setSelectedShift} 
      />

      <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri & Tengah: Visualisasi Grid 40 Bed */}
        <div className="lg:col-span-2">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Status Bed Ruangan (1 - 40)</h2>
            <BedGrid 
              beds={filteredBeds} 
              activeBedId={activeBed?.id} 
              onSelectBed={(bed) => {
                setActiveBed(bed);
                setIsEditing(false); // Default ke mode baca/detail
              }} 
            />
          </div>
        </div>

        {/* Kolom Kanan: Detail SBAR atau Form Input (Sangat Ramah HP) */}
        <div className="lg:col-span-1">
          {activeBed ? (
            isEditing ? (
              <PatientForm 
                bed={activeBed} 
                onSave={handleSavePatient} 
                onCancel={() => setIsEditing(false)} 
              />
            ) : (
              <PatientDetail 
                bed={activeBed} 
                onEdit={() => setIsEditing(true)} 
                onClose={() => setActiveBed(null)} 
              />
            )
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p className="font-medium">Pilih salah satu nomor bed untuk melihat atau memperbarui dokumentasi SBAR.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;