import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { cajaService } from "../../services/caja.service";
import { getErrorMessage } from "../../utils/error";
import { useToast } from "../../context/ToastContext";
import type { WarehouseCajaSummary, CashSession, CashRegister, Warehouse } from "../../types";
import OpenSessionModal from "./components/OpenSessionModal";
import CloseSessionModal from "./components/CloseSessionModal";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CajaResumen() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState<WarehouseCajaSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [isOpening, setIsOpening] = useState(false);
  const [openingRegisterId, setOpeningRegisterId] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const [closingSession, setClosingSession] = useState<CashSession | null>(null);
  const [closingLoading, setClosingLoading] = useState(false);

  const allRegisters = useMemo(() => {
    return summaries
      .filter((s) => s.register_id !== null)
      .map((s) => ({
        id: s.register_id!,
        name: s.register_name!,
        warehouse_id: s.warehouse_id,
        is_active: true,
        created_at: "",
      })) as CashRegister[];
  }, [summaries]);

  const allWarehouses = useMemo(() => {
    return summaries.map((s) => ({
      id: s.warehouse_id,
      name: s.warehouse_name,
      is_active: true,
      created_at: "",
    })) as Warehouse[];
  }, [summaries]);

  const openingRegisters = useMemo(() => {
    return allRegisters.filter((r) => r.id === openingRegisterId);
  }, [allRegisters, openingRegisterId]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cajaService.getWarehouseSummary();
      setSummaries(data);
    } catch (error) {
      const message = getErrorMessage(error, "Error al cargar el resumen de cajas.");
      showToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenSession = async (data: { register_id: number; opening_amount: number; notes?: string }) => {
    try {
      setSubmitting(true);
      await cajaService.openSession(data);
      showToast({ type: "success", message: "Caja abierta exitosamente." });
      setIsOpening(false);
      await fetchData();
    } catch (error) {
      const message = getErrorMessage(error, "Error al abrir la caja.");
      showToast({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSession = async (data: { closing_amount: number; notes?: string }) => {
    if (!closingSession) return;
    try {
      setClosingLoading(true);
      await cajaService.closeSession(closingSession.id, data);
      showToast({ type: "success", message: "Caja cerrada exitosamente." });
      setClosingSession(null);
      await fetchData();
    } catch (error) {
      const message = getErrorMessage(error, "Error al cerrar la caja.");
      showToast({ type: "error", message });
    } finally {
      setClosingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Resumen de Caja | Paraiso Biker" description="Resumen de cajas por almacen - Paraiso Biker" />
      <PageBreadcrumb pageTitle="Resumen de Caja" />

      <div className="space-y-4">
        {summaries.length === 0 ? (
          <div className="rounded-sm border border-stroke bg-white p-6 text-center dark:border-strokedark dark:bg-boxdark">
            <p className="text-gray-500 dark:text-gray-400">No hay almacenes registrados.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {summaries.map((summary) => {
              const session = summary.session;
              const isOpen = session?.status === "open";

              return (
                <div
                  key={summary.warehouse_id}
                  className="rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {summary.warehouse_name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {summary.register_name ?? "Sin caja"}
                      </p>
                    </div>
                    <Badge size="sm" color={isOpen ? "success" : "error"}>
                      {isOpen ? "Abierta" : "Cerrada"}
                    </Badge>
                  </div>

                  {isOpen && session ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Fondo:</span>
                          <span className="ml-2 font-medium text-gray-800 dark:text-white/90">
                            {formatCurrency(session.opening_amount)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Esperado:</span>
                          <span className="ml-2 font-medium text-brand-500">
                            {formatCurrency(session.expected_amount ?? 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Abrio:</span>
                          <span className="ml-2 text-gray-800 dark:text-white/90">
                            {formatDate(session.opened_at)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Ventas:</span>
                          <span className="ml-2 text-gray-800 dark:text-white/90">
                            {session.sales_count}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/caja/history")}
                          className="flex-1"
                        >
                          Ver Historial
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setClosingSession(session)}
                          disabled={closingLoading && closingSession?.id === session.id}
                          className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                          {closingLoading && closingSession?.id === session.id ? "Cerrando..." : "Cerrar"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                        No hay sesion abierta en este almacen.
                      </p>
                      {summary.register_id && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setOpeningRegisterId(summary.register_id!);
                            setIsOpening(true);
                          }}
                        >
                          Abrir Caja
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <OpenSessionModal
        isOpen={isOpening}
        onClose={() => setIsOpening(false)}
        onOpen={handleOpenSession}
        registers={openingRegisters}
        warehouses={allWarehouses}
        loading={submitting}
      />

      {closingSession && (
        <CloseSessionModal
          isOpen={!!closingSession}
          onClose={() => setClosingSession(null)}
          onCloseSession={handleCloseSession}
          session={closingSession}
          loading={closingLoading}
        />
      )}
    </>
  );
}
