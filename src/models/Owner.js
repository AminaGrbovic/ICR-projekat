import database from "../config/database.js";

const { mongoose } = database;

const ownerSchema = new mongoose.Schema(
  {
    _id: Number,
    vlasnik_id: Number,
    ime: String,
    prezime: String,
    adresa: String,
    tel: String,
    email: String,
    username: String,
    password: { type: String, select: false },
    status: Number,
  },
  {
    timestamps: false,
    toJSON: {
      transform: (_doc, value) => {
        delete value._id;
        delete value.password;
        delete value.__v;
        return value;
      },
    },
  }
);

ownerSchema.index({ username: 1 }, { unique: true });
ownerSchema.index({ email: 1 }, { unique: true });
ownerSchema.virtual("pets", {
  ref: "Pet",
  localField: "vlasnik_id",
  foreignField: "vlasnik_id",
});
ownerSchema.virtual("reservations", {
  ref: "Reservation",
  localField: "vlasnik_id",
  foreignField: "vlasnik_id",
});

export default
  mongoose.models.Owner || mongoose.model("Owner", ownerSchema, "owners");
