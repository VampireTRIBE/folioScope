import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

// ! Styles
import addGroupStyles from "./addgroup.module.css";

// ! Context
import { AuthenticationContext } from "../../../../../../context/authenticationContext";

// ! Dispatch Actions
import { useGroupFormActions } from "../../../redux/dispatchActions";

// ! APIs
import { FETCH_USERDETAILS } from "../../../../../apis/FETCH_APIs";

// ! tanStack Query hooks
import { useAddGroupFormMutation } from "../../../hooks/ReactQuery/useFormMutation";

// ! Custom Hooks
import { useFormDataActions } from "../../../hooks/customHooks/useFormData";

const AddGroupForm = () => {
  const { gp_id, level } = useParams();
  const queryClient = useQueryClient();
  const { accessToken, userData, setUserData } = useContext(
    AuthenticationContext,
  );
  const { ACTIVE_GROUP_FORM_RESET } = useGroupFormActions();
  const groupId = userData?.groups?.[`level${level}`]?.[gp_id]?._id;
  const {
    mutateAsync: addGroupFormMutationFn,
    isPending: isPendingAddGroupForm,
    isSuccess: isSuccessAddGroupForm,
    error: errorAddGroupForm,
  } = useAddGroupFormMutation();
  const { submitFormAddGroupData } = useFormDataActions();

  useEffect(() => {
    if (!isSuccessAddGroupForm) return;

    const syncAfterSuccess = async () => {
      await queryClient.invalidateQueries({ queryKey: ["GroupMeatadata"] });

      if (accessToken) {
        try {
          const updatedUserDetails = await FETCH_USERDETAILS(accessToken);
          setUserData(updatedUserDetails?.user || null);
        } catch {
          setUserData(userData);
        }
      }
      ACTIVE_GROUP_FORM_RESET();
    };

    syncAfterSuccess();
  }, [
    ACTIVE_GROUP_FORM_RESET,
    accessToken,
    isSuccessAddGroupForm,
    queryClient,
    setUserData,
    userData,
  ]);

  const errorMessage =
    errorAddGroupForm?.response?.data?.message ||
    errorAddGroupForm?.response?.data?.error ||
    errorAddGroupForm?.message ||
    "Add group failed";

  return (
    <form
      className={addGroupStyles.form}
      onSubmit={(e) =>
        submitFormAddGroupData(e, addGroupFormMutationFn, accessToken, groupId)
      }>
      <fieldset
        className={addGroupStyles.fieldset}
        disabled={isPendingAddGroupForm}>
        <legend className={addGroupStyles.legend}>
          <h3>Add New Group</h3>
          <button
            className={addGroupStyles.closeButton}
            type="button"
            aria-label="Close add group form"
            title="Close"
            onClick={ACTIVE_GROUP_FORM_RESET}>
            X
          </button>
        </legend>

        {errorAddGroupForm && (
          <div className={addGroupStyles.error}>{errorMessage}</div>
        )}

        <div className={addGroupStyles.inputGroup}>
          <label htmlFor="addGroupName" className={addGroupStyles.label}>
            Name :
          </label>

          <input
            className={addGroupStyles.input}
            type="text"
            placeholder="Group name"
            id="addGroupName"
            name="name"
            required
          />
        </div>

        <div className={addGroupStyles.inputGroup}>
          <label htmlFor="addGroupDescription" className={addGroupStyles.label}>
            Description :
          </label>

          <textarea
            className={addGroupStyles.textarea}
            placeholder="Group description"
            id="addGroupDescription"
            name="description"
            rows="4"
            required
          />
        </div>

        <div className={addGroupStyles.buttonContainer}>
          <button className={addGroupStyles.resetButton} type="reset">
            Reset
          </button>

          <button className={addGroupStyles.submitButton} type="submit">
            {isPendingAddGroupForm ? "Submiting...." : "Add Group"}
          </button>
        </div>
      </fieldset>
    </form>
  );
};

export default AddGroupForm;
