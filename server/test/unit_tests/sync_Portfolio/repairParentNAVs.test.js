const {
  buildHierarchy,
  buildParentRepairs,
  replayIndependentUnits,
} = require("../../../scripts/repairParentNAVs");

const groups = [
  { _id: "root", name: "Root", parentId: null },
  { _id: "leaf-a", name: "Leaf A", parentId: "root" },
  { _id: "leaf-b", name: "Leaf B", parentId: "root" },
];

describe("repairParentNAVs", () => {
  test("replays leaf units exactly and repairs parent units independently", () => {
    const replay = replayIndependentUnits({
      groups,
      groupStatements: [
        {
          _id: "deposit-a-1",
          portfolioGroupId: "leaf-a",
          type: "deposit",
          amount: 10000,
          date: "2026-01-01T09:00:00.000Z",
        },
        {
          _id: "tax-a",
          portfolioGroupId: "leaf-a",
          type: "tax",
          amount: 1000,
          date: "2026-01-02T08:00:00.000Z",
        },
        {
          _id: "deposit-a-2",
          portfolioGroupId: "leaf-a",
          type: "deposit",
          amount: 900,
          date: "2026-01-02T10:00:00.000Z",
        },
        {
          _id: "deposit-b",
          portfolioGroupId: "leaf-b",
          type: "deposit",
          amount: 1000,
          date: "2026-01-02T11:00:00.000Z",
        },
      ],
      ledgerStatements: [
        {
          _id: "dividend-a",
          portfolioGroupId: "leaf-a",
          financialAssetId: "asset-a",
          type: "dividend",
          amount: 100,
          date: "2026-01-02T12:00:00.000Z",
        },
      ],
      financialAssets: [
        {
          _id: "asset-a",
          name: "Asset A",
          portfolioGroupId: "leaf-a",
          assetMetadataId: "metadata-a",
        },
      ],
      priceRows: [],
    });

    const navRows = [
      {
        _id: "a-day-1",
        portfolioGroupId: "leaf-a",
        date: "2026-01-01T11:30:00.000Z",
        nav: 100,
        units: 100,
        value: 10000,
      },
      {
        _id: "b-day-1",
        portfolioGroupId: "leaf-b",
        date: "2026-01-01T11:30:00.000Z",
        nav: 100,
        units: 0,
        value: 0,
      },
      {
        _id: "root-day-1",
        portfolioGroupId: "root",
        date: "2026-01-01T11:30:00.000Z",
        nav: 100,
        units: 100,
        value: 10000,
      },
      {
        _id: "a-day-2",
        portfolioGroupId: "leaf-a",
        date: "2026-01-02T11:30:00.000Z",
        nav: 10000 / 110,
        units: 110,
        value: 10000,
      },
      {
        _id: "b-day-2",
        portfolioGroupId: "leaf-b",
        date: "2026-01-02T11:30:00.000Z",
        nav: 100,
        units: 10,
        value: 1000,
      },
      {
        _id: "root-day-2",
        portfolioGroupId: "root",
        date: "2026-01-02T11:30:00.000Z",
        nav: 11000 / 120,
        units: 120,
        value: 11000,
      },
    ];

    const repairPlan = buildParentRepairs({ navRows, replay });
    const expectedRootUnits = 110 + 1000 / 90;

    expect(replay.eventCount).toBe(5);
    expect(repairPlan.leafUnitMismatches).toEqual([]);
    expect(repairPlan.changedRepairs).toHaveLength(1);
    expect(repairPlan.changedRepairs[0]).toMatchObject({
      navIdString: "root-day-2",
      groupId: "root",
      corrected: {
        value: 11000,
      },
    });
    expect(repairPlan.changedRepairs[0].corrected.units).toBeCloseTo(
      expectedRootUnits,
      10,
    );
    expect(repairPlan.changedRepairs[0].corrected.nav).toBeCloseTo(
      11000 / expectedRootUnits,
      10,
    );
  });

  test("rejects a cycle in the stored hierarchy", () => {
    expect(() =>
      buildHierarchy([
        { _id: "root", parentId: null },
        { _id: "a", parentId: "b" },
        { _id: "b", parentId: "a" },
      ]),
    ).toThrow("Cycle detected");
  });

  test("rejects replay when a pre-flow holding has no close price", () => {
    expect(() =>
      replayIndependentUnits({
        groups: [
          { _id: "root", parentId: null },
          { _id: "leaf", parentId: "root" },
        ],
        groupStatements: [
          {
            _id: "deposit-1",
            portfolioGroupId: "leaf",
            type: "deposit",
            amount: 100,
            date: "2026-01-01T09:00:00.000Z",
          },
          {
            _id: "deposit-2",
            portfolioGroupId: "leaf",
            type: "deposit",
            amount: 100,
            date: "2026-01-02T09:00:00.000Z",
          },
        ],
        ledgerStatements: [
          {
            _id: "buy-1",
            portfolioGroupId: "leaf",
            financialAssetId: "asset",
            type: "buy",
            qty: 1,
            amount: 100,
            date: "2026-01-01T10:00:00.000Z",
          },
        ],
        financialAssets: [
          {
            _id: "asset",
            name: "Missing Price Asset",
            portfolioGroupId: "leaf",
            assetMetadataId: "metadata",
          },
        ],
        priceRows: [],
      }),
    ).toThrow("Missing close price");
  });
});
