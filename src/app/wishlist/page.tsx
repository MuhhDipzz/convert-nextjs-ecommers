"use client"

import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAddToCart } from '@/hooks/useCart';
import { useProducts } from '@/hooks/useProducts';
import { useState, useEffect } from 'react';

interface WishlistProduct {
    id: string;
    name: string;
    price: number;
    original_price: number | null;
    images: string[];
    category_name?: string;
}

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);
    const addToCart = useAddToCart();

    const removeFromWishlist = (id: string) => {
        setWishlistItems((prev) => prev.filter((item) => item.id !== id));
    };

    const handleAddToCart = (product: WishlistProduct) => {
        addToCart.mutate({ productId: product.id, quantity: 1 });
        removeFromWishlist(product.id);
    };

    if (wishlistItems.length === 0) {
        return (
            <div className="min-h-screen pt-24 pb-12 bg-background">
                <div className="container mx-auto px-6">
                    <div className="max-w-2xl mx-auto text-center py-24">
                        <div className="w-24 h-24 glass-card rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h1 className="text-3xl font-semibold mb-4 text-foreground">Your wishlist is empty</h1>
                        <p className="text-muted-foreground mb-8">
                            Save your favorite items to purchase later.
                        </p>
                        <Link href="/products">
                            <Button className="h-12 px-8 bg-primary text-primary-foreground hover:opacity-90 rounded-xl font-medium">
                                Explore Products
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-background">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">Wishlist</h1>
                        <p className="text-muted-foreground mt-2">{wishlistItems.length} items saved</p>
                    </div>
                </div>

                {/* Pinterest-style Grid */}
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                    {wishlistItems.map((product, index) => (
                        <div
                            key={product.id}
                            className="break-inside-avoid group glass-card overflow-hidden hover:bg-[hsl(0_0%_100%/0.08)] hover:border-[hsl(0_0%_100%/0.15)] transition-all duration-500 fade-in-up"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            {/* Image */}
                            <Link href={`/products/${product.id}`}>
                                <div
                                    className="relative overflow-hidden bg-muted"
                                    style={{ aspectRatio: index % 3 === 0 ? '3/4' : index % 3 === 1 ? '4/5' : '1/1' }}
                                >
                                    <img
                                        src={product.images?.[0] || '/placeholder.svg'}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Badges - Monochrome */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        {product.original_price && product.original_price > product.price && (
                                            <span className="px-3 py-1 bg-foreground/90 text-background text-xs font-medium rounded-lg">
                                                SALE
                                            </span>
                                        )}
                                    </div>

                                    {/* Remove Button */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-4 right-4 w-10 h-10 rounded-full glass text-foreground hover:bg-foreground hover:text-background opacity-0 group-hover:opacity-100 transition-all duration-300"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            removeFromWishlist(product.id);
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Link>

                            {/* Info */}
                            <div className="p-4">
                                <p className="text-xs text-muted-foreground tracking-wide uppercase mb-1">
                                    {product.category_name || 'Product'}
                                </p>
                                <Link href={`/products/${product.id}`}>
                                    <h3 className="text-sm font-medium text-foreground hover:opacity-80 transition-opacity line-clamp-2">
                                        {product.name}
                                    </h3>
                                </Link>
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-semibold text-foreground">
                                            ${product.price.toFixed(2)}
                                        </span>
                                        {product.original_price && product.original_price > product.price && (
                                            <span className="text-sm text-muted-foreground line-through">
                                                ${product.original_price.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    <Button
                                        size="icon"
                                        className="w-10 h-10 rounded-full bg-primary text-primary-foreground hover:opacity-90"
                                        onClick={() => handleAddToCart(product)}
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Wishlist;