import { useState } from "react";
import { InfoIcon, ChevronDownIcon, ChevronUpIcon } from "../../../icons";

const classRows = [
  {
    class: "A",
    threshold: "0% – 80%",
    action:
      "Nunca agotar stock. Negociar mejores precios con proveedores. Priorizar en marketing y promociones.",
    color:
      "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
  },
  {
    class: "B",
    threshold: "80% – 95%",
    action:
      "Monitorear regularmente. Mantener stock moderado. Revisar trimestralmente.",
    color:
      "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500",
  },
  {
    class: "C",
    threshold: "95% – 100%",
    action:
      "Considerar descontinuar. Reducir inventario. Subir precios o vender en paquete con productos clase A.",
    color:
      "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  },
];

export default function ABCInfoPanel() {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mb-5 rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <InfoIcon className="h-5 w-5 shrink-0 text-brand-500" />
        <span>¿Qué es el Análisis ABC?</span>
        <span className="ml-auto shrink-0">
          {expanded ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-gray-200 px-4 pb-4 pt-3 dark:border-gray-800">
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
            El Análisis ABC clasifica tus productos según su contribución a los
            ingresos totales. Se basa en el{" "}
            <strong>Principio de Pareto</strong> (regla 80/20): un pequeño grupo
            de productos genera la mayor parte de tus ventas.
          </p>

          <div className="mb-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 pr-4 font-medium text-gray-500 dark:text-gray-400">
                    Clase
                  </th>
                  <th className="pb-2 pr-4 font-medium text-gray-500 dark:text-gray-400">
                    Umbral
                  </th>
                  <th className="pb-2 font-medium text-gray-500 dark:text-gray-400">
                    Qué hacer
                  </th>
                </tr>
              </thead>
              <tbody>
                {classRows.map((row) => (
                  <tr
                    key={row.class}
                    className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                  >
                    <td className="py-2 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${row.color}`}
                      >
                        {row.class}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                      {row.threshold}
                    </td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">
                      {row.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-500">
            <strong>Columnas:</strong>{" "}
            <span className="font-medium">% Ingresos</span> — participación
            del producto en el ingreso total.{" "}
            <span className="font-medium">% Acumulado</span> — suma progresiva
            que determina la clase.{" "}
            <span className="font-medium">Unidades</span> — cantidad vendida
            en el período seleccionado.
          </p>
        </div>
      )}
    </div>
  );
}
