import React from 'react';
import Link from 'next/link';

type PostProps = {
    post: any;
};

const Post = ({ post }: PostProps) => {
    return (
        <article className="bg-surface-container-lowest rounded-lg overflow-hidden shadow-[0_20px_40px_rgba(27,27,31,0.06)] transition-all">
            {/* <!-- Header --> */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                        {post.userName ? post.userName.charAt(0) : 'U'}
                    </div>
                    <div>
                        <h3 className="font-headline font-bold text-primary">{post.userName}</h3>
                        <p className="text-xs text-on-surface-variant">Contributor • {new Date(post.creationDate).toLocaleDateString()}</p>
                    </div>
                </div>
                <button className="text-on-surface-variant hover:text-primary">
                    <span className="material-symbols-outlined">more_horiz</span>
                </button>
            </div>
            {/* <!-- Content --> */}
            <div className="px-6 pb-4">
                <h4 className="font-headline font-extrabold text-2xl text-primary mb-2">{post.title}</h4>
                <p className="text-on-surface-variant leading-relaxed">
                    {post.description}
                </p>
                {post.content && (
                    <p className="text-on-surface-variant leading-relaxed mt-2 text-sm text-slate-500">
                        {post.content}
                    </p>
                )}
            </div>
            {/* <!-- Media & Pet Details Box --> */}
            {post.petId && (
                <div className="relative group">
                    <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory">
                        <div className="flex-shrink-0 w-full aspect-[4/5] snap-center bg-slate-100 flex items-center justify-center">
                            {post.petImageUrl ? (
                                <img className="w-full h-full object-cover" src={post.petImageUrl} alt={post.petName} />
                            ) : (
                                <span className="text-slate-400 font-medium">No image available</span>
                            )}
                        </div>
                    </div>
                    {/* <!-- Pet Details Overlay --> */}
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
            {/* <!-- Footer --> */}
            <div className="p-6 flex items-center justify-between border-t border-surface-container/50">
                <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 group transition-all">
                        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-red-500 transition-colors">favorite</span>
                        <span className="text-sm font-bold text-on-surface-variant group-hover:text-primary">{post.favouriteCount || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 group transition-all">
                        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">chat_bubble</span>
                        <span className="text-sm font-bold text-on-surface-variant group-hover:text-primary">0</span>
                    </button>
                    <button className="flex items-center gap-2 group transition-all">
                        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">share</span>
                    </button>
                </div>
                <button className="text-primary hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">bookmark</span>
                </button>
            </div>
        </article>
    );
};

export default Post;