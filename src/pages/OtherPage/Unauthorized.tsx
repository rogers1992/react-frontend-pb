import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";

export default function Unauthorized() {
  return (
    <>
      <PageMeta
        title="No autorizado | Paraiso Biker"
        description="Acceso denegado - Paraiso Biker"
      />
      <PageBreadcrumb pageTitle="No autorizado" />
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-error-50 text-error-500 dark:bg-error-500/15 dark:text-error-400">
          <svg
            className="fill-current"
            width="32"
            height="32"
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
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
          No tienes permiso para acceder a esta pagina
        </h3>
        <p className="mb-6 max-w-md text-sm text-gray-500 dark:text-gray-400">
          Tu rol actual no incluye los permisos necesarios para ver esta
          seccion. Contacta a un administrador si crees que es un error.
        </p>
        <Link to="/">
          <Button variant="primary" size="sm">
            Volver al inicio
          </Button>
        </Link>
      </div>
    </>
  );
}
