import { usePublicSecurities } from "../hooks/RTK Query Hooks/sessionStorage";

const AppInitializerWithSessionStorage = () => {
  usePublicSecurities();
  return null;
};

export default AppInitializerWithSessionStorage;
