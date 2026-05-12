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
  const [userHasPets, setUserHasPets] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Review states
  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviews, setShowReviews] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr || !post.postId) return;
    const u = JSON.parse(userStr);
    const uid = u.UserId || u.userId || u.Id || u.id;
    setCurrentUserId(uid);
    setIsOwner(uid && (post.userId === uid || post.UserId === uid));

    // Check if current user has pets (for review constraint)
    api.get(`/User/${uid}/profile`)
      .then(r => {
        if (r.data.Success || r.data.success) {
          const prof = r.data.Profile || r.data.profile;
          const petCount = prof?.TotalPets ?? prof?.totalPets ?? 0;
          
          if (petCount > 0) {
            setUserHasPets(true);
          } else {
            // Fallback: Check the pet list directly if profile says 0
            api.get(`/Pet/owner/${uid}`)
              .then(pr => {
                const pets = pr.data.Pets || pr.data.pets || [];
                setUserHasPets(pets.length > 0);
              })
              .catch(() => {});
          }
        }
      })
      .catch(() => {});

    // Fetch reviews for post owner
    api.get(`/Review/user/${post.userId}/received`)
      .then(r => {
        if (r.data.Success || r.data.success) {
          setReviews(r.data.Reviews || []);
        }
      })
      .catch(() => {});

    // Check if already favourited
    api.get(`/Favourite/check?userId=${uid}&postId=${post.postId}`)
      .then(r => {
        if (r.data.IsFavourited || r.data.isFavourited) {
          setIsFav(true);
          setFavId(r.data.FavouriteId || r.data.favouriteId);
        }
      })
      .catch(() => {});
  }, [post.postId, post.userId]);

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

  const handleReview = async () => {
    if (!currentUserId || !reviewContent) return;
    if (!userHasPets) {
      alert("Constraint: You must have at least one pet registered in your profile to leave reviews.");
      return;
    }
    
    const payload = {
      reviewerId: currentUserId,
      revieweeId: post.userId,
      content: reviewContent,
      rating: reviewRating
    };
    console.log("Submitting Review Payload:", payload);
    
    setSubmittingReview(true);
    try {
      const res = await api.post('/Review/create', payload);
      
      if (res.data.Success || res.data.success) {
        // Refresh reviews for this post author
        const timestamp = new Date().getTime();
        const r = await api.get(`/Review/user/${post.userId}/received?t=${timestamp}`);
        const newReviews = r.data.Reviews || r.data.reviews || [];
        setReviews(newReviews);
        
        // Reset form
        setReviewing(false);
        setReviewContent('');
        setReviewRating(5);
        
        // Also refresh userHasPets status just in case
        const profRes = await api.get(`/User/${currentUserId}/profile?t=${timestamp}`);
        const prof = profRes.data.Profile || profRes.data.profile;
        const petCount = prof?.TotalPets ?? prof?.totalPets ?? 0;
        setUserHasPets(petCount > 0);
      }
    } catch (e: any) {
      alert(e.response?.data?.Error || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
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
      <div className="p-6 flex flex-col border-t border-surface-container/50">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-sm font-bold text-on-surface-variant">
              <span className="material-symbols-outlined text-red-400">favorite</span>
              {post.favouriteCount || 0}
            </span>
            <button 
              onClick={() => setShowReviews(!showReviews)}
              className="flex items-center gap-2 group transition-all"
            >
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">star</span>
              <span className="text-sm font-bold text-on-surface-variant group-hover:text-primary">{reviews.length} Reviews</span>
            </button>
            <button className="flex items-center gap-2 group transition-all">
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">share</span>
            </button>
          </div>
          <div className="flex gap-2">
            {!isOwner && currentUserId && (
              <button
                onClick={() => { setShowReviews(true); setReviewing(true); }}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">rate_review</span>
                Review Author
              </button>
            )}
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
        </div>

        {/* Expanded Reviews Section */}
        {showReviews && (
          <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h5 className="font-bold text-slate-800 text-sm">Author Reviews</h5>
              {reviewing ? (
                <button onClick={() => setReviewing(false)} className="text-xs text-slate-500 font-bold hover:text-slate-700">Cancel</button>
              ) : (
                !isOwner && (
                  <button onClick={() => setReviewing(true)} className="text-xs text-blue-600 font-bold hover:underline">+ Write Review</button>
                )
              )}
            </div>

            {reviewing && (
              <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReviewRating(s)} className={`text-xl transition ${s <= reviewRating ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-300'}`}>
                      ★
                    </button>
                  ))}
                </div>
                <textarea 
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Tell us about your experience with this author..."
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none mb-3"
                />
                {!userHasPets && (
                  <div className="flex items-center gap-2 text-rose-500 text-[10px] font-bold mb-3 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    Must own a pet to submit
                  </div>
                )}
                <button
                  onClick={handleReview}
                  disabled={submittingReview || !reviewContent || (!userHasPets)}
                  className="w-full bg-blue-600 text-white font-extrabold py-2.5 rounded-xl text-xs hover:bg-blue-700 transition disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
                >
                  {submittingReview ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : 'Post Review'}
                </button>
              </div>
            )}

            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4 italic">No reviews for this author yet.</p>
              ) : (
                reviews.slice(0, 3).map((r: any) => (
                  <div key={r.reviewId} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                      {(r.reviewerName || 'U').charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-800">{r.reviewerName}</span>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={`text-[10px] ${s <= r.rating ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{r.content}</p>
                    </div>
                  </div>
                ))
              )}
              {reviews.length > 3 && (
                <button className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition py-2">
                  View All {reviews.length} Reviews
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default Post;