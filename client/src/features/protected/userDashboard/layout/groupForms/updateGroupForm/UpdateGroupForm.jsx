import { useContext, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

// ! Styles
import groupUpdateStyles from "./groupUpdateForm.module.css";

// ! Context
import { AuthenticationContext } from "../../../../../../context/authenticationContext";

// ! Dispatch Actions
import { useGroupFormActions } from "../../../redux/dispatchActions";

// ! APIs
import { FETCH_USERDETAILS } from "../../../../../apis/FETCH_APIs";

// ! tanStack Query hooks
import { useGROUPMETADATA } from "../../../hooks/ReactQuery/useQuery";
import { useUpdateGroupFormMutation } from "../../../hooks/ReactQuery/useFormMutation";

// ! Custom Hooks
import { useFormDataActions } from "../../../hooks/customHooks/useFormData";

const UpdateGroupForm = () => {
  const { gp_id, level } = useParams();

  const navigate = useNavigate();
  const location = useLocation();

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
          const updatedUser = updatedUserDetails?.user || null;

          setUserData(updatedUser);

          const updatedLevelGroups =
            updatedUser?.groups?.[`level${level}`] || {};

          const newGroupKey = Object.keys(updatedLevelGroups).find(
            (key) =>
              String(updatedLevelGroups[key]?._id) === String(groupId),
          );

          if (newGroupKey && newGroupKey !== gp_id) {
            const oldPathPart = encodeURIComponent(gp_id);
            const newPathPart = encodeURIComponent(newGroupKey);

            const nextPath = location.pathname.includes(oldPathPart)
              ? location.pathname.replace(oldPathPart, newPathPart)
              : location.pathname.replace(gp_id, newGroupKey);

            navigate(nextPath, { replace: true });
          }
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
    gp_id,
    groupId,
    isSuccessUpdateGroupForm,
    level,
    location.pathname,
    navigate,
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
      className={groupUpdateStyles.form}
      onSubmit={(e) =>
        submitFormUpdateGroupData(
          e,
          updateGroupFormMutationFn,
          accessToken,
          groupId,
        )
      }>
      <fieldset
        className={groupUpdateStyles.fieldset}
        disabled={isPendingUpdateGroupForm || isPendingGroupMetadata}>
        <legend className={groupUpdateStyles.legend}>
          <h3>Update Group</h3>
          <button
            className={groupUpdateStyles.closeButton}
            type="button"
            aria-label="Close update group form"
            title="Close"
            onClick={ACTIVE_GROUP_FORM_RESET}>
            X
          </button>
        </legend>

        {errorUpdateGroupForm && (
          <div className={groupUpdateStyles.error}>{errorMessage}</div>
        )}

        <div className={groupUpdateStyles.inputGroup}>
          <label htmlFor="updateGroupName" className={groupUpdateStyles.label}>
            Name :
          </label>

          <input
            className={groupUpdateStyles.input}
            type="text"
            placeholder="Group name"
            id="updateGroupName"
            name="name"
            defaultValue={GroupMeatadataData?.data?.groupName || ""}
            required
          />
        </div>

        <div className={groupUpdateStyles.inputGroup}>
          <label
            htmlFor="updateGroupDescription"
            className={groupUpdateStyles.label}>
            Description :
          </label>

          <textarea
            className={groupUpdateStyles.textarea}
            placeholder="Group description"
            id="updateGroupDescription"
            name="description"
            rows="4"
            defaultValue={GroupMeatadataData?.data?.description || ""}
            required
          />
        </div>

        <div className={groupUpdateStyles.buttonContainer}>
          <button className={groupUpdateStyles.resetButton} type="reset">
            Reset
          </button>

          <button className={groupUpdateStyles.submitButton} type="submit">
            {isPendingUpdateGroupForm ? "Submiting...." : "Update Group"}
          </button>
        </div>
      </fieldset>
    </form>
  );
};

export default UpdateGroupForm;