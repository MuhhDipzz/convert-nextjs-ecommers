"use client"

import { useState } from "react";
import {
    Package,
    ShoppingCart,
    Users,
    DollarSign,
    MoreHorizontal,
    ArrowUp,
    ArrowDown,
    Loader2,
    Pencil,
    Trash2,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import {
    useSellerProducts,
    useCreateProduct,
    useUpdateProduct,
    useDeleteProduct,
    useCategories,
    Product,
} from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";

const ProductForm = ({
    product,
    categories,
    sellerId,
    onSubmit,
    onCancel,
    isLoading,
}: {
    product?: Product;
    categories: { id: string; name: string }[];
    sellerId: string;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isLoading: boolean;
}) => {
    const [formData, setFormData] = useState({
        name: product?.name || "",
        description: product?.description || "",
        price: product?.price?.toString() || "",
        original_price: product?.original_price?.toString() || "",
        stock: product?.stock?.toString() || "0",
        category_id: product?.category_id || "",
        images: product?.images?.join("\n") || "",
        is_active: product?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const images = formData.images
            .split("\n")
            .map((url) => url.trim())
            .filter((url) => url.length > 0);

        onSubmit({
            seller_id: sellerId,
            name: formData.name,
            description: formData.description || null,
            price: parseFloat(formData.price),
            original_price: formData.original_price
                ? parseFloat(formData.original_price)
                : null,
            stock: parseInt(formData.stock) || 0,
            category_id: formData.category_id || null,
            images,
            is_active: formData.is_active,
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
        >
            <div>
                <label className="block text-sm text-muted-foreground mb-2">
                    Product Name *
                </label>
                <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    required
                />
            </div>
            <div>
                <label className="block text-sm text-muted-foreground mb-2">
                    Description
                </label>
                <Textarea
                    value={formData.description}
                    onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Product description"
                    rows={3}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                        Price *
                    </label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                        }
                        placeholder="0.00"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                        Original Price
                    </label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.original_price}
                        onChange={(e) =>
                            setFormData({ ...formData, original_price: e.target.value })
                        }
                        placeholder="0.00 (for discounts)"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                        Stock *
                    </label>
                    <Input
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={(e) =>
                            setFormData({ ...formData, stock: e.target.value })
                        }
                        placeholder="0"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                        Category
                    </label>
                    <Select
                        value={formData.category_id}
                        onValueChange={(value) =>
                            setFormData({ ...formData, category_id: value })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div>
                <label className="block text-sm text-muted-foreground mb-2">
                    Image URLs (one per line)
                </label>
                <Textarea
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                    rows={3}
                />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="rounded"
                />
                <span className="text-sm text-foreground">
                    Product is active (visible to customers)
                </span>
            </label>
            <div className="flex gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-foreground text-background hover:opacity-90"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : product ? (
                        "Update Product"
                    ) : (
                        "Add Product"
                    )}
                </Button>
            </div>
        </form>
    );
};

const page = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const userId = user?.id;
    const { data: sellerProducts, isLoading: productsLoading } =
        useSellerProducts(userId!);
    const { data: categories } = useCategories();
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const deleteProduct = useDeleteProduct();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const stats = [
        {
            label: "Total Revenue",
            value: "$124,563",
            change: "+12.5%",
            trend: "up",
            icon: DollarSign,
        },
        {
            label: "Total Orders",
            value: "1,284",
            change: "+8.2%",
            trend: "up",
            icon: ShoppingCart,
        },
        {
            label: "Total Products",
            value: sellerProducts?.length?.toString() || "0",
            change: "+3.1%",
            trend: "up",
            icon: Package,
        },
        {
            label: "Total Customers",
            value: "12,453",
            change: "+15.3%",
            trend: "up",
            icon: Users,
        },
    ];

    const handleCreate = async (data: any) => {
        try {
            await createProduct.mutateAsync(data);
            setIsDialogOpen(false);
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleUpdate = async (data: any) => {
        if (!editingProduct) return;
        try {
            await updateProduct.mutateAsync({ id: editingProduct.id, ...data });
            setEditingProduct(null);
            setIsDialogOpen(false);
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this product?")) {
            await deleteProduct.mutateAsync(id);
        }
    };

    const openEditDialog = (product: Product) => {
        setEditingProduct(product);
        setIsDialogOpen(true);
    };

    const openCreateDialog = () => {
        setEditingProduct(null);
        setIsDialogOpen(true);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-foreground/10 text-foreground font-medium";
            case "shipped":
                return "bg-foreground/5 text-foreground/80";
            case "processing":
                return "glass-subtle text-muted-foreground";
            default:
                return "glass-subtle text-muted-foreground/70";
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-background">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-2">Welcome back, Admin</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={openCreateDialog}
                                className="h-12 px-6 bg-primary text-primary-foreground hover:opacity-90 rounded-xl font-medium gap-2"
                            >
                                <Package className="w-4 h-4" />
                                Add Product
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card border-border max-w-lg">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingProduct ? "Edit Product" : "Add New Product"}
                                </DialogTitle>
                            </DialogHeader>
                            <ProductForm
                                product={editingProduct || undefined}
                                categories={categories || []}
                                sellerId={user?.id || ""}
                                onSubmit={editingProduct ? handleUpdate : handleCreate}
                                onCancel={() => setIsDialogOpen(false)}
                                isLoading={createProduct.isPending || updateProduct.isPending}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.label}
                            className="p-6 glass-card fade-in-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                                    <stat.icon className="w-6 h-6 text-foreground" />
                                </div>
                                <div
                                    className={`flex items-center gap-1 text-sm ${stat.trend === "up" ? "text-foreground" : "text-muted-foreground"}`}
                                >
                                    {stat.trend === "up" ? (
                                        <ArrowUp className="w-4 h-4" />
                                    ) : (
                                        <ArrowDown className="w-4 h-4 opacity-50" />
                                    )}
                                    {stat.change}
                                </div>
                            </div>
                            <p className="text-2xl font-semibold text-foreground">
                                {stat.value}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* My Products */}
                    <div className="lg:col-span-2 glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-foreground">
                                My Products
                            </h2>
                        </div>

                        {productsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : sellerProducts?.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">
                                    No products yet. Add your first product!
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left text-sm text-muted-foreground font-medium pb-4">
                                                Product
                                            </th>
                                            <th className="text-left text-sm text-muted-foreground font-medium pb-4">
                                                Price
                                            </th>
                                            <th className="text-left text-sm text-muted-foreground font-medium pb-4">
                                                Stock
                                            </th>
                                            <th className="text-left text-sm text-muted-foreground font-medium pb-4">
                                                Status
                                            </th>
                                            <th className="text-right text-sm text-muted-foreground font-medium pb-4">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sellerProducts?.map((product) => (
                                            <tr
                                                key={product.id}
                                                className="border-b border-border last:border-0"
                                            >
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                            {product.images?.[0] ? (
                                                                <img
                                                                    src={product.images[0]}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Package className="w-5 h-5 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                                                            {product.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-sm text-foreground">
                                                    ${product.price.toFixed(2)}
                                                </td>
                                                <td className="py-4 text-sm text-muted-foreground">
                                                    {product.stock}
                                                </td>
                                                <td className="py-4">
                                                    <span
                                                        className={`px-3 py-1 text-xs font-medium rounded-lg ${product.is_active ? "bg-foreground/10 text-foreground" : "glass-subtle text-muted-foreground"}`}
                                                    >
                                                        {product.is_active ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openEditDialog(product)}
                                                            className="w-8 h-8 text-muted-foreground hover:text-foreground"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(product.id)}
                                                            className="w-8 h-8 text-muted-foreground hover:text-destructive"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-foreground">
                                Top Products
                            </h2>
                            <Button
                                variant="ghost"
                                className="text-foreground hover:opacity-70 text-sm"
                            >
                                View All
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {sellerProducts?.slice(0, 4).map((product, index) => (
                                <div
                                    key={product.id}
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-[hsl(0_0%_100%/0.04)] transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-foreground truncate">
                                            {product.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            {product.sold_count} sales
                                        </p>
                                    </div>
                                    <p className="text-sm font-medium text-foreground">
                                        ${product.price.toFixed(2)}
                                    </p>
                                </div>
                            ))}
                            {(!sellerProducts || sellerProducts.length === 0) && (
                                <p className="text-center text-muted-foreground py-4">
                                    No products to display
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default page;
