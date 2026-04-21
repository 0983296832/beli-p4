'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@components/ui/input';
import { cn } from '@lib/utils';

interface FlexibleOTPInputProps {
  inputString?: string;
  value?: string;
  onChange?: (value: string) => void;
  inputClassName?: string;
}

export default function FlexibleOTPInput({ inputString = '', value, onChange, inputClassName }: FlexibleOTPInputProps) {
  // ... giữ nguyên toàn bộ code gốc bạn gửi

  const processInputString = (str: string) => {
    const chars = str.split('');
    const charCount = chars.filter((char) => char !== ' ').length;
    const spacePositions: number[] = [];

    let charIndex = 0;
    chars.forEach((char) => {
      if (char === ' ') {
        spacePositions.push(charIndex);
      } else {
        charIndex++;
      }
    });

    return {
      charCount: charCount > 0 ? charCount : 6,
      spaces: spacePositions
    };
  };

  const addSpacesToValue = (value: string) => {
    if (spaces.length === 0) return value;

    let result = '';
    let charIndex = 0;

    for (let i = 0; i < charCount; i++) {
      if (spaces.includes(i)) {
        result += ' ';
      }
      if (charIndex < value.length) {
        result += value[charIndex];
        charIndex++;
      }
    }

    return result;
  };

  const { charCount, spaces: spacePositions } = processInputString(inputString);
  const [values, setValues] = useState<string[]>(Array(charCount).fill(''));
  const [spaces] = useState<number[]>(spacePositions);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, charCount);
  }, [charCount]);

  // **PHẦN MỚI: Đồng bộ state values với prop value**
  useEffect(() => {
    if (value !== undefined) {
      const rawValue = value.replace(/ /g, '').slice(0, charCount);
      const newValues = Array(charCount).fill('');
      for (let i = 0; i < rawValue.length; i++) {
        newValues[i] = rawValue[i];
      }
      setValues(newValues);
    }
  }, [value, charCount]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    if (onChange) {
      const formattedValue = addSpacesToValue(newValues.join(''));
      onChange(formattedValue);
    }

    if (value && index < values.length - 1) {
      const nextIndex = index + 1;
      inputRefs.current[nextIndex]?.focus();
      setFocusedIndex(nextIndex);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!values[index] && index > 0) {
        const prevIndex = index - 1;
        inputRefs.current[prevIndex]?.focus();
        setFocusedIndex(prevIndex);
      } else {
        const newValues = [...values];
        newValues[index] = '';
        setValues(newValues);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      const prevIndex = index - 1;
      inputRefs.current[prevIndex]?.focus();
      setFocusedIndex(prevIndex);
    } else if (e.key === 'ArrowRight' && index < 5) {
      const nextIndex = index + 1;
      inputRefs.current[nextIndex]?.focus();
      setFocusedIndex(nextIndex);
    } else if (e.key === 'Delete') {
      const newValues = [...values];
      newValues[index] = '';
      setValues(newValues);
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    inputRefs.current[index]?.select();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newValues = [...values];

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newValues[i] = pastedData[i];
    }

    setValues(newValues);

    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
    setFocusedIndex(lastIndex);
  };

  return (
    <div className='flex justify-center items-center gap-2 flex-wrap'>
      {values.map((value, index) => (
        <div key={index} className='flex items-center'>
          <Input
            ref={(el: any) => (inputRefs.current[index] = el)}
            type='text'
            inputMode='text'
            maxLength={1}
            value={value}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => handleFocus(index)}
            onPaste={handlePaste}
            className={cn(
              `size-[60px] text-center text-2xl font-semibold border-0 focus-visible:border-0 focus-visible:ring-0 focus-visible:border-transparent border-transparent bg-primary-blue-800 text-primary-neutral-50 md:text-2xl ${
                focusedIndex === index && '!border-0 ring-0'
              }`,
              inputClassName
            )}
          />
          {spaces.includes(index + 1) && <div className='w-5'></div>}
        </div>
      ))}
    </div>
  );
}
