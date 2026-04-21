import React from 'react';
import { cn } from '@lib/utils';

interface Props {
  className?: string;
  tabs: { value: number; label: string }[];
  active: number;
  onChangeTab: (value: number) => void;
}

const Tab = (props: Props) => {
  const { className, active, onChangeTab, tabs } = props;
  return (
    <div className={cn('flex items-center gap-3 p-2 border rounded-lg', className)}>
      {tabs.map((tab) => {
        const isActive = active === tab.value;
        return (
          <div
            key={`tab-${tab.value}-${tab.label}`}
            className={`rounded-lg p-[10px] ${isActive && 'bg-primary-blue-50'} cursor-pointer`}
            onClick={() => {
              onChangeTab(tab.value);
            }}
          >
            <p className={`text-sm font-medium ${isActive ? 'text-primary-blue-600' : 'text-primary-neutral-500'} `}>
              {tab.label} {active}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Tab;
