module.exports.comparisonDrawdownFunction = (
  currentDate = null,
  startDate = null,
  normalizeNavsSeries,
) => {
  if (!currentDate || !startDate || !normalizeNavsSeries) return;

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const endTarget = new Date(currentDate);
  const startTarget = new Date(startDate);

  const resultOBJ = {
    index: {
      peak: -Infinity,
      trough: Infinity,
      peakDate: null,
      troughDate: null,
    },
    group: {
      peak: -Infinity,
      trough: Infinity,
      peakDate: null,
      troughDate: null,
    },
  };

  const drawdownOBJ = {
    index: {
      current: 0,
      max: 0,
      peakDate: null,
      troughDate: null,
      recoveryDate: null,
      recoveryDays: null,
    },
    group: {
      current: 0,
      max: 0,
      peakDate: null,
      troughDate: null,
      recoveryDate: null,
      recoveryDays: null,
    },
  };

  // Guarantee Chronological Order while preserving original string keys
  const sortedKeys = Object.keys(normalizeNavsSeries)
    .filter((key) => {
      const d = new Date(key);
      return d >= startTarget && d <= endTarget;
    })
    .sort((a, b) => new Date(a) - new Date(b));

  if (sortedKeys.length === 0) return drawdownOBJ;

  // Safely track the last valid prices to prevent Weekend 'NaN' bugs
  let lastSeenIndexPrice = null;
  let lastSeenGroupPrice = null;

  for (const key of sortedKeys) {
    const dateKey = new Date(key);
    const value = normalizeNavsSeries[key];

    lastSeenIndexPrice = value.index;
    lastSeenGroupPrice = value.group;

    // ================= INDEX =================
    if (value.index > resultOBJ.index.peak) {
      // finalize previous drawdown
      if (resultOBJ.index.peak !== -Infinity) {
        const dd =
          ((resultOBJ.index.trough - resultOBJ.index.peak) /
            resultOBJ.index.peak) *
          100;

        if (drawdownOBJ.index.max === 0 || dd < drawdownOBJ.index.max) {
          drawdownOBJ.index.max = dd;
          drawdownOBJ.index.peakDate = resultOBJ.index.peakDate;
          drawdownOBJ.index.troughDate = resultOBJ.index.troughDate;
          drawdownOBJ.index.recoveryDate = key;
          drawdownOBJ.index.recoveryDays =
            (dateKey - new Date(resultOBJ.index.peakDate)) / MS_PER_DAY;
        }
      }

      // reset for new peak
      resultOBJ.index.peak = value.index;
      resultOBJ.index.trough = value.index;
      resultOBJ.index.peakDate = key;
      resultOBJ.index.troughDate = key;
    } else if (value.index < resultOBJ.index.trough) {
      resultOBJ.index.trough = value.index;
      resultOBJ.index.troughDate = key;
    }

    // ================= GROUP =================
    if (value.group > resultOBJ.group.peak) {
      // finalize previous drawdown
      if (resultOBJ.group.peak !== -Infinity) {
        const dd =
          ((resultOBJ.group.trough - resultOBJ.group.peak) /
            resultOBJ.group.peak) *
          100;

        if (drawdownOBJ.group.max === 0 || dd < drawdownOBJ.group.max) {
          drawdownOBJ.group.max = dd;
          drawdownOBJ.group.peakDate = resultOBJ.group.peakDate;
          drawdownOBJ.group.troughDate = resultOBJ.group.troughDate;
          drawdownOBJ.group.recoveryDate = key;
          drawdownOBJ.group.recoveryDays =
            (dateKey - new Date(resultOBJ.group.peakDate)) / MS_PER_DAY;
        }
      }

      // reset for new peak
      resultOBJ.group.peak = value.group;
      resultOBJ.group.trough = value.group;
      resultOBJ.group.peakDate = key;
      resultOBJ.group.troughDate = key;
    } else if (value.group < resultOBJ.group.trough) {
      resultOBJ.group.trough = value.group;
      resultOBJ.group.troughDate = key;
    }
  }

  // ================= FINALIZATION =================

  // INDEX
  if (resultOBJ.index.peak !== -Infinity) {
    const dd =
      ((resultOBJ.index.trough - resultOBJ.index.peak) / resultOBJ.index.peak) *
      100;
    const currentddindex =
      ((lastSeenIndexPrice - resultOBJ.index.peak) / resultOBJ.index.peak) *
      100;

    if (drawdownOBJ.index.max === 0 || dd < drawdownOBJ.index.max) {
      drawdownOBJ.index.max = dd;
      drawdownOBJ.index.peakDate = resultOBJ.index.peakDate;
      drawdownOBJ.index.troughDate = resultOBJ.index.troughDate;
      drawdownOBJ.index.recoveryDate = null;
      drawdownOBJ.index.recoveryDays = null;
    }
    drawdownOBJ.index.current = currentddindex;
  }

  // GROUP
  if (resultOBJ.group.peak !== -Infinity) {
    const dd =
      ((resultOBJ.group.trough - resultOBJ.group.peak) / resultOBJ.group.peak) *
      100;
    const currentddgroup =
      ((lastSeenGroupPrice - resultOBJ.group.peak) / resultOBJ.group.peak) *
      100;

    if (drawdownOBJ.group.max === 0 || dd < drawdownOBJ.group.max) {
      drawdownOBJ.group.max = dd;
      drawdownOBJ.group.peakDate = resultOBJ.group.peakDate;
      drawdownOBJ.group.troughDate = resultOBJ.group.troughDate;
      drawdownOBJ.group.recoveryDate = null;
      drawdownOBJ.group.recoveryDays = null;
    }
    drawdownOBJ.group.current = currentddgroup;
  }

  return drawdownOBJ;
};

module.exports.singleDrawdownFunction = (
  currentDate = null,
  startDate = null,
  normalizeNavsSeries,
) => {
  if (!currentDate || !startDate || !normalizeNavsSeries) return;

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const endTarget = new Date(currentDate);
  const startTarget = new Date(startDate);

  const resultOBJ = {
    peak: -Infinity,
    trough: Infinity,
    peakDate: null,
    troughDate: null,
  };

  const drawdownOBJ = {
    current: 0,
    max: 0,
    peakDate: null,
    troughDate: null,
    recoveryDate: null,
    recoveryDays: null,
  };

  // Guarantee Chronological Order
  const sortedDateKeys = Object.keys(normalizeNavsSeries)
    .map((dateStr) => new Date(dateStr))
    .filter((date) => date >= startTarget && date <= endTarget)
    .sort((a, b) => a - b);

  if (sortedDateKeys.length === 0) return drawdownOBJ;

  let lastSeenPrice = null;

  for (const dateKey of sortedDateKeys) {
    const key = dateKey.toISOString();
    const value = normalizeNavsSeries[key];

    lastSeenPrice = value;

    if (value > resultOBJ.peak) {
      // We hit a NEW running peak. The previous drawdown is now fully "Recovered".
      if (resultOBJ.peak !== -Infinity) {
        const dd = ((resultOBJ.trough - resultOBJ.peak) / resultOBJ.peak) * 100;

        // If this recovered drawdown is the worst we've seen, save it
        if (drawdownOBJ.max === 0 || dd < drawdownOBJ.max) {
          drawdownOBJ.max = dd;
          drawdownOBJ.peakDate = resultOBJ.peakDate;
          drawdownOBJ.troughDate = resultOBJ.troughDate;
          drawdownOBJ.recoveryDate = key;
          drawdownOBJ.recoveryDays =
            (dateKey - new Date(resultOBJ.peakDate)) / MS_PER_DAY;
        }
      }

      // Reset the watermark for the next potential drop
      resultOBJ.peak = value;
      resultOBJ.trough = value;
      resultOBJ.peakDate = key;
      resultOBJ.troughDate = key;
    } else if (value < resultOBJ.trough) {
      // We are actively dropping. Track the new lowest point.
      resultOBJ.trough = value;
      resultOBJ.troughDate = key;
    }
  }

  // Handle the final "Open" (Unrecovered) Drawdown
  if (resultOBJ.peak !== -Infinity) {
    const dd = ((resultOBJ.trough - resultOBJ.peak) / resultOBJ.peak) * 100;

    // Calculate the open drawdown based on the last actual trading day
    const currentdd = ((lastSeenPrice - resultOBJ.peak) / resultOBJ.peak) * 100;

    // If the unrecovered drop is worse than any historical recovered drop, it becomes our Max
    if (drawdownOBJ.max === 0 || dd < drawdownOBJ.max) {
      drawdownOBJ.max = dd;
      drawdownOBJ.peakDate = resultOBJ.peakDate;
      drawdownOBJ.troughDate = resultOBJ.troughDate;
      drawdownOBJ.recoveryDate = null;
      drawdownOBJ.recoveryDays = null;
    }

    drawdownOBJ.current = currentdd;
  }

  return drawdownOBJ;
};
