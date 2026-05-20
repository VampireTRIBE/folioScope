import { Outlet } from "react-router-dom";
import FinalHeader from "../../features/public/header/components/FinalHeader";
import Footer from "../../components/layout/public/footer/Footer";

const PublicLayout = () => {
  return (
    <>
      <FinalHeader />
      <Outlet />
      <Footer />
    </>
  );
};

export default PublicLayout;
