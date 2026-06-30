import { useState } from "react";
import { Link } from "react-router";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useNotifications } from "../../context/NotificationContext";
import type { Notification, NotificationType } from "../../types";

const TYPE_META: Record<
  string,
  { dot: string; icon: React.ReactNode }
> = {
  low_stock: {
    dot: "bg-warning-500",
    icon: (
      <svg
        className="fill-current"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm1 9.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  new_sale: {
    dot: "bg-success-500",
    icon: (
      <svg
        className="fill-current"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 14.414l4.707-4.707-1.414-1.414L13 14.586V7h-2v9.414z"
          fill="currentColor"
        />
      </svg>
    ),
  },
};

const DEFAULT_META = {
  dot: "bg-brand-500",
  icon: (
    <svg
      className="fill-current"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.75 2.29C10.75 1.88 10.41 1.54 10 1.54c-.41 0-.75.34-.75.75v.54A6.96 6.96 0 003.63 9.17v5.29H3.33c-.41 0-.75.34-.75.75s.34.75.75.75h12.5c.41 0 .75-.34.75-.75s-.34-.75-.75-.75h-.29V9.17a6.96 6.96 0 00-5.04-6.34V2.29zM8 17.71c0 .41.34.75.75.75h2.5c.41 0 .75-.34.75-.75s-.34-.75-.75-.75h-2.5c-.41 0-.75.34-.75.75z"
        fill="currentColor"
      />
    </svg>
  ),
};

const getTypeMeta = (type: NotificationType) => TYPE_META[type] ?? DEFAULT_META;

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "";
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return "hace un momento";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
  } = useNotifications();

  function toggleDropdown() {
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
  };

  const handleMarkAll = () => {
    void markAllRead();
  };

  const handleItemClick = (n: Notification) => {
    if (!n.is_read) void markRead(n.id);
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
        aria-label="Notificaciones"
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            unreadCount > 0 ? "flex" : "hidden"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notificaciones
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-brand-500 px-2 py-0.5 text-xs font-medium text-white">
                {unreadCount}
              </span>
            )}
          </h5>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-brand-500 transition hover:text-brand-600 dark:text-brand-400"
                title="Marcar todas como leidas"
              >
                Marcar todas
              </button>
            )}
            <button
              onClick={toggleDropdown}
              className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              aria-label="Cerrar"
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>

        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <li className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              No tienes notificaciones.
            </li>
          ) : (
            notifications.map((n) => {
              const meta = getTypeMeta(n.type);
              return (
                <li key={n.id}>
                  <button
                    onClick={() => handleItemClick(n)}
                    className={`flex w-full gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 text-left hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${
                      !n.is_read ? "bg-brand-50/40 dark:bg-brand-500/5" : ""
                    }`}
                  >
                    <span
                      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        n.is_read
                          ? "bg-gray-100 text-gray-400 dark:bg-white/5"
                          : `text-white ${meta.dot}`
                      }`}
                    >
                      {meta.icon}
                      {!n.is_read && (
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-500 dark:border-gray-900" />
                      )}
                    </span>
                    <span className="block min-w-0 flex-1">
                      <span className="mb-1 block text-theme-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {n.title}
                        </span>
                      </span>
                      <span className="block text-theme-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {n.message}
                      </span>
                      <span className="mt-1 flex items-center gap-2 text-gray-400 text-theme-xs dark:text-gray-500">
                        <span className="capitalize">{n.type.replace("_", " ")}</span>
                        <span className="w-1 h-1 bg-gray-400 rounded-full" />
                        <span>{timeAgo(n.created_at)}</span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <Link
          to="/notifications"
          onClick={closeDropdown}
          className="mt-3 block rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Ver todas las notificaciones
        </Link>
      </Dropdown>
    </div>
  );
}
