import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LandingRedirect from "./components/auth/LandingRedirect";
import ProductIndex from "./pages/Products/ProductIndex";
import CategoryIndex from "./pages/Categories/CategoryIndex";
import SupplierIndex from "./pages/Suppliers/SupplierIndex";
import InventoryIndex from "./pages/Inventory/InventoryIndex";
import WarehouseIndex from "./pages/Warehouses/WarehouseIndex";
import SalesHistory from "./pages/Sales/SalesHistory";
import SalesPOS from "./pages/Sales/SalesPOS";
import PurchaseHistory from "./pages/Purchases/PurchaseHistory";
import PurchasePOS from "./pages/Purchases/PurchasePOS";
import UserIndex from "./pages/Users/UserIndex";
import RoleIndex from "./pages/Roles/RoleIndex";
import NotificationIndex from "./pages/Notifications/NotificationIndex";
import Unauthorized from "./pages/OtherPage/Unauthorized";
import PermissionRoute from "./components/auth/PermissionRoute";
import CustomerIndex from "./pages/Customers/CustomerIndex";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import ReportsIndex from "./pages/Reports/ReportsIndex";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<LandingRedirect />} />
            <Route path="/products" element={<ProductIndex />} />
            <Route path="/categories" element={<CategoryIndex />} />
            <Route path="/suppliers" element={<SupplierIndex />} />
            <Route path="/inventory" element={<InventoryIndex />} />
            <Route path="/warehouses" element={
              <PermissionRoute resource="inventory" action="read">
                <WarehouseIndex />
              </PermissionRoute>
            } />
            <Route path="/sales" element={
              <PermissionRoute resource="sales" action="read">
                <SalesHistory />
              </PermissionRoute>
            } />
            <Route path="/sales/new" element={
              <PermissionRoute resource="sales" action="create">
                <SalesPOS />
              </PermissionRoute>
            } />
            <Route path="/purchases" element={
              <PermissionRoute resource="purchases" action="read">
                <PurchaseHistory />
              </PermissionRoute>
            } />
            <Route path="/purchases/new" element={
              <PermissionRoute resource="purchases" action="create">
                <PurchasePOS />
              </PermissionRoute>
            } />

            {/* Administration - permission gated */}
            <Route
              path="/users"
              element={
                <PermissionRoute resource="users" action="read">
                  <UserIndex />
                </PermissionRoute>
              }
            />
            <Route
              path="/roles"
              element={
                <PermissionRoute resource="roles" action="read">
                  <RoleIndex />
                </PermissionRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <PermissionRoute resource="customers" action="read">
                  <CustomerIndex />
                </PermissionRoute>
              }
            />

            {/* Analytics & reports - permission gated to reports.read */}
            <Route
              path="/dashboard"
              element={
                <PermissionRoute resource="reports" action="read">
                  <DashboardPage />
                </PermissionRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PermissionRoute resource="reports" action="read">
                  <ReportsIndex />
                </PermissionRoute>
              }
            />

            <Route path="/no-autizado" element={<Unauthorized />} />
            <Route path="/notifications" element={<NotificationIndex />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
