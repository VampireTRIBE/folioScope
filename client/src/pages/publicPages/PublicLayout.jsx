import { Outlet } from "react-router-dom";

import Footer from "../../components/layout/public/footer/Footer";
import PublicHeader from "../../features/public/header/outlets/header/PublicHeader";
import publicLayoutStyles from "./publiclayout.module.css";

const PublicLayout = () => {
  return (
    <div className={publicLayoutStyles.layout}>
      <PublicHeader />
      <div className={publicLayoutStyles.content}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default PublicLayout;
