import { useState, useEffect, useCallback, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { cajaService } from "../../services/caja.service";
import { warehouseService } from "../../services/warehouse.service";
import { getErrorMessage } from "../../utils/error";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import type { CashSession, CashRegister, Warehouse } from "../../types";
import OpenSessionModal from "./components/OpenSessionModal";
import SessionDashboard from "./components/SessionDashboard";
import CloseSessionModal from "./components/CloseSessionModal";
import AddMovementModal from "./components/AddMovementModal";

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

export default function CajaIndex() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const { hasRole } = usePermissions();
  const isAdmin = hasRole("admin");

  const [currentSession, setCurrentSession] = useState<CashSession | null>(null);
  const [openSessions, setOpenSessions] = useState<CashSession[]>([]);
  const [registers, setRegisters] = useState<CashRegister[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpening, setIsOpening] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [closingSession, setClosingSession] = useState<CashSession | null>(null);
  const [closingLoading, setClosingLoading] = useState(false);

  const [movementSession, setMovementSession] = useState<CashSession | null>(null);
  const [movementLoading, setMovementLoading] = useState(false);

  const userWarehouseIds = useMemo(
    () => user?.warehouse_ids && user.warehouse_ids.length > 0 ? user.warehouse_ids : null,
    [user?.warehouse_ids],
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sessionsData, registerData, warehouseData] = await Promise.all([
        isAdmin
          ? cajaService.getOpenSessions().catch(() => [] as CashSession[])
          : cajaService.getCurrentSession().catch(() => null),
        cajaService.getRegisters(),
        warehouseService.getAll(0, 100),
      ]);

      if (isAdmin) {
        setOpenSessions(sessionsData as CashSession[]);
        setCurrentSession(null);
      } else {
        setCurrentSession(sessionsData as CashSession | null);
        setOpenSessions([]);
      }

      const filteredRegisters = isAdmin
        ? registerData
        : userWarehouseIds
          ? registerData.filter(r => userWarehouseIds.includes(r.warehouse_id ?? 0))
          : registerData;
      const filteredWarehouses = isAdmin
        ? warehouseData
        : userWarehouseIds
          ? warehouseData.filter(w => userWarehouseIds.includes(w.id))
          : warehouseData;

      setRegisters(filteredRegisters);
      setWarehouses(filteredWarehouses);
    } catch (error) {
      const message = getErrorMessage(error, "Error al cargar la caja.");
      showToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }, [showToast, userWarehouseIds, isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenSession = async (data: { register_id: number; opening_amount: number; notes?: string }) => {
    try {
      setSubmitting(true);
      const session = await cajaService.openSession(data);
      if (isAdmin) {
        setOpenSessions(prev => [session, ...prev]);
      } else {
        setCurrentSession(session);
      }
      setIsOpening(false);
      showToast({ type: "success", message: "Caja abierta exitosamente." });
    } catch (error) {
      const message = getErrorMessage(error, "Error al abrir la caja.");
      showToast({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSession = async (data: { closing_amount: number; notes?: string }) => {
    const sessionToClose = closingSession ?? currentSession;
    if (!sessionToClose) return;
    try {
      setClosingLoading(true);
      await cajaService.closeSession(sessionToClose.id, data);
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

  const handleAddMovement = async (data: { type: "ingreso" | "egreso"; amount: number; reason: string; notes?: string; session_id?: number }) => {
    try {
      setMovementLoading(true);
      await cajaService.addMovement(data);
      showToast({ type: "success", message: "Movimiento registrado exitosamente." });
      setMovementSession(null);
      await fetchData();
    } catch (error) {
      const message = getErrorMessage(error, "Error al registrar el movimiento.");
      showToast({ type: "error", message });
    } finally {
      setMovementLoading(false);
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
      <PageMeta title="Caja | Paraiso Biker" description="Gestion de caja - Paraiso Biker" />
      <PageBreadcrumb pageTitle="Caja" />

      {isAdmin ? (
        <>
          {openSessions.length > 0 ? (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {openSessions.length} caja{openSessions.length !== 1 ? "s" : ""} abierta{openSessions.length !== 1 ? "s" : ""}
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsOpening(true)}
              >
                Abrir Caja
              </Button>
            </div>
          ) : null}

          {openSessions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {openSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {session.warehouse_name ?? "Caja"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Abierta el {formatDate(session.opened_at)}
                      </p>
                    </div>
                    <Badge size="sm" color="success">Abierta</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Fondo:</span>
                      <span className="ml-2 font-medium text-gray-800 dark:text-white/90">
                        {formatCurrency(session.opening_amount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Ventas:</span>
                      <span className="ml-2 font-medium text-brand-500">
                        {formatCurrency(session.cash_sales_total)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Ingresos:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {formatCurrency(session.movements.filter((m) => m.type === "ingreso").reduce((sum, m) => sum + m.amount, 0))}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Egresos:</span>
                      <span className="ml-2 font-medium text-red-600">
                        {formatCurrency(session.movements.filter((m) => m.type === "egreso").reduce((sum, m) => sum + m.amount, 0))}
                      </span>
                    </div>
                    <div className="col-span-2 border-t border-stroke pt-2 dark:border-strokedark">
                      <span className="text-gray-500 dark:text-gray-400">Esperado:</span>
                      <span className="ml-2 text-lg font-bold text-brand-500">
                        {formatCurrency(session.expected_amount ?? 0)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMovementSession(session)}
                      className="flex-1"
                    >
                      Movimiento
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
              ))}
            </div>
          ) : (
            <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="mx-auto max-w-md text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
                  <svg className="h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
                  No hay cajas abiertas
                </h3>
                <p className="mb-4 text-gray-500 dark:text-gray-400">
                  Abre una caja para comenzar a registrar ventas en efectivo.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsOpening(true)}
                  disabled={registers.length === 0}
                >
                  {registers.length === 0 ? "Sin cajas disponibles" : "Abrir Caja"}
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {currentSession && currentSession.status === "open" ? (
            <SessionDashboard
              session={currentSession}
              onCloseSession={handleCloseSession}
              onRefresh={fetchData}
              loading={closingLoading}
            />
          ) : (
            <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="mx-auto max-w-md text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
                  <svg className="h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
                  No hay caja abierta
                </h3>
                <p className="mb-2 text-gray-500 dark:text-gray-400">
                  Debes abrir una caja antes de registrar ventas en efectivo.
                </p>
                {currentSession?.warehouse_name && (
                  <p className="mb-4 text-sm text-brand-500">
                    Almacen: {currentSession.warehouse_name}
                  </p>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsOpening(true)}
                  disabled={registers.length === 0}
                >
                  {registers.length === 0 ? "Sin cajas disponibles" : "Abrir Caja"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <OpenSessionModal
        isOpen={isOpening}
        onClose={() => setIsOpening(false)}
        onOpen={handleOpenSession}
        registers={registers}
        warehouses={warehouses}
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

      {movementSession && (
        <AddMovementModal
          isOpen={!!movementSession}
          onClose={() => setMovementSession(null)}
          onAdd={handleAddMovement}
          loading={movementLoading}
          sessionId={movementSession.id}
        />
      )}
    </>
  );
}
