"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  CreditCard,
  Minus,
  Package,
  Plus,
  Send,
  ShoppingCart,
  Truck,
  Users,
  Wheat
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Branch, Distributor, InventoryItem, Product } from "@/types";

type Flow = "production" | "transfer" | "distributor-sale" | "loss";
type Payment = "Efectivo" | "Transferencia" | "Crédito";

type AdminData = {
  products: Product[];
  inventory: InventoryItem[];
  branches: Branch[];
  distributors: Distributor[];
};

const flowOptions: Array<{ id: Flow; label: string; icon: typeof Wheat; description: string }> = [
  { id: "production", label: "Registrar producción", icon: Wheat, description: "Producto terminado entra a Central con lote." },
  { id: "transfer", label: "Enviar a tienda", icon: Truck, description: "Central descuenta y la tienda recibe automático." },
  { id: "distributor-sale", label: "Venta a distribuidor", icon: ShoppingCart, description: "Contado o crédito, con cuenta por cobrar." },
  { id: "loss", label: "Registrar pérdida", icon: AlertTriangle, description: "Vencido, dañado o perdido por ubicación." }
];

const quickLinks = [
  { href: "/admin/inventario", label: "Inventario", icon: Boxes },
  { href: "/admin/productos", label: "Productos y precios", icon: Package },
  { href: "/admin/distribuidores", label: "Clientes distribuidores", icon: Users },
  { href: "/admin/creditos", label: "Cuentas por cobrar", icon: CreditCard },
  { href: "/admin/ubicaciones", label: "Ubicaciones", icon: Boxes },
  { href: "/admin/ventas", label: "Historial de ventas", icon: ShoppingCart },
  { href: "/admin/envios", label: "Historial de envíos", icon: Truck },
  { href: "/admin/mermas", label: "Historial de pérdidas", icon: AlertTriangle }
];

export function AdminOperateCenter() {
  const [flow, setFlow] = useState<Flow>("production");
  const [data, setData] = useState<AdminData>({ products: [], inventory: [], branches: [], distributors: [] });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [products, inventory, branches, distributors] = await Promise.all([
      fetchJson("/api/products"),
      fetchJson("/api/inventory"),
      fetchJson("/api/branches"),
      fetchJson("/api/distributors")
    ]);
    setData({
      products: products.success ? products.data : [],
      inventory: inventory.success ? inventory.data : [],
      branches: branches.success ? branches.data : [],
      distributors: distributors.success ? distributors.data : []
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">Admin</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-normal">Operar</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60">
            Acciones principales en pasos cortos, con SKU visible y sin escribir códigos manualmente.
          </p>
        </div>
        <button className="btn-secondary" type="button" onClick={() => void load()}>
          Actualizar
        </button>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {flowOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setFlow(option.id)}
              className={cn(
                "min-h-32 rounded-lg border p-4 text-left transition hover:-translate-y-0.5",
                flow === option.id ? "border-ink bg-ink text-white shadow-soft" : "border-black/10 bg-white hover:bg-cream-100"
              )}
            >
              <Icon className="h-7 w-7" />
              <p className="mt-4 text-lg font-semibold">{option.label}</p>
              <p className={cn("mt-1 text-sm leading-5", flow === option.id ? "text-white/70" : "text-black/55")}>{option.description}</p>
            </button>
          );
        })}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="flex items-center justify-between rounded-lg border border-black/10 bg-white p-4 transition hover:bg-cream-100">
              <span className="flex items-center gap-3 font-semibold">
                <Icon className="h-5 w-5" />
                {link.label}
              </span>
              <ArrowRight className="h-4 w-4 text-black/45" />
            </Link>
          );
        })}
      </section>

      {loading ? <div className="panel p-8 text-center text-sm text-black/55">Cargando opciones...</div> : null}
      {!loading && flow === "production" ? <AdminProductionFlow data={data} onDone={load} /> : null}
      {!loading && flow === "transfer" ? <AdminTransferFlow data={data} onDone={load} /> : null}
      {!loading && flow === "distributor-sale" ? <AdminDistributorSaleFlow data={data} onDone={load} /> : null}
      {!loading && flow === "loss" ? <AdminLossFlow data={data} onDone={load} /> : null}
    </div>
  );
}

function AdminProductionFlow({ data, onDone }: { data: AdminData; onDone: () => Promise<void> }) {
  const central = data.branches.find((branch) => branch.type === "Tienda central") || data.branches[0];
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [lotNumber, setLotNumber] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);
  const product = data.products.find((item) => item.id === productId);

  async function submit() {
    if (!central || !product || !lotNumber || !expiresAt || quantity <= 0) return toast.error("Completa producto, cantidad, lote y vencimiento.");
    setSaving(true);
    const response = await postJson("/api/production", { branchId: central.id, productId, quantity, lotNumber, expiresAt });
    setSaving(false);
    if (response.success) {
      toast.success("Producción guardada.");
      setProductId("");
      setQuantity(1);
      setLotNumber("");
      setExpiresAt("");
      await onDone();
    } else toast.error(response.error || "No se pudo guardar.");
  }

  return (
    <EasyPanel title="Registrar producción" subtitle="El producto entra a Central y queda ordenado por lote para FIFO.">
      <Step title="1. Producto producido">
        <ProductPicker products={data.products} inventory={data.inventory} branchId={central?.id || ""} selectedId={productId} onSelect={setProductId} showStock={false} />
      </Step>
      <Step title="2. Cantidad, lote y vencimiento">
        <div className="grid gap-3 md:grid-cols-[0.8fr_1fr_1fr]">
          <QuantityPicker value={quantity} onChange={setQuantity} />
          <Field label="SKU de lote">
            <input className="field" value={lotNumber} onChange={(event) => setLotNumber(event.target.value)} placeholder="001" />
          </Field>
          <Field label="Vencimiento">
            <input className="field" type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />
          </Field>
        </div>
      </Step>
      <ConfirmBox
        title="Confirmar producción"
        lines={[product ? `${sku(product)} · ${product.name}` : "Elegí producto", `Cantidad: ${quantity}`, `Destino: ${central?.name || "Central"}`, `Lote: ${lotNumber || "pendiente"}`]}
        action="Guardar producción"
        disabled={!product || !lotNumber || !expiresAt || saving}
        onConfirm={submit}
      />
    </EasyPanel>
  );
}

function AdminTransferFlow({ data, onDone }: { data: AdminData; onDone: () => Promise<void> }) {
  const central = data.branches.find((branch) => branch.type === "Tienda central") || data.branches[0];
  const subbranches = data.branches.filter((branch) => branch.type === "Punto de venta / sucursal");
  const [destinationBranchId, setDestinationBranchId] = useState(subbranches[0]?.id || "");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [saving, setSaving] = useState(false);
  const product = data.products.find((item) => item.id === productId);
  const stock = data.inventory.find((item) => item.productId === productId && item.branchId === central?.id)?.quantity || 0;

  async function submit() {
    if (!central || !destinationBranchId || !product || quantity <= 0) return toast.error("Completa destino, producto y cantidad.");
    if (quantity > stock) return toast.error("No hay suficiente stock en Central.");
    setSaving(true);
    const response = await postJson("/api/transfers", {
      originBranchId: central.id,
      destinationBranchId,
      items: [{ productId, quantity, price: 0, discount: 0, subtotal: 0 }]
    });
    setSaving(false);
    if (response.success) {
      toast.success("Envío guardado y recibido automáticamente.");
      setProductId("");
      setQuantity(1);
      await onDone();
    } else toast.error(response.error || "No se pudo guardar.");
  }

  return (
    <EasyPanel title="Enviar a tienda" subtitle="El inventario sale de Central y entra a la tienda seleccionada.">
      <Step title="1. Tienda destino">
        <OptionGrid options={subbranches.map((branch) => ({ id: branch.id, label: branch.name, helper: branch.id }))} value={destinationBranchId} onChange={setDestinationBranchId} />
      </Step>
      <Step title="2. Producto y cantidad">
        <ProductPicker products={data.products} inventory={data.inventory} branchId={central?.id || ""} selectedId={productId} onSelect={setProductId} />
        <div className="mt-4">
          <QuantityPicker value={quantity} max={stock} onChange={setQuantity} />
        </div>
      </Step>
      <ConfirmBox
        title="Confirmar envío"
        lines={[product ? `${sku(product)} · ${product.name}` : "Elegí producto", `Cantidad: ${quantity}`, `Sale de: ${central?.name || "Central"}`, `Stock disponible: ${stock}`]}
        action="Guardar envío"
        disabled={!destinationBranchId || !product || quantity > stock || saving}
        onConfirm={submit}
      />
    </EasyPanel>
  );
}

function AdminDistributorSaleFlow({ data, onDone }: { data: AdminData; onDone: () => Promise<void> }) {
  const central = data.branches.find((branch) => branch.type === "Tienda central") || data.branches[0];
  const [distributorId, setDistributorId] = useState(data.distributors[0]?.id || "");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<Payment>("Efectivo");
  const [saving, setSaving] = useState(false);
  const product = data.products.find((item) => item.id === productId);
  const distributor = data.distributors.find((item) => item.id === distributorId);
  const stock = data.inventory.find((item) => item.productId === productId && item.branchId === central?.id)?.quantity || 0;

  async function submit() {
    if (!central || !distributor || !product || quantity <= 0) return toast.error("Completa distribuidor, producto y cantidad.");
    if (quantity > stock) return toast.error("No hay suficiente stock en Central.");
    setSaving(true);
    const response = await postJson("/api/sales", {
      branchId: central.id,
      customerType: "Distribuidor/mayorista",
      distributorId,
      paymentMethod,
      items: [{ productId, quantity, price: 0, discount: 0, subtotal: 0 }]
    });
    setSaving(false);
    if (response.success) {
      toast.success(paymentMethod === "Crédito" ? "Venta guardada y crédito creado." : "Venta guardada.");
      setProductId("");
      setQuantity(1);
      await onDone();
    } else toast.error(response.error || "No se pudo guardar.");
  }

  return (
    <EasyPanel title="Venta a distribuidor" subtitle="Usá este flujo para Mazate, CAES u otros mayoristas.">
      <Step title="1. Distribuidor">
        <OptionGrid options={data.distributors.map((item) => ({ id: item.id, label: item.name, helper: item.id }))} value={distributorId} onChange={setDistributorId} />
      </Step>
      <Step title="2. Producto, cantidad y pago">
        <ProductPicker products={data.products} inventory={data.inventory} branchId={central?.id || ""} selectedId={productId} onSelect={setProductId} />
        <div className="mt-4 grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
          <QuantityPicker value={quantity} max={stock} onChange={setQuantity} />
          <OptionGrid options={["Efectivo", "Transferencia", "Crédito"].map((item) => ({ id: item, label: item }))} value={paymentMethod} onChange={(value) => setPaymentMethod(value as Payment)} />
        </div>
      </Step>
      <ConfirmBox
        title="Confirmar venta"
        lines={[distributor ? `${distributor.id} · ${distributor.name}` : "Elegí distribuidor", product ? `${sku(product)} · ${product.name}` : "Elegí producto", `Cantidad: ${quantity}`, `Pago: ${paymentMethod}`]}
        action="Guardar venta"
        disabled={!distributor || !product || quantity > stock || saving}
        onConfirm={submit}
      />
    </EasyPanel>
  );
}

function AdminLossFlow({ data, onDone }: { data: AdminData; onDone: () => Promise<void> }) {
  const [branchId, setBranchId] = useState(data.branches[0]?.id || "");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("Vencido");
  const [saving, setSaving] = useState(false);
  const product = data.products.find((item) => item.id === productId);
  const branch = data.branches.find((item) => item.id === branchId);
  const stock = data.inventory.find((item) => item.productId === productId && item.branchId === branchId)?.quantity || 0;

  async function submit() {
    if (!branch || !product || quantity <= 0) return toast.error("Completa ubicación, producto y cantidad.");
    if (quantity > stock) return toast.error("No hay suficiente stock.");
    setSaving(true);
    const response = await postJson("/api/waste", { branchId, productId, quantity, reason });
    setSaving(false);
    if (response.success) {
      toast.success("Pérdida guardada.");
      setProductId("");
      setQuantity(1);
      await onDone();
    } else toast.error(response.error || "No se pudo guardar.");
  }

  return (
    <EasyPanel title="Registrar pérdida" subtitle="Descuenta producto vencido, dañado o perdido en cualquier ubicación.">
      <Step title="1. Ubicación">
        <OptionGrid options={data.branches.map((item) => ({ id: item.id, label: item.name, helper: item.id }))} value={branchId} onChange={setBranchId} />
      </Step>
      <Step title="2. Producto, cantidad y motivo">
        <ProductPicker products={data.products} inventory={data.inventory} branchId={branchId} selectedId={productId} onSelect={setProductId} />
        <div className="mt-4 grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
          <QuantityPicker value={quantity} max={stock} onChange={setQuantity} />
          <OptionGrid options={["Vencido", "Dañado", "Pérdida", "Otro"].map((item) => ({ id: item, label: item }))} value={reason} onChange={setReason} />
        </div>
      </Step>
      <ConfirmBox
        title="Confirmar pérdida"
        lines={[branch ? `${branch.id} · ${branch.name}` : "Elegí ubicación", product ? `${sku(product)} · ${product.name}` : "Elegí producto", `Cantidad: ${quantity}`, `Motivo: ${reason}`]}
        action="Guardar pérdida"
        disabled={!branch || !product || quantity > stock || saving}
        onConfirm={submit}
      />
    </EasyPanel>
  );
}

function EasyPanel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-normal">{title}</h2>
        <p className="mt-1 text-sm text-black/60">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ProductPicker({ products, inventory, branchId, selectedId, onSelect, showStock = true }: { products: Product[]; inventory: InventoryItem[]; branchId: string; selectedId: string; onSelect: (id: string) => void; showStock?: boolean }) {
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
          className={cn("min-h-32 rounded-lg border p-4 text-left transition", selectedId === product.id ? "border-ink bg-ink text-white" : "border-black/10 bg-white hover:bg-cream-100")}
        >
          <div className="flex items-center gap-3">
            <ProductImage product={product} />
            <div>
              <p className={cn("text-xs font-semibold uppercase tracking-[0.12em]", selectedId === product.id ? "text-white/60" : "text-black/40")}>{sku(product)}</p>
              <p className="mt-1 text-lg font-semibold">{product.name}</p>
              {showStock ? <p className={cn("text-sm", selectedId === product.id ? "text-white/70" : "text-black/55")}>Stock: {stock}</p> : null}
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
    <div className="flex flex-wrap items-center gap-3">
      <button className="btn-secondary h-14 w-14 p-0" type="button" onClick={() => onChange(Math.max(1, value - 1))}><Minus className="h-5 w-5" /></button>
      <input className="field h-14 max-w-32 text-center text-2xl font-bold" type="number" min={1} max={max} value={value} onChange={(event) => onChange(Math.max(1, Number(event.target.value || 1)))} />
      <button className="btn-secondary h-14 w-14 p-0" type="button" onClick={() => onChange(max ? Math.min(max, value + 1) : value + 1)}><Plus className="h-5 w-5" /></button>
      {max !== undefined ? <p className="text-sm text-black/55">Máximo: {max}</p> : null}
    </div>
  );
}

function OptionGrid({ options, value, onChange }: { options: Array<{ id: string; label: string; helper?: string }>; value: string; onChange: (value: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {options.map((option) => (
        <button key={option.id} type="button" onClick={() => onChange(option.id)} className={cn("rounded-lg border p-4 text-left transition", value === option.id ? "border-ink bg-ink text-white" : "border-black/10 bg-white hover:bg-cream-100")}>
          {option.helper ? <p className={cn("text-xs font-semibold uppercase tracking-[0.12em]", value === option.id ? "text-white/60" : "text-black/40")}>{option.helper}</p> : null}
          <p className="text-lg font-semibold">{option.label}</p>
        </button>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/50">{label}</span>
      {children}
    </label>
  );
}

function ConfirmBox({ title, lines, action, disabled, onConfirm }: { title: string; lines: string[]; action: string; disabled?: boolean; onConfirm: () => void }) {
  return (
    <section className="rounded-lg border border-ink bg-ink p-4 text-white">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5" />
        <h3 className="text-lg font-semibold">{title}</h3>
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

function sku(product: Product) {
  return `SKU ${product.code || product.id}`;
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
