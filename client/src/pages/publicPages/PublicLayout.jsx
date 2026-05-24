import { Outlet } from "react-router-dom";

import Footer from "../../components/layout/public/footer/Footer";
import PublicHeader from "../../features/public/header/outlets/header/PublicHeader";

const PublicLayout = () => {
  return (
    <>
      <PublicHeader />
      <Outlet />
      <Footer />
    </>
  );
};

export default PublicLayout;
