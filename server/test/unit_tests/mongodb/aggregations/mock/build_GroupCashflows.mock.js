// test/unit_tests/cashflows/mock/build_GroupCashflows.mock.js

const mongoose = require("mongoose");

const mockIds = {
  userId: new mongoose.Types.ObjectId().toString(),
  groupId1: new mongoose.Types.ObjectId().toString(),
  groupId2: new mongoose.Types.ObjectId().toString(),
  groupId3: new mongoose.Types.ObjectId().toString(),
};

const mockSession = {
  id: "mock-session-id",
};

const mockAggregatedCashflows = [
  {
    date: new Date("2024-01-01T00:00:00.000Z"),
    amount: -10000,
  },
  {
    date: new Date("2024-01-02T00:00:00.000Z"),
    amount: 5000,
  },
  {
    date: new Date("2024-01-03T00:00:00.000Z"),
    amount: -2000,
  },
];

const emptyAggregatedCashflows = [];

const createMockAggregateQuery = (result = []) => {
  const query = {
    session: jest.fn().mockReturnThis(),

    // Allows: const result = await query;
    then: jest.fn((resolve, reject) => {
      return Promise.resolve(result).then(resolve, reject);
    }),
  };

  return query;
};

const buildExpectedPipeline = ({ userId, groupIds }) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const groupObjectIds = groupIds.map((id) => {
    return new mongoose.Types.ObjectId(id);
  });

  return [
    {
      $match: {
        userId: userObjectId,
        portfolioGroupId: {
          $in: groupObjectIds,
        },
        type: {
          $ne: "tax",
        },
      },
    },
    {
      $project: {
        date: {
          $dateTrunc: {
            date: "$date",
            unit: "day",
            timezone: "UTC",
          },
        },

        amount: {
          $cond: [
            {
              $eq: ["$type", "deposit"],
            },
            {
              $multiply: ["$amount", -1],
            },
            "$amount",
          ],
        },
      },
    },
    {
      $group: {
        _id: "$date",
        amount: {
          $sum: "$amount",
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: {
          $toDate: "$_id",
        },
        amount: 1,
      },
    },
    {
      $sort: {
        date: 1,
      },
    },
  ];
};

module.exports = {
  mockIds,
  mockSession,
  mockAggregatedCashflows,
  emptyAggregatedCashflows,
  createMockAggregateQuery,
  buildExpectedPipeline,
};