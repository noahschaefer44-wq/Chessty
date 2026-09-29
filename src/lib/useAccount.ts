import { useEffect, useState } from 'react';
import { getAccount, type Account } from './cloud';

export function useAccount(): Account | null {
  const [a, setA] = useState(getAccount());
  useEffect(() => {
    const on = () => setA(getAccount());
    window.addEventListener('chessty-account', on);
    return () => window.removeEventListener('chessty-account', on);
  }, []);
  return a;
}
