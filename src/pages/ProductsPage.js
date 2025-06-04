import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogAction, AlertDialogCancel, } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
export function ProductsPage() {
    const { productsQuery, categoriesQuery, createMutation, updateMutation, deleteMutation, } = useProducts();
    const [searchText, setSearchText] = useState("");

    const [selectedCategory, setSelectedCategory] = useState("");
    const [sortOrder, setSortOrder] = useState("none");
    const [openDialog, setOpenDialog] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [alertOpen, setAlertOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const filteredAndSorted = useMemo(() => {
        const all = productsQuery.data || [];

        let result = all.filter((p) => p.title.toLowerCase().includes(searchText.toLowerCase()));

        if (selectedCategory) {
            result = result.filter((p) => p.category === selectedCategory);
        }

        if (sortOrder === "asc") {
            result = [...result].sort((a, b) => a.price - b.price);
        }
        else if (sortOrder === "desc") {
            result = [...result].sort((a, b) => b.price - a.price);
        }
        return result;
    }, [productsQuery.data, searchText, selectedCategory, sortOrder]);
    const categories = categoriesQuery.data || [];
    const { register, handleSubmit, reset, formState: { isSubmitting }, } = useForm({
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
    const openEditModal = (prod) => {
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
    const onSubmit = async (values) => {
        if (editingProduct) {

            await updateMutation.mutateAsync({
                id: editingProduct.id,
                title: values.title,
                price: Number(values.price),
                description: values.description,
                category: values.category,
                image: values.image,
            });
        }
        else {

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
        return (_jsx("div", { className: "min-h-[300px] flex items-center justify-center text-gray-500", children: "Carregando dados..." }));
    }
    if (productsQuery.isError || categoriesQuery.isError) {
        return (_jsx("div", { className: "min-h-[300px] flex items-center justify-center text-red-500", children: "Erro ao carregar produtos ou categorias." }));
    }
    return (

    _jsx("div", { className: "min-h-screen bg-gray-100 p-6", children: _jsx("div", { className: "max-w-screen-lg mx-auto bg-white rounded-2xl shadow-md overflow-hidden", children: _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("header", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-semibold text-gray-900", children: "Produtos" }), _jsx(Button, { onClick: openCreateModal, className: "bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition", children: "Criar produto" })] }), _jsx("div", { className: "bg-gray-50 p-4 rounded-lg", children: _jsxs("div", { className: "flex flex-wrap gap-4 items-end", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("label", { htmlFor: "search", className: "mb-1 text-sm font-medium text-gray-700", children: "Buscar por t\u00EDtulo:" }), _jsx(Input, { id: "search", placeholder: "Digite parte do nome...", value: searchText, onChange: (e) => setSearchText(e.target.value), className: "w-64 bg-white border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md px-3 py-2" })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { htmlFor: "filter-category", className: "mb-1 text-sm font-medium text-gray-700", children: "Filtrar por categoria:" }), _jsxs("select", { id: "filter-category", value: selectedCategory, onChange: (e) => setSelectedCategory(e.target.value), className: "w-64 bg-white border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md px-2 py-1", children: [_jsx("option", { value: "", children: "Todas" }), categories.map((cat) => (_jsx("option", { value: cat, children: cat }, cat)))] })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "mb-1 text-sm font-medium text-gray-700", children: "Ordenar por pre\u00E7o:" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { size: "sm", className: `px-3 py-1 rounded-md transition ${sortOrder === "asc"
                                                        ? "bg-indigo-600 text-white"
                                                        : "bg-white text-gray-700 border border-gray-300"}`, onClick: () => setSortOrder((prev) => (prev === "asc" ? "none" : "asc")), children: "Crescente" }), _jsx(Button, { size: "sm", className: `px-3 py-1 rounded-md transition ${sortOrder === "desc"
                                                        ? "bg-indigo-600 text-white"
                                                        : "bg-white text-gray-700 border border-gray-300"}`, onClick: () => setSortOrder((prev) => prev === "desc" ? "none" : "desc"), children: "Decrescente" }), _jsx(Button, { size: "sm", className: `px-3 py-1 rounded-md transition ${sortOrder === "none"
                                                        ? "bg-indigo-600 text-white"
                                                        : "bg-white text-gray-700 border border-gray-300"}`, onClick: () => setSortOrder("none"), children: "Normal" })] })] })] }) }), _jsx("div", { className: "mt-6 overflow-x-auto", children: _jsxs("table", { className: "min-w-full bg-white rounded-lg shadow", children: [_jsx("thead", { className: "bg-gray-100", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left text-sm font-medium text-gray-700", children: "ID" }), _jsx("th", { className: "px-4 py-3 text-left text-sm font-medium text-gray-700", children: "T\u00EDtulo" }), _jsx("th", { className: "px-4 py-3 text-left text-sm font-medium text-gray-700", children: "Categoria" }), _jsx("th", { className: "px-4 py-3 text-left text-sm font-medium text-gray-700", children: "Pre\u00E7o" }), _jsx("th", { className: "px-4 py-3 text-left text-sm font-medium text-gray-700", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { children: filteredAndSorted.map((prod) => (_jsxs("tr", { className: "hover:bg-gray-50 transition-colors", children: [_jsx("td", { className: "px-4 py-3 text-sm text-gray-800", children: prod.id }), _jsx("td", { className: "px-4 py-3 max-w-xs truncate text-sm text-gray-800", children: prod.title }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-700", children: prod.category }), _jsxs("td", { className: "px-4 py-3 text-sm font-semibold text-indigo-600", children: ["R$ ", prod.price.toFixed(2)] }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex space-x-2 justify-around", children: [_jsx(Button, { size: "sm", className: "px-3 py-1 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition", onClick: () => openEditModal(prod), children: "Editar" }), _jsxs(AlertDialog, { open: alertOpen && productToDelete?.id === prod.id, onOpenChange: setAlertOpen, children: [_jsx(AlertDialogTrigger, { asChild: true, children: _jsx(Button, { size: "sm", className: "px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition", onClick: () => {
                                                                            setProductToDelete(prod);
                                                                            setAlertOpen(true);
                                                                        }, children: "Excluir" }) }), _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { className: "text-lg font-medium text-gray-900", children: "Confirmar Exclus\u00E3o" }), _jsx("p", { className: "text-sm text-gray-600", children: "Tem certeza que deseja excluir este produto?" })] }), _jsxs("div", { className: "flex justify-end space-x-2 mt-4", children: [_jsx(AlertDialogCancel, { asChild: true, children: _jsx(Button, { className: "px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition", children: "Cancelar" }) }), _jsx(AlertDialogAction, { asChild: true, children: _jsx(Button, { className: "px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition", onClick: confirmDelete, children: "Sim, excluir" }) })] })] })] })] }) })] }, prod.id))) }), _jsx("tfoot", { children: _jsx("tr", { children: _jsx("td", { colSpan: 5, children: _jsxs("div", { className: "text-right pr-4 text-sm text-gray-600", children: ["Total de produtos: ", filteredAndSorted.length] }) }) }) })] }) }), _jsxs(Dialog, { open: openDialog, onOpenChange: setOpenDialog, children: [_jsx(DialogTrigger, { asChild: true }), _jsxs(DialogContent, { className: "sm:max-w-lg bg-white rounded-lg shadow-lg", children: [_jsx(DialogHeader, { className: "border-b border-gray-200 px-6 py-4", children: _jsx(DialogTitle, { className: "text-xl font-semibold text-gray-900", children: editingProduct ? "Editar Produto" : "Criar Produto" }) }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "px-6 py-4 space-y-4", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("label", { htmlFor: "title", className: "mb-1 text-sm font-medium text-gray-700", children: "T\u00EDtulo" }), _jsx(Input, { id: "title", ...register("title", { required: true }), className: "bg-white border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md px-3 py-2", placeholder: "Nome do produto" })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { htmlFor: "price", className: "mb-1 text-sm font-medium text-gray-700", children: "Pre\u00E7o" }), _jsx(Input, { id: "price", type: "number", step: "0.01", ...register("price", {
                                                            required: true,
                                                            valueAsNumber: true,
                                                        }), className: "bg-white border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md px-3 py-2", placeholder: "00.00" })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { htmlFor: "category", className: "mb-1 text-sm font-medium text-gray-700", children: "Categoria" }), _jsxs("select", { id: "category", ...register("category", { required: true }), className: "w-full bg-white border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md px-2 py-1", children: [_jsx("option", { value: "", children: "Selecione a categoria" }), categories.map((cat) => (_jsx("option", { value: cat, children: cat }, cat)))] })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { htmlFor: "description", className: "mb-1 text-sm font-medium text-gray-700", children: "Descri\u00E7\u00E3o" }), _jsx("textarea", { id: "description", rows: 3, ...register("description", { required: true }), className: "resize-none rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Descri\u00E7\u00E3o do produto" })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { htmlFor: "image", className: "mb-1 text-sm font-medium text-gray-700", children: "URL da imagem" }), _jsx(Input, { id: "image", ...register("image", { required: true }), className: "bg-white border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md px-3 py-2", placeholder: "https://..." })] }), _jsxs(DialogFooter, { className: "flex justify-end space-x-2 border-t border-gray-200 px-6 py-4", children: [_jsx(Button, { type: "button", className: "px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition", onClick: () => setOpenDialog(false), disabled: isSubmitting, children: "Cancelar" }), _jsx(Button, { type: "submit", className: "px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition", disabled: isSubmitting, children: editingProduct ? "Salvar" : "Criar" })] })] })] })] })] }) }) }));
}
