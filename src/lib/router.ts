import { useEffect, useState } from 'react';

// Hash-Routing: funktioniert auf jedem statischen Hosting und offline.
export function useRoute(): string[] {
  const read = () => (location.hash.replace(/^#\/?/, '') || '').split('/').filter(Boolean);
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => {
      setRoute(read());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export const go = (path: string) => {
  location.hash = '#/' + path.replace(/^\//, '');
};
