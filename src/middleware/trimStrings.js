
const excluded = new Set([
  "current_password",
  "password",
  "password_confirmation",
]);

function trim(value, key) {
  if (typeof value === "string" && !excluded.has(key)) {
    const result = value.trim();
    return result === "" ? null : result;
  }
  if (Array.isArray(value)) {
    return value.map((item) => trim(item, key));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        trim(childValue, childKey),
      ])
    );
  }
  return value;
}

export default (req, res, next) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    req.body = {};
  } else {
    req.body = trim(req.body, "");
  }
  next();
};
