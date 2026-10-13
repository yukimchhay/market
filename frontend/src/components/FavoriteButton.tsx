import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

export default function FavoriteButton({
  listingId,
  className = '',
}: {
  listingId: string;
  className?: string;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isFavorited, toggleFavorite } = useFavorites();
  const favorited = isFavorited(listingId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault(); // don't follow a parent <Link> (e.g. inside ListingCard)
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    toggleFavorite(listingId);
  }

  return (
    <button
      onClick={handleClick}
      aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
      aria-pressed={favorited}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" strokeWidth={2}>
        <path
          d="M12 21s-6.716-4.35-9.428-8.06C.91 10.42 1.2 7.26 3.6 5.4c2.1-1.63 5.02-1.2 6.6.9l1.8 2.4 1.8-2.4c1.58-2.1 4.5-2.53 6.6-.9 2.4 1.86 2.69 5.02 1.03 7.54C18.716 16.65 12 21 12 21z"
          className={favorited ? 'fill-saffron-500 stroke-saffron-500' : 'fill-none stroke-ink/50'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
