import authService from "../services/authService.js";

async function registerOwner(req, res) {
  res.status(201).json(await authService.registerOwner(req.body));
}

async function login(req, res) {
  const result = await authService.login(req.body);
  if (!result) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  return res.status(200).json(result);
}

export default { registerOwner, login };
