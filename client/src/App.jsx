import { BrowserRouter, Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';
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

      {/* Dark Forest Green Footer (Matching Reference) */}
      <footer className="mt-8 w-full bg-[#2f5219] text-white">
        <div className="grid w-full grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 sm:px-8 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Stay Updated</h4>
            <p className="mt-2 text-xs text-emerald-100/80">
              Get the best organic deals &amp; wholesale updates delivered to your inbox.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-4 flex max-w-sm overflow-hidden rounded-md bg-white"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 text-xs text-[#1f2e18] focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#f3c63f] px-4 py-2 text-xs font-extrabold uppercase text-[#1f2e18] hover:bg-[#e5b832]"
              >
                Subscribe
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Shop</h4>
            <ul className="mt-3 space-y-2 text-xs text-emerald-100/80">
              <li><Link to="/" className="hover:text-white">All Categories</Link></li>
              <li><Link to="/?category=Honey+%26+Sweeteners" className="hover:text-white">Honey &amp; Sweeteners</Link></li>
              <li><Link to="/?category=Cold-Pressed+Oils" className="hover:text-white">Cold-Pressed Oils</Link></li>
              <li><Link to="/?category=Ghee+%26+Dairy" className="hover:text-white">A2 Bilona Ghee</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Help</h4>
            <ul className="mt-3 space-y-2 text-xs text-emerald-100/80">
              <li><Link to="/orders" className="hover:text-white">Track Order</Link></li>
              <li><Link to="/cart" className="hover:text-white">View Cart</Link></li>
              <li><Link to="/login" className="hover:text-white">My Account</Link></li>
              <li><Link to="/bulk-enquiry" className="hover:text-white">Wholesale Enquiry</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Company</h4>
            <ul className="mt-3 space-y-2 text-xs text-emerald-100/80">
              <li>Virar West, Maharashtra</li>
              <li>+91 98200 11111</li>
              <li>care@virarorganics.in</li>
              <li>100% Farm-Direct Sourcing</li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Bulk &amp; B2B</h4>
            <p className="mt-2 text-xs text-emerald-100/80">
              Ordering for a cafe, society, or retail store?
            </p>
            <Link
              to="/bulk-enquiry"
              className="mt-3 inline-block rounded-md bg-[#f3c63f] px-4 py-2 text-xs font-extrabold uppercase text-[#1f2e18] hover:bg-[#e5b832]"
            >
              Request Quote
            </Link>
          </div>
        </div>

        <div className="border-t border-white/15 py-4">
          <div className="flex w-full flex-wrap items-center justify-between gap-2 px-4 text-[11px] text-emerald-100/75 sm:px-8 lg:px-12">
            <span>© {new Date().getFullYear()} Virar Organics. All rights reserved.</span>
            <span>Privacy Policy &nbsp;|&nbsp; Terms &amp; Conditions</span>
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
