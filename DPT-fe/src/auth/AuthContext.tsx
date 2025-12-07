import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type TokenData = {
  access_token: string;
  token_type: string;
  expires_in: number;
  customer_id: number;
  email: string;
  role: string;
};

type AuthContextType = {
  token: TokenData | null;
  login: (token: TokenData) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<TokenData | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("authToken");
    if (raw) {
      try {
        setToken(JSON.parse(raw));
      } catch {
        localStorage.removeItem("authToken");
      }
    }
  }, []);

  const login = (data: TokenData) => {
    setToken(data);
    localStorage.setItem("authToken", JSON.stringify(data));
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}


