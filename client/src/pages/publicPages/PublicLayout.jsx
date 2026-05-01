import { Outlet } from "react-router-dom";
import Header from "../../components/public/header/header";

const PublicLayout = () => {
  return (
    <>
      <Header/>
      <Outlet />
      <h1 className="footer">Footer</h1>
    </>
  );
};

export default PublicLayout;
