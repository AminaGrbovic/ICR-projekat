
function requiredString(body, field, errors, options = {}) {
  const value = body[field];
  if (value === undefined || value === null || value === "") {
    errors[field] = [`The ${field} field is required.`];
  } else if (typeof value !== "string") {
    errors[field] = [`The ${field} must be a string.`];
  } else if (options.max && value.length > options.max) {
    errors[field] = [`The ${field} must not be greater than ${options.max} characters.`];
  } else if (options.min && value.length < options.min) {
    errors[field] = [`The ${field} must be at least ${options.min} characters.`];
  }
}

function registerOwner(body) {
  const errors = {};
  for (const field of ["ime", "prezime", "adresa", "tel", "username"]) {
    requiredString(body, field, errors, { max: 255 });
  }
  requiredString(body, "email", errors, { max: 255 });
  if (
    typeof body.email === "string" &&
    body.email.length > 0 &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
  ) {
    errors.email = ["The email must be a valid email address."];
  }
  requiredString(body, "password", errors, { min: 6 });
  return errors;
}

function login(body) {
  const errors = {};
  requiredString(body, "username", errors);
  requiredString(body, "password", errors);
  return errors;
}

export default { registerOwner, login };
