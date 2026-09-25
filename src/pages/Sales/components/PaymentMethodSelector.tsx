interface PaymentMethodSelectorProps {
  value: string;
  onChange: (method: string) => void;
}

const methods = [
  { key: "efectivo", label: "Efectivo", icon: "cash" },
  { key: "transferencia", label: "Transferencia", icon: "transfer" },
];

function MethodIcon({ type }: { type: string }) {
  if (type === "cash") {
    return (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    );
  }
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3h5v5" />
      <path d="M8 3H3v5" />
      <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" />
      <path d="m15 9 6-6" />
    </svg>
  );
}

export default function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="flex gap-3">
      {methods.map((m) => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition cursor-pointer ${
            value === m.key && value !== ""
              ? "bg-brand-500 text-white border-brand-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
          }`}
        >
          <MethodIcon type={m.icon} />
          {m.label}
        </button>
      ))}
    </div>
  );
}
