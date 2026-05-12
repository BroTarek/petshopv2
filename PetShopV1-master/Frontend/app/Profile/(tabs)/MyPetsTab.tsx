'use client';
import React, { useEffect, useState } from 'react';
import api from '@/utils/axios';
import Link from 'next/link';

type Pet = { petId: string; name: string; breed: string; type: string; age: number; status: string; primaryImage: string; };

export default function MyPetsTab({ userId }: { userId: string }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPet, setEditPet] = useState<Pet | null>(null);
  const [form, setForm] = useState({ name: '', type: '', breed: '', age: '', gender: '0', location: '', healthStatus: '3', description: '' });
  const [images, setImages] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!userId) return;
    api.get(`/Pet/owner/${userId}`)
      .then(r => {
        const ok = r.data.Success || r.data.success;
        const pts = r.data.Pets || r.data.pets || [];
        if (ok) {
          const normalized = pts.map((p: any) => ({
            petId: p.petId || p.PetId || p.id || p.Id,
            name: p.name || p.Name,
            breed: p.breed || p.Breed,
            type: p.type || p.Type,
            age: p.age || p.Age,
            status: p.status || p.Status,
            primaryImage: (p.primaryImage || p.PrimaryImage)
              ? ((p.primaryImage || p.PrimaryImage).startsWith('http') ? (p.primaryImage || p.PrimaryImage) : `http://localhost:5000/${(p.primaryImage || p.PrimaryImage)}`)
              : (p.images?.[0] || p.Images?.[0])
                ? ((p.images?.[0] || p.Images?.[0]).startsWith('http') ? (p.images?.[0] || p.Images?.[0]) : `http://localhost:5000/${(p.images?.[0] || p.Images?.[0])}`)
                : ''
          }));
          setPets(normalized);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, [userId]);

  const openAdd = () => { 
    setEditPet(null); 
    setForm({ name:'', type:'', breed:'', age:'', gender:'0', location:'', healthStatus:'3', description:'' }); 
    setImages(null); 
    setShowModal(true); 
  };
  
  const openEdit = (pet: Pet) => {
    setEditPet(pet);
    setForm({ 
      name: pet.name, 
      type: pet.type, 
      breed: pet.breed, 
      age: String(pet.age), 
      gender: '0', 
      location: '', 
      healthStatus: '3', 
      description: '' 
    });
    setImages(null); 
    setShowModal(true);
  };

  const save = async () => {
    setSaving(true);
    if (!editPet && (!images || images.length === 0)) {
      alert('At least one image is required for a new pet.');
      setSaving(false);
      return;
    }

    try {
      const fd = new FormData();
      // Map form fields to PascalCase for .NET backend
      fd.append('Name', form.name);
      fd.append('Type', form.type);
      fd.append('Breed', form.breed);
      fd.append('Age', form.age || '0');
      fd.append('Gender', form.gender);
      fd.append('Location', form.location);
      fd.append('HealthStatus', form.healthStatus);
      fd.append('Description', form.description);
      fd.append('OwnerId', userId);
      
      if (images) Array.from(images).forEach(f => fd.append('Images', f));
      
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      
      if (editPet) {
        await api.put(`/Pet/update/${editPet.petId}`, fd, config);
      } else {
        await api.post('/Pet/create', fd, config);
      }
      setShowModal(false); 
      load();
    } catch (e: any) { 
      console.error('Pet save error:', e);
      alert(e.response?.data?.Error || e.response?.data?.error || 'Failed to save pet.'); 
    }
    finally { setSaving(false); }
  };

  const deletePet = async (petId: string) => {
    if (!confirm('Delete this pet?')) return;
    try { 
      await api.delete(`/Pet/delete/${petId}?ownerId=${userId}`); 
      setPets(p => p.filter(x => x.petId !== petId)); 
    }
    catch { alert('Failed to delete.'); }
  };

  if (loading) return <div className="py-12 text-center text-slate-400">Loading pets...</div>;

  return (
    <div>
      <div className="flex justify-end mb-8">
        <button onClick={openAdd} className="bg-primary text-on-primary px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all">+ Register Pet</button>
      </div>
      {pets.length === 0 ? (
        <div className="py-12 text-center text-slate-400">No pets yet. Add your first one!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {pets.map(pet => (
            <div key={pet.petId} className="group bg-surface-container-low rounded-3xl border border-surface-container overflow-hidden flex flex-col hover:shadow-editorial-hover transition-all">
              <div className="h-44 bg-surface-container relative">
                {pet.primaryImage
                  ? <img src={pet.primaryImage} alt={pet.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl">🐾</div>}
                <span className={`absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${pet.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {pet.status}
                </span>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-primary font-headline tracking-tight">{pet.name}</h3>
                  <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">{pet.breed} · {pet.age}y</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(pet)} className="text-blue-500 hover:text-blue-700"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                  <button onClick={() => deletePet(pet.petId)} className="text-red-400 hover:text-red-600"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">{editPet ? 'Edit Pet' : 'Add Pet'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
            </div>
            {[['name','Name'],['type','Type (e.g. Dog)'],['breed','Breed'],['age','Age (years)'],['location','Location'],['description','Description']].map(([k, label]) => (
              <div key={k}>
                <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
                <input value={(form as any)[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))}
                  type={k === 'age' ? 'number' : 'text'}
                  min={k === 'age' ? '0' : undefined}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-800" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Gender</label>
              <select value={form.gender} onChange={e => setForm(f => ({...f, gender: e.target.value}))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800">
                <option value="0">Male</option>
                <option value="1">Female</option>
                <option value="2">Unknown</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Health Status</label>
              <select value={form.healthStatus} onChange={e => setForm(f => ({...f, healthStatus: e.target.value}))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800">
                <option value="3">Healthy</option>
                <option value="0">Vaccinated</option>
                <option value="1">Unvaccinated</option>
                <option value="2">Sick</option>
                <option value="4">Under Treatment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-tighter">Pet Gallery (Required)</label>
              <div className="relative group">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={e => setImages(e.target.files)} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                <div className={`border-2 border-dashed rounded-2xl p-8 transition-all duration-300 flex flex-col items-center justify-center gap-3 ${images && images.length > 0 ? 'border-blue-400 bg-blue-50/30' : 'border-slate-200 bg-slate-50 group-hover:border-blue-400 group-hover:bg-blue-50/50'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${images && images.length > 0 ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    <span className="material-symbols-outlined">{images && images.length > 0 ? 'check_circle' : 'add_photo_alternate'}</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700">
                      {images && images.length > 0 ? `${images.length} Photos Selected` : 'Click or Drag to Upload'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </div>
              {images && images.length > 0 && (
                <div className="mt-2 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {Array.from(images).map((f, i) => (
                    <div key={i} className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-500 overflow-hidden font-mono">
                      IMG_{i+1}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={save} disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 border border-slate-200 py-2 rounded-xl font-bold hover:bg-slate-50 transition text-slate-600">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
