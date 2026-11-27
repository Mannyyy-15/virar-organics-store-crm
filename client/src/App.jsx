import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import StorePage from './pages/StorePage';
import ProductDetailPage from './pages/ProductDetailPage';
import BulkEnquiryPage from './pages/BulkEnquiryPage';
import CartCheckoutPage from './pages/CartCheckoutPage';
import MyOrdersPage from './pages/MyOrdersPage';
import LoginPage from './pages/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminLeads from './pages/admin/AdminLeads';

function RequireAdminOnly({ children }) {
  const { user } = useAuth();
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/admin/leads" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<StorePage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/bulk-enquiry" element={<BulkEnquiryPage />} />
                <Route path="/cart" element={<CartCheckoutPage />} />
                <Route path="/orders" element={<MyOrdersPage />} />
                <Route path="/login" element={<LoginPage />} />

                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="leads" element={<AdminLeads />} />
                  <Route
                    path="products"
                    element={
                      <RequireAdminOnly>
                        <AdminProducts />
                      </RequireAdminOnly>
                    }
                  />
                  <Route
                    path="orders"
                    element={
                      <RequireAdminOnly>
                        <AdminOrders />
                      </RequireAdminOnly>
                    }
                  />
                </Route>
              </Routes>
            </main>
            <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
              © {new Date().getFullYear()} Virar Organics — Pure Organic Foods & Mini CRM
            </footer>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
