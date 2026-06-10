import { useCallback, useMemo } from "react";

import { useDispatch } from "react-redux";

import { useNavigate } from "react-router-dom";
import { useNavigationActions } from "../../../hooks/customHooks/useNavigationActions";
import { publicheaderToggleActions } from "../redux/headerToggleState";

export const useHeaderUserActions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { goToUserDashBord, goToUserProfile, gotoHome } =
    useNavigationActions();

  // =========================
  // TOGGLE ACTION
  // =========================

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

  // =========================
  // PROFILE BUTTON
  // =========================

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
        letter: "U",
      },
    ],
    [toggle],
  );

  // =========================
  // PROFILE SIDEBAR ITEMS
  // =========================

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
    ],
    [toggle],
  );

  const userMneuSidebarItems = useMemo(
    () => [
      {
        id: "menu-home",
        onClick: gotoHome,
        children: "Home",
        variant: "sideBarbtn",
        order: 0,
      },
      {
        id: "menu-dashboard",
        onClick: goToUserDashBord,
        children: "Dashboard",
        variant: "sideBarbtn",
        order: 1,
      },
      {
        id: "menu-holdings",
        onClick: () => console.log("Holdings"),
        children: "Holdings",
        variant: "sideBarbtn",
        order: 3,
      },

      {
        id: "menu-grouplevel2",
        onClick: goToUserProfile,
        children: "Group Level 2",
        variant: "sideBarbtn",
        order: 4,
      },
      {
        id: "menu-grouplevel3",
        onClick: goToUserProfile,
        children: "Group Level 3",
        variant: "sideBarbtn",
        order: 5,
      },
      {
        id: "menu-grouplevel4",
        onClick: goToUserProfile,
        children: "Group Level 4",
        variant: "sideBarbtn",
        order: 6,
      },
    ],
    [toggle],
  );

  return {
    toggle,
    userprofileBtn,
    userprofileSidebarItems,
    userMneuSidebarItems,
  };
};
