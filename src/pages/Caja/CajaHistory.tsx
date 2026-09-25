import { useState, useEffect, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import { cajaService } from "../../services/caja.service";
import { getErrorMessage } from "../../utils/error";
import { useToast } from "../../context/ToastContext";
import type { CashSession } from "../../types";

export default function CajaHistory() {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<CashSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cajaService.getSessionHistory(0, 100);
      setSessions(data);
    } catch (error) {
      const message = getErrorMessage(error, "Error al cargar el historial de caja.");
      showToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDiscrepancyBadge = (discrepancy: number | null) => {
    if (discrepancy === null || discrepancy === undefined) {
      return <Badge size="sm" color="warning">Pendiente</Badge>;
    }
    if (discrepancy === 0) {
      return <Badge size="sm" color="success">Cuadrado</Badge>;
    }
    if (discrepancy > 0) {
      return (
        <Badge size="sm" color="warning">
          Sobrante: {formatCurrency(discrepancy)}
        </Badge>
      );
    }
    return (
      <Badge size="sm" color="error">
        Faltante: {formatCurrency(Math.abs(discrepancy))}
      </Badge>
    );
  };

  return (
    <>
      <PageMeta title="Historial de Caja | Paraiso Biker" description="Historial de sesiones de caja - Paraiso Biker" />
      <PageBreadcrumb pageTitle="Historial de Caja" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Historial de Sesiones
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500 dark:text-gray-400">Cargando...</div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No hay sesiones de caja registradas.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Almacén
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Apertura
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Cierre
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Fondo Inicial
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Ventas Efectivo
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Esperado
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Real
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Diferencia
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b border-stroke dark:border-strokedark">
                    <td className="px-6 py-4">
                      <Badge size="sm" color={session.status === "open" ? "success" : "light"}>
                        {session.status === "open" ? "Abierta" : "Cerrada"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {session.warehouse_name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(session.opened_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {session.closed_at ? formatDate(session.closed_at) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      {formatCurrency(session.opening_amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {formatCurrency(session.cash_sales_total)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-brand-500">
                      {session.expected_amount ? formatCurrency(session.expected_amount) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {session.closing_amount ? formatCurrency(session.closing_amount) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      {getDiscrepancyBadge(session.discrepancy)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
