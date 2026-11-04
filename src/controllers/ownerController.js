import ownerService from "../services/ownerService.js";

async function getAll(req, res) {
  res.json(await ownerService.getAll());
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

export default { getAll, getById, update, remove };
