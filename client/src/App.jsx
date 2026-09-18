import { RouterProvider } from 'react-router-dom';
import { router } from './router/index.jsx';
import { useSyncHtmlAttributes } from './i18n/useSyncHtmlAttributes.js';

export default function App() {
  useSyncHtmlAttributes();
  return <RouterProvider router={router} />;
}
