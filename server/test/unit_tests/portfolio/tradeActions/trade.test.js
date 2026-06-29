// test/unit_tests/portfolio/tradeActions/trade.test.js

jest.mock("mongoose", () => ({
  startSession: jest.fn(),
}));

jest.mock(
  "../../../../models/Portfolio_Models/PortfolioGroup_Models/portfolioGroup",
  () => ({
    updateMany: jest.fn(),
  }),
);

jest.mock(
  "../../../../models/Portfolio_Models/ledger_Models/groupStatement",
  () => ({
    findOne: jest.fn(),
  }),
);

jest.mock(
  "../../../../models/Portfolio_Models/PortfolioMetrics_Models/financialAsset",
  () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateOne: jest.fn(),
  }),
);

jest.mock(
  "../../../../models/Portfolio_Models/ledger_Models/ledgerStatement",
  () => ({
    findOne: jest.fn(),
    create: jest.fn(),
  }),
);

jest.mock(
  "../../../../models/Portfolio_Models/ledger_Models/fifoLedgerStatement",
  () => ({
    create: jest.fn(),
    find: jest.fn(),
  }),
);

jest.mock("../../../../utils/mongodb/aggregations/check_Leaf", () => ({
  is_Leaf: jest.fn(),
}));

jest.mock(
  "../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache",
  () => ({
    get_SingleAssetMetaDataID: jest.fn(),
  }),
);

jest.mock(
  "../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetClassificationCache",
  () => ({
    get_NAMEIDMAP: jest.fn(),
  }),
);

jest.mock("../../../../sync_Scripts/sync_Portfolio/fill_MissingNavs", () => ({
  fill_MissingNAVs: jest.fn(),
}));

const mongoose = require("mongoose");

const PortfolioGroupModel = require("../../../../models/Portfolio_Models/PortfolioGroup_Models/portfolioGroup");
const PortfolioGroupStatementModel = require("../../../../models/Portfolio_Models/ledger_Models/groupStatement");
const FinancialAssetModel = require("../../../../models/Portfolio_Models/PortfolioMetrics_Models/financialAsset");
const LedgerStatementModel = require("../../../../models/Portfolio_Models/ledger_Models/ledgerStatement");
const FifoLotModel = require("../../../../models/Portfolio_Models/ledger_Models/fifoLedgerStatement");
const { is_Leaf } = require("../../../../utils/mongodb/aggregations/check_Leaf");
const {
  get_SingleAssetMetaDataID,
} = require("../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");
const {
  get_NAMEIDMAP,
} = require("../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetClassificationCache");
const {
  fill_MissingNAVs,
} = require("../../../../sync_Scripts/sync_Portfolio/fill_MissingNavs");

const { tradeTransaction } = require("../../../../controllers/portfolio/tradeActions/trade");

const createSession = () => ({
  startTransaction: jest.fn(),
  commitTransaction: jest.fn().mockResolvedValue(undefined),
  abortTransaction: jest.fn().mockResolvedValue(undefined),
  endSession: jest.fn(),
});

const createSortChain = (result) => ({
  sort: jest.fn(() => Promise.resolve(result)),
});

const createRequest = (bodyOverrides = {}) => ({
  userId: "user-id",
  sessionDocId: "session-doc-id",
  sessionDoc: { _id: "session-doc-id" },
  params: {
    pg_id: "group-id",
    a_id: "asset-meta-id",
  },
  body: {
    type: "buy",
    date: "2026-06-29T10:00:00.000Z",
    qty: 10,
    price: 100,
    ...bodyOverrides,
  },
});

describe("tradeTransaction", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const session = createSession();
    mongoose.startSession.mockResolvedValue(session);

    is_Leaf.mockResolvedValue({
      userId: "user-id",
      isLeaf: true,
      path: ["parent-id"],
      consolidatedCash: 5000,
    });

    get_SingleAssetMetaDataID.mockReturnValue({
      name: "NIFTYBEES",
    });

    get_NAMEIDMAP.mockReturnValue({
      INDEX: "index-class-id",
    });

    FinancialAssetModel.findOne.mockResolvedValue(null);
    FinancialAssetModel.create.mockResolvedValue([
      {
        _id: "financial-asset-id",
      },
    ]);
    FinancialAssetModel.findOneAndUpdate.mockResolvedValue({
      _id: "financial-asset-id",
    });
    FinancialAssetModel.updateOne.mockResolvedValue({});
    LedgerStatementModel.findOne.mockReturnValue(createSortChain(null));
    LedgerStatementModel.create.mockResolvedValue({});
    PortfolioGroupStatementModel.findOne.mockReturnValue(createSortChain(null));
    PortfolioGroupModel.updateMany.mockResolvedValue({});
    FifoLotModel.create.mockResolvedValue({});
    fill_MissingNAVs.mockResolvedValue(undefined);
  });

  test("rejects invalid transaction type and rolls back session", async () => {
    const result = await tradeTransaction(
      createRequest({
        type: "bonus",
      }),
    );

    const session = await mongoose.startSession.mock.results[0].value;

    expect(result).toEqual({
      success: false,
      message: "Invalid transaction type",
    });
    expect(session.abortTransaction).toHaveBeenCalledTimes(1);
    expect(session.endSession).toHaveBeenCalledTimes(1);
  });

  test("executes first buy by creating asset, fifo lot, ledger, and cash update", async () => {
    const result = await tradeTransaction(createRequest());

    const session = await mongoose.startSession.mock.results[0].value;

    expect(result).toMatchObject({
      success: true,
      message: "Transaction Completed",
      txDate: new Date("2026-06-29T10:00:00.000Z"),
    });

    expect(FinancialAssetModel.create).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          name: "NIFTYBEES",
          assetMetadataId: "asset-meta-id",
          portfolioGroupId: "group-id",
          userId: "user-id",
          lock: {
            isLocked: true,
            lockedAt: expect.any(Date),
          },
        }),
      ],
      { session },
    );

    expect(fill_MissingNAVs).toHaveBeenCalledWith(
      "user-id",
      session,
      new Date("2026-06-29T10:00:00.000Z"),
      new Date("2026-06-29T10:00:00.000Z"),
    );

    expect(FifoLotModel.create).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          financialAssetId: "financial-asset-id",
          userId: "user-id",
          buyQty: 10,
          remainingQty: 10,
          buyPrice: 100,
          buyDate: new Date("2026-06-29T10:00:00.000Z"),
        }),
      ],
      { session },
    );

    expect(LedgerStatementModel.create).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          type: "buy",
          amount: 1000,
          qty: 10,
          price: 100,
        }),
      ],
      { session },
    );

    expect(PortfolioGroupModel.updateMany).toHaveBeenCalledWith(
      { _id: { $in: ["parent-id", "group-id"] } },
      { $inc: { consolidatedCash: -1000 } },
      { session },
    );

    expect(FinancialAssetModel.findOneAndUpdate).toHaveBeenCalledWith(
      {
        assetMetadataId: "asset-meta-id",
        portfolioGroupId: "group-id",
        userId: "user-id",
      },
      {
        $inc: { "snapshot.totalQty": 10 },
      },
      { session },
    );

    expect(session.commitTransaction).toHaveBeenCalledTimes(1);
    expect(FinancialAssetModel.updateOne).toHaveBeenCalledWith(
      { _id: "financial-asset-id" },
      { $set: { "lock.isLocked": false } },
    );
  });

  test("rejects buy when group does not have enough cash", async () => {
    is_Leaf.mockResolvedValue({
      userId: "user-id",
      isLeaf: true,
      path: ["parent-id"],
      consolidatedCash: 100,
    });

    const result = await tradeTransaction(createRequest());

    const session = await mongoose.startSession.mock.results[0].value;

    expect(result).toEqual({
      success: false,
      message: "Insufficient funds",
    });
    expect(session.abortTransaction).toHaveBeenCalledTimes(1);
    expect(FinancialAssetModel.updateOne).toHaveBeenCalledWith(
      { _id: "financial-asset-id" },
      { $set: { "lock.isLocked": false } },
    );
  });

  test("rejects non-buy when asset does not exist", async () => {
    const result = await tradeTransaction(
      createRequest({
        type: "sell",
      }),
    );

    expect(result).toEqual({
      success: false,
      message: "Asset does not exist",
    });
    expect(FinancialAssetModel.create).not.toHaveBeenCalled();
  });
});
