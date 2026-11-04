import database from "../config/database.js";

const { mongoose } = database;

const vetSchema = new mongoose.Schema(
  {
    _id: Number,
    veterinar_id: Number,
    ime: String,
    prezime: String,
    specijalizacija: String,
    kontakt: String,
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

vetSchema.virtual("reservations", {
  ref: "Reservation",
  localField: "veterinar_id",
  foreignField: "veterinar_id",
});

export default mongoose.models.Vet || mongoose.model("Vet", vetSchema, "vets");
