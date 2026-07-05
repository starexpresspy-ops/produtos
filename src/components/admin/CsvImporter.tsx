"use client";

import { useActionState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import type { ImportResult } from "@/types/actions";

interface CsvImporterProps {
  title: string;
  description: string;
  templateHeaders: string;
  templateExample: string;
  action: (formData: FormData) => Promise<ImportResult>;
}

export function CsvImporter({
  title,
  description,
  templateHeaders,
  templateExample,
  action,
}: CsvImporterProps) {
  const [state, formAction, pending] = useActionState<ImportResult, FormData>(
    async (_prev, formData) => action(formData),
    {},
  );

  function downloadTemplate() {
    const content = `${templateHeaders}\n${templateExample}`;
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="border-border bg-surface rounded-[var(--radius-card)] border p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <FileSpreadsheet className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-foreground text-lg font-semibold">{title}</h2>
          <p className="text-muted mt-1 text-sm">{description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={downloadTemplate}
        className="text-primary hover:text-primary-hover mb-4 text-sm font-semibold underline"
      >
        Baixar modelo CSV
      </button>

      {state?.error ? (
        <div className="bg-danger/10 text-danger mb-4 rounded-lg px-4 py-3 text-sm">
          {state.error}
        </div>
      ) : null}

      {state?.success ? (
        <div className="bg-primary/10 text-primary mb-4 rounded-lg px-4 py-3 text-sm">
          Importacao concluida: {state.imported ?? 0} importado(s),{" "}
          {state.skipped ?? 0} ignorado(s).
          {state.details && state.details.length > 0 ? (
            <ul className="mt-2 list-inside list-disc text-xs">
              {state.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <form action={formAction} encType="multipart/form-data" className="flex flex-wrap items-end gap-4">
        <div>
          <label
            htmlFor={`csv-${title}`}
            className="text-foreground mb-1.5 block text-sm font-medium"
          >
            Arquivo CSV
          </label>
          <input
            id={`csv-${title}`}
            name="file"
            type="file"
            accept=".csv,text/csv"
            required
            className="text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="bg-primary hover:bg-primary-hover inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          {pending ? "Importando..." : "Importar CSV"}
        </button>
      </form>
    </section>
  );
}
