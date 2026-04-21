import { useId, useState } from 'react';

import { RadioGroup, RadioGroupItem } from '@components/ui/radio-group';
import Icon from '../Icon';
import { STAR_RATING_ICON } from '@lib/ImageHelper';

export default function Rate({ value = '3', onChange }: { value: string; onChange: (active: string) => void }) {
  const id = useId();
  const [hoverRating, setHoverRating] = useState('');

  return (
    <fieldset className='space-y-4 w-max mx-auto'>
      <RadioGroup className='inline-flex w-full p-0.5 gap-2 mx-auto' onValueChange={onChange}>
        {['1', '2', '3', '4', '5'].map((val) => (
          <label
            key={val}
            className='group has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative cursor-pointer rounded p-0.5 outline-none has-focus-visible:ring-[3px]'
            onMouseEnter={() => setHoverRating(val)}
            onMouseLeave={() => setHoverRating('')}
          >
            <RadioGroupItem id={`${id}-${val}`} value={val} className='sr-only' />
            <Icon
              size={25}
              icon={STAR_RATING_ICON}
              className={`transition-all ${
                (hoverRating || value) >= val ? 'text-amber-500' : 'text-input'
              } group-hover:scale-110`}
            />
            <span className='sr-only'>
              {val} star{val === '1' ? '' : 's'}
            </span>
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
