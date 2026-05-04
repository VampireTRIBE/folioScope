import { useCallback, useMemo } from "react";

import { useDispatch } from "react-redux";

import { useNavigate } from "react-router-dom";

import { headerToggleActions } from "../redux/headerToggleState";

import { ROUTES } from "../../../../constants/routes";

export const useHeaderActions = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  // =========================
  // TOGGLE ACTION
  // =========================

  const toggle = useCallback(
    (key) => {
      dispatch(
        headerToggleActions.TOGGLE({
          key,
        }),
      );
    },
    [dispatch],
  );

  // =========================
  // NAVIGATION ACTIONS
  // =========================

  const goToHome = useCallback(() => {
    navigate(ROUTES.HOME);
  }, [navigate]);

  const goToLogin = useCallback(() => {
    navigate(ROUTES.LOGIN);
  }, [navigate]);

  const goToSignUp = useCallback(() => {
    navigate(ROUTES.SIGNUP);
  }, [navigate]);

  const goToSecurityDashbord = useCallback(
    (security) => {
      navigate(ROUTES.SECURITYDASHBORD(security));
    },
    [navigate],
  );

  // =========================
  // SHARED AUTH OPTIONS
  // =========================

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
        onClick: goToSignUp,
        children: "Sign Up",
        variant: "sideBarbtn",
        order: 2,
      },
    ],
    [goToLogin, goToSignUp],
  );

  const menuOptions = useMemo(
    () => [
      {
        id: "menu-option-1",
        onClick: goToLogin,
        children: "Option-1",
        variant: "sideBarbtn",
        order: 1,
      },
      {
        id: "auth-option-signup",
        onClick: goToSignUp,
        children: "Option-2",
        variant: "sideBarbtn",
        order: 2,
      },
    ],
    [goToLogin, goToSignUp],
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

  // =========================
  // PROFILE NAVBAR ITEMS
  // =========================

  return {
    toggle,
    goToHome,
    goToSecurityDashbord,
    profileBtn,
    profileSidebarItems,
  };
};
