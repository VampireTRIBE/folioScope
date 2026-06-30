import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { publicheaderToggleActions } from "../redux/headerToggleState";
import { useNavigationActions } from "../../../hooks/customHooks/useNavigationActions";

export const useHeaderActions = () => {
  const dispatch = useDispatch();

  const { goToLogin, goToSignup } = useNavigationActions();

  // =========================
  // ! TOGGLE ACTION
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

  const authOptions = useMemo(
    () => [
      {
        id: "auth-option-login",
        onClick: goToLogin,
        children: "Login",
        variant: "sideBarbtn",
        order: 1,
      },
      {
        id: "auth-option-signup",
        onClick: goToSignup,
        children: "Sign Up",
        variant: "sideBarbtn",
        order: 2,
      },
    ],
    [goToLogin, goToSignup],
  );

  // =========================
  // PROFILE BUTTON
  // =========================

  const profileBtn = useMemo(
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
        variantButton: "imgButton",
        variantImg: "icon",
        src: "/assets/icons/user.png",
        alt: "User Icon",
        title: "Profile",
      },
    ],
    [toggle],
  );

  // =========================
  // PROFILE SIDEBAR ITEMS
  // =========================

  const profileSidebarItems = useMemo(
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
      ...authOptions,
    ],
    [authOptions, toggle],
  );

  return {
    toggle,
    profileBtn,
    profileSidebarItems,
  };
};
