// src/hooks/useProducts.ts
import axios from "axios";
import { useQuery, useMutation, useQueryClient, } from "@tanstack/react-query";
const BASE_URL = import.meta.env.VITE_API_URL;
// Funções de fetch e mutações (mesmas do v4)
const fetchProducts = async () => {
    const { data } = await axios.get(`${BASE_URL}/products`);
    return data;
};
const fetchCategories = async () => {
    const { data } = await axios.get(`${BASE_URL}/products/categories`);
    return data;
};
const createProduct = async (newProd) => {
    const { data } = await axios.post(`${BASE_URL}/products`, newProd);
    return data;
};
const updateProduct = async (prod) => {
    const payload = {
        title: prod.title,
        price: prod.price,
        description: prod.description,
        category: prod.category,
        image: prod.image,
    };
    const { data } = await axios.put(`${BASE_URL}/products/${prod.id}`, payload);
    return data;
};
const deleteProduct = async (id) => {
    const { data } = await axios.delete(`${BASE_URL}/products/${id}`);
    return data;
};
export function useProducts() {
    const queryClient = useQueryClient();
    // === useQuery para listar produtos ===
    const productsQuery = useQuery({
        queryKey: ["products"],
        queryFn: fetchProducts,
        staleTime: 1000 * 60, // 1 minuto
        refetchOnWindowFocus: false,
    });
    // === useQuery para listar categorias ===
    const categoriesQuery = useQuery({
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
