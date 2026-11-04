import ids from "../utils/ids.js";

const { nextId } = ids;

async function createRecord(Model, collection, primaryKey, values) {
  const id = await nextId(collection);
  return Model.create({ _id: id, [primaryKey]: id, ...values });
}

function pick(values, fields) {
  return Object.fromEntries(
    Object.entries(values).filter(([field]) => fields.includes(field))
  );
}

export default { createRecord, pick };
