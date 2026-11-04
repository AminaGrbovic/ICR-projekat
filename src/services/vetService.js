import Vet from "../models/Vet.js";
import errors from "../utils/errors.js";
import ids from "../utils/ids.js";
import shared from "./shared.js";

const { assertDatabaseReady, notFound } = errors;
const { idFromParam } = ids;
const { createRecord, pick } = shared;

const fields = ["ime", "prezime", "specijalizacija", "kontakt"];

async function getAll() {
  assertDatabaseReady();
  return Vet.find({ status: 1 });
}

async function findActive(value) {
  const id = idFromParam(value);
  return Number.isNaN(id) ? null : Vet.findOne({ _id: id, status: 1 });
}

async function getById(value) {
  assertDatabaseReady();
  const vet = await findActive(value);
  if (!vet) {
    throw notFound("Vet not found");
  }
  return vet;
}

async function create(data) {
  assertDatabaseReady();
  return createRecord(Vet, "vets", "veterinar_id", {
    ...pick(data, fields),
    status: 1,
  });
}

async function update(value, data) {
  assertDatabaseReady();
  const vet = await findActive(value);
  if (!vet) {
    throw notFound("Vet not found");
  }
  Object.assign(vet, pick(data, fields));
  await vet.save();
  return vet;
}

async function remove(value) {
  assertDatabaseReady();
  const vet = await findActive(value);
  if (!vet) {
    throw notFound("Vet not found");
  }
  vet.status = 0;
  await vet.save();
}

async function countActive() {
  assertDatabaseReady();
  return Vet.countDocuments({ status: 1 });
}

export default { getAll, getById, create, update, remove, countActive };
