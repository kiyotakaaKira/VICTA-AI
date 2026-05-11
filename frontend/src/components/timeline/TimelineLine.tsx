'use client';

interface TimelineLineProps {
  color?: string;
}

export function TimelineLine({ color = 'rgba(6,182,212,0.2)' }: TimelineLineProps) {
  return (
    <div
      className="absolute left-[17px] top-0 bottom-0 w-px"
      style={{ backgroundColor: color }}
    />
  );
}
