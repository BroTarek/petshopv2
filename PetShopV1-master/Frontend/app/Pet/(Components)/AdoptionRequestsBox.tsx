'use client';
import React, { useEffect, useState } from 'react';
import api from '@/utils/axios';

export default function AdoptionRequestsBox({ petOwnerId }: { petOwnerId?: string }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const ownerId = petOwnerId || (() => {
    if (typeof window === 'undefined') return '';
    const s = localStorage.getItem('user');
    if (!s) return '';
    const u = JSON.parse(s);
    return u.UserId || u.userId || u.Id || u.id || '';
  })();

  useEffect(() => {
    if (!ownerId) { setLoading(false); return; }
    api.get(`/Adoption/user/${ownerId}/received`)
      .then(r => {
        const pts = Array.isArray(r.data) ? r.data : [];
        const normalized = pts.map((req: any) => ({
          requestId: req.requestId || req.RequestId || req.id || req.Id,
          petId: req.petId || req.PetId,
          petName: req.petName || req.PetName,
          status: req.status || req.Status,
          initiatorId: req.initiatorId || req.InitiatorId,
          initiatorName: req.initiatorName || req.InitiatorName,
          requestDate: req.requestDate || req.RequestDate
        }));
        setRequests(normalized);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ownerId]);

  const act = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      await api.put(`/Adoption/${requestId}/${action}`);
      setRequests(prev => prev.map(r => r.requestId === requestId ? { ...r, status: action === 'accept' ? 'Accepted' : 'Rejected' } : r));
    } catch { alert(`Failed to ${action}.`); }
  };

  const statusColor: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Accepted: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="lg:col-span-4 h-full">
      <div className="bg-surface-container-low rounded-lg p-8 border border-outline-variant/10 h-full flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-extrabold font-headline tracking-tight">Interest List</h3>
          <span className="bg-secondary text-on-secondary px-3 py-1 rounded-full text-xs font-bold">
            {loading ? '...' : requests.filter(r => r.status === 'Pending').length} Pending
          </span>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">No adoption requests yet.</div>
        ) : (
          <div className="space-y-4 overflow-y-auto pr-2 max-h-[400px]">
            {requests.map(req => (
              <div key={req.requestId} className="flex flex-col gap-2 bg-surface-container-lowest p-4 rounded-xl border border-transparent hover:border-secondary transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                    {(req.initiatorName || 'U').charAt(0)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-sm truncate">{req.initiatorName || req.initiatorId}</h4>
                    <p className="text-xs text-on-surface-variant">{req.requestDate ? new Date(req.requestDate).toLocaleDateString() : ''}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor[req.status] || 'bg-slate-100 text-slate-600'}`}>
                    {req.status}
                  </span>
                </div>
                {req.status === 'Pending' && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => act(req.requestId, 'accept')} className="flex-1 text-xs font-bold bg-green-600 text-white py-1.5 rounded-lg hover:bg-green-700 transition">Accept</button>
                    <button onClick={() => act(req.requestId, 'reject')} className="flex-1 text-xs font-bold bg-red-500 text-white py-1.5 rounded-lg hover:bg-red-600 transition">Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}