// src/components/checkout/AddressFields/AddressFields.jsx
// Algerian address form fields: wilaya (dropdown from static list),
// baladia (dropdown from static list filtered by wilaya), homeAddress (free text).
// Used on CheckoutPage and SignupPage / MyProfilePage.

import React from 'react';
import Select from '@components/ui/Select/Select';
import Input from '@components/ui/Input/Input';
import { useLanguage } from '@hooks/useLanguage';
import { WILAYAS, WILAYA_NAMES } from '@utils/wilayas';
import communesData from '@utils/communes.json';
import styles from './AddressFields.module.css';

/**
 * @param {{
 *   values:   { wilaya: string, baladia: string, homeAddress: string },
 *   errors:   { wilaya?: string, baladia?: string, homeAddress?: string },
 *   onChange: (field: string, value: string) => void,
 *   disabled?: boolean
 * }} props
 */
function AddressFields({ values, errors = {}, onChange, disabled = false }) {
  const { t, currentLanguage } = useLanguage();
  const wilayas = WILAYA_NAMES.map((name) => ({ value: name, label: name }));

  // Get communes for currently selected wilaya
  const selectedWilayaObj = WILAYAS.find((w) => w.name === values.wilaya);
  const communesList = selectedWilayaObj ? communesData[selectedWilayaObj.code] || [] : [];
  const baladiats = communesList.map((name) => ({ value: name, label: name }));

  const handleWilayaChange = (e) => {
    const selectedWilaya = e.target.value;
    onChange('wilaya', selectedWilaya);
    onChange('baladia', ''); // Clear baladia when wilaya changes
  };

  const getBaladiaPlaceholder = () => {
    if (!values.wilaya) {
      if (currentLanguage === 'ar') return 'اختر الولاية أولاً...';
      if (currentLanguage === 'fr') return "Sélectionnez la wilaya d'abord...";
      return 'Select wilaya first...';
    }
    return t('checkout.baladiaPlaceholder');
  };

  return (
    <div className={styles.fields}>
      <div className={styles.row}>
        <Select
          label={t('checkout.wilayaLabel')}
          name="wilaya"
          value={values.wilaya}
          onChange={handleWilayaChange}
          options={wilayas}
          placeholder={t('checkout.wilayaPlaceholder')}
          error={errors.wilaya}
          required
          disabled={disabled}
        />
        <Select
          label={t('checkout.baladiaLabel')}
          name="baladia"
          value={values.baladia}
          onChange={(e) => onChange('baladia', e.target.value)}
          options={baladiats}
          placeholder={getBaladiaPlaceholder()}
          error={errors.baladia}
          required
          disabled={disabled || !values.wilaya}
        />
      </div>
      <Input
        label={t('checkout.addressLabel')}
        name="homeAddress"
        value={values.homeAddress}
        onChange={(e) => onChange('homeAddress', e.target.value)}
        placeholder={t('checkout.addressPlaceholder')}
        error={errors.homeAddress}
        required
        disabled={disabled}
      />
    </div>
  );
}

export default AddressFields;
