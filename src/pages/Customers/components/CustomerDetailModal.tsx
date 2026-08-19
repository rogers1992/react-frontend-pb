import { useState, useEffect, useCallback } from "react";
import { Modal } from "../../../components/ui/modal";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Label from "../../../components/form/Label";
import { customerService } from "../../../services/customer.service";
import { getErrorMessage } from "../../../utils/error";
import { useToast } from "../../../context/ToastContext";
import type { Customer, CustomerSale, LoyaltyAdjust } from "../../../types";

interface CustomerDetailModalProps {
  isOpen: boolean;
  customer: Customer | null;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onRefresh: () => void;
}

type TabKey = "info" | "loyalty" | "sales";

export default function CustomerDetailModal({
  isOpen,
  customer,
  onClose,
  onEdit,
  onRefresh,
}: CustomerDetailModalProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("info");

  // Loyalty state
  const [pointsChange, setPointsChange] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);

  // Sales state
  const [sales, setSales] = useState<CustomerSale[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesPage, setSalesPage] = useState(0);
  const salesPageSize = 10;

  useEffect(() => {
    if (isOpen && customer) {
      setActiveTab("info");
      setPointsChange("");
      setAdjustReason("");
      setSales([]);
      setSalesPage(0);
    }
  }, [isOpen, customer]);

  const fetchSales = useCallback(async () => {
    if (!customer) return;
    try {
      setSalesLoading(true);
      const skip = salesPage * salesPageSize;
      const data = await customerService.getSales(customer.id, skip, salesPageSize);
      setSales(data);
    } catch (error) {
      const message = getErrorMessage(error, "Error al cargar historial de ventas.");
      showToast({ type: "error", message });
    } finally {
      setSalesLoading(false);
    }
  }, [customer, salesPage, showToast]);

  useEffect(() => {
    if (activeTab === "sales" && customer) {
      fetchSales();
    }
  }, [activeTab, customer, fetchSales]);

  const handleAdjustPoints = async () => {
    if (!customer || !pointsChange) return;
    try {
      setAdjustLoading(true);
      const change = parseInt(pointsChange);
      if (isNaN(change)) {
        showToast({ type: "error", message: "Ingresa un numero valido." });
        return;
      }
      const payload: LoyaltyAdjust = {
        points_change: change,
        reason: adjustReason || undefined,
      };
      await customerService.adjustLoyalty(customer.id, payload);
      showToast({ type: "success", message: "Puntos ajustados exitosamente." });
      setPointsChange("");
      setAdjustReason("");
      onRefresh();
    } catch (error) {
      const message = getErrorMessage(error, "Error al ajustar puntos.");
      showToast({ type: "error", message });
    } finally {
      setAdjustLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!customer) return;
    try {
      await customerService.toggleActive(customer.id);
      showToast({ type: "success", message: "Cliente restaurado exitosamente." });
      onRefresh();
      onClose();
    } catch (error) {
      const message = getErrorMessage(error, "Error al restaurar el cliente.");
      showToast({ type: "error", message });
    }
  };

  const tierColor = (tier: string): "warning" | "info" | "light" | "primary" => {
    switch (tier?.toLowerCase()) {
      case "gold": return "warning";
      case "silver": return "info";
      case "bronze": return "light";
      default: return "primary";
    }
  };

  const tierLabel = (tier: string): string => {
    switch (tier?.toLowerCase()) {
      case "gold": return "Oro";
      case "silver": return "Plata";
      case "bronze": return "Bronce";
      default: return tier;
    }
  };

  if (!customer) return null;

  const tabs: { key: TabKey; label: string }[] = [
    { key: "info", label: "Informacion" },
    { key: "loyalty", label: "Lealtad" },
    { key: "sales", label: "Historial de Ventas" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 sm:p-8">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {customer.first_name} {customer.last_name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          ID: {customer.id} &middot; Cliente desde{" "}
          {/* ISO strings with Z suffix are parsed as UTC; toLocaleDateString converts to browser's local timezone */}
          {new Date(customer.created_at).toLocaleDateString("es-MX", {
            year: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "info" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {customer.first_name} {customer.last_name}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Estado</p>
              <Badge size="sm" color={customer.is_active === 1 ? "success" : "error"}>
                {customer.is_active === 1 ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Correo</p>
            <p className="text-sm text-gray-800 dark:text-white/90">{customer.email || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Telefono</p>
            <p className="text-sm text-gray-800 dark:text-white/90">{customer.phone || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Direccion</p>
            <p className="text-sm text-gray-800 dark:text-white/90">{customer.address || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fecha de Nacimiento</p>
            <p className="text-sm text-gray-800 dark:text-white/90">
              {customer.date_of_birth
                ? /* ISO strings with Z suffix are parsed as UTC; toLocaleDateString converts to browser's local timezone */
                  new Date(customer.date_of_birth).toLocaleDateString("es-MX")
                : "—"}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            {customer.is_active === 0 && (
              <Button variant="primary" size="sm" onClick={handleRestore}>
                Restaurar Cliente
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => onEdit(customer)}>
              Editar Cliente
            </Button>
          </div>
        </div>
      )}

      {activeTab === "loyalty" && (
        <div className="space-y-5">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
            <div className="flex flex-col items-center">
              <Badge size="md" color={tierColor(customer.loyalty?.tier ?? "")}>
                {tierLabel(customer.loyalty?.tier ?? "")}
              </Badge>
              <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                {customer.loyalty?.points ?? 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">puntos</p>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Proxima tier:{" "}
                {(customer.loyalty?.points ?? 0) < 500
                  ? "Plata (500 pts)"
                  : (customer.loyalty?.points ?? 0) < 1000
                  ? "Oro (1000 pts)"
                  : "Maxima tier alcanzada"}
              </p>
              {customer.loyalty?.last_updated && (
                <p className="text-xs text-gray-400">
                  Ultima actualizacion:{" "}
                  {/* ISO strings with Z suffix are parsed as UTC; toLocaleDateString converts to browser's local timezone */}
                  {new Date(customer.loyalty.last_updated).toLocaleDateString("es-MX")}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-3">
              Ajustar Puntos
            </h4>
            <div className="space-y-3">
              <div>
                <Label>Cambio de Puntos</Label>
                <Input
                  type="number"
                  placeholder="+100 o -50"
                  value={pointsChange}
                  onChange={(e) => setPointsChange(e.target.value)}
                  disabled={adjustLoading}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Usa numeros negativos para restar puntos.
                </p>
              </div>
              <div>
                <Label>Motivo (opcional)</Label>
                <TextArea
                  placeholder="Razon del ajuste..."
                  rows={2}
                  value={adjustReason}
                  onChange={setAdjustReason}
                  disabled={adjustLoading}
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAdjustPoints}
                disabled={adjustLoading || !pointsChange}
              >
                {adjustLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Ajustando...
                  </span>
                ) : (
                  "Aplicar Ajuste"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "sales" && (
        <div className="space-y-3">
          {salesLoading ? (
            <div className="flex justify-center py-8 text-gray-400">
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <svg className="mb-2 size-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              <p className="text-sm">No se encontraron ventas para este cliente.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05]">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Fecha</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Pago</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <td className="px-4 py-2 text-gray-800 dark:text-white/90">#{sale.id}</td>
                      <td className="px-4 py-2 text-gray-500 dark:text-gray-400">
                        {/* ISO strings with Z suffix are parsed as UTC; toLocaleDateString converts to browser's local timezone */}
                        {new Date(sale.sale_date).toLocaleDateString("es-MX")}
                      </td>
                      <td className="px-4 py-2 text-gray-500 dark:text-gray-400 capitalize">
                        {sale.payment_method}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-gray-800 dark:text-white/90">
                        ${sale.total_amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {sales.length > 0 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Mostrando {sales.length} venta(s)
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={salesPage === 0}
                  onClick={() => setSalesPage((p) => Math.max(0, p - 1))}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={sales.length < salesPageSize}
                  onClick={() => setSalesPage((p) => p + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
