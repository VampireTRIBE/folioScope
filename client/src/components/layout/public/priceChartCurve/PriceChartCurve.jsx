import priceChartCurveStyle from "./pricechartcurve.module.css";

import { createChart, AreaSeries } from "lightweight-charts";

import { useEffect, useRef } from "react";

const PriceChartCurve = () => {
  //   const chartContainerRef = useRef(null);

  //   useEffect(() => {
  //     const chart = createChart(chartContainerRef.current, {
  //       width: chartContainerRef.current.clientWidth,
  //       height: 400,
  //     });

  //     const areaSeries = chart.addSeries(AreaSeries);

  //     areaSeries.setData([
  //       { time: "2026-05-10", value: 100 },
  //       { time: "2026-05-11", value: 105 },
  //       { time: "2026-05-12", value: 102 },
  //       { time: "2026-05-13", value: 110 },
  //     ]);

  //     return () => {
  //       chart.remove();
  //     };
  //   }, []);

  return (
    <div
      // ref={chartContainerRef}
      className={priceChartCurveStyle.chartContainer}
    />
  );
};

export default PriceChartCurve;
