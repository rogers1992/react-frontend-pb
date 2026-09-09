import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LandingRedirect from "./components/auth/LandingRedirect";
import PermissionRoute from "./components/auth/PermissionRoute";

// Auth pages (small, eagerly loaded)
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import Unauthorized from "./pages/OtherPage/Unauthorized";

// Lazy-loaded page components
const DashboardPage = lazy(() => import("./pages/Dashboard/DashboardPage"));
const ProductIndex = lazy(() => import("./pages/Products/ProductIndex"));
const CategoryIndex = lazy(() => import("./pages/Categories/CategoryIndex"));
const SupplierIndex = lazy(() => import("./pages/Suppliers/SupplierIndex"));
const InventoryIndex = lazy(() => import("./pages/Inventory/InventoryIndex"));
const WarehouseIndex = lazy(() => import("./pages/Warehouses/WarehouseIndex"));
const SalesHistory = lazy(() => import("./pages/Sales/SalesHistory"));
const SalesPOS = lazy(() => import("./pages/Sales/SalesPOS"));
const PurchaseHistory = lazy(() => import("./pages/Purchases/PurchaseHistory"));
const PurchasePOS = lazy(() => import("./pages/Purchases/PurchasePOS"));
const UserIndex = lazy(() => import("./pages/Users/UserIndex"));
const RoleIndex = lazy(() => import("./pages/Roles/RoleIndex"));
const CustomerIndex = lazy(() => import("./pages/Customers/CustomerIndex"));
const NotificationIndex = lazy(() => import("./pages/Notifications/NotificationIndex"));
const ReportsIndex = lazy(() => import("./pages/Reports/ReportsIndex"));
const CajaIndex = lazy(() => import("./pages/Caja/CajaIndex"));
const CajaMovements = lazy(() => import("./pages/Caja/CajaMovements"));
const CajaHistory = lazy(() => import("./pages/Caja/CajaHistory"));

// UI demo pages (lazy)
const UserProfiles = lazy(() => import("./pages/UserProfiles"));
const Videos = lazy(() => import("./pages/UiElements/Videos"));
const Images = lazy(() => import("./pages/UiElements/Images"));
const Alerts = lazy(() => import("./pages/UiElements/Alerts"));
const Badges = lazy(() => import("./pages/UiElements/Badges"));
const Avatars = lazy(() => import("./pages/UiElements/Avatars"));
const Buttons = lazy(() => import("./pages/UiElements/Buttons"));
const LineChart = lazy(() => import("./pages/Charts/LineChart"));
const BarChart = lazy(() => import("./pages/Charts/BarChart"));
const Calendar = lazy(() => import("./pages/Calendar"));
const BasicTables = lazy(() => import("./pages/Tables/BasicTables"));
const FormElements = lazy(() => import("./pages/Forms/FormElements"));
const Blank = lazy(() => import("./pages/Blank"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
    </div>
  );
}

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
            <Route path="/products" element={<Suspense fallback={<PageLoader />}><ProductIndex /></Suspense>} />
            <Route path="/categories" element={<Suspense fallback={<PageLoader />}><CategoryIndex /></Suspense>} />
            <Route path="/suppliers" element={<Suspense fallback={<PageLoader />}><SupplierIndex /></Suspense>} />
            <Route path="/inventory" element={<Suspense fallback={<PageLoader />}><InventoryIndex /></Suspense>} />
            <Route path="/warehouses" element={
              <PermissionRoute resource="inventory" action="read">
                <Suspense fallback={<PageLoader />}><WarehouseIndex /></Suspense>
              </PermissionRoute>
            } />
            <Route path="/sales" element={
              <PermissionRoute resource="sales" action="read">
                <Suspense fallback={<PageLoader />}><SalesHistory /></Suspense>
              </PermissionRoute>
            } />
            <Route path="/sales/new" element={
              <PermissionRoute resource="sales" action="create">
                <Suspense fallback={<PageLoader />}><SalesPOS /></Suspense>
              </PermissionRoute>
            } />
            <Route path="/purchases" element={
              <PermissionRoute resource="purchases" action="read">
                <Suspense fallback={<PageLoader />}><PurchaseHistory /></Suspense>
              </PermissionRoute>
            } />
            <Route path="/purchases/new" element={
              <PermissionRoute resource="purchases" action="create">
                <Suspense fallback={<PageLoader />}><PurchasePOS /></Suspense>
              </PermissionRoute>
            } />

            {/* Administration - permission gated */}
            <Route
              path="/users"
              element={
                <PermissionRoute resource="users" action="read">
                  <Suspense fallback={<PageLoader />}><UserIndex /></Suspense>
                </PermissionRoute>
              }
            />
            <Route
              path="/roles"
              element={
                <PermissionRoute resource="roles" action="read">
                  <Suspense fallback={<PageLoader />}><RoleIndex /></Suspense>
                </PermissionRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <PermissionRoute resource="customers" action="read">
                  <Suspense fallback={<PageLoader />}><CustomerIndex /></Suspense>
                </PermissionRoute>
              }
            />

            {/* Analytics & reports - permission gated to reports.read */}
            <Route
              path="/dashboard"
              element={
                <PermissionRoute resource="reports" action="read">
                  <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>
                </PermissionRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PermissionRoute resource="reports" action="read">
                  <Suspense fallback={<PageLoader />}><ReportsIndex /></Suspense>
                </PermissionRoute>
              }
            />

            {/* Cash Register - permission gated */}
            <Route
              path="/caja"
              element={
                <PermissionRoute resource="cash_register" action="read">
                  <Suspense fallback={<PageLoader />}><CajaIndex /></Suspense>
                </PermissionRoute>
              }
            />
            <Route
              path="/caja/movements"
              element={
                <PermissionRoute resource="cash_register" action="read">
                  <Suspense fallback={<PageLoader />}><CajaMovements /></Suspense>
                </PermissionRoute>
              }
            />
            <Route
              path="/caja/history"
              element={
                <PermissionRoute resource="cash_register" action="read">
                  <Suspense fallback={<PageLoader />}><CajaHistory /></Suspense>
                </PermissionRoute>
              }
            />

            <Route path="/no-autizado" element={<Unauthorized />} />
            <Route path="/notifications" element={<Suspense fallback={<PageLoader />}><NotificationIndex /></Suspense>} />

            {/* Others Page */}
            <Route path="/profile" element={<Suspense fallback={<PageLoader />}><UserProfiles /></Suspense>} />
            <Route path="/calendar" element={<Suspense fallback={<PageLoader />}><Calendar /></Suspense>} />
            <Route path="/blank" element={<Suspense fallback={<PageLoader />}><Blank /></Suspense>} />

            {/* Forms */}
            <Route path="/form-elements" element={<Suspense fallback={<PageLoader />}><FormElements /></Suspense>} />

            {/* Tables */}
            <Route path="/basic-tables" element={<Suspense fallback={<PageLoader />}><BasicTables /></Suspense>} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Suspense fallback={<PageLoader />}><Alerts /></Suspense>} />
            <Route path="/avatars" element={<Suspense fallback={<PageLoader />}><Avatars /></Suspense>} />
            <Route path="/badge" element={<Suspense fallback={<PageLoader />}><Badges /></Suspense>} />
            <Route path="/buttons" element={<Suspense fallback={<PageLoader />}><Buttons /></Suspense>} />
            <Route path="/images" element={<Suspense fallback={<PageLoader />}><Images /></Suspense>} />
            <Route path="/videos" element={<Suspense fallback={<PageLoader />}><Videos /></Suspense>} />

            {/* Charts */}
            <Route path="/line-chart" element={<Suspense fallback={<PageLoader />}><LineChart /></Suspense>} />
            <Route path="/bar-chart" element={<Suspense fallback={<PageLoader />}><BarChart /></Suspense>} />
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
