import Owner from "../models/Owner.js";
import Pet from "../models/Pet.js";
import errors from "../utils/errors.js";
import ids from "../utils/ids.js";
import shared from "./shared.js";

const { assertDatabaseReady, AppError, notFound } = errors;
const { idFromParam } = ids;
const { createRecord, pick } = shared;

const fields = [
  "ime",
  "vrsta",
  "rasa",
  "pol",
  "datum_rodjenja",
  "tezina",
  "vlasnik_id",
];

async function getAll(auth) {
  assertDatabaseReady();
  const query = { status: 1 };
  if (auth.role !== "admin") {
    query.vlasnik_id = auth.user.vlasnik_id;
  }
  return Pet.find(query);
}

async function findActive(value) {
  const id = idFromParam(value);
  return Number.isNaN(id) ? null : Pet.findOne({ _id: id, status: 1 });
}

function checkOwnership(pet, auth) {
  if (auth.role !== "admin" && pet.vlasnik_id !== auth.user.vlasnik_id) {
    throw new AppError(403, "Forbidden");
  }
}

async function getById(value, auth) {
  assertDatabaseReady();
  const pet = await findActive(value);
  if (!pet) {
    throw notFound("Pet not found");
  }
  checkOwnership(pet, auth);
  return pet;
}

async function update(value, data, auth) {
  assertDatabaseReady();
  const pet = await findActive(value);
  if (!pet) {
    throw notFound("Pet not found");
  }
  checkOwnership(pet, auth);
  const values = pick(data, fields);
  if (auth.role !== "admin") {
    delete values.vlasnik_id;
  }
  Object.assign(pet, values);
  await pet.save();
  return pet;
}

async function remove(value, auth) {
  assertDatabaseReady();
  const pet = await findActive(value);
  if (!pet) {
    throw notFound("Pet not found");
  }
  checkOwnership(pet, auth);
  pet.status = 0;
  await pet.save();
}

async function create(data, auth) {
  assertDatabaseReady();
  const values = pick(data, fields);
  if (auth.role === "admin") {
    const ownerId = Number(values.vlasnik_id);
    if (!values.vlasnik_id) {
      throw new AppError(422, "vlasnik_id is required for admin");
    }
    const owner = Number.isSafeInteger(ownerId)
      ? await Owner.findOne({ _id: ownerId, status: 1 })
      : null;
    if (!owner) {
      throw new AppError(422, "Izabrani vlasnik nije aktivan.");
    }
    values.vlasnik_id = owner.vlasnik_id;
  } else {
    values.vlasnik_id = auth.user.vlasnik_id;
  }
  return createRecord(Pet, "pets", "ljubimac_id", {
    ...values,
    status: 1,
  });
}

export default { getAll, getById, update, remove, create };
