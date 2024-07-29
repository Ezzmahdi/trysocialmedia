import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function CallbackPage() {
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const error = params.get('error');

    if (success) {
      setMessage('Authentication successful! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } else if (error) {
      setMessage(`Error: ${decodeURIComponent(error)}`);
    } else {
      setMessage('Authentication process not completed.');
    }
  }, [router]);

  return (
    <div>
      <h1>Authentication Status</h1>
      <p>{message}</p>
    </div>
  );
}
