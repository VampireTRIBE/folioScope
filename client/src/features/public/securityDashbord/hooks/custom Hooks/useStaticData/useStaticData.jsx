import { useMemo } from "react";

export const useStaticDataSecurityContent = () => {
  const dummyOverview = useMemo(
    () => [
      {
        assetClass: {
          id: "assetClass",
          name: "Class",
        },
      },
      {
        assetCategory: {
          id: "assetCategory",
          name: "Category",
        },
      },
      {
        assetSubCategory: {
          id: "assetSubCategory",
          name: "Sub Category",
        },
      },
    ],
    [],
  );

  return {
    dummyOverview,
  };
};
