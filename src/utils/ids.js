import Counter from "../models/Counter.js";

async function nextId(name) {
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: false }
  );
  return counter.sequence;
}

function idFromParam(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : NaN;
}

export default { nextId, idFromParam };
