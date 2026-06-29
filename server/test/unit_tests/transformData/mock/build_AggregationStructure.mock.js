const assetClassRows = [
  {
    _id: "asset-class-equity-id",
    name: "Equity",
    requiredFields: ["assetSector"],
    forbiddenFields: ["assetAMC"],
    category: [
      {
        _id: "category-listed-id",
        name: "Listed",
        subcategory: [
          {
            _id: "subcategory-largecap-id",
            name: "Large Cap",
            indexName: [
              {
                _id: "index-nifty50-id",
                name: "NIFTY 50",
              },
            ],
          },
        ],
      },
    ],
  },
];

const sectorRows = [
  {
    _id: "sector-financials-id",
    name: "Financials",
    industry: [
      {
        _id: "industry-bank-id",
        name: "Bank",
      },
    ],
  },
];

const amcRows = [
  {
    _id: "amc-hdfc-id",
    name: "HDFC AMC",
  },
];

const metadataRows = [
  {
    _id: "asset-nifty-id",
    name: "NIFTYBEES",
    currency: "INR",
  },
];

module.exports = {
  assetClassRows,
  sectorRows,
  amcRows,
  metadataRows,
};
