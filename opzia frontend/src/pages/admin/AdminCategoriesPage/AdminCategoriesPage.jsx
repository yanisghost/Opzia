// src/pages/admin/AdminCategoriesPage/AdminCategoriesPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { categoryService } from '@services/categoryService';
import { useUI } from '@hooks/useUI';
import { useLanguage } from '@hooks/useLanguage';
import { categoryImageUrl } from '@utils/imageUrl';
import Button from '@components/ui/Button/Button';
import Input from '@components/ui/Input/Input';
import Select from '@components/ui/Select/Select';
import Checkbox from '@components/ui/Checkbox/Checkbox';
import Modal from '@components/ui/Modal/Modal';
import Badge from '@components/ui/Badge/Badge';
import Spinner from '@components/ui/Spinner/Spinner';
import styles from './AdminCategoriesPage.module.css';

function AdminCategoriesPage() {
  const { addToast } = useUI();
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formParentCategory, setFormParentCategory] = useState('');
  const [imageFile, setImageFile] = useState(null); // Track category image file
  const [previewUrl, setPreviewUrl] = useState(null); // Track upload preview URL
  const [formActive, setFormActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Load Categories function
  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoryService.getCategories({ limit: 100, sort: 'name' });
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load categories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Quick lookup map for parent category names
  const categoriesMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      if (cat?._id) acc[cat._id] = cat.name;
      return acc;
    }, {});
  }, [categories]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedCategory(null);
    setFormName('');
    setFormDescription('');
    setFormParentCategory('');
    setImageFile(null);
    setPreviewUrl(null);
    setFormActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (category) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setFormName(category.name || '');
    setFormDescription(category.description || '');
    // In backend, parentCategory might be populated (an object) or just an ID
    const parentId = category.parentCategory
      ? typeof category.parentCategory === 'object'
        ? category.parentCategory._id || category.parentCategory.id
        : category.parentCategory
      : '';
    setFormParentCategory(parentId);
    setImageFile(null);
    setPreviewUrl(category.image ? categoryImageUrl(category.image) : null);
    setFormActive(category.active !== false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  // Delete category handler
  const handleDelete = async (id, name) => {
    if (!window.confirm(t('admin.categories.form.deleteConfirm'))) {
      return;
    }

    try {
      await categoryService.deleteCategory(id);
      addToast(t('admin.categories.form.successDelete'), 'success');
      loadCategories();
    } catch (err) {
      addToast(err.message || t('admin.categories.form.errorDelete'), 'error');
    }
  };

  // Submit handler (Create & Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError(t('admin.categories.form.errorRequired'));
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    // If an image is selected, we must build a FormData payload
    let payload;
    if (imageFile) {
      payload = new FormData();
      payload.append('name', formName.trim());
      payload.append('description', formDescription.trim());
      if (formParentCategory) {
        payload.append('parentCategory', formParentCategory);
      }
      payload.append('active', String(formActive));
      payload.append('image', imageFile);
    } else {
      payload = {
        name: formName.trim(),
        description: formDescription.trim(),
        parentCategory: formParentCategory || null,
        active: formActive,
      };
      if (!previewUrl && modalMode === 'edit') {
        payload.image = null;
      }
    }

    try {
      if (modalMode === 'create') {
        await categoryService.createCategory(payload);
        addToast(t('admin.categories.form.successCreate'), 'success');
      } else {
        await categoryService.updateCategory(selectedCategory._id, payload);
        addToast(t('admin.categories.form.successUpdate'), 'success');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      setFormError(err.message || t('admin.categories.form.errorSave'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare Parent Category Options (Filter out own category to prevent circular reference)
  const parentOptions = useMemo(() => {
    const opts = [{ value: '', label: t('admin.categories.form.noneRoot') }];
    categories
      .filter((cat) => {
        if (modalMode === 'edit' && selectedCategory) {
          // A category cannot be its own parent
          return cat._id !== selectedCategory._id;
        }
        return true;
      })
      .forEach((cat) => {
        opts.push({ value: cat._id, label: cat.name });
      });
    return opts;
  }, [categories, modalMode, selectedCategory, t]);

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>{t('admin.categories.title')}</h1>
          <p className={styles.subtitle}>
            {t('admin.categories.subtitle')}
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          {t('admin.categories.addCategory')}
        </Button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {isLoading ? (
        <div className={styles.loadingWrap}>
          <Spinner size="lg" />
          <p>{t('admin.categories.loading')}</p>
        </div>
      ) : categories.length === 0 ? (
        <div className={styles.empty}>
          {t('admin.categories.empty')}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('admin.categories.table.name')}</th>
                <th>{t('admin.categories.table.slug')}</th>
                <th>{t('admin.categories.table.description')}</th>
                <th>{t('admin.categories.table.parentCategory')}</th>
                <th>{t('admin.categories.table.status')}</th>
                <th>{t('admin.categories.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const parentId = category.parentCategory
                  ? typeof category.parentCategory === 'object'
                    ? category.parentCategory._id || category.parentCategory.id
                    : category.parentCategory
                  : null;
                const parentName = parentId ? categoriesMap[parentId] || 'Unknown' : '—';

                return (
                  <tr key={category._id || category.id}>
                    <td>
                      <div className={styles.nameWithThumbnail}>
                        <img
                          src={categoryImageUrl(category.image)}
                          alt={category.name}
                          className={styles.thumbnail}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
                          }}
                        />
                        <strong className={styles.categoryName}>{category.name}</strong>
                      </div>
                    </td>
                    <td>
                      <code className={styles.slug}>{category.slug || '—'}</code>
                    </td>
                    <td>
                      <span className={styles.descriptionText}>
                        {category.description || '—'}
                      </span>
                    </td>
                    <td>{parentName}</td>
                    <td>
                      <Badge variant={category.active !== false ? 'success' : 'neutral'}>
                        {category.active !== false ? t('admin.categories.form.active') : t('admin.categories.form.inactive')}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                        <Button
                          variant="secondary"
                          size="sm"
                          className={styles.actionButton}
                          onClick={() => handleOpenEdit(category)}
                        >
                          {t('admin.categories.table.edit')}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className={styles.actionButton}
                          onClick={() => handleDelete(category._id, category.name)}
                        >
                          {t('admin.categories.table.delete')}
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? t('admin.categories.form.createTitle') : t('admin.categories.form.editTitle')}
        size="md"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          {formError && <div className={styles.formError}>{formError}</div>}

          <Input
            label={t('admin.categories.form.nameLabel')}
            placeholder={t('admin.categories.form.namePlaceholder')}
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
            disabled={isSubmitting}
          />

          <div className={styles.fieldGroup}>
            <label className={styles.label}>{t('admin.categories.form.descriptionLabel')}</label>
            <textarea
              className={styles.textarea}
              placeholder={t('admin.categories.form.descriptionPlaceholder')}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              disabled={isSubmitting}
              rows={4}
            />
          </div>

          <Select
            label={t('admin.categories.form.parentCategoryLabel')}
            value={formParentCategory}
            onChange={(e) => setFormParentCategory(e.target.value)}
            options={parentOptions}
            placeholder={t('admin.categories.form.selectParent')}
            disabled={isSubmitting}
          />

          <div className={styles.imageUploadSection}>
            <label className={styles.label}>
              {t('admin.categories.form.imageLabel') || "Category Image (Optional)"}
            </label>
            
            {previewUrl ? (
              <div className={styles.imagePreviewCard}>
                <img src={previewUrl} alt="Category preview" className={styles.previewImage} />
                <button
                  type="button"
                  className={styles.removeImageOverlay}
                  onClick={handleRemoveImage}
                  title="Remove image"
                  disabled={isSubmitting}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                className={styles.dropZone}
                onClick={() => document.getElementById('category-file-input').click()}
              >
                <svg className={styles.uploadIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <span className={styles.uploadText}>Upload an image</span>
                <span className={styles.uploadSubtext}>Click to select file</span>
                <input
                  id="category-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>

          <div className={styles.checkboxGroup}>
            <Checkbox
              label={t('admin.categories.form.activeLabel')}
              checked={formActive}
              onChange={(e) => setFormActive(e.target.checked)}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.modalActions}>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              {t('admin.categories.form.cancelBtn')}
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {modalMode === 'create' ? t('admin.categories.form.createBtn') : t('admin.categories.form.saveBtn')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminCategoriesPage;

