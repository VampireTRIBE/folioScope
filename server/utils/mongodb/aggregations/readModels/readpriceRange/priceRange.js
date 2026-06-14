const mongoose = require("mongoose");
const {
  get_SingleAssetMetaDataName,
} = require("../../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");
const customError = require("../../../../shared/error/customError");

module.exports.read_PriceRange1D = async (securityId) => {
  try {
    const PRICE_MODEL = mongoose.model("AssetPriceHistory");
    if (!securityId) {
      throw new customErrortomError("Security Id Required", 400);
    }

    const securityDetail = get_SingleAssetMetaDataName(securityId);
    if (!securityDetail) {
      throw new customError("Security overview is Not Available", 404);
    }

    const { _id } = securityDetail;
    const prices = await PRICE_MODEL.find({ assetId: _id })
      .sort({ date: -1 })
      .limit(2)
      .select("date close")
      .lean();

    if (prices.length <= 1) {
      return {
        currentPrice: (prices[0]?.close).toFixed(2) ?? 0.0,
        todayChange: 0.0,
      };
    }

    const todayChange = Number(
      ((prices[0]?.close - prices[1]?.close) / prices[1].close) * 100,
    );

    return {
      currentPrice: (prices[0]?.close).toFixed(2) ?? 0.0,
      todayChange: todayChange ? todayChange.toFixed(2) : 0.0,
    };
  } catch (error) {
    throw error instanceof customError
      ? error
      : new customError(error.message || "Database Error", 503);
  }
};

module.exports.read_PriceRange = async (securityId, startDate = null) => {
  try {
    const PRICE_MODEL = mongoose.model("AssetPriceHistory");

    if (!securityId) {
      throw new customError("Security Id Required", 400);
    }

    const securityDetail = get_SingleAssetMetaDataName(securityId);

    if (!securityDetail) {
      throw new customError("Data Not Available", 404);
    }

    const { _id } = securityDetail;

    const query = {
      assetId: _id,
    };

    if (startDate) {
      query.date = {
        $gte: startDate,
      };
    }

    const prices = await PRICE_MODEL.find(query)
      .sort({ date: 1 })
      .select("date close")
      .lean();

    if (prices.length === 0) {
      return {
        high: 0.0,
        low: 0.0,
        periodReturn: 0.0,
        series: [],
      };
    }

    let high = -Infinity;
    let low = Infinity;

    const series = prices.map(({ date, close }) => {
      if (high < close) high = close;
      if (low > close) low = close;
      return {
        time: date.toISOString().split("T")[0],
        value: Number(close),
      };
    });

    if (series.length <= 1) {
      return {
        series,
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        periodReturn: 0.0,
      };
    }

    const first = series[0].value;
    const last = series[series.length - 1].value;
    const periodReturn = Number((((last - first) / first) * 100).toFixed(2));

    return {
      series,
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      periodReturn,
    };
  } catch (error) {
    throw error instanceof customError
      ? error
      : new customError(error.message || "Database Error", 503);
  }
};

module.exports.read_GroupPriceRange1D = async (groupid, userId) => {
  try {
    const GROUP_NAV_MODEL = mongoose.model("navPerformence");
    if (!groupid || !userId) {
      throw new customError("Group or User Id Required", 400);
    }

    const prices = await GROUP_NAV_MODEL.find({
      portfolioGroupId: groupid,
      userId,
    })
      .sort({ date: -1 })
      .limit(2)
      .select("date nav")
      .lean();

    if (prices.length <= 1) {
      return {
        currentPrice: (prices[0]?.nav).toFixed(2) ?? 0.0,
        todayChange: 0.0,
      };
    }

    const todayChange = Number(
      ((prices[0]?.nav - prices[1]?.nav) / prices[1].nav) * 100,
    );

    return {
      currentPrice: (prices[0]?.nav).toFixed(2) ?? 0.0,
      todayChange: todayChange ? todayChange.toFixed(2) : 0.0,
    };
  } catch (error) {
    throw error instanceof customError
      ? error
      : new customError(error.message || "Database Error", 503);
  }
};

module.exports.read_GroupPriceRange = async (
  groupid,
  userId,
  startDate = null,
) => {
  try {
    const GROUP_NAV_MODEL = mongoose.model("navPerformence");

    if (!groupid || !userId) {
      throw new customError("Missing Payload", 400);
    }

    const query = {
      userId,
      portfolioGroupId: groupid,
    };

    if (startDate) {
      query.date = {
        $gte: startDate,
      };
    }

    const prices = await GROUP_NAV_MODEL.find(query)
      .sort({ date: 1 })
      .select("date nav")
      .lean();

    if (prices.length === 0) {
      return {
        high: 0.0,
        low: 0.0,
        periodReturn: 0.0,
        series: [],
      };
    }

    let high = -Infinity;
    let low = Infinity;

    const series = prices.map(({ date, nav }) => {
      if (high < nav) high = nav;
      if (low > nav) low = nav;
      return {
        time: date.toISOString().split("T")[0],
        value: Number(nav),
      };
    });

    if (series.length <= 1) {
      return {
        series,
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        periodReturn: 0.0,
      };
    }

    const first = series[0].value;
    const last = series[series.length - 1].value;
    const periodReturn = Number((((last - first) / first) * 100).toFixed(2));

    return {
      series,
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      periodReturn,
    };
  } catch (error) {
    throw error instanceof customError
      ? error
      : new customError(error.message || "Database Error", 503);
  }
};
