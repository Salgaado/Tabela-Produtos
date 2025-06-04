// src/hooks/useProducts.ts
import axios from "axios";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Product, NewProduct } from "@/types/product";

const BASE_URL = import.meta.env.VITE_API_URL as string;

// Funções de fetch e mutações (mesmas do v4)
const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get<Product[]>(`${BASE_URL}/products`);
  return data;
};

const fetchCategories = async (): Promise<string[]> => {
  const { data } = await axios.get<string[]>(
    `${BASE_URL}/products/categories`
  );
  return data;
};

const createProduct = async (newProd: NewProduct): Promise<Product> => {
  const { data } = await axios.post<Product>(
    `${BASE_URL}/products`,
    newProd
  );
  return data;
};

const updateProduct = async (prod: Product): Promise<Product> => {
  const payload = {
    title: prod.title,
    price: prod.price,
    description: prod.description,
    category: prod.category,
    image: prod.image,
  };
  const { data } = await axios.put<Product>(
    `${BASE_URL}/products/${prod.id}`,
    payload
  );
  return data;
};

const deleteProduct = async (id: number): Promise<{}> => {
  const { data } = await axios.delete(`${BASE_URL}/products/${id}`);
  return data;
};

export function useProducts() {
  const queryClient = useQueryClient();

  // === useQuery para listar produtos ===
  const productsQuery = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60, // 1 minuto
    refetchOnWindowFocus: false,
  });

  // === useQuery para listar categorias ===
  const categoriesQuery = useQuery<string[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // === useMutation para criar produto ===
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // === useMutation para atualizar produto ===
  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // === useMutation para deletar produto ===
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    productsQuery,
    categoriesQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
