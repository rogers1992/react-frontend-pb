import { useState } from "react";
import Button from "../ui/button/Button";
import { SalesIcon } from "../../icons";

interface CartDrawerProps {
  children: React.ReactNode;
  itemCount: number;
  total: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function CartDrawer({ children, itemCount, total }: CartDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div className="hidden xl:block">
        {children}
      </div>

      <div
        className={`
          xl:hidden
          fixed bottom-14 left-0 right-0 z-40
          bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg
          overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded ? "max-h-[calc(80vh-3.5rem)]" : "max-h-0"}
        `}
      >
        <div className="overflow-y-auto max-h-[calc(80vh-3.5rem)]">
          {children}
        </div>
      </div>

      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <SalesIcon className="h-5 w-5 text-brand-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>
          <span className="text-sm font-bold text-brand-500 flex-shrink-0 mx-2">
            {formatCurrency(total)}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0"
          >
            {isExpanded ? "Ocultar" : "Ver"}
          </Button>
        </div>
      </div>
    </>
  );
}
