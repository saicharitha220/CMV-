import '../styles/globals.css';
import { Provider } from 'react-redux';
import store from '../store/store';
import { useEffect } from 'react';
import { setCredentials } from '../store/authSlice';

function App({ Component, pageProps }) {
  // Initialize auth from localStorage on client only to avoid SSR hydration mismatch
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('cms_token');
    const adminRaw = localStorage.getItem('cms_admin');
    const admin = adminRaw ? JSON.parse(adminRaw) : null;
    if (token || admin) {
      store.dispatch(setCredentials({ token, admin }));
    }
  }, []);

  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default App;
