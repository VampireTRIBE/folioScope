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
import BrandComponent from "../../../../../../components/UI/others/BrandComponent";
import ProfileSideBar from "../../../../../../components/layout/public/sideBar/ProfileSideBar";
import ImgButton from "../../../../../../components/UI/buttons/ImgButton";
import TextButton from "../../../../../../components/UI/buttons/TextButton";
import DropdownButton from "../../../../../../components/UI/buttons/DropdownButton";
import MobileViewSearchBar from "../../mobileSearchbar/MobileViewSearchBar";

// ! context
import { AuthenticationContext } from "../../../../../../context/authenticationContext";

// ! Utils Hooks
import { useWindowWidth } from "../../../../../../utils/EventListner/setWindowInnerWidth";

const getVisibleMenuCount = (screenWidth, menuCount) => {
  if (screenWidth < 768) return 0;
  if (screenWidth < 880) return Math.min(menuCount, 1);
  if (screenWidth < 1000) return Math.min(menuCount, 2);
  if (screenWidth < 1120) return Math.min(menuCount, 3);
  if (screenWidth < 1240) return Math.min(menuCount, 4);
  if (screenWidth < 1380) return Math.min(menuCount, 5);
  if (screenWidth < 1520) return Math.min(menuCount, 6);
  return menuCount;
};

const MobileHeader = () => {
  const profileToggle = useSelector(selectToggleByKey("profileToggle"));
  const menuToggle = useSelector(selectToggleByKey("menuToggle"));

  const screenWidth = useWindowWidth();

  // ! accessToken state
  const { accessToken } = useContext(AuthenticationContext);

  // ! header Actions based on roles and User Type
  const { profileBtn, profileSidebarItems } = useHeaderActions();
  const { userprofileBtn, userprofileSidebarItems, userMneuSidebarItems } =
    useHeaderUserActions();

  const navbarButtons = accessToken ? userprofileBtn : profileBtn;
  const profileSidebar = accessToken
    ? userprofileSidebarItems
    : profileSidebarItems;

  const menuOptions = accessToken ? userMneuSidebarItems : [];
  const orderedMenuOptions = [...menuOptions].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const visibleMenuCount = getVisibleMenuCount(
    screenWidth,
    orderedMenuOptions.length,
  );
  const visibleMenuOptions = orderedMenuOptions.slice(0, visibleMenuCount);
  const sidebarMenuOptions = orderedMenuOptions.slice(visibleMenuCount);
  const showMenuInNav = visibleMenuOptions.length > 0;
  const visibleNavbarButtons =
    menuOptions.length > 0 && sidebarMenuOptions.length === 0
      ? navbarButtons.filter((button) => button.id !== "menu-button")
      : navbarButtons;

  return (
    <header className={mobileHeaderStyle.header}>
      <BrandComponent />
      <nav className={mobileHeaderStyle.nav}>
        {screenWidth >= 768 && <MobileViewSearchBar desktop={true} />}
        {showMenuInNav && (
          <div className={mobileHeaderStyle.desktopMenuOptions}>
            {visibleMenuOptions.map((el, index) => {
              const {
                id,
                group,
                order: _order,
                variant: _variant,
                items,
                ...buttonProps
              } = el;

              return group ? (
                <DropdownButton
                  key={id || index}
                  {...buttonProps}
                  items={items}
                  variant="headerNavButton"
                  wrapperVariant="headerDropdownWrapper"
                  menuVariant="headerDropdownMenu"
                  itemVariant="headerDropdownItem"
                  emptyLabel="No groups"
                />
              ) : (
                <TextButton
                  key={id || index}
                  {...buttonProps}
                  variant="headerNavButton"
                />
              );
            })}
          </div>
        )}
        {visibleNavbarButtons.map((el, index) => (
          <ImgButton key={el.id || index} {...el} />
        ))}
      </nav>

      {profileToggle && <ProfileSideBar profileSidebarItems={profileSidebar} />}

      {menuToggle && sidebarMenuOptions.length > 0 && (
        <ProfileSideBar profileSidebarItems={sidebarMenuOptions} />
      )}

      {screenWidth < 768 && <MobileViewSearchBar />}
    </header>
  );
};

export default MobileHeader;
