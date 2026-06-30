/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useRef, useState } from "react";

// ! Tanstack Query
import { useRotateTokenMutation } from "../hooks/RTK Query Hooks/useRotateToken";

// ! APIs
import { FETCH_USERDETAILS } from "../features/apis/FETCH_APIs";

export const AuthenticationContext = createContext(null);

const ROTATE_TIME = 8 * 60 * 1000;

export const AuthenticationProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { mutateAsync: rotateToken } = useRotateTokenMutation();

  const timeoutRef = useRef(null);
  const isRunning = useRef(false);
  const refreshRef = useRef(null);

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const schedule = useCallback(() => {
    clearTimer();
    timeoutRef.current = setTimeout(() => {
      refreshRef.current?.();
    }, ROTATE_TIME);
  }, []);

  const refresh = useCallback(async () => {
    if (isRunning.current) return;
    isRunning.current = true;
    try {
      const res = await rotateToken();
      const accessToken = res?.accessToken || null;
      setAccessToken(accessToken);
      if (!accessToken) {
        setUserData(null);
        clearTimer();
        return;
      }

      schedule();
    } catch {
      setAccessToken(null);
      setUserData(null);
      clearTimer();
    } finally {
      isRunning.current = false;
    }
  }, [rotateToken, schedule]);

  refreshRef.current = refresh;

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const res = await rotateToken();
        const accessToken = res?.accessToken || null;
        setAccessToken(accessToken);
        if (!accessToken) {
          setUserData(null);
          return;
        }

        const userDetails = await FETCH_USERDETAILS(accessToken);
        setUserData(userDetails?.user || null);
        schedule();
      } catch {
        setAccessToken(null);
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
  }, [rotateToken, schedule]);

  if (loading) return <h1>loading</h1>;

  return (
    <AuthenticationContext.Provider
      value={{
        accessToken,
        setAccessToken,
        userData,
        setUserData,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
