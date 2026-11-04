import vetService from "../services/vetService.js";

async function getAll(req, res) {
  res.json(await vetService.getAll());
}

async function getById(req, res) {
  res.json(await vetService.getById(req.params.id));
}

async function create(req, res) {
  res.status(201).json(await vetService.create(req.body));
}

async function update(req, res) {
  res.json(await vetService.update(req.params.id, req.body));
}

async function remove(req, res) {
  await vetService.remove(req.params.id);
  res.json({ message: "Vet deleted successfully" });
}

async function count(req, res) {
  res.json({ count: await vetService.countActive() });
}

export default { getAll, getById, create, update, remove, count };
