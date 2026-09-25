import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Label from "../../../components/form/Label";
import DatePicker from "../../../components/form/date-picker";
import type { Customer, CustomerCreate, CustomerUpdate } from "../../../types";

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerCreate | CustomerUpdate) => void;
  customer?: Customer | null;
  loading?: boolean;
}

export default function CustomerForm({
  isOpen,
  onClose,
  onSubmit,
  customer,
  loading = false,
}: CustomerFormProps) {
  const isEditing = !!customer;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  useEffect(() => {
    if (customer) {
      setFirstName(customer.first_name);
      setLastName(customer.last_name);
      setEmail(customer.email ?? "");
      setPhone(customer.phone ?? "");
      setAddress(customer.address ?? "");
      setDateOfBirth(customer.date_of_birth ?? "");
    } else {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setDateOfBirth("");
    }
  }, [customer, isOpen]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      first_name: firstName,
      last_name: lastName,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
      date_of_birth: dateOfBirth || undefined,
    };

    if (isEditing) {
      onSubmit(payload as CustomerUpdate);
    } else {
      onSubmit(payload as CustomerCreate);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6 sm:p-8">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isEditing
            ? "Actualiza la informacion del cliente."
            : "Completa los campos para crear un nuevo cliente."}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>
                Nombre <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Nombre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label>
                Apellido <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Apellido"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label>Correo Electronico</Label>
            <Input
              type="email"
              placeholder="cliente@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <Label>Telefono</Label>
            <Input
              type="tel"
              placeholder="+52 55 1234 5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <Label>Direccion</Label>
            <TextArea
              placeholder="Direccion completa del cliente"
              rows={2}
              value={address}
              onChange={setAddress}
              disabled={loading}
            />
          </div>

          <div>
            <DatePicker
              id="customer-date-of-birth"
              label="Fecha de Nacimiento"
              value={dateOfBirth}
              onChange={setDateOfBirth}
              disabled={loading}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={loading || !firstName || !lastName}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Guardando...
              </span>
            ) : isEditing ? (
              "Actualizar"
            ) : (
              "Crear"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
