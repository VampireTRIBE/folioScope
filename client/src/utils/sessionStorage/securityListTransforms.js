export const TRADABLE_SECURITIES_KEY = "TRADABLE SECURITIES";

export const getSecurityLabel = (item) => {
  if (typeof item === "string") return item;
  return item?.label || item?.symbol || item?.name || "";
};

export const getSecurityId = (item) => {
  if (typeof item === "string") return item;
  return item?.id || item?._id || item?.value || item?.securityId || "";
};

const hasSecurityEntryShape = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  return Boolean(
    value.id ||
      value._id ||
      value.value ||
      value.securityId ||
      value.label ||
      value.symbol ||
      value.name,
  );
};

const normalizeSecurityEntry = (value, fallbackLabel = "", category = "") => {
  if (typeof value === "string") {
    return {
      label: fallbackLabel || value,
      id: value,
      category,
    };
  }

  if (!value || typeof value !== "object") {
    return {
      label: fallbackLabel,
      id: value || "",
      category,
    };
  }

  const label = getSecurityLabel(value) || fallbackLabel;
  const id = getSecurityId(value);

  return {
    ...value,
    label,
    id,
    category: value.category || category,
  };
};

const normalizeSecurityBucket = (bucket, category = "") => {
  if (Array.isArray(bucket)) {
    return bucket.map((item) => normalizeSecurityEntry(item, "", category));
  }

  if (!bucket || typeof bucket !== "object") return [];

  if (hasSecurityEntryShape(bucket)) {
    return [normalizeSecurityEntry(bucket, "", category)];
  }

  return Object.entries(bucket).map(([label, value]) =>
    normalizeSecurityEntry(value, label, category),
  );
};

const uniqueSecurities = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    const label = getSecurityLabel(item);
    const id = getSecurityId(item);
    const key = id || label;

    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const getSecuritiesByCategory = (securities, category) => {
  if (!category) return normalizeSecuritiesList(securities);

  return uniqueSecurities(
    normalizeSecurityBucket(securities?.[category], category),
  );
};

export const normalizeSecuritiesList = (securities) => {
  if (Array.isArray(securities)) {
    return uniqueSecurities(normalizeSecurityBucket(securities));
  }

  if (!securities || typeof securities !== "object") return [];

  if (hasSecurityEntryShape(securities)) {
    return uniqueSecurities(normalizeSecurityBucket(securities));
  }

  const entries = Object.entries(securities).flatMap(([category, bucket]) =>
    normalizeSecurityBucket(bucket, category),
  );

  return uniqueSecurities(entries);
};
