import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("access"),
  );
  // Guardamos el rol en el estado, leyendo del localStorage si ya existe una sesión activa
  const [userRol, setUserRol] = useState(localStorage.getItem("rol") || null);

  const login = (accessToken, refreshToken, rol) => {
    localStorage.setItem("access", accessToken);
    localStorage.setItem("refresh", refreshToken);
    localStorage.setItem("rol", rol); // Guardamos el rol para no perderlo al recargar la página

    setUserRol(rol);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("rol");

    setUserRol(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRol, // Exponemos el rol para usarlo en cualquier componente
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
