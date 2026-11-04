import database from "../config/database.js";

const { mongoose } = database;

const medicineSchema = new mongoose.Schema(
  {
    _id: Number,
    lijek_id: Number,
    naziv: String,
    cijena: Number,
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

export default
  mongoose.models.Medicine ||
  mongoose.model("Medicine", medicineSchema, "medicines");
