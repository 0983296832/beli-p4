import React, { useEffect, useState } from 'react';
import SelectInput from '@components/fields/SelectInput';
import { useT } from '@hooks/useT';
import mainServices from '@services/main';

interface WardType {
  value: number;
  label: string;
}

interface Props {
  districtId: number;
  value: number;
  onChange: (value: WardType) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
}

const WardSelect = ({ districtId, value, onChange, disabled, error, required, label }: Props) => {
  const { t } = useT();
  const [data, setData] = useState<WardType[]>([]);
  const [loading, setLoading] = useState(false);

  const getWards = async () => {
    setLoading(true);
    const res: any = await mainServices.getWards({
      filterings: {
        ['district_id:eq']: districtId
      }
    });
    setData(
      res?.data?.map((ward: { id: number; ward_name: string }) => ({
        value: ward.id,
        label: ward.ward_name
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    getWards();
  }, [districtId]);

  return (
    <SelectInput
      label={label}
      value={data.find((d) => d.value === value) ?? null}
      onChange={onChange}
      options={data}
      placeholder={t('select_district')}
      disabled={!districtId || disabled}
      error={error}
      required={required}
    />
  );
};

export default WardSelect;
