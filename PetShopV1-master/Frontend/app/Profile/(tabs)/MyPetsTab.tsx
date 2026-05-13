'use client';
import React, { useEffect, useState } from 'react';
import api from '@/utils/axios';
import Link from 'next/link';
import { PET_TYPES, GENDERS, HEALTH_STATUSES, COMMON_BREEDS, LOCATIONS } from '@/utils/constants';

type Pet = { 
  petId: string; name: string; breed: string; type: string; age: number; 
  status: string; primaryImage: string; gender: string; location: string; 
  healthStatus: string; description: string; 
};

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
          const normalized = pts.map((p: any) => {
            // Helper to map string enums to values if needed
            const mapEnum = (val: string, options: any[]) => {
              if (!val) return '0';
              if (!isNaN(Number(val))) return String(val);
              const found = options.find(o => o.label.toUpperCase() === val.toUpperCase());
              return found ? found.value : '0';
            };

            return {
              petId: p.petId || p.PetId || p.id || p.Id,
              name: p.name || p.Name,
              breed: p.breed || p.Breed,
              type: p.type || p.Type,
              age: p.age || p.Age,
              status: p.status || p.Status,
              gender: mapEnum(p.gender || p.Gender, GENDERS),
              location: p.location || p.Location || '',
              healthStatus: mapEnum(p.healthStatus || p.HealthStatus, HEALTH_STATUSES),
              description: p.description || p.Description || '',
              primaryImage: (p.primaryImage || p.PrimaryImage)
                ? ((p.primaryImage || p.PrimaryImage).startsWith('http') ? (p.primaryImage || p.PrimaryImage) : `http://localhost:5000/${(p.primaryImage || p.PrimaryImage)}`)
                : (p.images?.[0] || p.Images?.[0])
                  ? ((p.images?.[0] || p.Images?.[0]).startsWith('http') ? (p.images?.[0] || p.Images?.[0]) : `http://localhost:5000/${(p.images?.[0] || p.Images?.[0])}`)
                  : ''
            };
          });
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
      gender: pet.gender, 
      location: pet.location, 
      healthStatus: pet.healthStatus, 
      description: pet.description 
    });
    setImages(null); 
    setShowModal(true);
  };

  const save = async () => {
    // Basic validation
    if (!form.name || !form.type || !form.breed || !form.location) {
      alert('Please fill all required fields: Name, Type, Breed, and Location.');
      return;
    }

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
      
      if (editPet) {
        await api.put(`/Pet/update/${editPet.petId}`, fd);
      } else {
        await api.post('/Pet/create', fd);
      }
      setShowModal(false); 
      load();
    } catch (e: any) { 
      console.error('Pet save error:', e.response?.data || e);
      const errData = e.response?.data;
      let msg = 'Failed to save pet.';
      
      if (errData) {
        if (typeof errData.errors === 'object') {
          msg = Object.entries(errData.errors)
            .map(([key, val]: [string, any]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join('\n');
        } else {
          msg = errData.Error || errData.error || errData.Message || msg;
        }
      }
      alert(msg); 
    }
    finally { setSaving(false); }
  };

  const deletePet = async (petId: string) => {
    if (!confirm('Delete this pet?')) return;
    try { 
      await api.delete(`/Pet/delete/${petId}?ownerId=${userId}`); 
      setPets(p => p.filter(x => x.petId !== petId)); 
    }
    catch (e: any) { 
      console.error('Delete error:', e.response?.data || e);
      alert(e.response?.data?.Error || e.response?.data?.error || 'Failed to delete.'); 
    }
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
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Name</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Age (Years)</label>
                <input value={form.age} onChange={e => setForm(f => ({...f, age: e.target.value}))}
                  type="number" min="0" required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-800" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none">
                  <option value="">Select Type</option>
                  {PET_TYPES.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Gender</label>
                <select value={form.gender} onChange={e => setForm(f => ({...f, gender: e.target.value}))} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none">
                  {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Breed</label>
              <div className="relative">
                <input list="breeds" value={form.breed} onChange={e => setForm(f => ({...f, breed: e.target.value}))}
                  placeholder="Type or select breed..." required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-800" />
                <datalist id="breeds">
                  {COMMON_BREEDS.map(b => <option key={b} value={b} />)}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Location</label>
              <div className="relative">
                <input list="locations" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))}
                  placeholder="Type or select location..." required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-800" />
                <datalist id="locations">
                  {LOCATIONS.map(l => <option key={l} value={l} />)}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Health Status</label>
              <select value={form.healthStatus} onChange={e => setForm(f => ({...f, healthStatus: e.target.value}))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none">
                {HEALTH_STATUSES.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-800 resize-none" />
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
