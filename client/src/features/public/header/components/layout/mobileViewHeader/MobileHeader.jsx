import { useContext } from "react";
import { useSelector } from "react-redux";

// ! Selectors
import { selectToggleByKey } from "../../../redux/headerSelectors";

// ! Custom Hooks
import { useHeaderActions } from "../../../hooks/useHeadersActions";
import { useHeaderUserActions } from "../../../hooks/useHeadersActionsUser";

// ! styles
import mobileHeaderStyle from "./mobileheader.module.css";

// ! Components
import BrandComponet from "../../../../../../components/UI/others/BrandComponet";
import ProfileSideBar from "../../../../../../components/layout/public/sideBar/ProfileSideBar";
import ImgButton from "../../../../../../components/UI/buttons/ImgButton";
import MobileViewSearchBar from "../../mobileSearchbar/MobileViewSearchBar";

// ! context
import { AuthenticationContext } from "../../../../../../context/authenticationContext";

const MobileHeader = () => {
  const profileToggle = useSelector(selectToggleByKey("profileToggle"));
  const menuToggle = useSelector(selectToggleByKey("menuToggle"));

  // user state
  const { user, setUser } = useContext(AuthenticationContext);

  // header Actions based on roles and login or not
  const { profileBtn, profileSidebarItems } = useHeaderActions();
  const { userprofileBtn, userprofileSidebarItems, userMneuSidebarItems } =
    useHeaderUserActions();

  const navbarButtons = user ? userprofileBtn : profileBtn;
  const profileSidebar = user ? userprofileSidebarItems : profileSidebarItems;

  const menuOptions = user ? userMneuSidebarItems : null;

  const view = true;
  return (
    <header className={mobileHeaderStyle.header}>
      <BrandComponet />
      <nav className={mobileHeaderStyle.nav}>
        {navbarButtons.map((el, index) => (
          <ImgButton key={el.id || index} {...el} />
        ))}
      </nav>

      {profileToggle && <ProfileSideBar profileSidebarItems={profileSidebar} />}

      {menuToggle && <ProfileSideBar profileSidebarItems={menuOptions} />}

      {view && <MobileViewSearchBar />}
    </header>
  );
};

export default MobileHeader;
