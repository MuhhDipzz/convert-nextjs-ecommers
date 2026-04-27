"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/* ================= TYPES ================= */

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  category_id: string | null;
  images: string[];
  is_active: boolean;
  seller_id: string;
  sold_count: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

/* ================= GET PRODUCTS ================= */

export const useProducts = (filters?: {
  categoryId?: string;
  search?: string;
  sortBy?: string;
}) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      let query = supabase.from("products").select("*").eq("is_active", true);

      // filter category
      if (filters?.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }

      // search
      if (filters?.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      // sorting
      switch (filters?.sortBy) {
        case "price-asc":
          query = query.order("price", { ascending: true });
          break;
        case "price-desc":
          query = query.order("price", { ascending: false });
          break;
        case "best-selling":
          query = query.order("sold_count", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      return data as Product[];
    },
  });
};

/* ================= GET SELLER PRODUCTS ================= */

export const useSellerProducts = (sellerId: string) => {
  return useQuery({
    queryKey: ["seller-products", sellerId],
    queryFn: async () => {
      if (!sellerId) return [];

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data as Product[];
    },
    enabled: !!sellerId,
  });
};

/* ================= GET CATEGORIES ================= */

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*");

      if (error) throw error;

      return data as Category[];
    },
  });
};

/* ================= CREATE PRODUCT ================= */

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Partial<Product>) => {
      const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
  });
};

/* ================= UPDATE PRODUCT ================= */

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from("products")
        .update(product)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
  });
};

/* ================= DELETE PRODUCT ================= */

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
  });
};