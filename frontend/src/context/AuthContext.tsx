import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { AuthUser, LoginDto, RegisterDto } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  const login = useCallback(async (credentials: LoginDto) => {
    const { user: loggedInUser } = await authService.login(credentials);
    setUser(loggedInUser);
  }, []);

  const register = useCallback(async (data: RegisterDto) => {
    const { user: registeredUser } = await authService.register(data);
    setUser(registeredUser);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
