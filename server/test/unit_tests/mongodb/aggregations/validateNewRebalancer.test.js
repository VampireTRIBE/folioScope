// test/unit_tests/mongodb/aggregations/validateNewRebalancer.test.js

jest.mock(
  "../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetClassificationCache",
  () => ({
    get_NAMEIDMAP: jest.fn(),
  }),
);

jest.mock(
  "../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache",
  () => ({
    get_AssetMetaDataName: jest.fn(),
  }),
);

jest.mock("../../../../utils/mongodb/aggregations/get_leafGroupIDsByGroup", () => ({
  get_leafGroupID_NameByGroup: jest.fn(),
}));

jest.mock("../../../../utils/mongodb/aggregations/get_RebalancerListByuserId", () => ({
  get_RebalancerListByUserId: jest.fn(),
}));

const {
  get_NAMEIDMAP,
} = require("../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetClassificationCache");
const {
  get_AssetMetaDataName,
} = require("../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");
const {
  get_leafGroupID_NameByGroup,
} = require("../../../../utils/mongodb/aggregations/get_leafGroupIDsByGroup");
const {
  get_RebalancerListByUserId,
} = require("../../../../utils/mongodb/aggregations/get_RebalancerListByuserId");
const {
  validate_NewRebalancer_ReqData,
} = require("../../../../utils/mongodb/aggregations/writeModels/write_Rebalancer_Model/validate_NewRebalancer");

const userId = "66f000000000000000000001";
const portfolioGroupId = "66f000000000000000000099";
const equityGroupId = "65f000000000000000000001";
const cashGroupId = "65f000000000000000000002";
const equityAssetId = "64f000000000000000000001";
const cashAssetId = "64f000000000000000000002";
const indexAssetId = "64f000000000000000000099";

const createPayload = (overrides = {}) => ({
  userId,
  portfolioGroupId,
  sipAmount: "5000",
  rebalancerName: "Core SIP",
  rebalancerDescription: "Long term allocation",
  assets: [
    {
      assetId: equityAssetId,
      groupId: equityGroupId,
      targetWeight: "80",
      band: "5",
      multiplier: "1.5",
    },
    {
      assetId: cashAssetId,
      groupId: cashGroupId,
      targetWeight: "20",
      band: "2",
      isCashReserve: true,
    },
  ],
  marketFallRules: [
    {
      fallPercentage: "10",
      deployPercentage: "25",
      assets: [{ assetId: equityAssetId, multiplier: "2", min: "0.2" }],
    },
  ],
  ...overrides,
});

describe("validate_NewRebalancer_ReqData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    get_NAMEIDMAP.mockReturnValue({ INDEX: "asset-class-index" });
    get_AssetMetaDataName.mockReturnValue({
      NIFTYBEES: {
        _id: equityAssetId,
        assetClass: "asset-class-etf",
      },
      LIQUIDCASH: {
        _id: cashAssetId,
        assetClass: "asset-class-liquid",
      },
      "NIFTY 50": {
        _id: indexAssetId,
        assetClass: "asset-class-index",
      },
    });
    get_leafGroupID_NameByGroup.mockResolvedValue({
      [equityGroupId]: "Equity",
      [cashGroupId]: "Cash Reserve",
    });
    get_RebalancerListByUserId.mockResolvedValue({});
  });

  test("cleans valid request data and excludes index securities from tradable assets", async () => {
    const result = await validate_NewRebalancer_ReqData(createPayload());

    expect(get_leafGroupID_NameByGroup).toHaveBeenCalledWith(
      portfolioGroupId,
      userId,
    );
    expect(get_RebalancerListByUserId).toHaveBeenCalledWith(userId);
    expect(result).toEqual({
      userId,
      portfolioGroupId,
      sipAmount: 5000,
      rebalancerName: "Core SIP",
      rebalancerDescription: "Long term allocation",
      assets: [
        {
          assetId: equityAssetId,
          assetName: "NIFTYBEES",
          groupId: equityGroupId,
          groupName: "Equity",
          targetWeight: 80,
          band: 5,
          multiplier: 1.5,
          isCashReserve: false,
        },
        {
          assetId: cashAssetId,
          assetName: "LIQUIDCASH",
          groupId: cashGroupId,
          groupName: "Cash Reserve",
          targetWeight: 20,
          band: 2,
          multiplier: 1,
          isCashReserve: true,
        },
      ],
      marketFallRules: [
        {
          fallPercentage: 10,
          deployPercentage: 25,
          assets: [
            {
              assetId: equityAssetId,
              assetName: "NIFTYBEES",
              multiplier: 2,
              min: 0.2,
            },
          ],
        },
      ],
    });

    await expect(
      validate_NewRebalancer_ReqData(
        createPayload({
          assets: [
            {
              assetId: indexAssetId,
              groupId: equityGroupId,
              targetWeight: 100,
              band: 5,
              isCashReserve: true,
            },
          ],
          marketFallRules: [],
        }),
      ),
    ).rejects.toMatchObject({
      message: "Invalid Asset",
      statusCode: 400,
    });
  });

  test("blocks a group that already belongs to an active rebalancer", async () => {
    get_RebalancerListByUserId.mockResolvedValue({
      [equityGroupId]: "Existing Equity",
    });

    await expect(
      validate_NewRebalancer_ReqData(createPayload()),
    ).rejects.toMatchObject({
      message: "This group is part of another Rebalancer",
      statusCode: 400,
    });
  });

  test("allows a group when inactive rebalancers are absent from the active group map", async () => {
    get_RebalancerListByUserId.mockResolvedValue({});

    await expect(
      validate_NewRebalancer_ReqData(createPayload()),
    ).resolves.toMatchObject({
      portfolioGroupId,
      assets: expect.arrayContaining([
        expect.objectContaining({ groupId: equityGroupId }),
      ]),
    });
  });

  test("rejects cash reserve assets inside market fall rules", async () => {
    await expect(
      validate_NewRebalancer_ReqData(
        createPayload({
          marketFallRules: [
            {
              fallPercentage: 10,
              deployPercentage: 25,
              assets: [{ assetId: cashAssetId }],
            },
          ],
        }),
      ),
    ).rejects.toMatchObject({
      message: "Cash reserve assets cannot be selected in market fall rules",
      statusCode: 400,
    });
  });

  test("rejects market fall assets that are not in main assets", async () => {
    await expect(
      validate_NewRebalancer_ReqData(
        createPayload({
          marketFallRules: [
            {
              fallPercentage: 10,
              deployPercentage: 25,
              assets: [{ assetId: "64f000000000000000000003" }],
            },
          ],
        }),
      ),
    ).rejects.toMatchObject({
      message: "Invalid Market Fall Asset",
      statusCode: 400,
    });
  });
});
