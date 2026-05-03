import { FETCH_SECTION1 } from "../../api/fetchApis";
import store from "../../../../../app/store";
import { HOME_DEFAULT_SECTION1Actions } from "../../redux/section1Slice";

let intervalId = null;

export const LOADER_SECTION_1 = async () => {
  try {
    const { data1, data2, data3 } = await FETCH_SECTION1();

    store.dispatch(
      HOME_DEFAULT_SECTION1Actions.SET_SECTION_1_DATA({
        data1,
        data2,
        data3,
      }),
    );
  } catch (err) {
    console.log(err);
  }
};

export const START_SECTION_1_AUTO_REFRESH = () => {
  // Prevent duplicate intervals
  if (intervalId) return;

  // Run immediately
  LOADER_SECTION_1();

  intervalId = setInterval(
    () => {
      if (window.location.href === "http://localhost:5173/") {
        LOADER_SECTION_1();
      }
    },
    2 * 60 * 1000,
  );
};

export const STOP_SECTION_1_AUTO_REFRESH = () => {
  clearInterval(intervalId);
  intervalId = null;
};
