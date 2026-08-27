'use client';

import { useEffect, useState } from 'react';

function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 12) return 'בוקר טוב';
  if (hour >= 12 && hour < 17) return 'צהריים טובים';
  if (hour >= 17 && hour < 22) return 'ערב טוב';
  return 'לילה טוב';
}

/**
 * Time-of-day greeting computed from the viewer's LOCAL clock. Server render
 * would use UTC and get it wrong, so we resolve it on the client after mount.
 * Starts with a neutral greeting to avoid a hydration mismatch flash.
 */
export function Greeting({ name }: { name: string }) {
  const [greet, setGreet] = useState('שלום');
  useEffect(() => { setGreet(greetingFor(new Date().getHours())); }, []);
  return <>{greet}, {name}</>;
}
