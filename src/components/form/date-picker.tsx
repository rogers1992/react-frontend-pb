import { useEffect, useId, useRef } from "react";
import flatpickr from "flatpickr";
import type { Instance } from "flatpickr/dist/types/instance";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id?: string;
  mode?: "single" | "multiple" | "range" | "time";
  value?: string;
  defaultDate?: DateOption;
  onChange?: (val: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
};

export default function DatePicker({
  id,
  mode,
  value,
  defaultDate,
  onChange,
  label,
  placeholder,
  disabled,
}: PropsType) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fpRef = useRef<Instance | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!inputRef.current) return;
    const fp = flatpickr(inputRef.current, {
      mode: mode || "single",
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      defaultDate: value ?? defaultDate,
      onChange: (_dates, dateStr) => {
        onChangeRef.current?.(dateStr);
      },
    });
    fpRef.current = fp;
    return () => {
      fp.destroy();
      fpRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fpRef.current && value !== undefined) {
      fpRef.current.setDate(value, false);
    }
  }, [value]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.disabled = !!disabled;
    }
  }, [disabled]);

  const handleInputClick = () => {
    if (fpRef.current) {
      fpRef.current.open();
    }
  };

  return (
    <div>
      {label && <Label htmlFor={inputId}>{label}</Label>}

      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          placeholder={placeholder}
          disabled={disabled}
          onClick={handleInputClick}
          readOnly
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
