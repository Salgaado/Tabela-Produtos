# Tabela de Produtos

Este repositório contém um aplicativo web em React + TypeScript para listar, filtrar e gerenciar produtos via chamadas a uma API remota. Ele foi configurado para fazer deploy tanto no Vercel (com variáveis de ambiente) quanto no GitHub Pages (gerando a saída em `docs/`).

## Visão Geral

- **Frontend:** React + TypeScript + Vite  
- **UI Components:** Radix UI, Tailwind CSS  
- **Gerenciamento de Estado & Formulários:** React Hook Form, React Query  
- **Deploy:** Vercel (produção) e GitHub Pages (estático em `/docs`)

## Funcionalidades

- Exibição de lista de produtos com ID, título, categoria e preço  
- Filtro por título (campo de busca)  
- Filtro por categoria (select único)  
- Ordenação por preço (crescente, decrescente ou normal)  
- Criação, edição e exclusão de produtos (via modal e alert dialog)  
- Tratamento de loading e erros na tela  

Visite https://tabela-produtos-5k9azy0p6-daniel-salgados-projects-206cd70d.vercel.app/ para ver a page em produção

├─ docs/                
│   ├─ assets/
│   ├─ index.html
│   └─ .nojekyll
├─ public/                
├─ src/
│   ├─ components/ui/    
│   ├─ hooks/
│   │   └─ useProducts.ts 
│   │   └─ utils.ts     
│   ├─ pages/
│   │   └─ ProductsPage.tsx 
│   ├─ types/
│   │   └─ product.ts      
│   ├─ App.tsx
│   ├─ main.tsx
│   └─ vite-env.d.ts
├─ tsconfig.json        
├─ vite.config.ts         
├─ package.json
└─ README.md             
