import { createContext, useEffect, useRef, useState } from "react";

// ! Tanstack Query
import { useRotateTokenMutation } from "../hooks/RTK Query Hooks/useRotateToken";

// ! APIs
import { FETCH_USERDETAILS } from "../features/apis/FETCH_APIs";

export const AuthenticationContext = createContext(null);

const ROTATE_TIME = 8 * 60 * 1000;

export const AuthenticationProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { mutateAsync: rotateToken } = useRotateTokenMutation();

  const timeoutRef = useRef(null);
  const isRunning = useRef(false);

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const schedule = () => {
    clearTimer();
    timeoutRef.current = setTimeout(() => {
      refresh();
    }, ROTATE_TIME);
  };

  const refresh = async () => {
    if (isRunning.current) return;
    isRunning.current = true;
    try {
      const res = await rotateToken();
      const accessToken = res?.accessToken || null;
      setUser(accessToken);
      if (!accessToken) {
        setUserData(null);
        clearTimer();
        return;
      }

      schedule();
    } catch (err) {
      setUser(null);
      setUserData(null);
      clearTimer();
    } finally {
      isRunning.current = false;
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const res = await rotateToken();
        const accessToken = res?.accessToken || null;
        setUser(accessToken);
        if (!accessToken) {
          setUserData(null);
          return;
        }

        const userDetails = await FETCH_USERDETAILS(accessToken);
        setUserData(userDetails?.user || null);
        schedule();
      } catch (err) {
        setUser(null);
        setUserData(null);
        clearTimer();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();

    return () => {
      clearTimer();
    };
  }, []);

  if (loading) return <h1>loading</h1>;

  return (
    <AuthenticationContext.Provider
      value={{
        user,
        setUser,
        userData,
        setUserData,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};