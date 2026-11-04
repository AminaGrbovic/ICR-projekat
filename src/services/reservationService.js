import Reservation from "../models/Reservation.js";
import Pet from "../models/Pet.js";
import Vet from "../models/Vet.js";
import errors from "../utils/errors.js";
import ids from "../utils/ids.js";
import shared from "./shared.js";

const { assertDatabaseReady, AppError, notFound } = errors;
const { idFromParam } = ids;
const { createRecord } = shared;

async function getAll(auth) {
  assertDatabaseReady();
  const query =
    auth.role === "admin" ? {} : { vlasnik_id: auth.user.vlasnik_id };
  const reservations = await Reservation.find(query)
    .sort({ datum: 1 })
    .populate("owner")
    .populate("pet")
    .populate("vet");

  return reservations.filter(
    (reservation) =>
      (auth.role !== "admin" || reservation.owner?.status === 1) &&
      reservation.pet?.status === 1 &&
      reservation.vet?.status === 1
  );
}

async function create(data, auth) {
  assertDatabaseReady();
  const pet = await Pet.findOne({
    _id: data.ljubimac_id,
    vlasnik_id: auth.user.vlasnik_id,
    status: 1,
  });
  if (!pet) {
    throw new AppError(
      403,
      "Možete rezervisati termin samo za svog aktivnog ljubimca."
    );
  }

  const vet = await Vet.findOne({
    _id: data.veterinar_id,
    status: 1,
  });
  if (!vet) {
    throw new AppError(422, "Izabrani veterinar nije aktivan.");
  }

  const date = new Date(data.datum);
  const occupied = await Reservation.exists({
    veterinar_id: vet.veterinar_id,
    datum: date,
  });
  if (occupied) {
    throw new AppError(422, "Veterinar već ima rezervaciju u tom terminu.");
  }

  const reservation = await createRecord(
    Reservation,
    "reservations",
    "rezervacija_id",
    {
      datum: date,
      vlasnik_id: auth.user.vlasnik_id,
      veterinar_id: vet.veterinar_id,
      ljubimac_id: pet.ljubimac_id,
    }
  );
  return Reservation.findById(reservation._id)
    .populate("owner")
    .populate("pet")
    .populate("vet");
}

async function remove(value, auth) {
  assertDatabaseReady();
  const id = idFromParam(value);
  const reservation = Number.isNaN(id)
    ? null
    : await Reservation.findById(id);
  if (!reservation) {
    throw notFound("Rezervacija nije pronađena.");
  }
  if (
    auth.role !== "admin" &&
    reservation.vlasnik_id !== auth.user.vlasnik_id
  ) {
    throw new AppError(403, "Zabranjen pristup.");
  }
  await reservation.deleteOne();
}

export default { getAll, create, remove };
