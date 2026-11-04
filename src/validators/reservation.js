
function createReservation(body) {
  const errors = {};
  if (typeof body.datum !== "string" || body.datum.length === 0) {
    errors.datum = ["The datum field is required."];
  } else {
    const time = Date.parse(body.datum);
    if (Number.isNaN(time)) {
      errors.datum = ["The datum is not a valid date."];
    } else if (time < Date.now()) {
      errors.datum = ["The datum must be a date after or equal to now."];
    }
  }
  for (const field of ["veterinar_id", "ljubimac_id"]) {
    const value = body[field];
    const label = field.replaceAll("_", " ");
    if (value === undefined || value === null || value === "") {
      errors[field] = [`The ${label} field is required.`];
    } else if (
      !(typeof value === "number" && Number.isInteger(value)) &&
      !(typeof value === "string" && /^-?\d+$/.test(value))
    ) {
      errors[field] = [`The ${label} must be an integer.`];
    } else {
      body[field] = Number(body[field]);
    }
  }
  return errors;
}

export default { createReservation };
