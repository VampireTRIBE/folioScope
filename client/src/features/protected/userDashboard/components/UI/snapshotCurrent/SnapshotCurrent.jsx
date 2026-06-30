// ! UI Components
import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import PriceBadge from "../../../../../../components/layout/public/priceBadge/PriceBadge";

// ! Context
import { AuthenticationContext } from "../../../../../../context/authenticationContext";

// ! Styles
import snapshotCurrentStyles from "./snapshotcurrent.module.css";

// ! tanStack Query hooks
import { useGroupXirrMutation } from "../../../hooks/ReactQuery/useFormMutation";

const CurrentStatus = ({ currentStatus = null }) => {
  const { gp_id, level } = useParams();
  const { accessToken, userData } = useContext(AuthenticationContext);
  const groupId = userData?.groups?.[`level${level}`]?.[gp_id]?._id;
  const currentGroupIdRef = useRef(groupId);
  const [xirr, setXirr] = useState(null);
  const {
    mutateAsync: groupXirrMutationFn,
    isPending: isPendinggroupXirr,
    error: errorgroupXirr,
    reset: resetGroupXirrMutation,
  } = useGroupXirrMutation(groupId);

  useEffect(() => {
    currentGroupIdRef.current = groupId;
    const timer = setTimeout(() => setXirr(null), 0);
    resetGroupXirrMutation();
    return () => clearTimeout(timer);
  }, [groupId, resetGroupXirrMutation]);

  const errorMessage =
    errorgroupXirr?.response?.data?.message ||
    errorgroupXirr?.response?.data?.error ||
    errorgroupXirr?.message ||
    "XIRR calculation failed";

  const handleXirrButton = async () => {
    const requestedGroupId = groupId;
    const response = await groupXirrMutationFn({
      accessToken,
      groupId: requestedGroupId,
    });

    if (requestedGroupId === currentGroupIdRef.current) {
      setXirr(response?.data ?? null);
    }
  };

  const currentValue = {
    price: currentStatus?.currentvalue || 0.0,
  };
  const investmentValue = {
    price: currentStatus?.investmentvalue || 0.0,
  };
  const pl = {
    price: currentStatus?.pl || 0.0,
    today: currentStatus?.["pl%"] === "NaN" ? "0.00" : currentStatus?.["pl%"],
  };

  return (
    <div className={snapshotCurrentStyles.container}>
      <div className={snapshotCurrentStyles.subContainer}>
        <div>Investment Value : </div>
        <PriceBadge
          price={investmentValue}
          currency={true}
          percentage={false}
        />
      </div>
      <div className={snapshotCurrentStyles.subContainer}>
        <div>Current Value : </div>
        <PriceBadge price={currentValue} currency={true} percentage={false} />
      </div>
      <div className={snapshotCurrentStyles.subContainerPnl}>
        <div>Unrealized P/L : </div>
        <div>
          <PriceBadge price={pl} currency={true} />
        </div>
      </div>
      <div className={snapshotCurrentStyles.subContainerPnl}>
        <div>XIRR : </div>
        {xirr !== null ? (
          <div>
            <PriceBadge price={{ today: xirr }} priceValue={false} />
          </div>
        ) : (
          <button
            className={snapshotCurrentStyles.xirrButton}
            type="button"
            disabled={isPendinggroupXirr || !groupId || !accessToken}
            onClick={handleXirrButton}>
            {isPendinggroupXirr ? "---" : "View"}
          </button>
        )}
      </div>
      {errorgroupXirr && (
        <div className={snapshotCurrentStyles.error}>{errorMessage}</div>
      )}
    </div>
  );
};

export default CurrentStatus;
