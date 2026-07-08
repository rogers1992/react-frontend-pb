import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Alert from "../../components/ui/alert/Alert";
import PageMeta from "../../components/common/PageMeta";

export default function Alerts() {
  return (
    <>
      <PageMeta
        title="Alertas | Paraiso Biker"
        description="Página de alertas del panel de administración de Paraiso Biker"
      />
      <PageBreadcrumb pageTitle="Alertas" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Alerta de Éxito">
          <Alert
            variant="success"
            title="Mensaje de éxito"
            message="Ten cuidado al realizar esta acción."
            showLink={true}
            linkHref="/"
            linkText="Ver más"
          />
          <Alert
            variant="success"
            title="Mensaje de éxito"
            message="Ten cuidado al realizar esta acción."
            showLink={false}
          />
        </ComponentCard>
        <ComponentCard title="Alerta de Advertencia">
          <Alert
            variant="warning"
            title="Mensaje de advertencia"
            message="Ten cuidado al realizar esta acción."
            showLink={true}
            linkHref="/"
            linkText="Ver más"
          />
          <Alert
            variant="warning"
            title="Mensaje de advertencia"
            message="Ten cuidado al realizar esta acción."
            showLink={false}
          />
        </ComponentCard>{" "}
        <ComponentCard title="Alerta de Error">
          <Alert
            variant="error"
            title="Mensaje de error"
            message="Ten cuidado al realizar esta acción."
            showLink={true}
            linkHref="/"
            linkText="Ver más"
          />
          <Alert
            variant="error"
            title="Mensaje de error"
            message="Ten cuidado al realizar esta acción."
            showLink={false}
          />
        </ComponentCard>{" "}
        <ComponentCard title="Alerta Informativa">
          <Alert
            variant="info"
            title="Mensaje informativo"
            message="Ten cuidado al realizar esta acción."
            showLink={true}
            linkHref="/"
            linkText="Ver más"
          />
          <Alert
            variant="info"
            title="Mensaje informativo"
            message="Ten cuidado al realizar esta acción."
            showLink={false}
          />
        </ComponentCard>
      </div>
    </>
  );
}
