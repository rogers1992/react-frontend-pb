import { useState } from "react";
import Button from "../../../components/ui/button/Button";
import Badge from "../../../components/ui/badge/Badge";
import { cajaService } from "../../../services/caja.service";
import { getErrorMessage } from "../../../utils/error";
import { useToast } from "../../../context/ToastContext";
import type { CashSession, CashMovementCreate } from "../../../types";
import AddMovementModal from "./AddMovementModal";
import CloseSessionModal from "./CloseSessionModal";

interface SessionDashboardProps {
  session: CashSession;
  onCloseSession: (data: { closing_amount: number; notes?: string }) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export default function SessionDashboard({ session, onCloseSession, onRefresh, loading = false }: SessionDashboardProps) {
  const { showToast } = useToast();
  const [isClosing, setIsClosing] = useState(false);
  const [isAddingMovement, setIsAddingMovement] = useState(false);
  const [movementsLoading, setMovementsLoading] = useState(false);

  const handleAddMovement = async (data: CashMovementCreate) => {
    try {
      setMovementsLoading(true);
      await cajaService.addMovement(data);
      showToast({ type: "success", message: "Movimiento registrado exitosamente." });
      onRefresh();
    } catch (error) {
      const message = getErrorMessage(error, "Error al registrar el movimiento.");
      showToast({ type: "error", message });
    } finally {
      setMovementsLoading(false);
    }
  };

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

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Sesion Activa
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Abierta el {formatDate(session.opened_at)}
            </p>
            {session.warehouse_name && (
              <p className="text-sm text-brand-500 mt-1">
                Almacen: {session.warehouse_name}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingMovement(true)}
            >
              Nuevo Movimiento
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsClosing(true)}
              className="text-red-600 ring-red-200 hover:bg-red-50 dark:ring-red-800 dark:hover:bg-red-900/20"
            >
              Cerrar Caja
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
            <p className="text-sm text-gray-500 dark:text-gray-400">Fondo Inicial</p>
            <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {formatCurrency(session.opening_amount)}
            </p>
          </div>

          <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
            <p className="text-sm text-gray-500 dark:text-gray-400">Ventas en Efectivo</p>
            <p className="mt-1 text-2xl font-semibold text-brand-500">
              {formatCurrency(session.cash_sales_total)}
            </p>
            <p className="text-xs text-gray-400">{session.sales_count} ventas</p>
          </div>

          <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Ingresos</p>
            <p className="mt-1 text-2xl font-semibold text-green-600">
              {formatCurrency(session.movements.filter((m) => m.type === "ingreso").reduce((sum, m) => sum + m.amount, 0))}
            </p>
          </div>

          <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Egresos</p>
            <p className="mt-1 text-2xl font-semibold text-red-600">
              {formatCurrency(session.movements.filter((m) => m.type === "egreso").reduce((sum, m) => sum + m.amount, 0))}
            </p>
          </div>
        </div>

        <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Resumen de Caja
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-stroke pb-3 dark:border-strokedark">
              <span className="text-gray-600 dark:text-gray-400">Fondo inicial</span>
              <span className="font-medium text-gray-800 dark:text-white/90">
                {formatCurrency(session.opening_amount)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-stroke pb-3 dark:border-strokedark">
              <span className="text-gray-600 dark:text-gray-400">Ventas en efectivo</span>
              <span className="font-medium text-gray-800 dark:text-white/90">
                + {formatCurrency(session.cash_sales_total)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-stroke pb-3 dark:border-strokedark">
              <span className="text-gray-600 dark:text-gray-400">Ingresos</span>
              <span className="font-medium text-green-600">
                + {formatCurrency(session.movements.filter((m) => m.type === "ingreso").reduce((sum, m) => sum + m.amount, 0))}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-stroke pb-3 dark:border-strokedark">
              <span className="text-gray-600 dark:text-gray-400">Egresos</span>
              <span className="font-medium text-red-600">
                - {formatCurrency(session.movements.filter((m) => m.type === "egreso").reduce((sum, m) => sum + m.amount, 0))}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Efectivo esperado
              </span>
              <span className="text-lg font-bold text-brand-500">
                {formatCurrency(session.expected_amount ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {session.movements.length > 0 && (
          <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Movimientos Recientes
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stroke dark:border-strokedark">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Monto
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Motivo
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {session.movements.slice(0, 10).map((movement) => (
                    <tr key={movement.id} className="border-b border-stroke dark:border-strokedark">
                      <td className="px-4 py-3">
                        <Badge size="sm" color={movement.type === "ingreso" ? "success" : "error"}>
                          {movement.type === "ingreso" ? "Ingreso" : "Egreso"}
                        </Badge>
                      </td>
                      <td className={`px-4 py-3 font-medium ${movement.type === "ingreso" ? "text-green-600" : "text-red-600"}`}>
                        {movement.type === "ingreso" ? "+ " : "- "}
                        {formatCurrency(movement.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {movement.reason}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(movement.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {session.opening_notes && (
          <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
              Observaciones de Apertura
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{session.opening_notes}</p>
          </div>
        )}
      </div>

      <CloseSessionModal
        isOpen={isClosing}
        onClose={() => setIsClosing(false)}
        onCloseSession={onCloseSession}
        session={session}
        loading={loading}
      />

      <AddMovementModal
        isOpen={isAddingMovement}
        onClose={() => setIsAddingMovement(false)}
        onAdd={handleAddMovement}
        loading={movementsLoading}
      />
    </>
  );
}
