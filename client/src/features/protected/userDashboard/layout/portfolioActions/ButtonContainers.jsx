// ! UI Components
import TextImgButton from "../../../../../components/UI/buttons/TextImgButton";

// ! Styles
import ButtonContainersStyles from "./buttoncontainers.module.css";

// ! Dispatch Actions
import { useGroupFormActions } from "../../redux/dispatchActions";
import GroupFormRenderer from "../groupForms/GroupFormRenderer";

const buttons = [
  {
    key: "addGroup",
    name: "Add Group",
    varient: "textImgButton",
    imgAttibutes: {
      variantButton: "textImgButtonVarient",
      variantImg: "img",
      src: "/assets/icons/addGroup.png",
      alt: "add group",
      title: "Add New Group",
    },
  },
  {
    key: "updateGroup",
    name: "Update Group",
    varient: "textImgButton",
    imgAttibutes: {
      variantButton: "textImgButtonVarient",
      variantImg: "img",
      src: "/assets/icons/updateGroup.png",
      alt: "Update Group",
      title: "Update Group",
    },
  },
  {
    key: "deleteGroup",
    name: "Delete Group",
    varient: "textImgButton",
    imgAttibutes: {
      variantButton: "textImgButtonVarient",
      variantImg: "img",
      src: "/assets/icons/deleteGroup.png",
      alt: "Delete Group",
      title: "Delete Group",
    },
  },
  {
    key: "trade",
    name: "Trade",
    varient: "textImgButton",
    imgAttibutes: {
      variantButton: "textImgButtonVarient",
      variantImg: "img",
      src: "/assets/icons/trade.png",
      alt: "Trade",
      title: "Trade",
    },
  },
];

const ButtonContainers = () => {
  const { ACTIVE_GROUP_FORM } = useGroupFormActions();

  return (
    <div className={ButtonContainersStyles.container}>
      {buttons.map((button) => (
        <TextImgButton
          key={button.key}
          name={button.name}
          varient={button.varient}
          imgAttibutes={button.imgAttibutes}
          onClick={() => ACTIVE_GROUP_FORM(button.key)}
        />
      ))}
      <GroupFormRenderer />
    </div>
  );
};

export default ButtonContainers;
