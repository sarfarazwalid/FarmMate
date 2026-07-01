'use client';

import { Filter, Heart, Mail, MapPin, Minus, Phone, Plus, Search, ShoppingCart, Star, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/apiConfig';

export default function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [addingToCart, setAddingToCart] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [managingFavorites, setManagingFavorites] = useState(null);
  const [sortBy, setSortBy] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      let url = getApiUrl('/products');
      
      // Add category filter if not 'all'
      if (selectedCategory !== 'all') {
        url += `?category=${selectedCategory}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProducts(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const fetchCartCount = useCallback(async () => {
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
  }, []);

  const fetchFavorites = useCallback(async () => {
    try {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});

      const userId = cookies.userId;
      if (!userId) return;

      const response = await fetch(getApiUrl(`/users/${userId}/favorites`), {
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFavorites(result.data.map(fav => fav._id));
        }
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCartCount();
    fetchFavorites();
  }, [selectedCategory, fetchProducts, fetchCartCount, fetchFavorites]);

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
          if (showModal) {
            setShowModal(false);
            setSelectedProduct(null);
            setQuantity(1);
          }
        }
      } else {
        const errorResult = await response.json();
        alert(errorResult.msg || 'Failed to add product to cart');
        // Refresh products to get updated stock information
        fetchProducts();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const toggleFavorite = async (productId) => {
    try {
      setManagingFavorites(productId);
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

      const isFavorite = favorites.includes(productId);
      
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(getApiUrl(`/users/${userId}/favorites/${productId}`), {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          setFavorites(favorites.filter(id => id !== productId));
        } else {
          const errorResult = await response.json();
          alert(errorResult.msg || 'Failed to remove from favorites');
        }
      } else {
        // Add to favorites
        const response = await fetch(getApiUrl(`/users/${userId}/favorites`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            productId: productId
          }),
        });

        if (response.ok) {
          setFavorites([...favorites, productId]);
        } else {
          const errorResult = await response.json();
          alert(errorResult.msg || 'Failed to add to favorites');
        }
      }
    } catch (error) {
      console.error('Error managing favorites:', error);
      alert('Failed to manage favorites');
    } finally {
      setManagingFavorites(null);
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= selectedProduct.stock) {
      setQuantity(newQuantity);
    }
  };

  // Sorting logic
  const getSortedProducts = (products) => {
    let sorted = [...products];
    if (sortBy === 'Price: Low to High') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Rating') {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'Distance') {
      // Placeholder: implement real distance logic if location data is available
      // sorted.sort((a, b) => a.distance - b.distance);
    }
    return sorted;
  };

  // Filter and sort products
  const filteredProducts = getSortedProducts(products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  ));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Marketplace</h1>
        <Link 
          href="/dashboard/buyer/cart"
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          View Cart ({cartCount})
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-surface-900/50 text-white w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-surface-500"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="grains">Grains</option>
              <option value="dairy">Dairy</option>
              <option value="meat">Meat</option>
              <option value="other">Other</option>
            </select>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="">Sort by</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
              <option value="Rating">Rating</option>
              <option value="Distance">Distance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
          {loading ? 'Loading products...' : `${filteredProducts.length} Products Found`}
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🌾</div>
            <h3 className="text-lg font-semibold text-white mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product._id} 
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openProductModal(product)}
              >
                <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">🌾</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{product.name}</h3>
                    <button 
                      className={`${favorites.includes(product._id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product._id);
                      }}
                      disabled={managingFavorites === product._id}
                    >
                      {managingFavorites === product._id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                      ) : (
                        <Heart className={`w-5 h-5 ${favorites.includes(product._id) ? 'fill-current' : ''}`} />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < (product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">({product.reviewCount || 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {product.farmer?.name || 'Unknown Farmer'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-white">${product.price.toFixed(2)}</span>
                      <span className="text-sm text-gray-600">/{product.unit}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product._id);
                      }}
                      disabled={addingToCart === product._id}
                      className="bg-teal-600 text-white px-3 py-1 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
                      {showModal && selectedProduct && (
          <div className="fixed inset-0 z-50 p-4">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-surface-800/80 rounded-2xl border border-white/[0.06] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{selectedProduct.name}</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Product Image */}
              <div className="mb-6">
                <div className="h-64 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                  {selectedProduct.image ? (
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-6xl">🌾</span>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < (selectedProduct.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {selectedProduct.rating?.toFixed(1) || '0.0'} ({selectedProduct.reviewCount || 0} reviews)
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-white mb-2">Description</h3>
                  <p className="text-gray-600">{selectedProduct.description}</p>
                </div>

                {/* Farmer Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Farmer Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {selectedProduct.farmer?.name || 'Unknown Farmer'}
                      </span>
                    </div>
                    {selectedProduct.farmer?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedProduct.farmer.phone}</span>
                      </div>
                    )}
                    {selectedProduct.farmer?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedProduct.farmer.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stock and Price */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-white">
                      ${selectedProduct.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-600 ml-1">/{selectedProduct.unit}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className={selectedProduct.stock > 10 ? 'text-green-600' : selectedProduct.stock > 0 ? 'text-yellow-600' : 'text-red-600'}>
                      {selectedProduct.stock > 10 ? 'In Stock' : selectedProduct.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                    </span>
                    <span className="ml-2">({selectedProduct.stock} available)</span>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-1 text-white font-medium">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= selectedProduct.stock}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Total: ${(selectedProduct.price * quantity).toFixed(2)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => addToCart(selectedProduct._id, quantity)}
                    disabled={addingToCart === selectedProduct._id || selectedProduct.stock === 0}
                    className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {addingToCart === selectedProduct._id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => toggleFavorite(selectedProduct._id)}
                    disabled={managingFavorites === selectedProduct._id}
                    className={`px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center ${
                      favorites.includes(selectedProduct._id) ? 'text-red-500 border-red-300' : ''
                    }`}
                  >
                    {managingFavorites === selectedProduct._id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    ) : (
                      <Heart className={`w-5 h-5 ${favorites.includes(selectedProduct._id) ? 'fill-current' : ''}`} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 