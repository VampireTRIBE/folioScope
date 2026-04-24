module.exports.drawdownFuntion = (
  currentDate = null,
  startDate = null,
  normalizeNavsSeries,
) => {
  if (!currentDate || !startDate) return;
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  currentDate = new Date(currentDate);
  startDate = new Date(startDate);

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
      current: null,
      max: null,
      peakDate: null,
      troughDate: null,
      recoveryDate: null,
      recoveryDays: null,
    },
    group: {
      current: null,
      max: null,
      peakDate: null,
      troughDate: null,
      recoveryDate: null,
      recoveryDays: null,
    },
  };

  for (const [key, value] of Object.entries(normalizeNavsSeries)) {
    const dateKey = new Date(key);
    if (dateKey < startDate || dateKey > currentDate) continue;

    // ================= INDEX =================
    if (value.index > resultOBJ.index.peak) {
      // finalize previous drawdown
      if (resultOBJ.index.peak !== -Infinity) {
        const dd =
          ((resultOBJ.index.trough - resultOBJ.index.peak) /
            resultOBJ.index.peak) *
          100;

        if (drawdownOBJ.index.max === null || dd < drawdownOBJ.index.max) {
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
      if (resultOBJ.group.peak !== -Infinity) {
        const dd =
          ((resultOBJ.group.trough - resultOBJ.group.peak) /
            resultOBJ.group.peak) *
          100;

        if (drawdownOBJ.group.max === null || dd < drawdownOBJ.group.max) {
          drawdownOBJ.group.max = dd;
          drawdownOBJ.group.peakDate = resultOBJ.group.peakDate;
          drawdownOBJ.group.troughDate = resultOBJ.group.troughDate;
          drawdownOBJ.group.recoveryDate = key;
          drawdownOBJ.group.recoveryDays =
            (dateKey - new Date(resultOBJ.group.peakDate)) / MS_PER_DAY;
        }
      }

      resultOBJ.group.peak = value.group;
      resultOBJ.group.trough = value.group;
      resultOBJ.group.peakDate = key;
      resultOBJ.group.troughDate = key;
    } else if (value.group < resultOBJ.group.trough) {
      resultOBJ.group.trough = value.group;
      resultOBJ.group.troughDate = key;
    }
  }

  // INDEX
  if (resultOBJ.index.peak !== -Infinity) {
    const dd =
      ((resultOBJ.index.trough - resultOBJ.index.peak) / resultOBJ.index.peak) *
      100;
    const currentddindex =
      ((normalizeNavsSeries[currentDate.toISOString()].index -
        resultOBJ.index.peak) /
        resultOBJ.index.peak) *
      100;
    if (drawdownOBJ.index.max === null || dd < drawdownOBJ.index.max) {
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
      ((normalizeNavsSeries[currentDate.toISOString()].group -
        resultOBJ.group.peak) /
        resultOBJ.group.peak) *
      100;

    if (drawdownOBJ.group.max === null || dd < drawdownOBJ.group.max) {
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
