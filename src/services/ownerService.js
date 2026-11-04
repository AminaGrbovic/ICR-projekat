import Owner from "../models/Owner.js";
import Pet from "../models/Pet.js";
import errors from "../utils/errors.js";
import ids from "../utils/ids.js";
import shared from "./shared.js";

const { assertDatabaseReady, notFound } = errors;
const { idFromParam } = ids;
const { pick } = shared;

const fields = [
  "ime",
  "prezime",
  "adresa",
  "tel",
  "email",
  "username",
  "password",
];

async function getAll() {
  assertDatabaseReady();
  return Owner.find({ status: 1 });
}

async function findActive(value) {
  const id = idFromParam(value);
  return Number.isNaN(id)
    ? null
    : Owner.findOne({ _id: id, status: 1 });
}

async function getById(value) {
  assertDatabaseReady();
  const owner = await findActive(value);
  if (!owner) {
    throw notFound("Owner not found");
  }
  return owner;
}

async function update(value, data) {
  assertDatabaseReady();
  const owner = await findActive(value);
  if (!owner) {
    throw notFound("Owner not found");
  }
  Object.assign(owner, pick(data, fields));
  await owner.save();
  return owner;
}

async function remove(value) {
  assertDatabaseReady();
  const owner = await findActive(value);
  if (!owner) {
    throw notFound("Owner not found");
  }
  owner.status = 0;
  await owner.save();
  await Pet.updateMany(
    { vlasnik_id: owner.vlasnik_id, status: 1 },
    { $set: { status: 0 } }
  );
}

export default { getAll, getById, update, remove };
