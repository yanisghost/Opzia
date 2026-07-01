// src/pages/admin/AdminUsersPage/AdminUsersPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useUI } from '@hooks/useUI';
import { useLanguage } from '@hooks/useLanguage';
import { userService } from '@services/userService';

import Button from '@components/ui/Button/Button';
import Input from '@components/ui/Input/Input';
import Select from '@components/ui/Select/Select';
import Checkbox from '@components/ui/Checkbox/Checkbox';
import Modal from '@components/ui/Modal/Modal';
import Badge from '@components/ui/Badge/Badge';
import Spinner from '@components/ui/Spinner/Spinner';
import KPICard from '@components/admin/KPICard/KPICard';

import styles from './AdminUsersPage.module.css';

function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { addToast } = useUI();
  const { t, currentLanguage } = useLanguage();

  // Route Guard: Admin only
  if (currentUser?.role !== 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Data State
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPasswordConfirm, setFormPasswordConfirm] = useState('');
  const [formRole, setFormRole] = useState('user');
  const [formActive, setFormActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers({ sort: '-createdAt' });
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load user directory.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Aggregate user role metrics
  const stats = useMemo(() => {
    let admins = 0;
    let managers = 0;
    let clients = 0;
    let active = 0;

    users.forEach((u) => {
      if (u.role === 'admin') admins++;
      else if (u.role === 'manager') managers++;
      else clients++;

      if (u.active !== false) active++;
    });

    return {
      total: users.length,
      admins,
      managers,
      clients,
      active,
    };
  }, [users]);

  // Handle open create user modal
  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedUser(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormPasswordConfirm('');
    setFormRole('user');
    setFormActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle open edit user modal
  const handleOpenEdit = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormName(user.name || '');
    setFormEmail(user.email || '');
    setFormPassword('');
    setFormPasswordConfirm('');
    setFormRole(user.role || 'user');
    setFormActive(user.active !== false);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle delete user
  const handleDelete = async (user) => {
    if (user._id === currentUser._id) {
      addToast("You cannot delete your own account.", "error");
      return;
    }
    const confirmMsg = `Are you sure you want to delete user "${user.name}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await userService.deleteUser(user._id);
      addToast("User deleted successfully.", "success");
      loadUsers();
    } catch (err) {
      addToast(err.message || "Failed to delete user.", "error");
    }
  };

  // Handle modal submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formEmail.trim()) {
      setFormError("Name and Email are required fields.");
      return;
    }

    if (modalMode === 'create') {
      if (!formPassword) {
        setFormError("Password is required for new accounts.");
        return;
      }
      if (formPassword !== formPasswordConfirm) {
        setFormError("Passwords do not match.");
        return;
      }
      if (formPassword.length < 8) {
        setFormError("Password must be at least 8 characters long.");
        return;
      }
    }

    setIsSubmitting(true);

    const payload = {
      name: formName.trim(),
      email: formEmail.trim(),
      role: formRole,
      active: formActive,
    };

    if (modalMode === 'create') {
      payload.password = formPassword;
      payload.passwordConfirm = formPasswordConfirm;
    } else if (formPassword) {
      // Allow password resets during edit
      payload.password = formPassword;
      payload.passwordConfirm = formPasswordConfirm;
    }

    try {
      if (modalMode === 'create') {
        await userService.createUser(payload);
        addToast("User created successfully.", "success");
      } else {
        await userService.updateUser(selectedUser._id, payload);
        addToast("User updated successfully.", "success");
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err) {
      setFormError(err.message || "Failed to save user account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered list
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      const nameMatch = u.name?.toLowerCase().includes(q);
      const emailMatch = u.email?.toLowerCase().includes(q);
      const roleMatch = !roleFilter || u.role === roleFilter;
      
      const isActive = u.active !== false;
      const statusMatch =
        !statusFilter ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'inactive' && !isActive);

      return (nameMatch || emailMatch) && roleMatch && statusMatch;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const roleOptions = [
    { value: 'user', label: 'Customer' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' },
  ];

  const roleFilterOptions = [
    { value: '', label: 'All Roles' },
    { value: 'user', label: 'Customer' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' },
  ];

  const statusFilterOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active Only' },
    { value: 'inactive', label: 'Inactive Only' },
  ];

  const localeCode = currentLanguage === 'ar' ? 'ar-EG' : currentLanguage === 'fr' ? 'fr-FR' : 'en-US';

  return (
    <div className={styles.page}>
      {/* Header Row */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>{t('admin.users.title') || "Users Directory"}</h1>
          <p className={styles.subtitle}>
            Manage backend system roles, invite managers/administrators, and control client accounts.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          Add New User
        </Button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* KPI stats Grid */}
      {!isLoading && (
        <div className={styles.statsSection}>
          <div className={styles.kpiGrid}>
            <KPICard label="Total Users" value={stats.total} />
            <KPICard label="Administrators" value={stats.admins} />
            <KPICard label="Managers" value={stats.managers} />
            <KPICard label="Active Accounts" value={stats.active} />
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filterSelectors}>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={roleFilterOptions}
            className={styles.filterSelect}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusFilterOptions}
            className={styles.filterSelect}
          />
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className={styles.loadingWrap}>
          <Spinner size="lg" />
          <p>Loading users database...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className={styles.empty}>
          No users found matching your search.
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('admin.users.table.name') || "Name"}</th>
                <th>{t('admin.users.table.email') || "Email"}</th>
                <th>{t('admin.users.table.role') || "Role"}</th>
                <th>Status</th>
                <th>{t('admin.users.table.joined') || "Joined Date"}</th>
                <th className={styles.textRight}>{t('admin.users.table.actions') || "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isActive = user.active !== false;
                const dateStr = user.createdAt ? new Date(user.createdAt).toLocaleDateString(localeCode) : '—';
                
                // Color mapping for roles
                const roleVariant = 
                  user.role === 'admin' 
                    ? 'danger' 
                    : user.role === 'manager' 
                    ? 'info' 
                    : 'neutral';

                return (
                  <tr key={user._id}>
                    <td>
                      <strong className={styles.userName}>{user.name}</strong>
                    </td>
                    <td>
                      <span className={styles.userEmail}>{user.email}</span>
                    </td>
                    <td>
                      <Badge variant={roleVariant} className={styles.roleBadge}>
                        {user.role}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={isActive ? 'success' : 'neutral'}>
                        {isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <span className={styles.joinedDate}>{dateStr}</span>
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                        <Button
                          variant="secondary"
                          size="sm"
                          className={styles.actionButton}
                          onClick={() => handleOpenEdit(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className={styles.actionButton}
                          onClick={() => handleDelete(user)}
                          disabled={user._id === currentUser._id}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? "Add New User" : "Edit User Account"}
        size="md"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          {formError && <div className={styles.formError}>{formError}</div>}

          <Input
            label="Full Name"
            placeholder="John Doe"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
            disabled={isSubmitting}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="johndoe@example.com"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />

          {/* Password (Required for create, optional/empty for edit to bypass/reset) */}
          <Input
            label={modalMode === 'create' ? "Password" : "New Password (Optional)"}
            type="password"
            placeholder="••••••••"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
            required={modalMode === 'create'}
            disabled={isSubmitting}
            hint={modalMode === 'edit' ? "Leave empty to keep current password" : "Minimum 8 characters"}
          />

          {(formPassword || modalMode === 'create') && (
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={formPasswordConfirm}
              onChange={(e) => setFormPasswordConfirm(e.target.value)}
              required={true}
              disabled={isSubmitting}
            />
          )}

          <Select
            label="System Role"
            value={formRole}
            onChange={(e) => setFormRole(e.target.value)}
            options={roleOptions}
            disabled={isSubmitting || selectedUser?._id === currentUser._id}
            hint={selectedUser?._id === currentUser._id ? "You cannot modify your own system role." : ""}
          />

          <div className={styles.checkboxGroup}>
            <Checkbox
              label="Active Account"
              checked={formActive}
              onChange={(e) => setFormActive(e.target.checked)}
              disabled={isSubmitting || selectedUser?._id === currentUser._id}
            />
          </div>

          <div className={styles.modalActions}>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {modalMode === 'create' ? "Create User" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminUsersPage;
