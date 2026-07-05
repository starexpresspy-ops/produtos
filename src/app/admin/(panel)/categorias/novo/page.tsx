import { CategoryForm } from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="text-foreground mb-6 text-2xl font-bold">
        Cadastrar categoria
      </h1>
      <CategoryForm />
    </div>
  );
}
