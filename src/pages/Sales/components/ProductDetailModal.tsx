import { Modal } from "../../../components/ui/modal";
import ImageGallery from "../../../components/common/ImageGallery";
import Badge from "../../../components/ui/badge/Badge";
import type { Product, Category } from "../../../types";

interface ProductDetailModalProps {
  isOpen: boolean;
  product: Product | null;
  category: Category | undefined;
  stockQuantity: number;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

function getStockBadge(stock: number) {
  if (stock === 0) return { color: "error" as const, label: "Agotado" };
  if (stock <= 10) return { color: "warning" as const, label: "Poco stock" };
  return { color: "success" as const, label: "En stock" };
}

export default function ProductDetailModal({
  isOpen,
  product,
  category,
  stockQuantity,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  if (!product) return null;

  const price =
    typeof product.unit_price === "string"
      ? parseFloat(product.unit_price)
      : product.unit_price;
  const { color, label } = getStockBadge(stockQuantity);
  const isOutOfStock = stockQuantity === 0;

  const images: string[] = [];
  if (product.images && product.images.length > 0) {
    product.images
      .sort((a, b) => a.sort_order - b.sort_order)
      .forEach((img) => {
        if (img.image_url) {
          images.push(img.image_url);
        }
      });
  } else if (product.image_url) {
    images.push(product.image_url);
  }

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      onAddToCart(product, 1);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl p-0 overflow-hidden"
    >
      <div className="flex flex-col max-h-[95vh]">
        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col max-h-[95vh]">
          <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900">
            <ImageGallery images={images} alt={product.name} />
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                  {product.name}
                </h2>
                {category && (
                  <Badge color="info" size="sm">
                    {category.name}
                  </Badge>
                )}
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-3xl font-bold text-brand-500">
                  Bs{price.toFixed(2)}
                </p>
              </div>
            </div>

            {product.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <Badge size="sm" color={color}>
              {label}
            </Badge>
          </div>

          <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-5">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full bg-brand-500 text-white font-semibold py-3.5 px-6 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-base shadow-lg shadow-brand-500/20"
            >
              {isOutOfStock ? "Producto agotado" : "Agregar al carrito"}
            </button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex flex-col max-h-[95vh]">
          <div className="flex flex-row min-h-0">
            <div className="w-1/2 flex-shrink-0 bg-gray-50 dark:bg-gray-900 p-6">
              <ImageGallery images={images} alt={product.name} />
            </div>

            <div className="w-1/2 flex flex-col overflow-y-auto p-6 space-y-5 custom-scrollbar">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  {product.name}
                </h2>
                <div className="flex items-center gap-3">
                  {category && (
                    <Badge color="info" size="md">
                      {category.name}
                    </Badge>
                  )}
                </div>
                <p className="text-4xl font-bold text-brand-500 mt-3">
                  Bs{price.toFixed(2)}
                </p>
              </div>

              {product.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Descripción
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              <Badge size="sm" color={color}>
                {label}
              </Badge>
            </div>
          </div>

          <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-6 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full bg-brand-500 text-white font-semibold py-3.5 px-6 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-base shadow-lg shadow-brand-500/20"
            >
              {isOutOfStock ? "Producto agotado" : "Agregar al carrito"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
