import React, { useState } from 'react';
import { useT } from '@hooks/useT';
import i18n from '@i18n/index';
import SelectInput from '@components/fields/SelectInput';

interface StatusType {
  value: number;
  label: string;
}

interface Props {
  value?: number;
  onChange: (value: StatusType) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  isClearable?: boolean;
  type?: 'student' | 'other';
}

export const working_status: StatusType[] = [
  {
    value: 1,
    label: i18n.t('working')
  },
  {
    value: 0,
    label: i18n.t('on_break')
  }
];

export const student_working_status: StatusType[] = [
  {
    value: 1,
    label: i18n.t('learning_now')
  },
  {
    value: 2,
    label: i18n.t('on_break')
  },
  {
    value: 2,
    label: i18n.t('temporary_break')
  }
];

const WorkingStatusSelect = ({
  value,
  onChange,
  disabled,
  error,
  required,
  label,
  isClearable,
  type = 'other'
}: Props) => {
  const { t } = useT();
  const options = type == 'other' ? working_status : student_working_status;

  return (
    <SelectInput
      label={label}
      value={options.find((s) => s.value === value) ?? null}
      onChange={onChange}
      options={options}
      placeholder={t('status')}
      error={error}
      disabled={disabled}
      required={required}
      isClearable={isClearable}
    />
  );
};

export default WorkingStatusSelect;
