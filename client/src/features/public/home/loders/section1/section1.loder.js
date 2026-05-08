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