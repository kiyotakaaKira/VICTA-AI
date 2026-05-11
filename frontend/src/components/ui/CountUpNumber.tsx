'use client';

import { useEffect, useState } from 'react';

interface Props {
  target?: number;
  value?: number | string;
  prefix?: string;
  suffix?: string;
}

export function CountUpNumber({ value, target, prefix = '', suffix = '' }: Props) {
  const [count, setCount] = useState(0);
  const val = target !== undefined ? target : value;
  const numericValue = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : Number(val);
  
  useEffect(() => {
    if (isNaN(numericValue)) return;
    let start = 0;
    const end = numericValue;
    const duration = 1500;
    const incrementTime = 30;
    const steps = duration / incrementTime;
    const stepValue = end / steps;
    
    const timer = setInterval(() => {
      start += stepValue;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [numericValue]);

  return <span>{prefix}{isNaN(numericValue) ? val : count.toLocaleString()}{suffix}</span>;
}
