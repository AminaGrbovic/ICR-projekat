import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

async function ensureInitialAdmin() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!username || !password) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env.");
  }

  if (await Admin.exists({ username })) {
    return;
  }

  const lastAdmin = await Admin.findOne().sort({ _id: -1 }).select("_id admin_id");
  const adminId = Math.max(
    Number(lastAdmin?.admin_id) || 0,
    Number(lastAdmin?._id) || 0
  ) + 1;
  const hashedPassword = await bcrypt.hash(password, 10);

  await Admin.create({
    _id: adminId,
    admin_id: adminId,
    username,
    password: hashedPassword,
  });
}

export default { ensureInitialAdmin };
