'use client';
import React, { useEffect, useState } from 'react';
import api from '@/utils/axios';

const STARS = [1, 2, 3, 4, 5];

export default function ReviewsTab({ userId }: { userId: string }) {
  const [tab, setTab] = useState<'received' | 'given'>('received');
  const [received, setReceived] = useState<any[]>([]);
  const [given, setGiven] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ revieweeId: '', content: '', rating: 5 });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      api.get(`/Review/user/${userId}/received`).then(r => setReceived(r.data.Reviews || [])).catch(() => {}),
      api.get(`/Review/user/${userId}/given`).then(r => setGiven(r.data.Reviews || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  };
  useEffect(load, [userId]);

  const submitReview = async () => {
    if (!form.revieweeId || !form.content) return alert('Fill all fields.');
    setSaving(true);
    try {
      await api.post('/Review/create', { ...form, reviewerId: userId, rating: form.rating });
      setShowForm(false); setForm({ revieweeId: '', content: '', rating: 5 }); load();
    } catch (e: any) { alert(e.response?.data?.Error || 'Failed to submit review.'); }
    finally { setSaving(false); }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Delete review?')) return;
    try { await api.delete(`/Review/delete/${reviewId}?reviewerId=${userId}`); load(); }
    catch { alert('Failed to delete.'); }
  };

  const ReviewCard = ({ r, canDelete }: { r: any; canDelete: boolean }) => (
    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-slate-800 text-sm">{canDelete ? `To: ${r.revieweeName}` : `From: ${r.reviewerName}`}</p>
          <div className="flex gap-0.5 my-1">{STARS.map(s => <span key={s} className={`text-sm ${s <= r.rating ? 'text-yellow-400' : 'text-slate-300'}`}>★</span>)}</div>
          <p className="text-sm text-slate-600">{r.content}</p>
        </div>
        {canDelete && (
          <button onClick={() => deleteReview(r.reviewId)} className="text-red-400 hover:text-red-600 ml-3 flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['received', 'given'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition ${tab === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t === 'received' ? `Received (${received.length})` : `Given (${given.length})`}
          </button>
        ))}
        <button onClick={() => setShowForm(s => !s)}
          className="ml-auto px-5 py-2 rounded-full text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition">
          + Write Review
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 space-y-3">
          <h3 className="font-bold text-slate-800">Write a Review</h3>
          <input placeholder="Reviewee User ID" value={form.revieweeId} onChange={e => setForm(f => ({...f, revieweeId: e.target.value}))}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
          <div className="flex gap-1">{STARS.map(s => (
            <button key={s} onClick={() => setForm(f => ({...f, rating: s}))}
              className={`text-xl transition ${s <= form.rating ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-300'}`}>★</button>
          ))}</div>
          <textarea placeholder="Your review..." value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))}
            rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none" />
          <div className="flex gap-3">
            <button onClick={submitReview} disabled={saving}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50">
              {saving ? 'Submitting...' : 'Submit'}
            </button>
            <button onClick={() => setShowForm(false)} className="border border-slate-200 px-5 py-2 rounded-xl text-sm font-bold hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      )}

      {loading
        ? <div className="py-10 text-center text-slate-400">Loading...</div>
        : (tab === 'received' ? received : given).length === 0
          ? <div className="py-10 text-center text-slate-400">No reviews {tab}.</div>
          : <div className="space-y-3">
              {(tab === 'received' ? received : given).map(r => (
                <ReviewCard key={r.reviewId} r={r} canDelete={tab === 'given'} />
              ))}
            </div>}
    </div>
  );
}
