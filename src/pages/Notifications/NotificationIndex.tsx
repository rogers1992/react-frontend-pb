import { useState, useEffect, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { useToast } from "../../context/ToastContext";
import { useNotifications } from "../../context/NotificationContext";
import { notificationService } from "../../services/notification.service";
import { getErrorMessage } from "../../utils/error";
import type { Notification } from "../../types";

type Filter = "all" | "unread";

const TYPE_BADGE: Record<string, { color: "warning" | "success" | "primary"; label: string }> = {
  low_stock: { color: "warning", label: "Stock bajo" },
  new_sale: { color: "success", label: "Nueva venta" },
};

function getTypeBadge(type: string) {
  return TYPE_BADGE[type] ?? { color: "primary" as const, label: type.replace("_", " ") };
}

// ISO strings with Z suffix are parsed as UTC; toLocaleString converts to browser's local timezone
function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function NotificationIndex() {
  const { showToast } = useToast();
  const { markRead, markAllRead, deleteNotification, refresh } =
    useNotifications();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAll(filter === "unread", 0, 200);
      setNotifications(data);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Error al cargar las notificaciones.",
      );
      showToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }, [showToast, filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkRead = async (n: Notification) => {
    if (n.is_read) return;
    try {
      await markRead(n.id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, is_read: true } : item,
        ),
      );
    } catch {
      // ignore
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      showToast({
        type: "success",
        message: "Notificaciones marcadas como leidas.",
      });
    } catch {
      // ignore
    }
  };

  const handleDelete = async (n: Notification) => {
    try {
      await deleteNotification(n.id);
      setNotifications((prev) => prev.filter((item) => item.id !== n.id));
      showToast({ type: "success", message: "Notificacion eliminada." });
    } catch {
      // ignore
    }
  };

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <>
      <PageMeta
        title="Notificaciones | Paraiso Biker"
        description="Notificaciones y alertas - Paraiso Biker"
      />
      <PageBreadcrumb pageTitle="Notificaciones" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === "all"
                  ? "bg-brand-500 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === "unread"
                  ? "bg-brand-500 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
              }`}
            >
              No leidas
            </button>
          </div>
          {hasUnread && (
            <Button size="sm" variant="outline" onClick={handleMarkAll}>
              Marcar todas como leidas
            </Button>
          )}
        </div>

        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex gap-4 p-5">
                <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 animate-pulse dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-gray-200 animate-pulse dark:bg-gray-700" />
                  <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse dark:bg-gray-700" />
                </div>
              </li>
            ))
          ) : notifications.length === 0 ? (
            <li className="px-5 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
              {filter === "unread"
                ? "No tienes notificaciones sin leer."
                : "No tienes notificaciones."}
            </li>
          ) : (
            notifications.map((n) => {
              const badge = getTypeBadge(n.type);
              return (
                <li
                  key={n.id}
                  className={`flex gap-4 p-5 ${
                    !n.is_read ? "bg-brand-50/40 dark:bg-brand-500/5" : ""
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      n.is_read
                        ? "bg-gray-100 text-gray-400 dark:bg-white/5"
                        : "bg-brand-500 text-white"
                    }`}
                  >
                    <svg
                      className="fill-current"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M10.75 2.29C10.75 1.88 10.41 1.54 10 1.54c-.41 0-.75.34-.75.75v.54A6.96 6.96 0 003.63 9.17v5.29H3.33c-.41 0-.75.34-.75.75s.34.75.75.75h12.5c.41 0 .75-.34.75-.75s-.34-.75-.75-.75h-.29V9.17a6.96 6.96 0 00-5.04-6.34V2.29z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {n.title}
                      </span>
                      <Badge size="sm" color={badge.color}>
                        {badge.label}
                      </Badge>
                      {!n.is_read && (
                        <span className="inline-flex h-2 w-2 rounded-full bg-brand-500" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {n.message}
                    </p>
                    <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                      {formatDateTime(n.created_at)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-brand-400"
                        title="Marcar como leida"
                      >
                        <svg
                          className="size-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n)}
                      className="rounded-lg p-2 text-gray-500 hover:bg-error-50 hover:text-error-500 dark:text-gray-400 dark:hover:bg-error-500/15 dark:hover:text-error-400"
                      title="Eliminar"
                    >
                      <svg
                        className="size-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {/* Keep context in sync on unmount */}
      <SyncOnUnmount onSync={refresh} />
    </>
  );
}

function SyncOnUnmount({ onSync }: { onSync: () => Promise<void> }) {
  useEffect(() => {
    return () => {
      void onSync();
    };
  }, [onSync]);
  return null;
}
