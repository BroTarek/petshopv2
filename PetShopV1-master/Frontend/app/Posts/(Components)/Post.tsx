'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/axios';

type PostProps = {
  post: any;
  onDeleted?: (postId: string) => void;
};

const Post = ({ post: rawPost, onDeleted }: PostProps) => {
  const post = {
    postId: rawPost.postId || rawPost.PostId || rawPost.id || rawPost.Id,
    userId: rawPost.userId || rawPost.UserId,
    userName: rawPost.userName || rawPost.UserName,
    title: rawPost.title || rawPost.Title,
    description: rawPost.description || rawPost.Description,
    content: rawPost.content || rawPost.Content,
    petId: rawPost.petId || rawPost.PetId,
    petName: rawPost.petName || rawPost.PetName,
    petImageUrl: rawPost.petImageUrl || rawPost.PetImageUrl,
    creationDate: rawPost.creationDate || rawPost.CreationDate,
    favouriteCount: rawPost.favouriteCount || rawPost.FavouriteCount,
  };

  const [isFav, setIsFav] = useState(false);
  const [favId, setFavId] = useState<string | null>(null);
  const [favLoading, setFavLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr || !post.postId) return;
    const u = JSON.parse(userStr);
    const uid = u.UserId || u.userId || u.Id || u.id;
    setCurrentUserId(uid);
    setIsOwner(uid && (post.userId === uid || post.UserId === uid));

    // Check if already favourited
    api.get(`/Favourite/check?userId=${uid}&postId=${post.postId}`)
      .then(r => {
        if (r.data.IsFavourited || r.data.isFavourited) {
          setIsFav(true);
          setFavId(r.data.FavouriteId || r.data.favouriteId);
        }
      })
      .catch(() => {});
  }, [post.postId]);

  const toggleFav = async () => {
    if (favLoading || !currentUserId || !post.postId) return;
    setFavLoading(true);
    try {
      if (isFav && favId) {
        await api.delete(`/Favourite/remove/${favId}?userId=${currentUserId}`);
        setIsFav(false);
        setFavId(null);
      } else {
        const res = await api.post('/Favourite/add', {
          userId: currentUserId,
          postId: post.postId,
        });
        if (res.data.Success || res.data.success) {
          setIsFav(true);
          setFavId(res.data.FavouriteId || res.data.favouriteId);
        }
      }
    } catch (e) {
      console.error('Favourite toggle failed', e);
    } finally {
      setFavLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    setDeleting(true);
    try {
      await api.delete(`/Post/delete/${post.postId}?userId=${currentUserId}`);
      onDeleted?.(post.postId);
    } catch (e) {
      alert('Failed to delete post.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="bg-surface-container-lowest rounded-lg overflow-hidden shadow-[0_20px_40px_rgba(27,27,31,0.06)] transition-all">
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
            {post.userName ? post.userName.charAt(0) : 'U'}
          </div>
          <div>
            <h3 className="font-headline font-bold text-primary">{post.userName}</h3>
            <p className="text-xs text-on-surface-variant">
              Contributor • {new Date(post.creationDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete post"
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-6 pb-4">
        <h4 className="font-headline font-extrabold text-2xl text-primary mb-2">{post.title}</h4>
        <p className="text-on-surface-variant leading-relaxed">{post.description}</p>
        {post.content && (
          <p className="text-on-surface-variant leading-relaxed mt-2 text-sm text-slate-500">
            {post.content}
          </p>
        )}
      </div>

      {/* Media & Pet Details */}
      {post.petId && (
        <div className="relative group">
          <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory">
            <div className="flex-shrink-0 w-full aspect-[4/5] snap-center bg-slate-100 flex items-center justify-center">
              {post.imageUrl || post.petImageUrl ? (
                <img 
                  className="w-full h-full object-cover" 
                  src={(post.imageUrl || post.petImageUrl).startsWith('http') 
                    ? (post.imageUrl || post.petImageUrl) 
                    : `http://localhost:5000/${post.imageUrl || post.petImageUrl}`} 
                  alt={post.petName || post.title} 
                />
              ) : (
                <span className="text-slate-400 font-medium">No image available</span>
              )}
            </div>
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <Link href={`/Pet/${post.petId.toLowerCase()}`}>
              <div className="bg-surface/90 backdrop-blur-xl p-5 rounded-lg border-outline-variant/10 shadow-xl flex items-center justify-between hover:bg-surface transition-colors cursor-pointer">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-secondary-fixed-variant mb-1 block">
                    Linked Pet
                  </span>
                  <h5 className="font-headline font-extrabold text-xl text-primary">{post.petName}</h5>
                </div>
                <div className="bg-blue-600 px-4 py-2 rounded-full text-white text-xs font-bold hover:bg-blue-700 transition">
                  View Profile
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-6 flex items-center justify-between border-t border-surface-container/50">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 text-sm font-bold text-on-surface-variant">
            <span className="material-symbols-outlined text-red-400">favorite</span>
            {post.favouriteCount || 0}
          </span>
          <button className="flex items-center gap-2 group transition-all">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">chat_bubble</span>
            <span className="text-sm font-bold text-on-surface-variant group-hover:text-primary">0</span>
          </button>
          <button className="flex items-center gap-2 group transition-all">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">share</span>
          </button>
        </div>
        <button
          onClick={toggleFav}
          disabled={favLoading || !currentUserId}
          title={isFav ? 'Remove from favourites' : 'Love this post'}
          className={`transition-all ${favLoading ? 'opacity-50' : 'hover:scale-110'}`}
        >
          <span
            className={`material-symbols-outlined ${isFav ? 'text-red-500' : 'text-primary'}`}
            style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>
      </div>
    </article>
  );
};

export default Post;