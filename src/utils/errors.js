import database from "../config/database.js";

class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.details = details;
  }
}

function assertDatabaseReady() {
  const { mongoose } = database;
  if (mongoose.connection.readyState !== 1) {
    throw new AppError(503, "Database is not connected");
  }
}

function notFound(message = "Not Found") {
  return new AppError(404, message);
}

function validationError(errors) {
  return new AppError(422, "The given data was invalid.", errors);
}

export default { AppError, assertDatabaseReady, notFound, validationError };
