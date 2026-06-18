import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";

// ! Redux Selectors
import { selectActiveGroupForm } from "../../redux/groupSelectors";

// ! Styles
import styles from "./groupformrenderer.module.css";

// ! Forms
import AddGroupForm from "./addGroupForm/AddGroupForm";
import UpdateGroupForm from "./updateGroupForm/UpdateGroupForm.jsx";
import DeleteGroupForm from "./deleteGroupForm/DeleteGroupForm.jsx";
import TradeForm from "./tradeGroupForm/DeleteGroupForm.jsx";

const formComponents = {
  addGroup: AddGroupForm,
  updateGroup: UpdateGroupForm,
  deleteGroup: DeleteGroupForm,
  trade: TradeForm,
};

const GroupFormRenderer = () => {
  const activeGroupForm = useSelector(selectActiveGroupForm);
  const ActiveFormComponent = formComponents[activeGroupForm];

  useEffect(() => {
    if (!ActiveFormComponent) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [ActiveFormComponent]);

  if (!ActiveFormComponent) return null;

  return createPortal(
    <div className={styles.centerLayer}>
      <div className={styles.formContainer}>
        <ActiveFormComponent />
      </div>
    </div>,
    document.body,
  );
};

export default GroupFormRenderer;
