// src/pages/ProductsPage.tsx
import React, { useMemo, useState } from "react";
import { Product } from "@/types/product";
import { useProducts } from "@/hooks/useProducts";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
} from "@/components/ui/table";

import { useForm } from "react-hook-form";

type SortOrder = "none" | "asc" | "desc";

export function ProductsPage() {
  const {
    productsQuery,
    categoriesQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useProducts();

  const [searchText, setSearchText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Controle do AlertDialog de exclusão
  const [alertOpen, setAlertOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(
    null
  );

  // Filtrar e ordenar
  const filteredAndSorted = useMemo(() => {
    const all = productsQuery.data || [];

    // 1. Filtrar por título
    let result = all.filter((p) =>
      p.title.toLowerCase().includes(searchText.toLowerCase())
    );

    // 2. Filtrar por categorias (se houver)
    if (selectedCategories.length > 0) {
      result = result.filter((p) =>
        selectedCategories.includes(p.category)
      );
    }

    // 3. Ordenar por preço
    if (sortOrder === "asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortOrder === "desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [productsQuery.data, searchText, selectedCategories, sortOrder]);

  const categories = categoriesQuery.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<Omit<Product, "id"> & { id?: number }>({
    defaultValues: {
      title: "",
      price: 0,
      description: "",
      category: "",
      image: "",
    },
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    reset({
      title: "",
      price: 0,
      description: "",
      category: "",
      image: "",
    });
    setOpenDialog(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    reset({
      id: prod.id,
      title: prod.title,
      price: prod.price,
      description: prod.description,
      category: prod.category,
      image: prod.image,
    });
    setOpenDialog(true);
  };

  const onSubmit = async (values: any) => {
    if (editingProduct) {
      // Editar
      await updateMutation.mutateAsync({
        id: editingProduct.id,
        title: values.title,
        price: Number(values.price),
        description: values.description,
        category: values.category,
        image: values.image,
      });
    } else {
      // Criar
      await createMutation.mutateAsync({
        title: values.title,
        price: Number(values.price),
        description: values.description,
        category: values.category,
        image: values.image,
      });
    }
    setOpenDialog(false);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      await deleteMutation.mutateAsync(productToDelete.id);
      setAlertOpen(false);
    }
  };

  if (productsQuery.isLoading || categoriesQuery.isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center text-gray-500">
        Carregando dados...
      </div>
    );
  }
  if (productsQuery.isError || categoriesQuery.isError) {
    return (
      <div className="min-h-[300px] flex items-center justify-center text-red-500">
        Erro ao carregar produtos ou categorias.
      </div>
    );
  }

  return (
    // Página com fundo cinza-claro e padding geral
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Card centralizado */}
      <div className="max-w-screen-lg mx-auto bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Área interna do card */}
        <div className="p-6 space-y-6">
          {/* Cabeçalho */}
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Produtos</h1>
            <Button onClick={openCreateModal} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition">
              Criar produto
            </Button>
          </header>

          {/* Seção de filtros */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex flex-wrap gap-4 items-end">
              {/* Input de busca por título */}
              <div className="flex flex-col">
                <label
                  htmlFor="search"
                  className="mb-1 text-sm font-medium text-gray-700"
                >
                  Buscar por título:
                </label>
                <Input
                  id="search"
                  placeholder="Digite parte do nome..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-64 bg-white border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md px-3 py-2"
                />
              </div>

              {/* Select múltiplo de categorias */}
              <div className="flex flex-col">
                <label
                  htmlFor="categories"
                  className="mb-1 text-sm font-medium text-gray-700"
                >
                  Filtrar por categoria:
                </label>
                <Select
                  multiple
                  onValueChange={(values) =>
                    setSelectedCategories(values as string[])
                  }
                  className="w-64 bg-white border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Botões de ordenação */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">
                  Ordenar por preço:
                </label>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    className={`px-3 py-1 rounded-md transition ${
                      sortOrder === "asc"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                    }`}
                    onClick={() =>
                      setSortOrder((prev) => (prev === "asc" ? "none" : "asc"))
                    }
                  >
                    Crescente
                  </Button>
                  <Button
                    size="sm"
                    className={`px-3 py-1 rounded-md transition ${
                      sortOrder === "desc"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                    }`}
                    onClick={() =>
                      setSortOrder((prev) =>
                        prev === "desc" ? "none" : "desc"
                      )
                    }
                  >
                    Decrescente
                  </Button>
                  <Button
                    size="sm"
                    className={`px-3 py-1 rounded-md transition ${
                      sortOrder === "none"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                    }`}
                    onClick={() => setSortOrder("none")}
                  >
                    Normal
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de produtos */}
          <div className="mt-6 overflow-x-auto">
            <Table className="min-w-full bg-white rounded-lg shadow">
              {/* Cabeçalho da tabela */}
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    ID
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Título
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Categoria
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Preço
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>

              {/* Corpo da tabela */}
              <TableBody>
                {filteredAndSorted.map((prod) => (
                  <TableRow
                    key={prod.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="px-4 py-3 text-sm text-gray-800">
                      {prod.id}
                    </TableCell>
                    <TableCell className="px-4 py-3 max-w-xs truncate text-sm text-gray-800">
                      {prod.title}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-700">
                      {prod.category}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm font-semibold text-indigo-600">
                      R$ {prod.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex space-x-2">
                        {/* Botão Editar */}
                        <Button
                          size="sm"
                          className="px-3 py-1 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition"
                          onClick={() => openEditModal(prod)}
                        >
                          Editar
                        </Button>

                        {/* Botão Excluir (AlertDialog) */}
                        <AlertDialog
                          open={
                            alertOpen && productToDelete?.id === prod.id
                          }
                          onOpenChange={setAlertOpen}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
                              onClick={() => {
                                setProductToDelete(prod);
                                setAlertOpen(true);
                              }}
                            >
                              Excluir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-lg font-medium text-gray-900">
                                Confirmar Exclusão
                              </AlertDialogTitle>
                              <p className="text-sm text-gray-600">
                                Tem certeza que deseja excluir este produto?
                              </p>
                            </AlertDialogHeader>
                            <div className="flex justify-end space-x-2 mt-4">
                              <AlertDialogCancel asChild>
                                <Button className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition">
                                  Cancelar
                                </Button>
                              </AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button
                                  className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
                                  onClick={confirmDelete}
                                >
                                  Sim, excluir
                                </Button>
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              {/* Rodapé da tabela */}
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="text-right pr-4 text-sm text-gray-600">
                      Total de produtos: {filteredAndSorted.length}
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          {/* Modal de Criar / Editar */}
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild />
            <DialogContent className="sm:max-w-lg bg-white rounded-lg shadow-lg">
              <DialogHeader className="border-b border-gray-200 px-6 py-4">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {editingProduct ? "Editar Produto" : "Criar Produto"}
                </DialogTitle>
              </DialogHeader>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="px-6 py-4 space-y-4"
              >
                {/* TÍTULO */}
                <div className="flex flex-col">
                  <label
                    htmlFor="title"
                    className="mb-1 text-sm font-medium text-gray-700"
                  >
                    Título
                  </label>
                  <Input
                    id="title"
                    {...register("title", { required: true })}
                    className="bg-white border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md px-3 py-2"
                    placeholder="Nome do produto"
                  />
                  {/* Mensagem de erro (opcional) */}
                  {/*
                  {formState.errors.title && (
                    <span className="text-xs text-red-500">
                      Título é obrigatório
                    </span>
                  )} 
                  */}
                </div>

                {/* PREÇO */}
                <div className="flex flex-col">
                  <label
                    htmlFor="price"
                    className="mb-1 text-sm font-medium text-gray-700"
                  >
                    Preço
                  </label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register("price", {
                      required: true,
                      valueAsNumber: true,
                    })}
                    className="bg-white border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md px-3 py-2"
                    placeholder="00.00"
                  />
                </div>

                {/* CATEGORIA */}
                <div className="flex flex-col">
                  <label
                    htmlFor="category"
                    className="mb-1 text-sm font-medium text-gray-700"
                  >
                    Categoria
                  </label>
                  <Select
                    {...register("category", { required: true })}
                    className="w-full bg-white border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* DESCRIÇÃO */}
                <div className="flex flex-col">
                  <label
                    htmlFor="description"
                    className="mb-1 text-sm font-medium text-gray-700"
                  >
                    Descrição
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    {...register("description", { required: true })}
                    className="resize-none rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Descrição do produto"
                  />
                </div>

                {/* IMAGEM (URL) */}
                <div className="flex flex-col">
                  <label
                    htmlFor="image"
                    className="mb-1 text-sm font-medium text-gray-700"
                  >
                    URL da imagem
                  </label>
                  <Input
                    id="image"
                    {...register("image", { required: true })}
                    className="bg-white border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md px-3 py-2"
                    placeholder="https://..."
                  />
                </div>

                {/* Botões no footer do modal */}
                <DialogFooter className="flex justify-end space-x-2 border-t border-gray-200 px-6 py-4">
                  <Button
                    type="button"
                    className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                    onClick={() => setOpenDialog(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
                    disabled={isSubmitting}
                  >
                    {editingProduct ? "Salvar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
