'use client';

import React, { useEffect, useState } from 'react';
import ProfileStats from './(Components)/ProfileStats';
import CreatePostAnchor from './(Components)/CreatePostAnchor';
import Post from './(Components)/Post';
import api from '@/utils/axios';

const PostsPage = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await api.get('/Post/all');
                if (response.data && response.data.Success) {
                    const normalized = (response.data.Posts || []).map((p: any) => ({
                        ...p,
                        postId: p.postId || p.PostId || p.id || p.Id,
                        title: p.title || p.Title,
                        description: p.description || p.Description,
                        content: p.content || p.Content,
                        petId: p.petId || p.PetId,
                        petName: p.petName || p.PetName,
                        petImageUrl: p.petImageUrl || p.PetImageUrl,
                        userName: p.userName || p.UserName,
                        userId: p.userId || p.UserId,
                        creationDate: p.creationDate || p.CreationDate,
                        favouriteCount: p.favouriteCount || p.FavouriteCount
                    }));
                    setPosts(normalized);
                }
            } catch (err) {
                console.error("Failed to fetch posts", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <main className="pt-24 pb-12 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 min-h-screen">
            {/* <!-- Left Sidebar: Profile Stats --> */}
            <ProfileStats />
            
            {/* <!-- Center Column: The Feed --> */}
            <section className="md:col-span-6 space-y-8">
                {/* <!-- Create Post Anchor --> */}
                <CreatePostAnchor />
                
                {/* <!-- Feed Posts --> */}
                {loading ? (
                    <div className="text-center py-20 text-slate-500">Loading community feed...</div>
                ) : posts.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-100">
                        <div className="text-slate-400 mb-4">
                            <span className="material-symbols-outlined text-4xl">inbox</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No posts yet</h3>
                        <p className="text-slate-500">Be the first to share an update with the community!</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <Post
                            key={post.postId}
                            post={post}
                            onDeleted={(id) => setPosts(prev => prev.filter(p => p.postId !== id))}
                        />
                    ))
                )}
            </section>
        </main>
    );
};

export default PostsPage;