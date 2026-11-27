import { BrowserRouter, Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';
import { Leaf, MapPin, Phone, Mail } from 'lucide-react';
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
import AdminLoginPage from './pages/admin/AdminLoginPage';
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

function StoreShell() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <Navbar />
      <main className="w-full flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 w-full border-t border-[#ececec] bg-white">
        <div className="grid w-full grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-12">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3bb77e] text-white">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold text-[#253d4e]">
                Virar <span className="text-[#3bb77e]">Organics</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-[#7e7e7e]">
              Pure, chemical-free organic foods sourced directly from Sahyadri and Maharashtra farms.
            </p>
            <div className="mt-4 space-y-2 text-xs text-[#253d4e]">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#3bb77e]" /> Virar West, Palghar, Maharashtra 401303
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#3bb77e]" /> +91 98200 11111
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#3bb77e]" /> care@virarorganics.in
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-[#253d4e]">Categories</h4>
            <ul className="mt-3 space-y-2 text-sm text-[#7e7e7e]">
              <li><Link to="/" className="hover:text-[#3bb77e]">All Products</Link></li>
              <li><Link to="/?category=Honey+%26+Sweeteners" className="hover:text-[#3bb77e]">Honey &amp; Sweeteners</Link></li>
              <li><Link to="/?category=Cold-Pressed+Oils" className="hover:text-[#3bb77e]">Cold-Pressed Oils</Link></li>
              <li><Link to="/?category=Ghee+%26+Dairy" className="hover:text-[#3bb77e]">A2 Bilona Ghee</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#253d4e]">Customer Account</h4>
            <ul className="mt-3 space-y-2 text-sm text-[#7e7e7e]">
              <li><Link to="/login" className="hover:text-[#3bb77e]">Sign In / Register</Link></li>
              <li><Link to="/cart" className="hover:text-[#3bb77e]">View Cart</Link></li>
              <li><Link to="/orders" className="hover:text-[#3bb77e]">Track My Orders</Link></li>
              <li><Link to="/bulk-enquiry" className="hover:text-[#3bb77e]">Bulk &amp; Wholesale Enquiry</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#253d4e]">Our Promise</h4>
            <ul className="mt-3 space-y-2 text-sm text-[#7e7e7e]">
              <li>100% Farm-Direct Sourcing</li>
              <li>Lab-Tested Zero Adulteration</li>
              <li>Live Real-Time Inventory</li>
              <li>Same-Day Dispatch in Virar &amp; Vasai</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#ececec] bg-[#fafaf8] py-4">
          <div className="flex w-full flex-wrap items-center justify-between gap-2 px-4 text-xs text-[#7e7e7e] sm:px-8 lg:px-12">
            <span>© {new Date().getFullYear()} Virar Organics. All rights reserved.</span>
            <span>Need help? Call 1800-888-123</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public & Customer Storefront */}
            <Route element={<StoreShell />}>
              <Route path="/" element={<StorePage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/bulk-enquiry" element={<BulkEnquiryPage />} />
              <Route path="/cart" element={<CartCheckoutPage />} />
              <Route path="/orders" element={<MyOrdersPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Separate Internal Staff / Admin / CRM Portal */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
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
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
