import { useContext, useEffect, useMemo, useRef, useState } from "react";

// ! Syles
import userHoldingsOutletStyles from "./userholdingsoutlet.module.css";

// ! context
import { AuthenticationContext } from "../../../../context/authenticationContext";

// ! Custom Hooks
import { useNavigationActions } from "../../../hooks/customHooks/useNavigationActions";

// ! Tanstck Query

// ! Layout Components
import HoldingsContainer from "../layout/holdingsContainer/HoldingsContainer";
import CostStructure from "../components/UI/expanseCard/ExpenseCard";
import HoldingSummary from "../components/UI/holdingSummary/HoldingSummary";
import StrategicInsights from "../components/UI/strategicInsights/StrategicInsights";
import FilterHoldings from "../layout/filterHoldings/FilterHoldings";
import { useFormDataActions } from "../hooks/customHooks/useFormData";
import { useFilterHoldingsFormMutation } from "../hooks/ReactQuery/useFormMutation";

const UserHoldingsOutlet = () => {
  const { accessToken, userData } = useContext(AuthenticationContext);
  const { goToLogin } = useNavigationActions();
  const [selectedHoldingsGroupId, setSelectedHoldingsGroupId] = useState("");
  const autoFetchedGroupIdRef = useRef("");
  const defaultNetWorthGroupId = useMemo(() => {
    return (
      Object.values(userData?.groups?.level1 || {}).find(
        (group) => group?.name?.toUpperCase() === "NET WORTH",
      )?._id || ""
    );
  }, [userData]);
  const activeHoldingsGroupId =
    selectedHoldingsGroupId || defaultNetWorthGroupId;
  const { submitFilterHoldingData } = useFormDataActions();
  const {
    mutateAsync: filterHoldingData,
    isPending: isPendingFilterHoldingForm,
    data: filterHoldingResponse,
    error: errorFilterHoldingForm,
  } = useFilterHoldingsFormMutation();
  const holdingsData = filterHoldingResponse?.data || {};
  const totalStats = holdingsData?.totalStats || {};
  const bucketCost = holdingsData?.buketCost || {};

  const errorMessage =
    errorFilterHoldingForm?.response?.data?.message ||
    errorFilterHoldingForm?.response?.data?.error ||
    errorFilterHoldingForm?.message ||
    "Holdins Fetch failed";

  useEffect(() => {
    if (!accessToken) {
      goToLogin();
    }
  }, [accessToken, goToLogin]);

  useEffect(() => {
    if (!accessToken || !defaultNetWorthGroupId || selectedHoldingsGroupId) {
      return;
    }
    if (autoFetchedGroupIdRef.current === defaultNetWorthGroupId) {
      return;
    }
    autoFetchedGroupIdRef.current = defaultNetWorthGroupId;
    filterHoldingData({
      accessToken,
      data: { groupId: defaultNetWorthGroupId },
    }).catch(() => null);
  }, [
    accessToken,
    defaultNetWorthGroupId,
    filterHoldingData,
    selectedHoldingsGroupId,
  ]);

  return (
    <main className={userHoldingsOutletStyles.outlet}>
      <div className={userHoldingsOutletStyles.filterLayout}>
        <FilterHoldings
          accessToken={accessToken}
          errorMessage={errorFilterHoldingForm ? errorMessage : ""}
          filterHoldingData={filterHoldingData}
          isPending={isPendingFilterHoldingForm}
          onSubmitGroup={setSelectedHoldingsGroupId}
          submitFilterHoldingData={submitFilterHoldingData}
        />
      </div>
      <div className={userHoldingsOutletStyles.layout}>
        <HoldingSummary
          totalInvested={totalStats.investedValue}
          currentValue={totalStats.currentValue}
          todaysGain={totalStats.todaysGain?.price}
          todaysGainPercentage={totalStats.todaysGain?.today}
          groupXirr={totalStats.groupXirr}
        />
        <CostStructure
          totalExpenseRatio={bucketCost.totalExpenseRatio}
          annualCost={bucketCost.anualCost}
        />
        <StrategicInsights />
      </div>
      <HoldingsContainer
        groupId={activeHoldingsGroupId}
        userHoldings={holdingsData.userHoldings || []}
      />
    </main>
  );
};

export default UserHoldingsOutlet;
