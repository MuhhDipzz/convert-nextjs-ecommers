'use client'

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import CategoryIcon from '@/components/CategoryIcon';
import { useProducts, useCategories } from '@/hooks/useProducts';

const page = () => {
  const { data: products, isLoading: productsLoading } = useProducts({ sortBy: 'newest' });
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const featuredProducts = products?.slice(0, 8) || [];
  const recommendedProducts = products?.slice(0, 12) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="glass-card p-6 md:p-10">
            <h1 className="text-2xl md:text-4xl font-bold mb-2 text-foreground">Welcome to Tokoku</h1>
            <p className="text-muted-foreground mb-4">Discover amazing products at great prices</p>
            <Link 
              href="/products"
              className="inline-block px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Categories</h2>
            <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              See All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-3">
                  <div className="w-12 h-12 rounded-full bg-muted skeleton" />
                  <div className="w-16 h-3 bg-muted skeleton rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {categories?.map((category) => (
                <CategoryIcon key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Featured Products</h2>
            <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              See All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card p-3">
                  <div className="aspect-square bg-muted skeleton rounded-lg mb-3" />
                  <div className="h-4 bg-muted skeleton rounded mb-2" />
                  <div className="h-4 w-1/2 bg-muted skeleton rounded" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No products yet. Be the first seller!</p>
              <Link href="/admin" className="text-foreground underline mt-2 inline-block hover:opacity-80 transition-opacity">
                Start Selling
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Recommended For You */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Recommended For You</h2>
          
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card p-3">
                  <div className="aspect-square bg-muted skeleton rounded-lg mb-3" />
                  <div className="h-4 bg-muted skeleton rounded mb-2" />
                  <div className="h-4 w-1/2 bg-muted skeleton rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default page;