import petService from "../services/petService.js";

async function getAll(req, res) {
  res.json(await petService.getAll(req.auth));
}

async function getById(req, res) {
  res.json(await petService.getById(req.params.id, req.auth));
}

async function create(req, res) {
  res.status(201).json(await petService.create(req.body, req.auth));
}

async function update(req, res) {
  res.json(await petService.update(req.params.id, req.body, req.auth));
}

async function remove(req, res) {
  await petService.remove(req.params.id, req.auth);
  res.json({ message: "Pet deleted successfully" });
}

export default { getAll, getById, create, update, remove };
