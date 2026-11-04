import medicineService from "../services/medicineService.js";

async function getAll(req, res) {
  res.json(await medicineService.getAll());
}

async function getById(req, res) {
  res.json(await medicineService.getById(req.params.id));
}

async function create(req, res) {
  res.status(201).json(await medicineService.create(req.body));
}

async function update(req, res) {
  res.json(await medicineService.update(req.params.id, req.body));
}

async function remove(req, res) {
  await medicineService.remove(req.params.id);
  res.json({ message: "Medicine deleted successfully" });
}

export default { getAll, getById, create, update, remove };
