import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ResponsiveImage from "../../components/ui/images/ResponsiveImage";
import TwoColumnImageGrid from "../../components/ui/images/TwoColumnImageGrid";
import ThreeColumnImageGrid from "../../components/ui/images/ThreeColumnImageGrid";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

export default function Images() {
  return (
    <>
      <PageMeta
        title="Imágenes | Paraiso Biker"
        description="Página de imágenes del panel de administración de Paraiso Biker"
      />
      <PageBreadcrumb pageTitle="Imágenes" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Imagen responsiva">
          <ResponsiveImage />
        </ComponentCard>
        <ComponentCard title="Imagen en cuadrícula de 2">
          <TwoColumnImageGrid />
        </ComponentCard>
        <ComponentCard title="Imagen en cuadrícula de 3">
          <ThreeColumnImageGrid />
        </ComponentCard>
      </div>
    </>
  );
}
