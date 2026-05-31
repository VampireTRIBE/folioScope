import { createContext, useEffect, useRef, useState } from "react";
import { useRotateTokenMutation } from "../hooks/RTK Query Hooks/useRotateToken";

export const AuthenticationContext = createContext();

const ROTATE_TIME = 1 * 60 * 1000;

export const AuthenticationProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { mutateAsync: rotateToken } = useRotateTokenMutation();

  const timeoutRef = useRef(null);
  const isRunning = useRef(false);

  const schedule = () => {
    timeoutRef.current = setTimeout(refresh, ROTATE_TIME);
  };

  const refresh = async () => {
    if (isRunning.current) return;
    isRunning.current = true;
    try {
      const res = await rotateToken();
      setUser(res.accessToken);
      schedule();
    } catch (err) {
      setUser(null);
    } finally {
      isRunning.current = false;
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const res = await rotateToken();
        setUser(res.accessToken);

        schedule();
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (loading) return <h1>loading</h1>;

  return (
    <AuthenticationContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthenticationContext.Provider>
  );
};
