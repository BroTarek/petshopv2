'use client';
import React, { useEffect, useState } from 'react';
import api from '@/utils/axios';
import Link from 'next/link';

export default function MyPostsTab({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    api.get(`/Post/user/${userId}`)
      .then(r => { 
        const ok = r.data.Success || r.data.success;
        const posts = r.data.Posts || r.data.posts;
        if (ok) setPosts(posts || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/Post/delete/${postId}?userId=${userId}`);
      setPosts(p => p.filter(x => x.postId !== postId));
    } catch { alert('Failed to delete.'); }
  };

  if (loading) return <div className="py-12 text-center text-slate-400">Loading posts...</div>;
  if (posts.length === 0) return (
    <div className="py-12 text-center text-slate-400">
      <p className="mb-4">No posts yet.</p>
      <Link href="/CreatePost" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition">Create Post</Link>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href="/CreatePost" className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition">+ New Post</Link>
      </div>
      {posts.map(p => (
        <div key={p.postId} className="bg-slate-50 rounded-xl border border-slate-100 p-5 flex justify-between items-start">
          <div>
            <h3 className="font-bold text-slate-800">{p.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{p.description}</p>
            <span className={`mt-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {p.isActive ? 'Active' : 'Pending'}
            </span>
          </div>
          <button onClick={() => deletePost(p.postId)} className="text-red-400 hover:text-red-600 ml-4 flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      ))}
    </div>
  );
}
