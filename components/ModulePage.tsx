"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ImagePlus, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/DataTable";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

export type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "select" | "textarea" | "file";
  options?: string[];
  optionSource?: "products" | "branches" | "distributors" | "credits";
  optionFilter?: "central" | "subbranches" | "assigned";
  defaultValue?: string;
  accept?: string;
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
  const [optionRows, setOptionRows] = useState<Record<string, Record<string, unknown>[]>>({});
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const initial = useMemo(() => Object.fromEntries(fields.map((field) => [field.name, field.defaultValue || ""])), [fields]);
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

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) setCurrentUser(json.data);
      });
  }, []);

  useEffect(() => {
    const endpoints: Record<NonNullable<FieldConfig["optionSource"]>, string> = {
      products: "/api/products",
      branches: "/api/branches",
      distributors: "/api/distributors",
      credits: "/api/credits"
    };
    const sources = Array.from(new Set(fields.map((field) => field.optionSource).filter(Boolean))) as NonNullable<FieldConfig["optionSource"]>[];
    sources.forEach((source) => {
      fetch(endpoints[source], { cache: "no-store" })
        .then((response) => response.json())
        .then((json) => {
          if (json.success) setOptionRows((current) => ({ ...current, [source]: Array.isArray(json.data) ? json.data : [] }));
        });
    });
  }, [fields]);

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
                    {field.optionSource
                      ? filterOptions(optionRows[field.optionSource] || [], field, currentUser).map((option) => (
                          <option key={String(option.id)} value={String(option.id)}>
                            {optionLabel(option, field.optionSource as NonNullable<FieldConfig["optionSource"]>)}
                          </option>
                        ))
                      : field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                  </select>
                ) : field.type === "file" ? (
                  <FileInput
                    field={field}
                    value={values[field.name] || ""}
                    onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))}
                  />
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

function FileInput({ field, value, onChange }: { field: FieldConfig; value: string; onChange: (value: string) => void }) {
  async function handleFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona una imagen válida.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen debe pesar menos de 2 MB para esta demo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result || ""));
    reader.onerror = () => toast.error("No se pudo leer la imagen.");
    reader.readAsDataURL(file);
  }

  return (
    <div className="rounded-lg border border-dashed border-black/15 bg-white p-3">
      <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-md bg-cream-50 px-4 py-5 text-center transition hover:bg-cream-100">
        <ImagePlus className="h-6 w-6 text-black/55" />
        <span className="mt-2 text-sm font-semibold text-ink">Subir imagen</span>
        <span className="mt-1 text-xs text-black/50">Galería, cámara o archivos</span>
        <input className="sr-only" type="file" accept={field.accept || "image/*"} required={field.required && !value} onChange={(event) => void handleFile(event.target.files?.[0])} />
      </label>
      {value && (
        <div className="mt-3 flex items-center gap-3">
          <Image src={value} alt="Vista previa" width={56} height={56} unoptimized className="h-14 w-14 rounded-md border border-black/10 object-cover" />
          <button className="btn-secondary h-9 px-3 text-xs" type="button" onClick={() => onChange("")}>
            Quitar
          </button>
        </div>
      )}
    </div>
  );
}

function optionLabel(option: Record<string, unknown>, source: NonNullable<FieldConfig["optionSource"]>) {
  if (source === "credits") {
    return `${option.distributorName || option.id} - ${option.status || "Crédito"}`;
  }
  return String(option.name || option.productName || option.id);
}

function filterOptions(options: Record<string, unknown>[], field: FieldConfig, currentUser: SessionUser | null) {
  if (field.optionSource !== "branches" || !field.optionFilter) return options;
  return options.filter((option) => {
    if (field.optionFilter === "central") return option.type === "Tienda central";
    if (field.optionFilter === "subbranches") return option.type === "Punto de venta / sucursal";
    if (!currentUser || currentUser.role === "Admin") return true;
    return currentUser.assignedBranches.includes(String(option.id));
  });
}
