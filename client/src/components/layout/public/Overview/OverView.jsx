import overviewStyle from "./overview.module.css";

const OverView = ({ title, overview }) => {
  return (
    <div id="overview" className={overviewStyle.container}>
      <h3 className={overviewStyle.title}>{title ?? "Title"}</h3>
      <div className={overviewStyle.overview}>
        {overview ??
          "................................... ........................ ...................................... ................................... ................................... ........................ ..................................................."}
      </div>
    </div>
  );
};

export default OverView;
