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

  
  const filteredAndSorted = useMemo(() => {
    const all = productsQuery.data || [];

    // 1. Filtrar por título
    let result = all.filter((p) =>
      p.title.toLowerCase().includes(searchText.toLowerCase())
    );


    if (selectedCategories.length > 0) {
      result = result.filter((p) =>
        selectedCategories.includes(p.category)
      );
    }


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
    return <div>Carregando dados...</div>;
  }
  if (productsQuery.isError || categoriesQuery.isError) {
    return <div>Erro ao carregar produtos ou categorias.</div>;
  }

  return (
    <div className="p-6 space-y-6">

      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Button onClick={openCreateModal}>Criar produto</Button>
      </header>


      <div className="flex flex-wrap gap-4 items-end">

        <div className="flex flex-col">
          <label htmlFor="search" className="mb-1 text-sm font-medium">
            Buscar por título:
          </label>
          <Input
            id="search"
            placeholder="Digite parte do nome..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="categories"
            className="mb-1 text-sm font-medium"
          >
            Filtrar por categoria:
          </label>
          <Select
            multiple
            onValueChange={(values) =>
              setSelectedCategories(values as string[])
            }
          >
            <SelectTrigger className="w-64">
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


        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">
            Ordenar por preço:
          </label>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={sortOrder === "asc" ? "secondary" : "outline"}
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "none" : "asc"))
              }
            >
              Crescente
            </Button>
            <Button
              size="sm"
              variant={sortOrder === "desc" ? "secondary" : "outline"}
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
              variant={sortOrder === "none" ? "secondary" : "outline"}
              onClick={() => setSortOrder("none")}
            >
              Normal
            </Button>
          </div>
        </div>
      </div>


      <div className="mt-6 overflow-x-auto">
        <Table>

          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>


          <TableBody>
            {filteredAndSorted.map((prod) => (
              <TableRow key={prod.id}>
                <TableCell>{prod.id}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {prod.title}
                </TableCell>
                <TableCell>{prod.category}</TableCell>
                <TableCell>R$ {prod.price.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(prod)}
                    >
                      Editar
                    </Button>

                    <AlertDialog
                      open={
                        alertOpen && productToDelete?.id === prod.id
                      }
                      onOpenChange={setAlertOpen}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
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
                          <AlertDialogTitle>
                            Confirmar Exclusão
                          </AlertDialogTitle>
                          <p>
                            Tem certeza que deseja excluir este
                            produto?
                          </p>
                        </AlertDialogHeader>
                        <div className="flex justify-end space-x-2 mt-4">
                          <AlertDialogCancel asChild>
                            <Button variant="outline">
                              Cancelar
                            </Button>
                          </AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button
                              variant="destructive"
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

          <TableFooter>
            <TableRow>
              <TableCell colSpan={5}>
                <div className="text-right pr-4">
                  Total de produtos: {filteredAndSorted.length}
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild />

        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Editar Produto" : "Criar Produto"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >

            <div className="flex flex-col">
              <label htmlFor="title" className="mb-1 font-medium">
                Título
              </label>
              <Input
                id="title"
                {...register("title", { required: true })}
                placeholder="Nome do produto"
              />
            </div>


            <div className="flex flex-col">
              <label htmlFor="price" className="mb-1 font-medium">
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
                placeholder="00.00"
              />
            </div>


            <div className="flex flex-col">
              <label
                htmlFor="category"
                className="mb-1 font-medium"
              >
                Categoria
              </label>
              <Select {...register("category", { required: true })}>
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


            <div className="flex flex-col">
              <label
                htmlFor="description"
                className="mb-1 font-medium"
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
              <label htmlFor="image" className="mb-1 font-medium">
                URL da imagem
              </label>
              <Input
                id="image"
                {...register("image", { required: true })}
                placeholder="https://..."
              />
            </div>

            <DialogFooter className="flex justify-end space-x-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDialog(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {editingProduct ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
