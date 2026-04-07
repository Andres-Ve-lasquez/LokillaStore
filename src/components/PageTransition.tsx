'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [display, setDisplay] = useState(children);
  const [animate, setAnimate] = useState(false);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    // Trigger fade-slide out → in
    setAnimate(false);
    const t = setTimeout(() => {
      setDisplay(children);
      setAnimate(true);
    }, 80);
    return () => clearTimeout(t);
  }, [pathname, children]);

  useEffect(() => {
    setDisplay(children);
    setAnimate(true);
  }, [children]);

  return (
    <div
      style={{
        opacity: animate ? 1 : 0,
        transform: animate ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}
    >
      {display}
    </div>
  );
}
