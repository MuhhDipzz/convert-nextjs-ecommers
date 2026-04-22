import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useClearCart, CartItem } from './useCart';

export interface Order {
  id: string;
  user_id: string;
  address_id: string | null;
  total_price: number;
  shipping_cost: number;
  status: string;
  payment_method: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  seller_id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
  created_at: string;
}

export const useOrders = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user
  });
};

export const useSellerOrders = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['seller-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          order:orders(id, status, created_at, payment_method)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
};

export const useCreateOrder = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const clearCart = useClearCart();

  return useMutation({
    mutationFn: async ({ 
      cartItems, 
      addressId, 
      paymentMethod 
    }: { 
      cartItems: CartItem[]; 
      addressId?: string; 
      paymentMethod?: string 
    }) => {
      if (!user) throw new Error('Not authenticated');

      const selectedItems = cartItems.filter(item => item.is_selected && item.product);
      if (selectedItems.length === 0) throw new Error('No items selected');

      const subtotal = selectedItems.reduce((sum, item) => {
        return sum + (item.product?.price || 0) * item.quantity;
      }, 0);

      const shippingCost = subtotal > 100 ? 0 : 10;
      const totalPrice = subtotal + shippingCost;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          address_id: addressId || null,
          total_price: totalPrice,
          shipping_cost: shippingCost,
          payment_method: paymentMethod || 'cod',
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = selectedItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        seller_id: item.product?.seller_id || '',
        product_name: item.product?.name || '',
        product_image: item.product?.images?.[0] || null,
        quantity: item.quantity,
        price: item.product?.price || 0
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update stock
      for (const item of selectedItems) {
        if (item.product) {
          await supabase
            .from('products')
            .update({ 
              stock: Math.max(0, item.product.stock - item.quantity),
              sold_count: item.product.stock + item.quantity
            })
            .eq('id', item.product_id);
        }
      }

      return order;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      await clearCart.mutateAsync();
      toast({
        title: "Order placed!",
        description: "Your order has been confirmed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};
