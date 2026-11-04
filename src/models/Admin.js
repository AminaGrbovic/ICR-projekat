import database from "../config/database.js";

const { mongoose } = database;

const adminSchema = new mongoose.Schema(
  {
    _id: Number,
    admin_id: Number,
    username: String,
    password: { type: String, select: false },
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

adminSchema.index({ username: 1 }, { unique: true });
export default
  mongoose.models.Admin || mongoose.model("Admin", adminSchema, "admins");
