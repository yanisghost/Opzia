// src/components/layout/AdminLayout/AdminLayout.jsx
// Layout shell for all admin pages.
// Contains: AdminSidebar (left) + page content (right via <Outlet>).
// Used as the element for the /admin parent route — child routes render
// into the <Outlet>.

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@components/layout/AdminSidebar/AdminSidebar';
import AdminTopbar from '@components/layout/AdminTopbar/AdminTopbar';
import styles from './AdminLayout.module.css';

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {isSidebarOpen && (
        <div className={styles.backdrop} onClick={() => setIsSidebarOpen(false)} />
      )}
      
      <div className={styles.content}>
        <AdminTopbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
