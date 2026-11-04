import database from "../config/database.js";

const { mongoose } = database;

const petSchema = new mongoose.Schema(
  {
    _id: Number,
    ljubimac_id: Number,
    ime: String,
    vrsta: String,
    rasa: String,
    pol: String,
    datum_rodjenja: String,
    tezina: Number,
    vlasnik_id: Number,
    status: Number,
  },
  {
    timestamps: false,
    toJSON: {
      transform: (_doc, value) => {
        delete value._id;
        delete value.__v;
        return value;
      },
    },
  }
);

petSchema.virtual("reservations", {
  ref: "Reservation",
  localField: "ljubimac_id",
  foreignField: "ljubimac_id",
});

export default mongoose.models.Pet || mongoose.model("Pet", petSchema, "pets");
