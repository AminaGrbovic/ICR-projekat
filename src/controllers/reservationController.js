import reservationService from "../services/reservationService.js";

async function getAll(req, res) {
  res.json(await reservationService.getAll(req.auth));
}

async function create(req, res) {
  res.status(201).json(
    await reservationService.create(req.body, req.auth)
  );
}

async function remove(req, res) {
  await reservationService.remove(req.params.id, req.auth);
  res.json({ message: "Rezervacija je obrisana." });
}

export default { getAll, create, remove };
