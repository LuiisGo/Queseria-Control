"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/DataTable";
import { cn } from "@/lib/utils";

export type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "select" | "textarea";
  options?: string[];
  required?: boolean;
  placeholder?: string;
};

type ModulePageProps = {
  title: string;
  description: string;
  endpoint: string;
  columns: Column<Record<string, unknown>>[];
  fields?: FieldConfig[];
  formTitle?: string;
  transformSubmit?: (values: Record<string, string>) => Record<string, unknown>;
};

export function ModulePage({ title, description, endpoint, columns, fields = [], formTitle = "Nuevo registro", transformSubmit }: ModulePageProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const initial = useMemo(() => Object.fromEntries(fields.map((field) => [field.name, ""])), [fields]);
  const [values, setValues] = useState<Record<string, string>>(initial);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch(endpoint, { cache: "no-store" });
    const json = await response.json();
    if (json.success) setRows(Array.isArray(json.data) ? json.data : json.data?.rows || []);
    else toast.error(json.error || "No se pudo cargar.");
    setLoading(false);
  }, [endpoint]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const payload = transformSubmit ? transformSubmit(values) : values;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await response.json();
    if (json.success) {
      toast.success(json.message || "Guardado.");
      setValues(initial);
      await load();
    } else {
      toast.error(json.error || "No se pudo guardar.");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">Quesería San Antonio</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-normal">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60">{description}</p>
        </div>
        <button className="btn-secondary" onClick={load}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Actualizar
        </button>
      </section>

      {!!fields.length && (
        <form className="panel p-4" onSubmit={submit}>
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            <h2 className="font-semibold">{formTitle}</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {fields.map((field) => (
              <label key={field.name} className={cn(field.type === "textarea" && "md:col-span-2")}>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">{field.label}</span>
                {field.type === "select" ? (
                  <select className="field" required={field.required} value={values[field.name] || ""} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}>
                    <option value="">Seleccionar</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea className="field h-24 py-3" placeholder={field.placeholder} value={values[field.name] || ""} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))} />
                ) : (
                  <input className="field" type={field.type || "text"} required={field.required} placeholder={field.placeholder} value={values[field.name] || ""} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))} />
                )}
              </label>
            ))}
          </div>
          <button className="btn-primary mt-4 w-full sm:w-auto" disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </form>
      )}

      <DataTable title={title} rows={rows} columns={columns} />
    </div>
  );
}
