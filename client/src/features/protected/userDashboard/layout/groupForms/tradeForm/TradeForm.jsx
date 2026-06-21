import { useSelector } from "react-redux";
import { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

// ! Hooks
import { usePublicSecurities } from "../../../../../../hooks/RTK Query Hooks/sessionStorage";

// ! Utils
import {
  getSecuritiesByCategory,
  getSecurityId,
  getSecurityLabel,
  TRADABLE_SECURITIES_KEY,
} from "../../../../../../utils/sessionStorage/securityListTransforms";

// ! Styles
import tradeStyles from "./tradeform.module.css";

// ! UI Components
import Button from "../../../../../../components/UI/buttons/Button";

// ! Context
import { AuthenticationContext } from "../../../../../../context/authenticationContext";

// ! Dispatch Actions
import { useGroupFormActions } from "../../../redux/dispatchActions";

// ! Redux Selectors
import { selectActiveTradeTransactionType } from "../../../redux/groupSelectors";

// ! tanStack Query hooks
import { useTradeTransactionFormMutation } from "../../../hooks/ReactQuery/useFormMutation";

// ! Custom Hooks
import { useFormDataActions } from "../../../hooks/customHooks/useFormData";

// ! Custom Client Navigation Hooks
import { useNavigationActions } from "../../../../../hooks/customHooks/useNavigationActions";

const TradeForm = () => {
  const { gp_id, level } = useParams();
  const { accessToken, userData } = useContext(AuthenticationContext);
  const { goToUserDashboard } = useNavigationActions();

  const {
    FILTER_ACTIVE_TRADETRANSACTION_TYPE,
    ACTIVE_GROUP_FORM_RESET,
    FILTER_ACTIVE_GROUPTRANSACTION_TYPE_RESET,
    FILTER_ACTIVE_TRADETRANSACTION_TYPE_RESET,
  } = useGroupFormActions();
  const activeTradeTransactionType = useSelector(
    selectActiveTradeTransactionType,
  );

  const groupId = userData?.groups?.[`level${level}`]?.[gp_id]?._id;

  const {
    mutateAsync: tradeTransactionFormMutationFn,
    isPending: isPendingtradeTransactionForm,
    isSuccess: isSuccesstradeTransactionForm,
    error: errortradeTransactionForm,
  } = useTradeTransactionFormMutation();
  const { submitFormTradeTransactionData } = useFormDataActions();

  const [symbolQuery, setSymbolQuery] = useState("");
  const [selectedSymbolId, setSelectedSymbolId] = useState("");
  const [showSymbolPreview, setShowSymbolPreview] = useState(false);

  const { data: securitiesList, isPending: isPendingSecuritiesList } =
    usePublicSecurities();

  const safeSecuritiesList = useMemo(() => {
    return getSecuritiesByCategory(securitiesList, TRADABLE_SECURITIES_KEY);
  }, [securitiesList]);

  const filteredSecuritiesList = useMemo(() => {
    if (!symbolQuery.trim()) return [];

    return safeSecuritiesList.filter((item) =>
      getSecurityLabel(item).toLowerCase().includes(symbolQuery.toLowerCase()),
    );
  }, [safeSecuritiesList, symbolQuery]);

  const handleSelectSymbol = (item) => {
    setSymbolQuery(getSecurityLabel(item));
    setSelectedSymbolId(getSecurityId(item));
    setShowSymbolPreview(false);
  };

  const errorMessage =
    errortradeTransactionForm?.response?.data?.message ||
    errortradeTransactionForm?.response?.data?.error ||
    errortradeTransactionForm?.message ||
    "Group Transaction Failed";

  const buttonArray = [
    {
      id: "buy",
      text: "BUY",
      varient:
        activeTradeTransactionType === "buy"
          ? "chartFilterActive"
          : "chartFilter",
      type: "button",
    },
    {
      id: "sell",
      text: "SELL",
      varient:
        activeTradeTransactionType === "sell"
          ? "chartFilterActive"
          : "chartFilter",
      type: "button",
    },
    {
      id: "dividend",
      text: "DIVIDEND",
      varient:
        activeTradeTransactionType === "dividend"
          ? "chartFilterActive"
          : "chartFilter",
      type: "button",
    },
  ];

  useEffect(() => {
    if (!isSuccesstradeTransactionForm) return;

    const syncAfterSuccess = async () => {
      ACTIVE_GROUP_FORM_RESET();
      FILTER_ACTIVE_GROUPTRANSACTION_TYPE_RESET();
      FILTER_ACTIVE_TRADETRANSACTION_TYPE_RESET();
      goToUserDashboard(level, gp_id);
    };

    syncAfterSuccess();
  }, [
    ACTIVE_GROUP_FORM_RESET,
    FILTER_ACTIVE_GROUPTRANSACTION_TYPE_RESET,
    FILTER_ACTIVE_TRADETRANSACTION_TYPE_RESET,
    goToUserDashboard,
    isSuccesstradeTransactionForm,
    gp_id,
    level,
  ]);

  return (
    <form
      className={tradeStyles.form}
      onReset={() => {
        setSymbolQuery("");
        setSelectedSymbolId("");
        setShowSymbolPreview(false);
      }}
      onSubmit={(e) =>
        submitFormTradeTransactionData(
          e,
          tradeTransactionFormMutationFn,
          activeTradeTransactionType,
          accessToken,
          groupId,
        )
      }>
      <fieldset
        className={tradeStyles.fieldset}
        disabled={isPendingtradeTransactionForm}>
        <legend className={tradeStyles.legend}>
          <div className={tradeStyles.legendHeading}>
            <h3>Trade Transaction</h3>
            <button
              className={tradeStyles.closeButton}
              type="button"
              aria-label="Close add group form"
              title="Close"
              onClick={ACTIVE_GROUP_FORM_RESET}>
              X
            </button>
          </div>
          <div className={tradeStyles.formTypebuttonContainer}>
            {buttonArray.map((button, indx) => (
              <Button
                key={button.id ?? indx}
                {...button}
                onClick={() => FILTER_ACTIVE_TRADETRANSACTION_TYPE?.(button.id)}
              />
            ))}
          </div>
        </legend>

        {errortradeTransactionForm && (
          <div className={tradeStyles.error}>{errorMessage}</div>
        )}

        <div className={tradeStyles.inputGroup}>
          <label htmlFor="tradeSymbol" className={tradeStyles.label}>
            Symbol :
          </label>

          <div className={tradeStyles.symbolInputContainer}>
            <input
              className={`${tradeStyles.input} ${tradeStyles.symbolInput}`}
              type="text"
              placeholder={isPendingSecuritiesList ? "Loading..." : "Symbol"}
              id="tradeSymbol"
              value={symbolQuery}
              onChange={(e) => {
                setSymbolQuery(e.target.value);
                setSelectedSymbolId("");
                setShowSymbolPreview(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowSymbolPreview(false), 200);
              }}
              onFocus={() => {
                if (symbolQuery.trim()) setShowSymbolPreview(true);
              }}
              autoComplete="off"
              required
            />
            <input type="hidden" name="symbol" value={selectedSymbolId} />

            {showSymbolPreview && filteredSecuritiesList.length > 0 && (
              <div className={tradeStyles.suggestionPreview}>
                {filteredSecuritiesList.map((item, index) => {
                  const value = getSecurityLabel(item);

                  return (
                    <div
                      key={`${value}-${index}`}
                      className={tradeStyles.suggestionItem}
                      onMouseDown={() => handleSelectSymbol(item)}>
                      {value}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {(activeTradeTransactionType === "buy" ||
          activeTradeTransactionType === "sell") && (
          <div className={tradeStyles.tradeButtonsContainer}>
            <div className={tradeStyles.inputGroup}>
              <label htmlFor="tradeQty" className={tradeStyles.label}>
                Qty :
              </label>

              <input
                className={tradeStyles.input}
                type="Number"
                placeholder="Qty"
                id="tradeQty"
                name="qty"
                required
              />
            </div>
            <div className={tradeStyles.inputGroup}>
              <label htmlFor="tradePrice" className={tradeStyles.label}>
                Price :
              </label>

              <input
                className={tradeStyles.input}
                type="Number"
                placeholder="Price"
                id="tradePrice"
                name="price"
                required
              />
            </div>
          </div>
        )}
        <div className={tradeStyles.inputGroup}>
          <label htmlFor="tradeDate" className={tradeStyles.label}>
            Date :
          </label>

          <input
            className={tradeStyles.input}
            type="date"
            placeholder="Transaction date"
            id="tradeDate"
            name="date"
            required
          />
        </div>

        {activeTradeTransactionType === "dividend" && (
          <div className={tradeStyles.inputGroup}>
            <label htmlFor="tradeDividendAmount" className={tradeStyles.label}>
              Dividend Amount :
            </label>

            <input
              className={tradeStyles.input}
              placeholder="Dividend Amount"
              type="Number"
              id="tradeDividendAmount"
              name="dividendAmount"
              rows="4"
              required
            />
          </div>
        )}

        <div className={tradeStyles.buttonContainer}>
          <button className={tradeStyles.resetButton} type="reset">
            Reset
          </button>

          <button className={tradeStyles.submitButton} type="submit">
            {isPendingtradeTransactionForm
              ? "Submiting...."
              : activeTradeTransactionType.toUpperCase()}
          </button>
        </div>
      </fieldset>
    </form>
  );
};

export default TradeForm;
