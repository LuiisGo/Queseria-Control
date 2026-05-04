"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Minus, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { hasPermission, permissionLabels } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { Branch, Distributor, InventoryItem, PermissionKey, Product, SessionUser, StoreSummary } from "@/types";

type Payment = "Efectivo" | "Transferencia" | "Crédito";

type LoadState = {
  user: SessionUser | null;
  summary: StoreSummary | null;
  products: Product[];
  inventory: InventoryItem[];
  branches: Branch[];
  distributors: Distributor[];
};

const paymentOptions: Payment[] = ["Efectivo", "Transferencia", "Crédito"];
const wasteReasons = ["Vencido", "Dañado", "Pérdida", "Otro"];

export function StoreSaleFlow() {
  const [state, setState] = useStoreData();
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<Payment>("Efectivo");
  const [distributorId, setDistributorId] = useState("");
  const [saving, setSaving] = useState(false);

  const branchId = state.user?.assignedBranches[0] || "";
  const product = state.products.find((item) => item.id === productId);
  const inventory = state.inventory.find((item) => item.productId === productId && item.branchId === branchId);
  const stock = inventory?.quantity || 0;
  if (state.user && !hasPermission(state.user, "can_register_sales")) return <BlockedFlow title="Vender" permission="can_register_sales" />;

  async function submit() {
    if (!product || quantity <= 0) return toast.error("Elige producto y cantidad.");
    if (quantity > stock) return toast.error("No hay suficiente stock.");
    if (paymentMethod === "Crédito" && !distributorId) return toast.error("Elige distribuidor para crédito.");
    setSaving(true);
    const response = await postJson("/api/sales", {
      branchId,
      customerType: paymentMethod === "Crédito" ? "Distribuidor/mayorista" : "Cliente general",
      distributorId: paymentMethod === "Crédito" ? distributorId : "",
      paymentMethod,
      items: [{ productId, quantity, price: 0, discount: 0, subtotal: 0 }]
    });
    setSaving(false);
    if (response.success) {
      const used = response.data?.items?.[0]?.lotsUsed?.map((lot: { lotNumber: string; quantity: number }) => `${lot.quantity} del lote ${lot.lotNumber}`).join(", ");
      toast.success(used ? `Venta guardada. Salió ${used}.` : "Venta guardada.");
      setProductId("");
      setQuantity(1);
      setPaymentMethod("Efectivo");
      setDistributorId("");
      void setState();
    } else {
      toast.error(response.error || "No se pudo guardar.");
    }
  }

  return (
    <EasyShell title="Vender" subtitle="El sistema usa FIFO y descuenta primero los lotes más próximos a vencer.">
      <Step title="1. ¿Qué producto vendiste?">
        <ProductGrid products={state.products} inventory={state.inventory} branchId={branchId} selectedId={productId} onSelect={(id) => { setProductId(id); setQuantity(1); }} />
      </Step>

      <Step title="2. ¿Cuántos?">
        <QuantityPicker value={quantity} max={stock} onChange={setQuantity} />
        {product && <p className="mt-2 text-sm text-black/55">Stock disponible en {state.summary?.branchName}: {stock}</p>}
      </Step>

      <Step title="3. ¿Cómo pagaron?">
        <ButtonGroup options={paymentOptions} value={paymentMethod} onChange={(value) => setPaymentMethod(value as Payment)} />
        {paymentMethod === "Crédito" && (
          <select className="field mt-3" value={distributorId} onChange={(event) => setDistributorId(event.target.value)}>
            <option value="">Elegir distribuidor</option>
            {state.distributors.map((distributor) => (
              <option key={distributor.id} value={distributor.id}>{distributor.name}</option>
            ))}
          </select>
        )}
      </Step>

      <ConfirmBox
        title="Confirmar venta"
        lines={[
          product ? `${quantity} ${product.name}` : "Elige un producto",
          `Pago: ${paymentMethod}`,
          `Ubicación: ${state.summary?.branchName || ""}`,
          inventory?.lots?.[0] ? `Primer lote a usar: ${inventory.lots[0].lotNumber} vence ${inventory.lots[0].expiresAt || "sin fecha"}` : "Sin lote disponible"
        ]}
        action="Confirmar venta"
        disabled={!product || quantity <= 0 || quantity > stock || saving}
        onConfirm={submit}
      />
    </EasyShell>
  );
}

export function StoreProductionFlow() {
  const [state, reload] = useStoreData();
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [lotNumber, setLotNumber] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);
  const product = state.products.find((item) => item.id === productId);
  const isCentral = state.summary?.branchType === "Tienda central";
  if (state.user && !hasPermission(state.user, "can_register_entries")) return <BlockedFlow title="Registrar producción" permission="can_register_entries" />;

  async function submit() {
    if (!product || quantity <= 0 || !lotNumber || !expiresAt) return toast.error("Completa producto, cantidad, lote y vencimiento.");
    setSaving(true);
    const response = await postJson("/api/production", { productId, branchId: "BR001", quantity, lotNumber, expiresAt });
    setSaving(false);
    if (response.success) {
      toast.success("Producción guardada y sumada a Central.");
      setProductId("");
      setQuantity(1);
      setLotNumber("");
      setExpiresAt("");
      void reload();
    } else toast.error(response.error || "No se pudo guardar.");
  }

  return (
    <EasyShell title="Registrar producción" subtitle="Esto suma inventario a Central con código de lote y vencimiento.">
      {!isCentral && state.summary ? (
        <section className="panel p-4">
          <h2 className="text-lg font-semibold">Producción solo en Central</h2>
          <p className="mt-2 text-sm text-black/60">Las subsucursales no registran entradas. Cuando Central envía producto, su inventario se actualiza automáticamente.</p>
        </section>
      ) : null}
      {isCentral || !state.summary ? (
        <>
      <Step title="1. ¿Qué se produjo?">
        <ProductGrid products={state.products} inventory={state.inventory} branchId="BR001" selectedId={productId} onSelect={setProductId} showStock={false} />
      </Step>
      <Step title="2. ¿Cuántas unidades?">
        <QuantityPicker value={quantity} onChange={setQuantity} />
      </Step>
      <Step title="3. Lote y vencimiento">
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Código de lote</span>
            <input className="field" value={lotNumber} onChange={(event) => setLotNumber(event.target.value)} placeholder="001" />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Fecha de vencimiento</span>
            <input className="field" type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />
          </label>
        </div>
      </Step>
      <ConfirmBox
        title="Confirmar producción"
        lines={[product ? `${quantity} ${product.name}` : "Elige un producto", `Lote: ${lotNumber || "pendiente"}`, `Vence: ${expiresAt || "pendiente"}`, "Destino: Central"]}
        action="Guardar producción"
        disabled={!product || !lotNumber || !expiresAt || saving}
        onConfirm={submit}
      />
        </>
      ) : null}
    </EasyShell>
  );
}

export function StoreTransferFlow() {
  const [state, reload] = useStoreData();
  const [destinationBranchId, setDestinationBranchId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [saving, setSaving] = useState(false);
  const destination = state.branches.find((branch) => branch.id === destinationBranchId);
  const product = state.products.find((item) => item.id === productId);
  const inventory = state.inventory.find((item) => item.productId === productId && item.branchId === "BR001");
  const stock = inventory?.quantity || 0;
  const isCentral = state.summary?.branchType === "Tienda central";
  if (state.user && !hasPermission(state.user, "can_register_transfers")) return <BlockedFlow title="Enviar a tienda" permission="can_register_transfers" />;

  async function submit() {
    if (!destination || !product || quantity <= 0) return toast.error("Completa destino, producto y cantidad.");
    if (quantity > stock) return toast.error("No hay suficiente stock en Central.");
    setSaving(true);
    const response = await postJson("/api/transfers", {
      originBranchId: "BR001",
      destinationBranchId,
      items: [{ productId, quantity, price: 0, discount: 0, subtotal: 0 }]
    });
    setSaving(false);
    if (response.success) {
      toast.success("Envío guardado. El inventario de la tienda ya fue actualizado.");
      setDestinationBranchId("");
      setProductId("");
      setQuantity(1);
      void reload();
    } else toast.error(response.error || "No se pudo guardar.");
  }

  return (
    <EasyShell title="Enviar a tienda" subtitle="Central descuenta inventario y la tienda recibe automáticamente.">
      {!isCentral && state.summary ? (
        <section className="panel p-4">
          <h2 className="text-lg font-semibold">Envíos solo desde Central</h2>
          <p className="mt-2 text-sm text-black/60">Las subsucursales solo venden y registran mermas. No necesitan recibir producto manualmente.</p>
        </section>
      ) : null}
      {isCentral || !state.summary ? (
        <>
      <Step title="1. ¿A qué tienda vas a enviar?">
        <ButtonGrid options={state.branches.filter((branch) => branch.type === "Punto de venta / sucursal").map((branch) => ({ id: branch.id, label: branch.name }))} value={destinationBranchId} onChange={setDestinationBranchId} />
      </Step>
      <Step title="2. ¿Qué producto?">
        <ProductGrid products={state.products} inventory={state.inventory} branchId="BR001" selectedId={productId} onSelect={(id) => { setProductId(id); setQuantity(1); }} />
      </Step>
      <Step title="3. Cantidad">
        <QuantityPicker value={quantity} max={stock} onChange={setQuantity} />
      </Step>
      <ConfirmBox
        title="Confirmar envío"
        lines={[
          destination ? `Enviar a: ${destination.name}` : "Elige tienda",
          product ? `${quantity} ${product.name}` : "Elige producto",
          "Sale de: Central",
          inventory?.lots?.[0] ? `Primer lote a usar: ${inventory.lots[0].lotNumber}` : "Sin lote disponible"
        ]}
        action="Confirmar envío"
        disabled={!destination || !product || quantity > stock || saving}
        onConfirm={submit}
      />
        </>
      ) : null}
    </EasyShell>
  );
}

export function StoreInventoryEasy() {
  const [state] = useStoreData();
  if (state.user && !hasPermission(state.user, "can_view_inventory")) return <BlockedFlow title="Inventario" permission="can_view_inventory" />;
  return (
    <EasyShell title="Inventario" subtitle="Stock por producto, lote y vencimiento.">
      <div className="grid gap-3 md:grid-cols-2">
        {state.inventory.map((item) => (
          <div key={item.id} className="rounded-lg border border-black/10 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{item.productName}</h2>
                <p className="text-sm text-black/55">{item.branchName}</p>
              </div>
              <p className="rounded-lg bg-ink px-3 py-2 text-lg font-bold text-white">{item.quantity}</p>
            </div>
            <div className="mt-4 space-y-2">
              {item.lots.length ? item.lots.map((lot) => (
                <div key={lot.id} className={cn("rounded-lg p-3 text-sm", isSoon(lot.expiresAt) ? "bg-amber-50 text-amber-900" : "bg-cream-100 text-black/70")}>
                  <p className="font-semibold">Lote {lot.lotNumber}: {lot.quantity} unidades</p>
                  <p>Vence: {lot.expiresAt || "Sin fecha"}</p>
                  {isSoon(lot.expiresAt) && <p className="mt-1 flex items-center gap-1 font-semibold"><AlertTriangle className="h-4 w-4" /> Próximo a vencer</p>}
                </div>
              )) : <p className="text-sm text-black/50">Sin lotes disponibles.</p>}
            </div>
          </div>
        ))}
      </div>
    </EasyShell>
  );
}

export function StoreWasteFlow() {
  const [state, reload] = useStoreData();
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("Vencido");
  const [saving, setSaving] = useState(false);
  const branchId = state.user?.assignedBranches[0] || "";
  const product = state.products.find((item) => item.id === productId);
  const inventory = state.inventory.find((item) => item.productId === productId && item.branchId === branchId);
  const stock = inventory?.quantity || 0;
  if (state.user && !hasPermission(state.user, "can_register_waste")) return <BlockedFlow title="Registrar merma" permission="can_register_waste" />;

  async function submit() {
    if (!product || quantity <= 0) return toast.error("Elige producto y cantidad.");
    if (quantity > stock) return toast.error("No hay suficiente stock.");
    setSaving(true);
    const response = await postJson("/api/waste", { branchId, productId, quantity, reason });
    setSaving(false);
    if (response.success) {
      toast.success("Merma guardada.");
      setProductId("");
      setQuantity(1);
      setReason("Vencido");
      void reload();
    } else toast.error(response.error || "No se pudo guardar.");
  }

  return (
    <EasyShell title="Registrar merma" subtitle="Producto vencido, dañado o perdido.">
      <Step title="1. ¿Qué producto se perdió o dañó?">
        <ProductGrid products={state.products} inventory={state.inventory} branchId={branchId} selectedId={productId} onSelect={(id) => { setProductId(id); setQuantity(1); }} />
      </Step>
      <Step title="2. Cantidad">
        <QuantityPicker value={quantity} max={stock} onChange={setQuantity} />
      </Step>
      <Step title="3. Motivo">
        <ButtonGroup options={wasteReasons} value={reason} onChange={setReason} />
      </Step>
      <ConfirmBox
        title="Confirmar merma"
        lines={[product ? `${quantity} ${product.name}` : "Elige producto", `Motivo: ${reason}`, `Ubicación: ${state.summary?.branchName || ""}`]}
        action="Guardar merma"
        disabled={!product || quantity > stock || saving}
        onConfirm={submit}
      />
    </EasyShell>
  );
}

function BlockedFlow({ title, permission }: { title: string; permission: PermissionKey }) {
  return (
    <EasyShell title={title} subtitle="Tu usuario no tiene permiso para usar esta opción. Pedí al Admin que lo active en Usuarios y permisos.">
      <section className="panel p-4">
        <h2 className="text-lg font-semibold">Permiso requerido</h2>
        <p className="mt-2 text-sm text-black/60">{permissionLabels[permission]}</p>
      </section>
    </EasyShell>
  );
}

function EasyShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <section>
        <h1 className="font-display text-3xl font-semibold tracking-normal">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60">{subtitle}</p>
      </section>
      {children}
    </div>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ProductGrid({ products, inventory, branchId, selectedId, onSelect, showStock = true }: { products: Product[]; inventory: InventoryItem[]; branchId: string; selectedId: string; onSelect: (id: string) => void; showStock?: boolean }) {
  const cards = products.map((product) => ({
    product,
    stock: inventory.find((item) => item.productId === product.id && item.branchId === branchId)?.quantity || 0
  }));
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(({ product, stock }) => (
        <button
          key={product.id}
          type="button"
          onClick={() => onSelect(product.id)}
          className={cn("min-h-28 rounded-lg border p-4 text-left transition", selectedId === product.id ? "border-ink bg-ink text-white" : "border-black/10 bg-white hover:bg-cream-100")}
        >
          <div className="flex items-center gap-3">
            <ProductImage product={product} />
            <div>
              <p className="text-lg font-semibold">{product.name}</p>
              {showStock && <p className={cn("text-sm", selectedId === product.id ? "text-white/70" : "text-black/55")}>Stock: {stock}</p>}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function ProductImage({ product }: { product: Product }) {
  if (product.imageData) {
    return <Image src={product.imageData} alt={product.name} width={56} height={56} unoptimized className="h-14 w-14 rounded-lg border border-black/10 object-cover" />;
  }
  return <div className="grid h-14 w-14 place-items-center rounded-lg bg-cream-100 text-lg font-bold">{product.name.slice(0, 1)}</div>;
}

function QuantityPicker({ value, max, onChange }: { value: number; max?: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button className="btn-secondary h-14 w-14 p-0" type="button" onClick={() => onChange(Math.max(1, value - 1))}><Minus className="h-5 w-5" /></button>
      <input className="field h-14 max-w-32 text-center text-2xl font-bold" type="number" min={1} max={max} value={value} onChange={(event) => onChange(Math.max(1, Number(event.target.value || 1)))} />
      <button className="btn-secondary h-14 w-14 p-0" type="button" onClick={() => onChange(max ? Math.min(max, value + 1) : value + 1)}><Plus className="h-5 w-5" /></button>
      {max !== undefined && <p className="text-sm text-black/55">Máximo: {max}</p>}
    </div>
  );
}

function ButtonGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return <ButtonGrid options={options.map((option) => ({ id: option, label: option }))} value={value} onChange={onChange} />;
}

function ButtonGrid({ options, value, onChange }: { options: Array<{ id: string; label: string }>; value: string; onChange: (value: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((option) => (
        <button key={option.id} type="button" onClick={() => onChange(option.id)} className={cn("rounded-lg border p-4 text-left text-lg font-semibold transition", value === option.id ? "border-ink bg-ink text-white" : "border-black/10 bg-white hover:bg-cream-100")}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ConfirmBox({ title, lines, action, disabled, onConfirm }: { title: string; lines: string[]; action: string; disabled?: boolean; onConfirm: () => void }) {
  return (
    <section className="rounded-lg border border-ink bg-ink p-4 text-white">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="mt-3 space-y-1 text-sm text-white/75">
        {lines.map((line) => <p key={line}>{line}</p>)}
      </div>
      <button className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 font-semibold text-ink disabled:opacity-50 sm:w-auto" type="button" disabled={disabled} onClick={onConfirm}>
        <Send className="h-4 w-4" />
        {action}
      </button>
    </section>
  );
}

function useStoreData(): [LoadState, () => Promise<void>] {
  const [state, setState] = useState<LoadState>({ user: null, summary: null, products: [], inventory: [], branches: [], distributors: [] });
  async function load() {
    const [me, summary, products, inventory, branches, distributors] = await Promise.all([
      fetchJson("/api/auth/me"),
      fetchJson("/api/reports/store-summary"),
      fetchJson("/api/products"),
      fetchJson("/api/inventory"),
      fetchJson("/api/branches"),
      fetchJson("/api/distributors")
    ]);
    setState({
      user: me.data || null,
      summary: summary.data || null,
      products: products.data || [],
      inventory: inventory.data || [],
      branches: branches.data || [],
      distributors: distributors.data || []
    });
  }
  useEffect(() => {
    void load();
  }, []);
  return [state, load];
}

async function fetchJson(path: string) {
  const response = await fetch(path, { cache: "no-store" });
  return response.json();
}

async function postJson(path: string, body: Record<string, unknown>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return response.json();
}

function isSoon(expiresAt?: string) {
  if (!expiresAt) return false;
  const days = (new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 10;
}
