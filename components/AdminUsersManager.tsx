"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Edit3, ShieldCheck, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { emptyPermissions } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  normalizePermissions,
  permissionDescriptions,
  permissionGroups,
  permissionLabels,
  permissionPresets
} from "@/lib/permissions";
import type { Branch, PermissionKey, PermissionMap, Role, SessionUser } from "@/types";

type UserForm = {
  id: string;
  name: string;
  username: string;
  password: string;
  role: Role;
  active: boolean;
  assignedBranches: string[];
  permissions: PermissionMap;
};

const newUserForm: UserForm = {
  id: "",
  name: "",
  username: "",
  password: "",
  role: "Tienda",
  active: true,
  assignedBranches: [],
  permissions: permissionPresets[0].permissions
};

export function AdminUsersManager() {
  const [users, setUsers] = useState<SessionUser[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [form, setForm] = useState<UserForm>(newUserForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedUser = users.find((user) => user.id === form.id);
  const isEditing = Boolean(form.id);
  const branchName = useMemo(() => new Map(branches.map((branch) => [branch.id, branch.name])), [branches]);

  const load = useCallback(async () => {
    setLoading(true);
    const [usersResponse, branchesResponse] = await Promise.all([
      fetch("/api/users", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/branches", { cache: "no-store" }).then((response) => response.json())
    ]);
    if (usersResponse.success) setUsers(usersResponse.data);
    else toast.error(usersResponse.error || "No se pudieron cargar usuarios.");
    if (branchesResponse.success) {
      setBranches(branchesResponse.data);
      setForm((current) => ({
        ...current,
        assignedBranches: current.assignedBranches.length ? current.assignedBranches : [branchesResponse.data[0]?.id].filter(Boolean)
      }));
    } else {
      toast.error(branchesResponse.error || "No se pudieron cargar ubicaciones.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function startNew() {
    setForm({
      ...newUserForm,
      assignedBranches: [branches[0]?.id].filter(Boolean)
    });
  }

  function editUser(user: SessionUser) {
    setForm({
      id: user.id,
      name: user.name,
      username: user.username,
      password: "",
      role: user.role,
      active: user.active,
      assignedBranches: user.assignedBranches,
      permissions: normalizePermissions(user.permissions)
    });
  }

  function setPermission(permission: PermissionKey, value: boolean) {
    setForm((current) => ({
      ...current,
      permissions: { ...current.permissions, [permission]: value }
    }));
  }

  function toggleBranch(branchId: string) {
    setForm((current) => {
      const exists = current.assignedBranches.includes(branchId);
      const assignedBranches = exists
        ? current.assignedBranches.filter((id) => id !== branchId)
        : [...current.assignedBranches, branchId];
      return { ...current, assignedBranches };
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.username.trim()) return toast.error("Nombre y usuario son obligatorios.");
    if (!isEditing && !form.password.trim()) return toast.error("La contraseña es obligatoria para usuarios nuevos.");
    if (form.role === "Tienda" && !form.assignedBranches.length) return toast.error("Asigná al menos una ubicación.");

    setSaving(true);
    const payload = {
      id: form.id || undefined,
      name: form.name.trim(),
      username: form.username.trim(),
      password: form.password.trim() || undefined,
      role: form.role,
      active: form.active,
      assignedBranches: form.role === "Admin" ? branches.map((branch) => branch.id) : form.assignedBranches,
      permissions: form.role === "Admin" ? emptyPermissions : normalizePermissions(form.permissions)
    };
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await response.json();
    setSaving(false);
    if (json.success) {
      toast.success(isEditing ? "Usuario actualizado." : "Usuario creado.");
      await load();
      if (!isEditing) startNew();
    } else {
      toast.error(json.error || "No se pudo guardar usuario.");
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">Admin</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-normal">Usuarios y permisos</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60">
            Creá usuarios, asigná ubicaciones y decidí exactamente qué puede hacer cada usuario de tienda.
          </p>
        </div>
        <button className="btn-secondary" type="button" onClick={startNew}>
          <UserPlus className="h-4 w-4" />
          Nuevo usuario
        </button>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="panel overflow-hidden">
          <div className="border-b border-black/10 p-4">
            <h2 className="font-semibold">Usuarios</h2>
            <p className="text-sm text-black/55">{loading ? "Cargando..." : `${users.length} usuarios configurados`}</p>
          </div>
          <div className="divide-y divide-black/10">
            {users.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => editUser(user)}
                className={cn("block w-full p-4 text-left transition hover:bg-cream-100", form.id === user.id && "bg-cream-100")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-black/55">@{user.username} · {user.role}</p>
                    <p className="mt-1 text-xs text-black/45">
                      {user.role === "Admin"
                        ? "Todas las ubicaciones"
                        : user.assignedBranches.map((id) => branchName.get(id) || id).join(", ") || "Sin ubicación"}
                    </p>
                  </div>
                  <span className={cn("rounded-full px-2 py-1 text-xs font-semibold", user.active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
                    {user.active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <form className="panel p-4" onSubmit={submit}>
          <div className="flex items-center gap-2">
            {isEditing ? <Edit3 className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            <h2 className="font-semibold">{isEditing ? `Editar ${selectedUser?.name || "usuario"}` : "Nuevo usuario"}</h2>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Nombre</span>
              <input className="field" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Usuario</span>
              <input className="field" value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} required />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">{isEditing ? "Nueva contraseña opcional" : "Contraseña"}</span>
              <input className="field" type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required={!isEditing} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Rol</span>
              <select
                className="field"
                value={form.role}
                onChange={(event) => {
                  const role = event.target.value as Role;
                  setForm((current) => ({
                    ...current,
                    role,
                    permissions: role === "Admin" ? emptyPermissions : current.permissions,
                    assignedBranches: role === "Admin" ? branches.map((branch) => branch.id) : current.assignedBranches
                  }));
                }}
              >
                <option value="Tienda">Tienda</option>
                <option value="Admin">Admin</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-cream-100 p-3">
            <button
              type="button"
              onClick={() => setForm((current) => ({ ...current, active: !current.active }))}
              className={cn("inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold", form.active ? "bg-ink text-white" : "bg-white text-black/65")}
            >
              {form.active ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {form.active ? "Usuario activo" : "Usuario inactivo"}
            </button>
            <p className="text-sm text-black/55">Si está inactivo, no podrá iniciar sesión.</p>
          </div>

          <section className="mt-5">
            <h3 className="font-semibold">Ubicaciones asignadas</h3>
            <p className="mt-1 text-sm text-black/55">El usuario solo verá y operará estas ubicaciones.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {branches.map((branch) => (
                <label key={branch.id} className={cn("flex cursor-pointer items-center justify-between rounded-lg border p-3", form.assignedBranches.includes(branch.id) ? "border-ink bg-ink text-white" : "border-black/10 bg-white")}>
                  <span>
                    <span className="block font-semibold">{branch.name}</span>
                    <span className={cn("text-xs", form.assignedBranches.includes(branch.id) ? "text-white/70" : "text-black/45")}>{branch.type}</span>
                  </span>
                  <input className="h-5 w-5 accent-black" type="checkbox" checked={form.assignedBranches.includes(branch.id)} onChange={() => toggleBranch(branch.id)} disabled={form.role === "Admin"} />
                </label>
              ))}
            </div>
          </section>

          <section className="mt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="font-semibold">Permisos de tienda</h3>
                <p className="mt-1 text-sm text-black/55">Podés activar o quitar cada opción. Admin siempre ve todo.</p>
              </div>
              {form.role === "Tienda" && (
                <div className="flex flex-wrap gap-2">
                  {permissionPresets.map((preset) => (
                    <button key={preset.id} type="button" className="btn-secondary h-9 px-3 text-xs" onClick={() => setForm((current) => ({ ...current, permissions: normalizePermissions(preset.permissions) }))}>
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {form.role === "Admin" ? (
              <div className="mt-3 rounded-lg border border-ink bg-ink p-4 text-white">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  <p className="font-semibold">Admin tiene acceso completo</p>
                </div>
                <p className="mt-2 text-sm text-white/70">Puede ver dashboard, editar catálogos, usuarios, precios, inventario, reportes y configuración.</p>
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                {permissionGroups.map((group) => (
                  <div key={group.title} className="rounded-lg border border-black/10 bg-white p-3">
                    <h4 className="font-semibold">{group.title}</h4>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {group.keys.map((permission) => (
                        <PermissionToggle
                          key={permission}
                          permission={permission}
                          checked={form.permissions[permission]}
                          onChange={(value) => setPermission(permission, value)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <button className="btn-primary mt-5 w-full sm:w-auto" disabled={saving}>
            {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear usuario"}
          </button>
        </form>
      </section>
    </div>
  );
}

function PermissionToggle({ permission, checked, onChange }: { permission: PermissionKey; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn("rounded-lg border p-3 text-left transition", checked ? "border-ink bg-ink text-white" : "border-black/10 bg-cream-50 hover:bg-cream-100")}
    >
      <div className="flex items-start gap-3">
        <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border", checked ? "border-white bg-white text-ink" : "border-black/20 bg-white text-transparent")}>
          <Check className="h-3.5 w-3.5" />
        </span>
        <span>
          <span className="block font-semibold">{permissionLabels[permission]}</span>
          <span className={cn("mt-1 block text-xs leading-5", checked ? "text-white/70" : "text-black/50")}>{permissionDescriptions[permission]}</span>
        </span>
      </div>
    </button>
  );
}
