import { useSelector } from "react-redux";
import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";

// ! Styles
import groupTransactionStyles from "./groupTransaction.module.css";

// ! UI Components
import Button from "../../../../../../components/UI/buttons/Button";

// ! Context
import { AuthenticationContext } from "../../../../../../context/authenticationContext";

// ! Dispatch Actions
import { useGroupFormActions } from "../../../redux/dispatchActions";

// ! Redux Selectors
import { selectActiveGroupTransactionType } from "../../../redux/groupSelectors";

// ! tanStack Query hooks
import { useGroupTransactionFormMutation } from "../../../hooks/ReactQuery/useFormMutation";

// ! Custom Hooks
import { useFormDataActions } from "../../../hooks/customHooks/useFormData";

// ! Custom Client Navigation Hooks
import { useNavigationActions } from "../../../../../hooks/customHooks/useNavigationActions";

const GroupTransactionForm = () => {
  const { gp_id, level } = useParams();
  const { accessToken, userData } = useContext(AuthenticationContext);
  const { goToUserDashboard } = useNavigationActions();
  const {
    FILTER_ACTIVE_GROUPTRANSACTION_TYPE,
    ACTIVE_GROUP_FORM_RESET,
    FILTER_ACTIVE_GROUPTRANSACTION_TYPE_RESET,
  } = useGroupFormActions();
  const activeGroupTransactionType = useSelector(
    selectActiveGroupTransactionType,
  );
  const groupId = userData?.groups?.[`level${level}`]?.[gp_id]?._id;

  const {
    mutateAsync: groupTransactionFormMutationFn,
    isPending: isPendinggroupTransactionForm,
    isSuccess: isSuccessgroupTransactionForm,
    error: errorgroupTransactionForm,
  } = useGroupTransactionFormMutation();
  const { submitFormGroupTransactionData } = useFormDataActions();
  const errorMessage =
    errorgroupTransactionForm?.response?.data?.message ||
    errorgroupTransactionForm?.response?.data?.error ||
    errorgroupTransactionForm?.message ||
    "Group Transaction Failed";

  const buttonArray = [
    {
      id: "deposit",
      text: "DEPOSIT",
      varient:
        activeGroupTransactionType === "deposit"
          ? "chartFilterActive"
          : "chartFilter",
      type: "button",
    },
    {
      id: "withdrawal",
      text: "WITHDRAWAL",
      varient:
        activeGroupTransactionType === "withdrawal"
          ? "chartFilterActive"
          : "chartFilter",
      type: "button",
    },
    {
      id: "tax",
      text: "TAX",
      varient:
        activeGroupTransactionType === "tax"
          ? "chartFilterActive"
          : "chartFilter",
      type: "button",
    },
  ];
  
  useEffect(() => {
    if (!isSuccessgroupTransactionForm) return;

    const syncAfterSuccess = async () => {
      ACTIVE_GROUP_FORM_RESET();
      FILTER_ACTIVE_GROUPTRANSACTION_TYPE_RESET();
      goToUserDashboard(level, gp_id);
    };

    syncAfterSuccess();
  }, [
    ACTIVE_GROUP_FORM_RESET,
    FILTER_ACTIVE_GROUPTRANSACTION_TYPE_RESET,
    goToUserDashboard,
    isSuccessgroupTransactionForm,
    gp_id,
    level,
  ]);

  return (
    <form
      className={groupTransactionStyles.form}
      onSubmit={(e) =>
        submitFormGroupTransactionData(
          e,
          groupTransactionFormMutationFn,
          activeGroupTransactionType,
          accessToken,
          groupId,
        )
      }>
      <fieldset
        className={groupTransactionStyles.fieldset}
        disabled={isPendinggroupTransactionForm}>
        <legend className={groupTransactionStyles.legend}>
          <div className={groupTransactionStyles.legendHeading}>
            <h3>Group Transaction</h3>
            <button
              className={groupTransactionStyles.closeButton}
              type="button"
              aria-label="Close add group form"
              title="Close"
              onClick={ACTIVE_GROUP_FORM_RESET}>
              X
            </button>
          </div>
          <div className={groupTransactionStyles.formTypebuttonContainer}>
            {buttonArray.map((button, indx) => (
              <Button
                key={button.id ?? indx}
                {...button}
                onClick={() => FILTER_ACTIVE_GROUPTRANSACTION_TYPE?.(button.id)}
              />
            ))}
          </div>
        </legend>

        {errorgroupTransactionForm && (
          <div className={groupTransactionStyles.error}>{errorMessage}</div>
        )}

        <div className={groupTransactionStyles.inputGroup}>
          <label htmlFor="groupDate" className={groupTransactionStyles.label}>
            Date :
          </label>

          <input
            className={groupTransactionStyles.input}
            type="date"
            placeholder="Transaction date"
            id="groupDate"
            name="date"
            required
          />
        </div>

        <div className={groupTransactionStyles.inputGroup}>
          <label htmlFor="groupAmount" className={groupTransactionStyles.label}>
            Amount :
          </label>

          <input
            className={groupTransactionStyles.input}
            placeholder="Amount"
            type="Number"
            id="groupAmount"
            name="amount"
            rows="4"
            required
          />
        </div>

        <div className={groupTransactionStyles.buttonContainer}>
          <button className={groupTransactionStyles.resetButton} type="reset">
            Reset
          </button>

          <button className={groupTransactionStyles.submitButton} type="submit">
            {isPendinggroupTransactionForm
              ? "Submiting...."
              : activeGroupTransactionType.toUpperCase()}
          </button>
        </div>
      </fieldset>
    </form>
  );
};

export default GroupTransactionForm;
