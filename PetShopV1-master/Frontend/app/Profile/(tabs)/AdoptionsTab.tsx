'use client';
import React, { useEffect, useState } from 'react';
import api from '@/utils/axios';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Accepted: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  Cancelled: 'bg-slate-100 text-slate-500',
};

export default function AdoptionsTab({ userId }: { userId: string }) {
  const [tab, setTab] = useState<'sent' | 'received'>('sent');
  const [sent, setSent] = useState<any[]>([]);
  const [received, setReceived] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      api.get(`/Adoption/user/${userId}/initiated`).then(r => setSent(Array.isArray(r.data) ? r.data : [])).catch(() => {}),
      api.get(`/Adoption/user/${userId}/received`).then(r => setReceived(Array.isArray(r.data) ? r.data : [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [userId]);

  const action = async (requestId: string, act: 'accept' | 'reject' | 'cancel') => {
    try {
      await api.put(`/Adoption/${requestId}/${act}`);
      // Refresh both lists
      const [s, r] = await Promise.all([
        api.get(`/Adoption/user/${userId}/initiated`),
        api.get(`/Adoption/user/${userId}/received`),
      ]);
      setSent(Array.isArray(s.data) ? s.data : []);
      setReceived(Array.isArray(r.data) ? r.data : []);
    } catch { alert(`Failed to ${act} request.`); }
  };

  const RequestCard = ({ req, isSent }: { req: any; isSent: boolean }) => (
    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <p className="font-bold text-slate-800 text-sm">{req.petName || 'Unknown Pet'}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {isSent ? `To: ${req.receiverName || req.receiverId}` : `From: ${req.initiatorName || req.initiatorId}`}
        </p>
        <p className="text-xs text-slate-400">{req.requestDate ? new Date(req.requestDate).toLocaleDateString() : ''}</p>
        <span className={`mt-1 inline-block text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[req.status] || 'bg-slate-100 text-slate-600'}`}>
          {req.status}
        </span>
      </div>
      {req.status === 'Pending' && (
        <div className="flex gap-2">
          {isSent
            ? <button onClick={() => action(req.requestId, 'cancel')} className="text-xs font-bold border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">Cancel</button>
            : <>
                <button onClick={() => action(req.requestId, 'accept')} className="text-xs font-bold bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition">Accept</button>
                <button onClick={() => action(req.requestId, 'reject')} className="text-xs font-bold bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition">Reject</button>
              </>}
        </div>
      )}
    </div>
  );

  const list = tab === 'sent' ? sent : received;

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {(['sent', 'received'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition ${tab === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t === 'sent' ? `Sent (${sent.length})` : `Received (${received.length})`}
          </button>
        ))}
      </div>
      {loading
        ? <div className="py-10 text-center text-slate-400">Loading...</div>
        : list.length === 0
          ? <div className="py-10 text-center text-slate-400">No {tab} requests.</div>
          : <div className="space-y-3">{list.map(req => <RequestCard key={req.requestId} req={req} isSent={tab === 'sent'} />)}</div>}
    </div>
  );
}
