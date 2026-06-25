import { useCallback, useContext, useMemo } from "react";
import { useDispatch } from "react-redux";

import { useNavigationActions } from "../../../hooks/customHooks/useNavigationActions";
import { publicheaderToggleActions } from "../redux/headerToggleState";
import { AuthenticationContext } from "../../../../context/authenticationContext";
import { useLogoutActions } from "./customHooks/useMutationHooks";

export const useHeaderUserActions = () => {
  const { userData } = useContext(AuthenticationContext);
  const { LogoutRequest } = useLogoutActions();
  const dispatch = useDispatch();

  const {
    goToUserDashboard,
    goToUserProfile,
    gotoHome,
    goToUserHoldings,
    goToUserPortfolioRebalencer,
  } = useNavigationActions();

  const level1Array = useMemo(
    () => Object.values(userData?.groups?.level1 || {}),
    [userData],
  );

  const level2Array = useMemo(
    () => Object.values(userData?.groups?.level2 || {}),
    [userData],
  );

  const level3Array = useMemo(
    () => Object.values(userData?.groups?.level3 || {}),
    [userData],
  );

  const level4Array = useMemo(
    () => Object.values(userData?.groups?.level4 || {}),
    [userData],
  );

  const toggle = useCallback(
    (key) => {
      dispatch(
        publicheaderToggleActions.TOGGLE({
          key,
        }),
      );
    },
    [dispatch],
  );

  const createGroupDropdownItems = useCallback(
    (groupArray) =>
      groupArray.map((el) => ({
        id: el?._id,
        children: el?.name,
        onClick: () => goToUserDashboard(el?.level, el?.name),
      })),
    [goToUserDashboard],
  );

  const userprofileBtn = useMemo(
    () => [
      {
        id: "menu-button",
        onClick: () => {
          toggle("menuToggle");
        },
        variantButton: "imgButton",
        variantImg: "icon",
        src: "/assets/icons/menu.png",
        alt: "menu Icon",
        title: "More",
      },
      {
        id: "profile-button",
        onClick: () => {
          toggle("profileToggle");
        },
        variantButton: "containerType2",
        variantImg: "letterType2",
        imgplaceHolder: true,
        letter: userData?.firstName?.[0]?.toUpperCase() || "U",
      },
    ],
    [toggle, userData],
  );

  const userprofileSidebarItems = useMemo(
    () => [
      {
        id: "profile-close",
        onClick: () => {
          toggle("profileToggle");
        },
        children: "Close",
        variant: "sideBarbtn",
        order: 0,
      },
      {
        id: "profile-user-profile",
        onClick: goToUserProfile,
        children: "Profile",
        variant: "sideBarbtn",
        order: 1,
      },
      {
        id: "profile-user-settings",
        onClick: goToUserProfile,
        children: "Settings",
        variant: "sideBarbtn",
        order: 3,
      },
      {
        id: "logout-user",
        onClick: goToUserProfile,
        children: "Logout",
        variant: "sideBarbtn",
        order: 4,
      },
      {
        id: "logout-user-all-devices",
        onClick: goToUserProfile,
        children: "Logout All",
        variant: "sideBarbtn",
        order: 4,
      },
    ],
    [toggle, goToUserProfile],
  );

  const userMenuSidebarItems = useMemo(
    () => [
      {
        id: "menu-home",
        group: false,
        onClick: gotoHome,
        children: "Home",
        variant: "sideBarbtn",
        order: 0,
      },
      {
        id: "menu-dashboard",
        group: false,
        onClick: () => {
          const level1Group = level1Array[0];
          if (!level1Group) return;
          goToUserDashboard(level1Group.level, level1Group.name);
        },
        children: "Dashboard",
        variant: "sideBarbtn",
        order: 1,
      },
      {
        id: "menu-holdings",
        group: false,
        onClick: goToUserHoldings,
        children: "Holdings",
        variant: "sideBarbtn",
        order: 2,
      },
      {
        id: "menu-rebalancer",
        group: false,
        onClick: goToUserPortfolioRebalencer,
        children: "Rebalencer",
        variant: "sideBarbtn",
        order: 3,
      },
      {
        id: "menu-grouplevel2",
        group: true,
        children: "Group Level 2",
        variant: "sideBarbtn",
        order: 4,
        items: createGroupDropdownItems(level2Array),
      },
      {
        id: "menu-grouplevel3",
        group: true,
        children: "Group Level 3",
        variant: "sideBarbtn",
        order: 5,
        items: createGroupDropdownItems(level3Array),
      },
      {
        id: "menu-grouplevel4",
        group: true,
        children: "Group Level 4",
        variant: "sideBarbtn",
        order: 6,
        items: createGroupDropdownItems(level4Array),
      },
    ],
    [
      gotoHome,
      goToUserDashboard,
      level1Array,
      level2Array,
      level3Array,
      level4Array,
      createGroupDropdownItems,
    ],
  );

  return {
    toggle,
    userprofileBtn,
    userprofileSidebarItems,
    userMneuSidebarItems: userMenuSidebarItems,
  };
};
