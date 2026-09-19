import { createContext } from 'react';

// status: 'loading' (checking the session) | 'authenticated' | 'anonymous' | 'error'
// ('error' = the server could not be reached, so the session state is unknown).
export const AuthContext = createContext(null);
