import type { Product } from "../../../types";
import { PencilIcon, TrashBinIcon } from "../../../icons";

interface ProductActionsProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  hideDelete?: boolean;
}

export default function ProductActions({ product, onEdit, onDelete, hideDelete }: ProductActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(product);
        }}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-brand-400"
        title="Editar"
      >
        <PencilIcon className="size-4" />
      </button>
      {!hideDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(product);
          }}
          className="rounded-lg p-2 text-gray-500 hover:bg-error-50 hover:text-error-500 dark:text-gray-400 dark:hover:bg-error-500/15 dark:hover:text-error-400"
          title="Eliminar"
        >
          <TrashBinIcon className="size-4" />
        </button>
      )}
    </div>
  );
}
