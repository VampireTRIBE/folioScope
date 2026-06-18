// ! Styles
import styles from "../groupActionForm.module.css";

// ! Dispatch Actions
import { useGroupFormActions } from "../../../redux/dispatchActions";

const UpdateGroupForm = () => {
  const { ACTIVE_GROUP_FORM_RESET } = useGroupFormActions();

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <fieldset className={styles.fieldset}>
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
          />
        </div>

        <div className={styles.buttonContainer}>
          <button className={styles.resetButton} type="reset">
            Reset
          </button>

          <button className={styles.submitButton} type="submit">
            Update Group
          </button>
        </div>
      </fieldset>
    </form>
  );
};

export default UpdateGroupForm
