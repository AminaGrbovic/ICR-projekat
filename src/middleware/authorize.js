
export default (...roles) => (req, res, next) => {
  if (!req.auth) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!roles.includes(req.auth.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return next();
};
