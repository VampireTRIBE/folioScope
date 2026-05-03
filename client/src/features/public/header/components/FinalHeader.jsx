import React from "react";
import Header from "../../../../components/layout/public/header/Header";
import { useHeaderActions } from "../hooks/useHeadersActions";
import { selectToggleByKey } from "../headerSelectors";
import { useSelector } from "react-redux";

const FinalHeader = () => {
  const profileToggle = useSelector(selectToggleByKey("profileToggle"));
  const menuToggle = useSelector(selectToggleByKey("menuToggle"));
  const { profileBtn, profileSidebarItems, profileNavbarOptions } =
    useHeaderActions();

  return (
    <Header
      profile={{ profileBtn, profileSidebarItems, profileNavbarOptions }}
      toggle={{ profileToggle, menuToggle }}
    />
  );
};

export default FinalHeader;
