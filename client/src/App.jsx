import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
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
          <div className="flex min-h-screen flex-col bg-[#fafaf8]">
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

            <footer className="mt-16 border-t border-stone-200 bg-white">
              <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
                      <Leaf className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-extrabold text-stone-900">
                      Virar <span className="text-emerald-600">Organics</span>
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-stone-500">
                    Pure, chemical-free organic foods sourced directly from Sahyadri and Maharashtra farms.
                  </p>
                  <div className="mt-4 space-y-2 text-xs text-stone-600">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-600" /> Virar West, Palghar, Maharashtra 401303
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-600" /> +91 98200 11111
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-emerald-600" /> care@virarorganics.in
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-stone-900">Store</h4>
                  <ul className="mt-3 space-y-2 text-sm text-stone-600">
                    <li><Link to="/" className="hover:text-emerald-600">All Products</Link></li>
                    <li><Link to="/?category=Honey+%26+Sweeteners" className="hover:text-emerald-600">Honey &amp; Sweeteners</Link></li>
                    <li><Link to="/?category=Cold-Pressed+Oils" className="hover:text-emerald-600">Cold-Pressed Oils</Link></li>
                    <li><Link to="/?category=Ghee+%26+Dairy" className="hover:text-emerald-600">A2 Bilona Ghee</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-stone-900">Customer Care</h4>
                  <ul className="mt-3 space-y-2 text-sm text-stone-600">
                    <li><Link to="/login" className="hover:text-emerald-600">Sign In / Register</Link></li>
                    <li><Link to="/cart" className="hover:text-emerald-600">View Cart</Link></li>
                    <li><Link to="/orders" className="hover:text-emerald-600">Track My Orders</Link></li>
                    <li><Link to="/bulk-enquiry" className="hover:text-emerald-600">Bulk &amp; Wholesale Enquiry</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-stone-900">Staff &amp; Operations</h4>
                  <ul className="mt-3 space-y-2 text-sm text-stone-600">
                    <li><Link to="/admin" className="hover:text-emerald-600">Admin Dashboard</Link></li>
                    <li><Link to="/admin/leads" className="hover:text-emerald-600">Sales CRM &amp; Leads</Link></li>
                    <li><Link to="/admin/orders" className="hover:text-emerald-600">Order Fulfillment</Link></li>
                    <li><Link to="/admin/products" className="hover:text-emerald-600">Inventory Management</Link></li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-stone-200 bg-stone-50 py-4">
                <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-6 text-xs text-stone-500">
                  <span>© {new Date().getFullYear()} Virar Organics. All rights reserved.</span>
                  <span>Built with Express, SQLite (ACID Transactions), React &amp; Tailwind CSS</span>
                </div>
              </div>
            </footer>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
