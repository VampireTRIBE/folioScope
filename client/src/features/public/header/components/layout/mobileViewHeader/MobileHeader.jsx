import { useSelector } from "react-redux";

// ! Selectors
import { selectToggleByKey } from "../../../redux/headerSelectors";

// ! Custom Hooks
import { useHeaderActions } from "../../../hooks/useHeadersActions";

// ! styles
import mobileHeaderStyle from "./mobileheader.module.css";

// ! Components
import BrandComponet from "../../../../../../components/UI/others/BrandComponet";
import ProfileSideBar from "../../../../../../components/layout/public/sideBar/ProfileSideBar";
import ImgButton from "../../../../../../components/UI/buttons/ImgButton";
import MobileViewSearchBar from "../../mobileSearchbar/MobileViewSearchBar";

const MobileHeader = () => {
  const profileToggle = useSelector(selectToggleByKey("profileToggle"));
  const menuToggle = useSelector(selectToggleByKey("menuToggle"));
  const { profileBtn, profileSidebarItems } = useHeaderActions();

  const view = true;
  return (
    <header className={mobileHeaderStyle.header}>
      <BrandComponet />
      <nav className={mobileHeaderStyle.nav}>
        {profileBtn.map((el, index) => (
          <ImgButton key={el.id || index} {...el} />
        ))}
      </nav>

      {profileToggle && (
        <ProfileSideBar profileSidebarItems={profileSidebarItems} />
      )}

      {view && <MobileViewSearchBar />}
    </header>
  );
};

export default MobileHeader;
