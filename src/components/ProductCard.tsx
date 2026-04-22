import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Product } from '@/hooks/useProducts';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <Link to={`/product/${product.id}`}>
      <div className="group glass-card overflow-hidden hover:bg-[hsl(0_0%_100%/0.08)] hover:border-[hsl(0_0%_100%/0.15)] transition-all duration-300">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Discount Badge - Monochrome */}
          {discount > 0 && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-foreground/90 text-background text-xs font-medium rounded-lg">
              -{discount}%
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3">
          {/* Name */}
          <h3 className="text-sm text-foreground line-clamp-2 min-h-[40px] group-hover:opacity-80 transition-opacity">
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-2">
            <span className="text-base font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="ml-2 text-xs text-muted-foreground line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          {/* Rating & Sold - Monochrome */}
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            {product.rating_avg > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-current text-foreground/60" />
                <span>{product.rating_avg.toFixed(1)}</span>
              </div>
            )}
            {product.sold_count > 0 && (
              <>
                {product.rating_avg > 0 && <span className="opacity-50">•</span>}
                <span>{product.sold_count} sold</span>
              </>
            )}
          </div>

          {/* Shop Name */}
          {product.seller_profile && (
            <p className="mt-2 text-xs text-muted-foreground truncate">
              {product.seller_profile.name}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;