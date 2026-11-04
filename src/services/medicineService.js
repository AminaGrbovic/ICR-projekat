import Medicine from "../models/Medicine.js";
import errors from "../utils/errors.js";
import ids from "../utils/ids.js";
import shared from "./shared.js";

const { assertDatabaseReady, notFound } = errors;
const { idFromParam } = ids;
const { createRecord, pick } = shared;

const fields = ["naziv", "cijena"];

async function getAll() {
  assertDatabaseReady();
  return Medicine.find();
}

async function getById(value) {
  assertDatabaseReady();
  const id = idFromParam(value);
  return Number.isNaN(id) ? null : Medicine.findById(id);
}

async function create(data) {
  assertDatabaseReady();
  return createRecord(
    Medicine,
    "medicines",
    "lijek_id",
    pick(data, fields)
  );
}

async function update(value, data) {
  assertDatabaseReady();
  const id = idFromParam(value);
  const medicine = Number.isNaN(id)
    ? null
    : await Medicine.findByIdAndUpdate(id, pick(data, fields), {
        new: true,
        runValidators: false,
      });
  if (!medicine) {
    throw notFound("Medicine not found");
  }
  return medicine;
}

async function remove(value) {
  assertDatabaseReady();
  const id = idFromParam(value);
  const medicine = Number.isNaN(id) ? null : await Medicine.findById(id);
  if (!medicine) {
    throw notFound("Medicine not found");
  }
  await medicine.deleteOne();
}

export default { getAll, getById, create, update, remove };
