// ! UI Components
import TextImgButton from "../../../../../components/UI/buttons/TextImgButton";

// ! Styles
import ButtonContainersStyles from "./buttoncontainers.module.css";

const ButtonContainers = () => {
  const handleClick = (buttonName) => {
    console.log(`${buttonName} clicked`);
  };

  const dummyButtons = [
    {
      name: "Add Group",
      varient: "textImgButton",
      imgAttibutes: {
        variantButton: "textImgButtonVarient",
        variantImg: "img",
        src: "/assets/icons/addGroup.png",
        alt: "add group",
        title: "Add New Group",
      },
      onClick: () => handleClick("Add Group"),
    },
    {
      name: "Update Group",
      varient: "textImgButton",
      imgAttibutes: {
        variantButton: "textImgButtonVarient",
        variantImg: "img",
        src: "/assets/icons/updateGroup.png",
        alt: "Update Group",
        title: "Update Group",
      },
      onClick: () => handleClick("Update Group"),
    },
    {
      name: "Delete Group",
      varient: "textImgButton",
      imgAttibutes: {
        variantButton: "textImgButtonVarient",
        variantImg: "img",
        src: "/assets/icons/deleteGroup.png",
        alt: "Delete Group",
        title: "Delete Group",
      },
      onClick: () => handleClick("Delete Group"),
    },
  ];

  return (
    <div className={ButtonContainersStyles.container}>
      {dummyButtons.map((button, index) => (
        <TextImgButton
          key={index}
          name={button.name}
          varient={button.varient}
          imgAttibutes={button.imgAttibutes}
          onClick={button.onClick}
        />
      ))}
    </div>
  );
};

export default ButtonContainers;
