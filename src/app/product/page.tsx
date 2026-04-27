import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { useProducts, useCategories } from "@/hooks/useProducts";

const Products = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);

    const categoryId = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const sortBy = searchParams.get("sortBy") || "newest";

    const { data: products, isLoading } = useProducts({
        categoryId,
        search,
        sortBy,
    });
    const { data: categories } = useCategories();

    const updateParams = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        router.push(`/product?${params.toString()}`);
    };

    const handleCategoryChange = (id: string | null) => {
        updateParams("category", id);
    };

    const handleSortChange = (value: string) => {
        updateParams("category", value);
    };

    return (
        <div className="min-h-screen bg-background py-4">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">
                        {search
                            ? `Search: "${search}"`
                            : categoryId
                                ? categories?.find((c) => c.id === categoryId)?.name ||
                                "Products"
                                : "All Products"}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {products?.length || 0} products found
                    </p>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 glass-subtle"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                        </Button>

                        {/* Category Pills - Desktop */}
                        <div className="hidden md:flex items-center gap-2 flex-wrap">
                            <button
                                onClick={() => handleCategoryChange(null)}
                                className={`px-3 py-1.5 text-sm rounded-xl transition-all ${!categoryId
                                        ? "bg-primary text-primary-foreground"
                                        : "glass-subtle text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.08)]"
                                    }`}
                            >
                                All
                            </button>
                            {categories?.slice(0, 5).map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.id)}
                                    className={`px-3 py-1.5 text-sm rounded-xl transition-all ${categoryId === cat.id
                                            ? "bg-primary text-primary-foreground"
                                            : "glass-subtle text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.08)]"
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="appearance-none glass-subtle px-3 py-2 pr-8 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer text-foreground"
                        >
                            <option value="newest">Newest</option>
                            <option value="best-selling">Best Selling</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>

                {/* Mobile Filters */}
                {showFilters && (
                    <div className="md:hidden mb-6 p-4 glass-card">
                        <h3 className="text-sm font-medium mb-3 text-foreground">
                            Categories
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleCategoryChange(null)}
                                className={`px-3 py-1.5 text-sm rounded-xl transition-all ${!categoryId
                                        ? "bg-primary text-primary-foreground"
                                        : "glass-subtle text-foreground"
                                    }`}
                            >
                                All
                            </button>
                            {categories?.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.id)}
                                    className={`px-3 py-1.5 text-sm rounded-xl transition-all ${categoryId === cat.id
                                            ? "bg-primary text-primary-foreground"
                                            : "glass-subtle text-foreground"
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="glass-card p-3">
                                <div className="aspect-square bg-muted skeleton rounded-lg mb-3" />
                                <div className="h-4 bg-muted skeleton rounded mb-2" />
                                <div className="h-4 w-1/2 bg-muted skeleton rounded" />
                            </div>
                        ))}
                    </div>
                ) : products && products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">No products found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
