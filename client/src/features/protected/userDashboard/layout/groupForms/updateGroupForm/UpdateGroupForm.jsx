import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

// ! Styles
import styles from "../groupActionForm.module.css";

// ! Context
import { AuthenticationContext } from "../../../../../../context/authenticationContext";

// ! Dispatch Actions
import { useGroupFormActions } from "../../../redux/dispatchActions";

// ! APIs
import { FETCH_USERDETAILS } from "../../../../../apis/FETCH_APIs";

// ! tanStack Query hooks
import { useGROUPMETADATA } from "../../../hooks/ReactQuery/useQuery";
import { useUpdateGroupFormMutation } from "./hooks/RTK Query/useFormMutation";

// ! Custom Hooks
import { useFormDataActions } from "./hooks/customHooks/useFormData";

const UpdateGroupForm = () => {
  const { gp_id, level } = useParams();
  const queryClient = useQueryClient();
  const { accessToken, userData, setUserData } =
    useContext(AuthenticationContext);
  const { ACTIVE_GROUP_FORM_RESET } = useGroupFormActions();
  const groupId = userData?.groups?.[`level${level}`]?.[gp_id]?._id;
  const {
    data: GroupMeatadataData,
    isPending: isPendingGroupMetadata,
  } = useGROUPMETADATA(accessToken, groupId);
  const {
    mutateAsync: updateGroupFormMutationFn,
    isPending: isPendingUpdateGroupForm,
    isSuccess: isSuccessUpdateGroupForm,
    error: errorUpdateGroupForm,
  } = useUpdateGroupFormMutation();
  const { submitFormUpdateGroupData } = useFormDataActions();

  useEffect(() => {
    if (!isSuccessUpdateGroupForm) return;

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
    isSuccessUpdateGroupForm,
    queryClient,
    setUserData,
    userData,
  ]);

  const errorMessage =
    errorUpdateGroupForm?.response?.data?.message ||
    errorUpdateGroupForm?.response?.data?.error ||
    errorUpdateGroupForm?.message ||
    "Update group failed";

  return (
    <form
      key={GroupMeatadataData?.data?._id || groupId || "updateGroupForm"}
      className={styles.form}
      onSubmit={(e) =>
        submitFormUpdateGroupData(
          e,
          updateGroupFormMutationFn,
          accessToken,
          groupId,
        )
      }>
      <fieldset
        className={styles.fieldset}
        disabled={isPendingUpdateGroupForm || isPendingGroupMetadata}>
        <legend className={styles.legend}>
          <h3>Update Group</h3>
          <button
            className={styles.closeButton}
            type="button"
            aria-label="Close update group form"
            title="Close"
            onClick={ACTIVE_GROUP_FORM_RESET}>
            X
          </button>
        </legend>

        {errorUpdateGroupForm && (
          <div className={styles.error}>{errorMessage}</div>
        )}

        <div className={styles.inputGroup}>
          <label htmlFor="updateGroupName" className={styles.label}>
            Name :
          </label>

          <input
            className={styles.input}
            type="text"
            placeholder="Group name"
            id="updateGroupName"
            name="name"
            defaultValue={GroupMeatadataData?.data?.groupName || ""}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="updateGroupDescription" className={styles.label}>
            Description :
          </label>

          <textarea
            className={styles.textarea}
            placeholder="Group description"
            id="updateGroupDescription"
            name="description"
            rows="4"
            defaultValue={GroupMeatadataData?.data?.description || ""}
            required
          />
        </div>

        <div className={styles.buttonContainer}>
          <button className={styles.resetButton} type="reset">
            Reset
          </button>

          <button className={styles.submitButton} type="submit">
            {isPendingUpdateGroupForm ? "Submiting...." : "Update Group"}
          </button>
        </div>
      </fieldset>
    </form>
  );
};

export default UpdateGroupForm
