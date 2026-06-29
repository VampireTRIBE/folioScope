// test/unit_tests/dateUtils/normalizeDates.test.js

// Change this path according to your actual file location
const {
  normalizeToCurrentFinancialYear,
  normalizeToISTMidnight,
  normalizeToISTEndOfDay,
  normalizeToIST5PM,
  normalizeToIST330PM,
} = require("../../../../utils/transformData/normalizeDates");

const { normalizeDatesMockData } = require("./mock/normalizeDates.mock");

const expectDateIso = (receivedDate, expectedIso) => {
  expect(receivedDate).toBeInstanceOf(Date);
  expect(receivedDate.toISOString()).toBe(expectedIso);
};

const expectInvalidDate = (receivedDate) => {
  expect(receivedDate).toBeInstanceOf(Date);
  expect(Number.isNaN(receivedDate.getTime())).toBe(true);
};

describe("normalizeDates", () => {
  // ======================================================
  // normalizeToCurrentFinancialYear
  // ======================================================

  describe("normalizeToCurrentFinancialYear", () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    test.each(normalizeDatesMockData.financialYearCases)(
      "$name",
      ({ systemDate, expected }) => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(systemDate));

        const result = normalizeToCurrentFinancialYear();

        expectDateIso(result, expected);
      },
    );
  });

  // ======================================================
  // normalizeToISTMidnight
  // ======================================================

  describe("normalizeToISTMidnight", () => {
    test.each(normalizeDatesMockData.istMidnightCases)(
      "$name",
      ({ input, expected }) => {
        const result = normalizeToISTMidnight(input);

        expectDateIso(result, expected);
      },
    );

    test("accepts Date object input", () => {
      const input = new Date("2024-06-29T11:30:00.000Z");

      const result = normalizeToISTMidnight(input);

      expectDateIso(result, "2024-06-28T18:30:00.000Z");
    });

    test("returns Invalid Date for invalid string input", () => {
      const result = normalizeToISTMidnight("invalid-date");

      expectInvalidDate(result);
    });
  });

  // ======================================================
  // normalizeToISTEndOfDay
  // ======================================================

  describe("normalizeToISTEndOfDay", () => {
    test.each(normalizeDatesMockData.istEndOfDayCases)(
      "$name",
      ({ input, expected }) => {
        const result = normalizeToISTEndOfDay(input);

        expectDateIso(result, expected);
      },
    );

    test("accepts Date object input", () => {
      const input = new Date("2024-06-29T11:30:00.000Z");

      const result = normalizeToISTEndOfDay(input);

      expectDateIso(result, "2024-06-29T18:29:59.999Z");
    });

    test("returns Invalid Date for invalid string input", () => {
      const result = normalizeToISTEndOfDay("invalid-date");

      expectInvalidDate(result);
    });
  });

  // ======================================================
  // normalizeToIST5PM
  // ======================================================

  describe("normalizeToIST5PM", () => {
    test.each(normalizeDatesMockData.ist5PMCases)(
      "$name",
      ({ input, expected }) => {
        const result = normalizeToIST5PM(input);

        expectDateIso(result, expected);
      },
    );

    test("accepts Date object input", () => {
      const input = new Date("2024-06-29T00:00:00.000Z");

      const result = normalizeToIST5PM(input);

      expectDateIso(result, "2024-06-29T11:30:00.000Z");
    });

    test("returns Invalid Date for invalid string input", () => {
      const result = normalizeToIST5PM("invalid-date");

      expectInvalidDate(result);
    });
  });

  // ======================================================
  // normalizeToIST330PM
  // ======================================================

  describe("normalizeToIST330PM", () => {
    test.each(normalizeDatesMockData.ist330PMCases)(
      "$name",
      ({ input, expected }) => {
        const result = normalizeToIST330PM(input);

        expectDateIso(result, expected);
      },
    );

    test("accepts Date object input", () => {
      const input = new Date("2024-06-29T00:00:00.000Z");

      const result = normalizeToIST330PM(input);

      expectDateIso(result, "2024-06-29T10:00:00.000Z");
    });

    test("returns Invalid Date for invalid string input", () => {
      const result = normalizeToIST330PM("invalid-date");

      expectInvalidDate(result);
    });
  });
});
