import { LOADER_SECTION_1 } from "../loders/section1/section1.loder";

let intervalId = null;
const TIME_INTERVAL = 5000;
export const START_SECTION_1_AUTO_REFRESH = () => {
  if (intervalId) return;
  intervalId = setInterval(
    () => {
      if (window.location.href === "http://localhost:5173/") {
        LOADER_SECTION_1();
      }
    },
    TIME_INTERVAL,
  );
};

export const STOP_SECTION_1_AUTO_REFRESH = () => {
  clearInterval(intervalId);
  intervalId = null;
};
