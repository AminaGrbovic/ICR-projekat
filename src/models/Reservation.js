import database from "../config/database.js";

const { mongoose } = database;

const reservationSchema = new mongoose.Schema(
  {
    _id: Number,
    rezervacija_id: Number,
    datum: Date,
    vlasnik_id: Number,
    veterinar_id: Number,
    ljubimac_id: Number,
  },
  {
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, value) => {
        delete value._id;
        delete value.__v;
        return value;
      },
    },
  }
);

reservationSchema.virtual("owner", {
  ref: "Owner",
  localField: "vlasnik_id",
  foreignField: "vlasnik_id",
  justOne: true,
});
reservationSchema.virtual("pet", {
  ref: "Pet",
  localField: "ljubimac_id",
  foreignField: "ljubimac_id",
  justOne: true,
});
reservationSchema.virtual("vet", {
  ref: "Vet",
  localField: "veterinar_id",
  foreignField: "veterinar_id",
  justOne: true,
});

export default
  mongoose.models.Reservation ||
  mongoose.model("Reservation", reservationSchema, "reservations");
