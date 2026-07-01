// src/routes/AppRouter.jsx
// Defines all application routes. Every page-level component is lazy-loaded
// via React.lazy() for automatic Vite code-splitting.
// Layout wrappers (Navbar + Footer) are applied to customer-facing routes.
// Admin routes use AdminLayout independently.

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import Navbar from '@components/layout/Navbar/Navbar';
import Footer from '@components/layout/Footer/Footer';
import AdminLayout from '@components/layout/AdminLayout/AdminLayout';
import Spinner from '@components/ui/Spinner/Spinner';

// ─── Customer Pages ──────────────────────────────────────────────────────
const HomePage            = lazy(() => import('@pages/HomePage/HomePage'));
const ShopAllPage         = lazy(() => import('@pages/ShopAllPage/ShopAllPage'));
const ProductDetailsPage  = lazy(() => import('@pages/ProductDetailsPage/ProductDetailsPage'));
const PackDetailsPage     = lazy(() => import('@pages/PackDetailsPage/PackDetailsPage'));
const BagPage             = lazy(() => import('@pages/BagPage/BagPage'));
const CheckoutPage        = lazy(() => import('@pages/CheckoutPage/CheckoutPage'));
const ContactPage         = lazy(() => import('@pages/ContactPage/ContactPage'));
const OrderConfirmedPage  = lazy(() => import('@pages/OrderConfirmedPage/OrderConfirmedPage'));
const OrderStatusPage     = lazy(() => import('@pages/OrderStatusPage/OrderStatusPage'));

// ─── Account Pages ───────────────────────────────────────────────────────
const LoginPage           = lazy(() => import('@pages/account/LoginPage/LoginPage'));
const SignupPage          = lazy(() => import('@pages/account/SignupPage/SignupPage'));
const ForgotPasswordPage  = lazy(() => import('@pages/account/ForgotPasswordPage/ForgotPasswordPage'));
const ResetPasswordPage   = lazy(() => import('@pages/account/ResetPasswordPage/ResetPasswordPage'));
const MyProfilePage       = lazy(() => import('@pages/account/MyProfilePage/MyProfilePage'));
const MyOrdersPage        = lazy(() => import('@pages/account/MyOrdersPage/MyOrdersPage'));

// ─── Admin Pages ─────────────────────────────────────────────────────────
const AdminDashboard        = lazy(() => import('@pages/admin/AdminDashboard/AdminDashboard'));
const AdminProductsPage     = lazy(() => import('@pages/admin/AdminProductsPage/AdminProductsPage'));
const AdminProductCreatePage = lazy(() => import('@pages/admin/AdminProductCreatePage/AdminProductCreatePage'));
const AdminProductEditPage  = lazy(() => import('@pages/admin/AdminProductEditPage/AdminProductEditPage'));
const AdminPacksPage        = lazy(() => import('@pages/admin/AdminPacksPage/AdminPacksPage'));
const AdminPackCreatePage   = lazy(() => import('@pages/admin/AdminPackCreatePage/AdminPackCreatePage'));
const AdminPackEditPage     = lazy(() => import('@pages/admin/AdminPackEditPage/AdminPackEditPage'));
const AdminCategoriesPage   = lazy(() => import('@pages/admin/AdminCategoriesPage/AdminCategoriesPage'));
const AdminOrdersPage       = lazy(() => import('@pages/admin/AdminOrdersPage/AdminOrdersPage'));
const AdminOrderDetailPage  = lazy(() => import('@pages/admin/AdminOrderDetailPage/AdminOrderDetailPage'));
const AdminDiscountsPage    = lazy(() => import('@pages/admin/AdminDiscountsPage/AdminDiscountsPage'));
const AdminStatisticsPage   = lazy(() => import('@pages/admin/AdminStatisticsPage/AdminStatisticsPage'));
const AdminUsersPage        = lazy(() => import('@pages/admin/AdminUsersPage/AdminUsersPage'));
const AdminShippingPage     = lazy(() => import('@pages/admin/AdminShippingPage/AdminShippingPage'));

// ─── Page Loading Fallback ───────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}>
      <Spinner size="lg" />
    </div>
  );
}

// ─── Customer Layout Wrapper ─────────────────────────────────────────────
// Wraps all customer-facing pages with the shared Navbar + Footer.
function CustomerLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

// ─── Router ──────────────────────────────────────────────────────────────
function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* ── Customer-facing routes (Navbar + Footer) ── */}
          <Route
            path="/"
            element={
              <CustomerLayout>
                <HomePage />
              </CustomerLayout>
            }
          />
          <Route
            path="/shop"
            element={
              <CustomerLayout>
                <ShopAllPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/shop/:id"
            element={
              <CustomerLayout>
                <ProductDetailsPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/packs/:id"
            element={
              <CustomerLayout>
                <PackDetailsPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/bag"
            element={
              <CustomerLayout>
                <BagPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/checkout"
            element={
              <CustomerLayout>
                <CheckoutPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <CustomerLayout>
                <OrderStatusPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/order-confirmed"
            element={
              <CustomerLayout>
                <OrderConfirmedPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <CustomerLayout>
                <ContactPage />
              </CustomerLayout>
            }
          />

          {/* ── Account routes (public) ── */}
          <Route path="/account/login"           element={<LoginPage />} />
          <Route path="/account/signup"          element={<SignupPage />} />
          <Route path="/account/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/account/reset/:token"    element={<ResetPasswordPage />} />

          {/* ── Account routes (protected — requires auth) ── */}
          <Route
            path="/account/me"
            element={
              <ProtectedRoute>
                <CustomerLayout>
                  <MyProfilePage />
                </CustomerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/orders"
            element={
              <CustomerLayout>
                <MyOrdersPage />
              </CustomerLayout>
            }
          />

          {/* ── Admin routes (requires role: admin | manager) ── */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            {/* Index redirects to dashboard */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard"              element={<AdminDashboard />} />
            <Route path="products"               element={<AdminProductsPage />} />
            <Route path="products/new"           element={<AdminProductCreatePage />} />
            <Route path="products/:id/edit"      element={<AdminProductEditPage />} />
            <Route path="packs"                  element={<AdminPacksPage />} />
            <Route path="packs/new"              element={<AdminPackCreatePage />} />
            <Route path="packs/:id/edit"         element={<AdminPackEditPage />} />
            <Route path="categories"             element={<AdminCategoriesPage />} />
            <Route path="orders"                 element={<AdminOrdersPage />} />
            <Route path="orders/:id"             element={<AdminOrderDetailPage />} />
            <Route path="discounts"              element={<AdminDiscountsPage />} />
            <Route path="statistics"             element={<AdminStatisticsPage />} />
            <Route path="users"                  element={<AdminUsersPage />} />
            <Route path="shipping"               element={<AdminShippingPage />} />
          </Route>

          {/* ── 404 — catch-all ── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRouter;
