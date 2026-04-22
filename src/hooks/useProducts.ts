import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  seller_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  images: string[];
  rating_avg: number;
  rating_count: number;
  sold_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: { id: string; name: string; icon: string | null } | null;
  seller_profile?: { name: string; avatar_url: string | null } | null;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Category[];
    }
  });
};

export const useProducts = (filters?: {
  categoryId?: string;
  search?: string;
  sortBy?: string;
  sellerId?: string;
}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, icon)
        `)
        .eq('is_active', true);

      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters?.sellerId) {
        query = query.eq('seller_id', filters.sellerId);
      }

      if (filters?.sortBy === 'price-asc') {
        query = query.order('price', { ascending: true });
      } else if (filters?.sortBy === 'price-desc') {
        query = query.order('price', { ascending: false });
      } else if (filters?.sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (filters?.sortBy === 'best-selling') {
        query = query.order('sold_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Fetch seller profiles separately
      const sellerIds = [...new Set(data.map(p => p.seller_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url')
        .in('user_id', sellerIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, { name: p.name, avatar_url: p.avatar_url }]) || []);
      
      return data.map(product => ({
        ...product,
        seller_profile: profileMap.get(product.seller_id) || null
      })) as Product[];
    }
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, icon)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      // Fetch seller profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('user_id', data.seller_id)
        .maybeSingle();
      
      return {
        ...data,
        seller_profile: profile
      } as Product;
    },
    enabled: !!id
  });
};

export const useSellerProducts = (sellerId: string) => {
  return useQuery({
    queryKey: ['seller-products', sellerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, icon)
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!sellerId
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (product: {
      seller_id: string;
      category_id?: string | null;
      name: string;
      description?: string;
      price: number;
      original_price?: number | null;
      stock: number;
      images: string[];
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      toast({
        title: "Product created!",
        description: "Your product is now live.",
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

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.id] });
      toast({
        title: "Product updated!",
        description: "Your changes have been saved.",
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

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      toast({
        title: "Product deleted!",
        description: "The product has been removed.",
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
