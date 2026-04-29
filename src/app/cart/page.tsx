import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCartItems, useUpdateCartItem, useRemoveFromCart } from '@/hooks/useCart';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: cartItems, isLoading } = useCartItems();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-semibold mb-2 text-foreground">Sign in to view your cart</h1>
          <Link to="/login">
            <Button className="bg-primary text-primary-foreground hover:opacity-90">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-4">
        <div className="container mx-auto px-4">
          <div className="h-8 w-32 bg-muted skeleton rounded mb-6" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted skeleton rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-semibold mb-2 text-foreground">Your cart is empty</h1>
          <p className="text-muted-foreground mb-4">Add some products to get started</p>
          <Link to="/products">
            <Button className="bg-primary text-primary-foreground hover:opacity-90">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const selectedItems = cartItems.filter(item => item.is_selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  return (
    <div className="min-h-screen bg-background py-4">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6 text-foreground">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 glass-card">
                {/* Select */}
                <button
                  onClick={() => updateItem.mutate({ id: item.id, isSelected: !item.is_selected })}
                  className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                    item.is_selected ? 'bg-primary' : 'border border-border hover:border-foreground/30'
                  }`}
                >
                  {item.is_selected && <Check className="w-3 h-3 text-primary-foreground" />}
                </button>

                {/* Image */}
                <Link to={`/product/${item.product_id}`} className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  <img src={item.product?.images?.[0] || ''} alt="" className="w-full h-full object-cover" />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product_id}`}>
                    <h3 className="font-medium line-clamp-2 hover:opacity-80 transition-opacity text-foreground">{item.product?.name}</h3>
                  </Link>
                  {item.seller_name && (
                    <p className="text-xs text-muted-foreground mt-1">{item.seller_name}</p>
                  )}
                  <p className="font-bold mt-2 text-foreground">{formatPrice(item.product?.price || 0)}</p>
                </div>

                {/* Quantity */}
                <div className="flex flex-col items-end gap-2">
                  <Button variant="ghost" size="icon" className="hover:bg-muted" onClick={() => removeItem.mutate(item.id)}>
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <div className="flex items-center glass-subtle rounded-xl">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity - 1 })}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-sm text-foreground">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 p-6 glass-card">
              <h2 className="font-semibold mb-4 text-foreground">Order Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({selectedItems.length} items)</span>
                  <span className="text-foreground">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-border text-foreground">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              <Button 
                className="w-full mt-6 bg-primary text-primary-foreground hover:opacity-90" 
                disabled={selectedItems.length === 0}
                onClick={() => navigate('/checkout')}
              >
                Checkout ({selectedItems.length})
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;