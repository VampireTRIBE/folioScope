const SECURITY_SESSION_KEY = "public_securities_session_cache";

export const getSessionSecurities = () => {
  try {
    const cached = sessionStorage.getItem(SECURITY_SESSION_KEY);
    if (!cached) {
      return null;
    }
    return JSON.parse(cached);
  } catch {
    sessionStorage.removeItem(SECURITY_SESSION_KEY);
    return null;
  }
};

export const setSessionSecurities = (data) => {
  try {
    sessionStorage.setItem(SECURITY_SESSION_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save securities in sessionStorage", error);
  }
};

export const clearSessionSecurities = () => {
  sessionStorage.removeItem(SECURITY_SESSION_KEY);
};
