import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import Owner from "../models/Owner.js";
import errors from "../utils/errors.js";
import jwt from "../utils/jwt.js";
import shared from "./shared.js";

const { assertDatabaseReady, validationError } = errors;
const { createToken } = jwt;
const { createRecord } = shared;

async function registerOwner(data) {
  assertDatabaseReady();
  const errors = {};
  if (await Owner.exists({ email: data.email })) {
    errors.email = ["The email has already been taken."];
  }
  if (await Owner.exists({ username: data.username })) {
    errors.username = ["The username has already been taken."];
  }
  if (Object.keys(errors).length) {
    throw validationError(errors);
  }

  const password = await bcrypt.hash(data.password, 10);
  const owner = await createRecord(Owner, "owners", "vlasnik_id", {
    ime: data.ime,
    prezime: data.prezime,
    adresa: data.adresa,
    tel: data.tel,
    email: data.email,
    username: data.username,
    password,
    status: 1,
  });
  return {
    role: "owner",
    owner: {
      vlasnik_id: owner.vlasnik_id,
      ime: owner.ime,
      prezime: owner.prezime,
      username: owner.username,
    },
    token: createToken(owner.vlasnik_id, "owner"),
  };
}

function passwordMatches(password, hash) {
  return bcrypt.compare(password, hash.replace(/^\$2y\$/, "$2b$"));
}

async function login(credentials) {
  assertDatabaseReady();
  const username = credentials.username.trim();
  const password = credentials.password.trim();

  const admin = await Admin.findOne({ username }).select("+password");
  if (admin && (await passwordMatches(password, admin.password))) {
    return {
      role: "admin",
      admin: { admin_id: admin.admin_id, username: admin.username },
      token: createToken(admin.admin_id, "admin"),
    };
  }

  const owner = await Owner.findOne({ username, status: 1 }).select("+password");
  if (owner && (await passwordMatches(password, owner.password))) {
    return {
      role: "owner",
      owner: {
        vlasnik_id: owner.vlasnik_id,
        username: owner.username,
        ime: owner.ime,
        prezime: owner.prezime,
      },
      token: createToken(owner.vlasnik_id, "owner"),
    };
  }
  return null;
}

export default { registerOwner, login };
