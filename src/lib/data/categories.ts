import type { Category } from "@/types";

export const DEMO_CATEGORIES: Category[] = [
  {
    id: "cat-eletronicos",
    name: "Eletronicos",
    slug: "eletronicos",
    description: "Smartphones, fones, relogios e gadgets.",
    active: true,
    sortOrder: 1,
  },
  {
    id: "cat-perfumes",
    name: "Perfumes",
    slug: "perfumes",
    description: "Fragrancias importadas originais.",
    active: true,
    sortOrder: 2,
  },
  {
    id: "cat-acessorios",
    name: "Acessorios",
    slug: "acessorios",
    description: "Capinhas, cabos, bolsas e itens premium.",
    active: true,
    sortOrder: 3,
  },
];
