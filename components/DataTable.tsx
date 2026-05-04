"use client";

import { downloadCsv } from "@/lib/utils";

export type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

export function DataTable<T extends Record<string, unknown>>({ title, rows, columns }: { title?: string; rows: T[]; columns: Column<T>[] }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-black/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {title && <h3 className="font-semibold">{title}</h3>}
          <p className="text-sm text-black/55">{rows.length} registros</p>
        </div>
        <button className="btn-secondary h-10" onClick={() => downloadCsv(`${title || "datos"}.csv`, rows)}>
          Exportar CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-cream-100 text-xs uppercase tracking-[0.12em] text-black/55">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="px-4 py-3 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {rows.map((row, index) => (
              <tr key={String(row.id || index)} className="bg-white/70">
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-4 py-3 align-top">
                    {column.render ? column.render(row) : String(row[column.key as keyof T] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <div className="p-8 text-center text-sm text-black/55">No hay registros para mostrar.</div>}
    </div>
  );
}
