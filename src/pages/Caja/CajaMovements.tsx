import { useState, useEffect, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { cajaService } from "../../services/caja.service";
import { getErrorMessage } from "../../utils/error";
import { useToast } from "../../context/ToastContext";
import type { CashMovement, CashMovementCreate } from "../../types";
import AddMovementModal from "./components/AddMovementModal";

export default function CajaMovements() {
  const { showToast } = useToast();
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [addingLoading, setAddingLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cajaService.getMovements();
      setMovements(data);
    } catch (error) {
      const message = getErrorMessage(error, "Error al cargar los movimientos.");
      showToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddMovement = async (data: CashMovementCreate) => {
    try {
      setAddingLoading(true);
      await cajaService.addMovement(data);
      showToast({ type: "success", message: "Movimiento registrado exitosamente." });
      await fetchData();
      setIsAdding(false);
    } catch (error) {
      const message = getErrorMessage(error, "Error al registrar el movimiento.");
      showToast({ type: "error", message });
    } finally {
      setAddingLoading(false);
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
      <PageMeta title="Movimientos de Caja | Paraiso Biker" description="Movimientos de caja - Paraiso Biker" />
      <PageBreadcrumb pageTitle="Movimientos de Caja" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Movimientos de Caja
          </h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAdding(true)}
          >
            Nuevo Movimiento
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500 dark:text-gray-400">Cargando...</div>
          </div>
        ) : movements.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No hay movimientos registrados en esta sesion.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Almacén
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Motivo
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Observaciones
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id} className="border-b border-stroke dark:border-strokedark">
                    <td className="px-6 py-4">
                      <Badge size="sm" color={movement.type === "ingreso" ? "success" : "error"}>
                        {movement.type === "ingreso" ? "Ingreso" : "Egreso"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {movement.warehouse_name ?? "—"}
                    </td>
                    <td className={`px-6 py-4 font-medium ${movement.type === "ingreso" ? "text-green-600" : "text-red-600"}`}>
                      {movement.type === "ingreso" ? "+ " : "- "}
                      {formatCurrency(movement.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {movement.reason}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {movement.notes || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(movement.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddMovementModal
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        onAdd={handleAddMovement}
        loading={addingLoading}
      />
    </>
  );
}
