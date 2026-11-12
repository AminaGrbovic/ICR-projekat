
export default (req, res, next) => {
  if (req.path !== "/" && !req.path.startsWith("/api/")) {
    return next();
  }
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
  res.set("Access-Control-Allow-Headers", req.get("access-control-request-headers") || "*");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  return next();
};
