import type { InventoryItem } from "../../../types";
import { PencilIcon, TrashBinIcon } from "../../../icons";

interface InventoryActionsProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onTransfer: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

export default function InventoryActions({
  item,
  onEdit,
  onTransfer,
  onDelete,
}: InventoryActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(item);
        }}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-brand-400"
        title="Editar"
      >
        <PencilIcon className="size-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onTransfer(item);
        }}
        className="rounded-lg p-2 text-gray-500 hover:bg-blue-light-50 hover:text-blue-light-500 dark:text-gray-400 dark:hover:bg-blue-light-500/15 dark:hover:text-blue-light-400"
        title="Transferir"
      >
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(item);
        }}
        className="rounded-lg p-2 text-gray-500 hover:bg-error-50 hover:text-error-500 dark:text-gray-400 dark:hover:bg-error-500/15 dark:hover:text-error-400"
        title="Eliminar"
      >
        <TrashBinIcon className="size-4" />
      </button>
    </div>
  );
}
