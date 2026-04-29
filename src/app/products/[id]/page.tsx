"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Star,
    Minus,
    Plus,
    ShoppingCart,
    MessageCircle,
    Truck,
    Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useAddToCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import ProductCard from "@/components/ProductCard";

const ProductDetail = () => {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { user } = useAuth();
    const { data: product, isLoading } = useProduct(id || "");
    const { data: relatedProducts } = useProducts({
        categoryId: product?.category_id || undefined,
    });
    const addToCart = useAddToCart();

    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    const handleAddToCart = async () => {
        if (!user) {
            router.push("/login");
            return;
        }
        await addToCart.mutateAsync({ productId: product!.id, quantity });
    };

    const handleBuyNow = async () => {
        if (!user) {
            router.push("/login");
            return;
        }
        await addToCart.mutateAsync({ productId: product!.id, quantity });
        router.push("/cart");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background py-4">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="aspect-square bg-muted skeleton rounded-2xl" />
                        <div className="space-y-4">
                            <div className="h-8 bg-muted skeleton rounded w-3/4" />
                            <div className="h-6 bg-muted skeleton rounded w-1/4" />
                            <div className="h-20 bg-muted skeleton rounded" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-xl font-semibold mb-4 text-foreground">
                        Product not found
                    </h1>
                    <Link href="/products">
                        <Button className="bg-primary text-primary-foreground hover:opacity-90">
                            Back to Products
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const images = product.images?.length
        ? product.images
        : [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
        ];
    const related =
        relatedProducts?.filter((p) => p.id !== product.id).slice(0, 6) || [];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-4">
                {/* Back */}
                <Link
                    href="/products"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Images */}
                    <div className="space-y-4">
                        <div className="aspect-square rounded-2xl overflow-hidden glass-card bg-muted">
                            <img
                                src={images[selectedImage]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto">
                                {images.map((img: string, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all ${selectedImage === i
                                                ? "ring-2 ring-foreground"
                                                : "opacity-60 hover:opacity-100"
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-foreground">
                                {product.name}
                            </h1>

                            {/* Rating - Monochrome */}
                            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                {product.rating_avg && (
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-current text-foreground/60" />
                                        <span className="text-foreground">
                                            {product.rating_avg.toFixed(1)}
                                        </span>
                                        <span>({product.rating_count} reviews)</span>
                                    </div>
                                )}
                                {product.sold_count > 0 && (
                                    <>
                                        <span className="opacity-50">•</span>
                                        <span>{product.sold_count} sold</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Price */}
                        <div className="glass-card p-4">
                            <span className="text-2xl md:text-3xl font-bold text-foreground">
                                {formatPrice(product.price)}
                            </span>
                            {product.original_price &&
                                product.original_price > product.price && (
                                    <span className="ml-3 text-lg text-muted-foreground line-through">
                                        {formatPrice(product.original_price)}
                                    </span>
                                )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div>
                                <h3 className="font-medium mb-2 text-foreground">
                                    Description
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Seller */}
                        {product.seller_profile && (
                            <div className="flex items-center gap-3 p-4 glass-card">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                    <span className="font-medium text-foreground">
                                        {product.seller_profile.name?.[0]}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-foreground">
                                        {product.seller_profile.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Seller</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 glass-subtle"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Chat
                                </Button>
                            </div>
                        )}

                        {/* Shipping Info */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4" />
                                <span>Free Shipping</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                <span>Buyer Protection</span>
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-foreground">Quantity</span>
                            <div className="flex items-center glass-subtle rounded-xl">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-12 text-center text-foreground">
                                    {quantity}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        setQuantity(Math.min(product.stock, quantity + 1))
                                    }
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {product.stock} available
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                className="flex-1 gap-2 glass-subtle hover:bg-[hsl(0_0%_100%/0.08)]"
                                onClick={handleAddToCart}
                                disabled={addToCart.isPending}
                            >
                                <ShoppingCart className="w-4 h-4" />
                                Add to Cart
                            </Button>
                            <Button
                                className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
                                onClick={handleBuyNow}
                                disabled={addToCart.isPending}
                            >
                                Buy Now
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {related.length > 0 && (
                    <section className="mt-12">
                        <h2 className="text-lg font-semibold mb-4 text-foreground">
                            Related Products
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {related.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
