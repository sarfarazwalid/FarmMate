'use client';

import { Heart, MapPin, Plus, Search, Star, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/apiConfig';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [addingToCart, setAddingToCart] = useState(null);
  const [removingFromFavorites, setRemovingFromFavorites] = useState(null);

  useEffect(() => {
    fetchFavorites();
    fetchCartCount();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});

      const userId = cookies.userId;
      if (!userId) {
        alert('Please log in to view your favorites');
        return;
      }

      const response = await fetch(getApiUrl(`/users/${userId}/favorites`), {
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFavorites(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});

      const userId = cookies.userId;
      if (!userId) return;

      const response = await fetch(getApiUrl(`/cart/${userId}`), {
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCartCount(result.data.itemCount);
        }
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const addToCart = async (productId, qty = 1) => {
    try {
      setAddingToCart(productId);
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});

      const userId = cookies.userId;
      if (!userId) {
        alert('Please log in to add items to cart');
        return;
      }

      const response = await fetch(getApiUrl(`/cart/${userId}/add`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: productId,
          quantity: qty
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCartCount(result.data.itemCount);
          alert('Product added to cart successfully!');
        }
      } else {
        const errorResult = await response.json();
        alert(errorResult.msg || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const removeFromFavorites = async (productId) => {
    try {
      setRemovingFromFavorites(productId);
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});

      const userId = cookies.userId;
      if (!userId) {
        alert('Please log in to manage favorites');
        return;
      }

      const response = await fetch(getApiUrl(`/users/${userId}/favorites/${productId}`), {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFavorites(favorites.filter(fav => fav._id !== productId));
          alert('Product removed from favorites');
        }
      } else {
        const errorResult = await response.json();
        alert(errorResult.msg || 'Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      alert('Failed to remove from favorites');
    } finally {
      setRemovingFromFavorites(null);
    }
  };

  const filteredFavorites = favorites.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Favorites</h1>
          <p className="text-surface-400 mt-2">Your saved favorite products</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-surface-400">Cart: {cartCount} items</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-500 z-10 pointer-events-none" />
          <input
            type="text"
            placeholder="Search your favorites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface-900/50 text-white border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-surface-500"
          />
        </div>
      </div>

      {/* Favorites */}
      <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          {loading ? 'Loading favorites...' : `${filteredFavorites.length} Favorite Products`}
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💔</div>
            <h3 className="text-lg font-semibold text-white mb-2">No favorites found</h3>
            <p className="text-surface-400">You haven&apos;t added any products to your favorites yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFavorites.map((product) => (
              <div 
                key={product._id} 
                className="border border-white/[0.06] rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center relative">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">🌾</span>
                  )}
                  <button
                    onClick={() => removeFromFavorites(product._id)}
                    disabled={removingFromFavorites === product._id}
                    className="absolute top-2 right-2 p-2 bg-red-500/50 text-white rounded-full hover:bg-gradient-to-r from-red-600 to-red-500 transition-colors disabled:opacity-50"
                  >
                    {removingFromFavorites === product._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{product.name}</h3>
                    <Heart className="w-5 h-5 text-red-400 fill-current" />
                  </div>
                  <p className="text-sm text-surface-400 mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < (product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-surface-400'}`}
                      />
                    ))}
                    <span className="text-sm text-surface-400 ml-1">({product.reviewCount || 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-surface-500" />
                    <span className="text-sm text-surface-400">
                      {product.farmer?.name || 'Unknown Farmer'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-white">${product.price.toFixed(2)}</span>
                      <span className="text-sm text-surface-400">/{product.unit}</span>
                    </div>
                    <button 
                      onClick={() => addToCart(product._id)}
                      disabled={addingToCart === product._id || !product.isAvailable || product.stock === 0}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-3 py-1 rounded-lg hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {addingToCart === product._id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-surface-400">
                    <span className={product.stock > 10 ? 'text-emerald-400' : product.stock > 0 ? 'text-amber-400' : 'text-red-400'}>
                      {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                    </span>
                    <span className="ml-2">({product.stock} available)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 