import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import Button from "../../components/ui/button/Button";
import { PlusIcon } from "../../icons";
import { useToast } from "../../context/ToastContext";
import { salesService } from "../../services/sales.service";
import { customerService } from "../../services/customer.service";
import { userService } from "../../services/user.service";
import { getErrorMessage } from "../../utils/error";
import type { Sale, Customer, User } from "../../types";
import { getSaleColumns } from "./components/SaleTable";
import SaleDetailModal from "./components/SaleDetailModal";

export default function SalesHistory() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [salesData, customersData, usersData] = await Promise.all([
        salesService.getAll(0, 200),
        customerService.getAll(0, 1000),
        userService.getAll(0, 1000),
      ]);
      setSales(salesData);
      setCustomers(customersData.items);
      setUsers(usersData);
    } catch (error) {
      const message = getErrorMessage(error, "Error al cargar las ventas.");
      showToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const customerMap = useMemo(() => {
    const map = new Map<number, string>();
    customers.forEach((c) => {
      map.set(c.id, `${c.first_name} ${c.last_name}`);
    });
    return map;
  }, [customers]);

  const userMap = useMemo(() => {
    const map = new Map<number, string>();
    users.forEach((u) => {
      map.set(u.id, `${u.first_name} ${u.last_name}`);
    });
    return map;
  }, [users]);

  const filteredSales = useMemo(() => {
    if (!searchQuery.trim()) return sales;
    const query = searchQuery.toLowerCase();
    return sales.filter((sale) => {
      const customerName = customerMap.get(sale.customer_id)?.toLowerCase() ?? "";
      const saleId = String(sale.id);
      return customerName.includes(query) || saleId.includes(query);
    });
  }, [sales, searchQuery, customerMap]);

  const handleViewDetail = useCallback((sale: Sale) => {
    setSelectedSale(sale);
    setShowDetail(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false);
    setSelectedSale(null);
  }, []);

  const columns = getSaleColumns(customerMap, userMap, handleViewDetail);

  const customerName = selectedSale
    ? customerMap.get(selectedSale.customer_id) ?? "Cliente General"
    : "";

  const sellerName = selectedSale
    ? userMap.get(selectedSale.user_id) ?? "Desconocido"
    : "";

  return (
    <>
      <PageMeta title="Historial de Ventas | Paraiso Biker" description="Historial de ventas - Paraiso Biker" />
      <PageBreadcrumb pageTitle="Historial de Ventas" />

      <DataTable<Sale>
        columns={columns}
        data={filteredSales}
        loading={loading}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por cliente o ID de venta..."
        emptyMessage="No se encontraron ventas."
        actions={
          <Button
            size="sm"
            variant="primary"
            startIcon={<PlusIcon />}
            onClick={() => navigate("/sales/new")}
          >
            Nueva Venta
          </Button>
        }
      />

      <SaleDetailModal
        isOpen={showDetail}
        sale={selectedSale}
        customerName={customerName}
        sellerName={sellerName}
        onClose={handleCloseDetail}
      />
    </>
  );
}
