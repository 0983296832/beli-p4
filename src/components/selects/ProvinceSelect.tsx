import React, { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import SelectInput from '@components/fields/SelectInput';
import mainServices from '@services/main';

interface ProvinceType {
  value: number;
  label: string;
}

type ValueType<IsMulti extends boolean> = IsMulti extends true ? number[] : number;
type OnChangeType<IsMulti extends boolean> = IsMulti extends true
  ? (value: ProvinceType[]) => void
  : (value: ProvinceType) => void;

interface Props<IsMulti extends boolean = false> {
  label?: string;
  isMulti?: IsMulti;
  value?: ValueType<IsMulti>;
  onChange?: OnChangeType<IsMulti>;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  placeholder?: string;
  isClearable?: boolean;
}

const ProvinceSelect = <IsMulti extends boolean = false>({
  value,
  onChange,
  disabled,
  error,
  required,
  placeholder,
  label,
  isMulti = false as IsMulti,
  isClearable
}: Props<IsMulti>) => {
  const { t } = useT();
  const [data, setData] = useState<ProvinceType[]>([]);
  const [loading, setLoading] = useState(false);

  const getProvinces = async () => {
    setLoading(true);
    const res: any = await mainServices.getProvinces();
    setData(
      res?.data?.map((province: { id: number; province_name: string }) => ({
        value: province.id,
        label: province.province_name
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    getProvinces();
  }, []);

  return (
    <SelectInput
      label={label}
      value={
        !isMulti && typeof value === 'number'
          ? data.find((v) => v.value === value)
          : Array.isArray(value)
            ? data.filter((v) => value.includes(v.value))
            : undefined
      }
      onChange={(value) => onChange?.(value)}
      options={data}
      isMulti={isMulti}
      placeholder={placeholder || t('select_province')}
      disabled={disabled}
      error={error}
      required={required}
      isClearable={isClearable}
    />
  );
};

export default ProvinceSelect;
