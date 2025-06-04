// src/pages/ProductsPage.tsx
import { useMemo, useState } from "react";
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

  const [searchText, setSearchText] = useState<string>("");
  
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  
  const filteredAndSorted = useMemo<Product[]>(() => {
    const all = productsQuery.data || [];


    let result = all.filter((p: Product) =>
      p.title.toLowerCase().includes(searchText.toLowerCase())
    );

    if (selectedCategory) {
      result = result.filter((p: Product) => p.category === selectedCategory);
    }

    
    if (sortOrder === "asc") {
      result = [...result].sort((a: Product, b: Product) => a.price - b.price);
    } else if (sortOrder === "desc") {
      result = [...result].sort((a: Product, b: Product) => b.price - a.price);
    }

    return result;
  }, [productsQuery.data, searchText, selectedCategory, sortOrder]);

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

  const onSubmit = async (values: Omit<Product, "id"> & { id?: number }) => {
    if (editingProduct) {
      
      await updateMutation.mutateAsync({
        id: editingProduct.id,
        title: values.title,
        price: Number(values.price),
        description: values.description,
        category: values.category,
        image: values.image,
      });
    } else {
      
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-screen-lg mx-auto bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6 space-y-6">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Produtos</h1>
            <Button
              onClick={openCreateModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
            >
              Criar produto
            </Button>
          </header>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex flex-wrap gap-4 items-end">

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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchText(e.target.value)
                  }
                  className="w-64 bg-white border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md px-3 py-2"
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="filter-category"
                  className="mb-1 text-sm font-medium text-gray-700"
                >
                  Filtrar por categoria:
                </label>
                <select
                  id="filter-category"
                  value={selectedCategory}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSelectedCategory(e.target.value)
                  }
                  className="w-64 bg-white border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md px-2 py-1"
                >
                  <option value="">Todas</option>
                  {categories.map((cat: string) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

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
                        : "bg-white text-gray-700 border border-gray-300"
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
                        : "bg-white text-gray-700 border border-gray-300"
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
                        : "bg-white text-gray-700 border border-gray-300"
                    }`}
                    onClick={() => setSortOrder("none")}
                  >
                    Normal
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Título
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Preço
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredAndSorted.map((prod: Product) => (
                  <tr
                    key={prod.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-800">{prod.id}</td>
                    <td className="px-4 py-3 max-w-xs truncate text-sm text-gray-800">
                      {prod.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {prod.category}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-indigo-600">
                      R$ {prod.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2 justify-around">
                        <Button
                          size="sm"
                          className="px-3 py-1 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition"
                          onClick={() => openEditModal(prod)}
                        >
                          Editar
                        </Button>

                        <AlertDialog
                          open={alertOpen && productToDelete?.id === prod.id}
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
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td colSpan={5}>
                    <div className="text-right pr-4 text-sm text-gray-600">
                      Total de produtos: {filteredAndSorted.length}
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

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
                </div>

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

                <div className="flex flex-col">
                  <label
                    htmlFor="category"
                    className="mb-1 text-sm font-medium text-gray-700"
                  >
                    Categoria
                  </label>
                  <select
                    id="category"
                    {...register("category", { required: true })}
                    className="w-full bg-white border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md px-2 py-1"
                  >
                    <option value="">Selecione a categoria</option>
                    {categories.map((cat: string) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

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
