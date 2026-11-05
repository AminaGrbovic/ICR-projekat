import ownerService from "../services/ownerService.js";

async function getAll(req, res) {
  res.json(await ownerService.getAll());
}

async function getMe(req, res) {
  res.json(await ownerService.getById(req.auth.user.vlasnik_id));
}

async function updateMe(req, res) {
  res.json(await ownerService.update(req.auth.user.vlasnik_id, req.body));
}

async function getById(req, res) {
  res.json(await ownerService.getById(req.params.id));
}

async function update(req, res) {
  res.json(await ownerService.update(req.params.id, req.body));
}

async function remove(req, res) {
  await ownerService.remove(req.params.id);
  res.json({ message: "Owner deleted successfully" });
}

export default { getAll, getMe, updateMe, getById, update, remove };
