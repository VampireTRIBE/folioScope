// test/unit_tests/analytics/ComparisonAnalytics/default_NavRollingReturnsComparison.test.js

jest.mock("../../../../utils/mongodb/aggregations/get_AssetsPrice", () => ({
  get_DailyClosePricesByAsset: jest.fn(),
}));

jest.mock(
  "../../../../utils/shared/tools/computationFormula/drawdown",
  () => ({
    drawdownFunction: jest.fn(() => ({
      group: { current: -2, max: -8 },
      index: { current: -1, max: -4 },
    })),
  }),
);

const {
  get_DailyClosePricesByAsset,
} = require("../../../../utils/mongodb/aggregations/get_AssetsPrice");
const {
  drawdownFunction,
} = require("../../../../utils/shared/tools/computationFormula/drawdown");
const {
  default_NavRollingComparison,
} = require("../../../../sync_Scripts/sync_Portfolio/derivedComputation/default_NavRollingReturnsComparison");

const isoAt330 = (date) => {
  const d = new Date(date);
  d.setUTCHours(10, 0, 0, 0);
  return d.toISOString();
};

const buildSeries = (days) => {
  const indexPrices = {};
  const navPrices = {};
  const start = new Date("2026-06-29T10:00:00.000Z");

  for (let i = 0; i < days; i += 1) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() - i);
    const key = date.toISOString();
    indexPrices[isoAt330(date)] = 100 + i;
    navPrices[key] = {
      nav: 200 + i * 2,
      units: 10,
    };
  }

  return { indexPrices, navPrices };
};

describe("default_NavRollingComparison", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("throws when required parameters are missing", async () => {
    await expect(
      default_NavRollingComparison({
        indexId: "index-id",
        groupId: null,
        startDate: new Date(),
      }),
    ).rejects.toThrow("Missing Request Parameters");
  });

  test("returns empty analytics when NAV history has fewer than two points", async () => {
    get_DailyClosePricesByAsset
      .mockResolvedValueOnce({ [isoAt330("2026-06-29T10:00:00.000Z")]: 100 })
      .mockResolvedValueOnce({
        "2026-06-29T10:00:00.000Z": { nav: 200, units: 10 },
      });

    await expect(
      default_NavRollingComparison({
        indexId: "index-id",
        groupId: "group-id",
        startDate: "2026-01-01T00:00:00.000Z",
      }),
    ).resolves.toEqual({
      standalone: {},
      comparison: {},
    });
  });

  test("builds partial rolling comparison when less than three months of NAV exists", async () => {
    const { indexPrices, navPrices } = buildSeries(10);
    get_DailyClosePricesByAsset
      .mockResolvedValueOnce(indexPrices)
      .mockResolvedValueOnce(navPrices);

    const result = await default_NavRollingComparison({
      indexId: "index-id",
      groupId: "group-id",
      startDate: "2026-01-01T00:00:00.000Z",
      session: "session",
    });

    expect(get_DailyClosePricesByAsset).toHaveBeenNthCalledWith(
      1,
      "index-id",
      new Date("2026-01-01T00:00:00.000Z"),
      false,
      "session",
    );
    expect(get_DailyClosePricesByAsset).toHaveBeenNthCalledWith(
      2,
      "group-id",
      new Date("2026-01-01T00:00:00.000Z"),
      true,
      "session",
    );
    expect(result.groupCurveValue).toEqual(
      expect.objectContaining({
        "2026-06-29T10:00:00.000Z": 2000,
      }),
    );
    expect(result.navBasedAnalytics.standalone["group-id"]).toEqual(
      expect.objectContaining({
        "1Day": expect.objectContaining({
          drawdown: { current: -2, max: -8 },
        }),
        "3MonthsPartial": expect.any(Object),
      }),
    );
    expect(result.navBasedAnalytics.comparison["1Day"].excessDrawdown).toEqual({
      current: -1,
      max: -4,
    });
    expect(drawdownFunction).toHaveBeenCalled();
  });
});
