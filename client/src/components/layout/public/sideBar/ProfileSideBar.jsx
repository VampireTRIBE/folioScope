import containerStyle from "./profilesidebar.module.css";
import TextButton from "../../../UI/buttons/TextButton";
import DropdownButton from "../../../UI/buttons/DropdownButton";


const ProfileSideBar = ({ profileSidebarItems = [] }) => {
  return (
    <div className={containerStyle.userSideBar}>
      {profileSidebarItems.map((el, index) =>
        !el?.group ? (
          <TextButton key={el.id || index} {...el} />
        ) : (
          <DropdownButton key={el.id || index} {...el}/>
        ),
      )}
    </div>
  );
};
export default ProfileSideBar;
