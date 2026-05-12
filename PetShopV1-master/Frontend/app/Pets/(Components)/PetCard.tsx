import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/axios';

interface Pet {
    id: string;
    name: string;
    image: {
        alt: string;
        url: string;
    };
    tag: string;
    age: string | number;
    gender?: string;
    size?: string;
    status: string;
    description?: string;
}

type PetCardProps = {
    Props: Pet;
}

const PetCard = ({ Props }: PetCardProps) => {
    const [isFav, setIsFav] = useState(false);
    const [favId, setFavId] = useState<string | null>(null);
    const [loadingFav, setLoadingFav] = useState(false);

    useEffect(() => {
        const checkFav = async () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const userId = user.userId || user.UserId || user.Id || user.id;
            
            try {
                const res = await api.get(`/Favourite/check?userId=${userId}&petId=${Props.id}`);
                if (res.data.IsFavourited || res.data.isFavourited) {
                    setIsFav(true);
                    setFavId(res.data.FavouriteId || res.data.favouriteId);
                }
            } catch (err) {
                console.error('Failed to check favourite status', err);
            }
        };
        checkFav();
    }, [Props.id]);

    const toggleFav = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            alert('Please login to add to favourites');
            return;
        }
        const user = JSON.parse(userStr);
        const userId = user.userId || user.UserId || user.Id || user.id;

        setLoadingFav(true);
        try {
            if (isFav && favId) {
                await api.delete(`/Favourite/remove/${favId}?userId=${userId}`);
                setIsFav(false);
                setFavId(null);
            } else {
                const res = await api.post('/Favourite/add', { userId, petId: Props.id });
                setIsFav(true);
                setFavId(res.data.FavouriteId || res.data.favouriteId);
            }
        } catch (err: any) {
            alert(err.response?.data?.Error || 'Failed to update favourite');
        } finally {
            setLoadingFav(false);
        }
    };

    return (
        <div className="group relative bg-surface-container-lowest rounded-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-editorial-hover">
            <div className="relative h-80 overflow-hidden bg-slate-100 flex items-center justify-center">
                {Props.image?.url ? (
                    <img 
                        alt={Props.image.alt || Props.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={Props.image.url.startsWith('http') ? Props.image.url : `http://localhost:5000/${Props.image.url}`} 
                    />
                ) : (
                    <span className="text-slate-400">No Image</span>
                )}
                <div className="absolute top-4 left-4">
                    <span className="bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-sm font-headline">
                        {Props.tag}
                    </span>
                </div>
                <button 
                    onClick={toggleFav}
                    disabled={loadingFav}
                    className={`absolute bottom-4 right-4 bg-surface p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 hover:scale-110 ${isFav ? 'text-red-500' : 'text-primary hover:text-red-500'} ${loadingFav ? 'animate-pulse' : ''}`}
                >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}>
                        favorite
                    </span>
                </button>
            </div>
            <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-2xl font-extrabold tracking-tight font-headline text-slate-800">{Props.name}</h3>
                        <p className="text-sm text-on-surface-variant font-medium">
                            {`${Props.age} yrs`} {Props.gender && `• ${Props.gender}`} {Props.size && `• ${Props.size}`}
                        </p>
                    </div>
                    <span className="px-2 py-1 bg-secondary-fixed text-on-secondary-fixed text-[10px] font-black rounded uppercase font-headline">
                        {Props.status}
                    </span>
                </div>
                <p className="text-on-surface-variant text-sm line-clamp-2 mb-6 flex-1 text-slate-600">
                    {Props.description || "A very good friend looking for a home."}
                </p>
                <Link 
                    href={`/Pet/${Props.id}`}
                    className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group/btn"
                >
                    View Profile
                    <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
            </div>
        </div>
    );
};

export default PetCard;