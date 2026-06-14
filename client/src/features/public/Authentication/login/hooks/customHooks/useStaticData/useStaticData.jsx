import { useMemo } from "react";

export const useStaticData = () => {
  const imgAttributesBrandLogo = useMemo(
    () => ({
      variantButton: "buttonBlackSquare2",
      variantImg: "icon",
      src: "/assets/icons/logo.png",
      alt: "icon",
    }),
    [],
  );

  return {
    imgAttributesBrandLogo,
  };
};
