import { Outlet } from "react-router-dom";
import FinalHeader from "../../features/public/header/components/FinalHeader";

const PublicLayout = () => {
  return (
    <>
      <FinalHeader/>
      <Outlet />
      <h1 className="footer">Footer</h1>
    </>
  );
};

export default PublicLayout;
