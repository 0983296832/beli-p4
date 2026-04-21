import React, { useEffect, useState } from 'react';
import SelectInput from '@components/fields/SelectInput';
import { useT } from '@hooks/useT';
import mainServices from '@services/main';

interface DistrictType {
  value: number;
  label: string;
}

interface Props {
  label?: string;
  provinceId: number;
  value: number;
  onChange: (value: DistrictType) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

const DistrictSelect = ({ provinceId, value, onChange, disabled, error, required, label }: Props) => {
  const { t } = useT();
  const [data, setData] = useState<DistrictType[]>([]);
  const [loading, setLoading] = useState(false);

  const getDistricts = async () => {
    setLoading(true);
    const res: any = await mainServices.getDistricts({
      filterings: {
        ['province_id:eq']: provinceId
      }
    });
    setData(
      res?.data?.map((district: { id: number; district_name: string }) => ({
        value: district.id,
        label: district.district_name
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    getDistricts();
  }, [provinceId]);

  return (
    <SelectInput
      label={label}
      value={data.find((d) => d.value === value) ?? null}
      onChange={onChange}
      options={data}
      placeholder={t('select_district')}
      disabled={!provinceId || disabled}
      error={error}
      required={required}
    />
  );
};

export default DistrictSelect;
