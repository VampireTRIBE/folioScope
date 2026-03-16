const cache = {
  AssetClass: new Map(),
  AssetCategory: new Map(),
  AssetSubCategory: new Map(),
  AssetSector: new Map(),
  AssetIndustry: new Map(),
  AssetIndexName: new Map(),
  AssetAMC: new Map(),
};

async function getCachedId(Model, name, parentId = null, parentField = null) {
  const modelName = Model.modelName;

  if (!cache[modelName]) {
    cache[modelName] = new Map();
  }

  const key = parentId ? `${parentId}:${name}` : name;

  if (cache[modelName].has(key)) {
    return cache[modelName].get(key);
  }

  let query = { name };

  if (parentId && parentField) {
    query[parentField] = parentId;
  }

  const doc = await Model.findOne(query).select("_id").lean();

  if (!doc) return null;

  cache[modelName].set(key, doc._id);

  return doc._id;
}

module.exports = { getCachedId };
