module.exports.assetClassClassificationStructureID = async (result) => {
  return Object.fromEntries(
    result.map((cls) => [
      cls._id,
      {
        _id: cls._id,
        name: cls.name,
        requiredFields: cls.requiredFields || [],
        forbiddenFields: cls.forbiddenFields || [],
        category: Object.fromEntries(
          cls.category.map((cat) => [
            cat._id,
            {
              _id: cat._id,
              name: cat.name,
              subcategory: Object.fromEntries(
                cat.subcategory.map((sub) => [
                  sub._id,
                  {
                    _id: sub._id,
                    name: sub.name,
                    indexName: Object.fromEntries(
                      (sub.indexName || []).map((ind) => [
                        ind._id,
                        { _id: ind._id, name: ind.name },
                      ]),
                    ),
                  },
                ]),
              ),
            },
          ]),
        ),
      },
    ]),
  );
};

module.exports.assetSectorClassificationStructureID = async (result) => {
  return Object.fromEntries(
    result.map((cls) => [
      cls._id,
      {
        _id: cls._id,
        name: cls.name,
        industry: Object.fromEntries(
          cls.industry.map((cat) => [
            cat._id,
            {
              _id: cat._id,
              name: cat.name,
            },
          ]),
        ),
      },
    ]),
  );
};

module.exports.assetAMCClassificationStructureID = async (result) => {
  return Object.fromEntries(
    result.map((cls) => [
      cls._id,
      {
        _id: cls._id,
        name: cls.name,
      },
    ]),
  );
};

module.exports.assetClassClassificationStructureName = async (result) => {
  return Object.fromEntries(
    result.map((cls) => [
      cls.name,
      {
        _id: cls._id,
        name: cls.name,
        requiredFields: cls.requiredFields || [],
        forbiddenFields: cls.forbiddenFields || [],
        category: Object.fromEntries(
          cls.category.map((cat) => [
            cat.name,
            {
              _id: cat._id,
              name: cat.name,
              subcategory: Object.fromEntries(
                cat.subcategory.map((sub) => [
                  sub.name,
                  {
                    _id: sub._id,
                    name: sub.name,
                    indexName: Object.fromEntries(
                      (sub.indexName || []).map((ind) => [
                        ind.name,
                        { _id: ind._id, name: ind.name },
                      ]),
                    ),
                  },
                ]),
              ),
            },
          ]),
        ),
      },
    ]),
  );
};

module.exports.assetSectorClassificationStructureName = async (result) => {
  return Object.fromEntries(
    result.map((cls) => [
      cls.name,
      {
        _id: cls._id,
        name: cls.name,
        industry: Object.fromEntries(
          cls.industry.map((cat) => [
            cat.name,
            {
              _id: cat._id,
              name: cat.name,
            },
          ]),
        ),
      },
    ]),
  );
};

module.exports.assetAMCClassificationStructureName = async (result) => {
  return Object.fromEntries(
    result.map((cls) => [
      cls.name,
      {
        _id: cls._id,
        name: cls.name,
      },
    ]),
  );
};
