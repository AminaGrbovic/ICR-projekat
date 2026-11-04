# Veterinary clinic Express API

This project migrates the API routes and business rules from the Laravel application into native ES modules. The existing `GET /` and `GET /api/health` endpoints remain available.

## Run

```bash
npm install
Copy-Item .env.example .env
npm start
```

Set `JWT_SECRET` to the same secret used by Laravel if existing Laravel JWTs must be accepted. `npm run dev` starts the app with Node's watch mode. Swagger UI is available at `/api-docs`.

## Database integration

Mongoose schemas and data services are implemented, but this app intentionally does not open a MongoDB connection. Until an integration explicitly connects Mongoose, database-backed operations return HTTP 503; server startup, health checks, and Swagger work without MongoDB. `MONGODB_URI` is read by `src/config/database.js` for later integration.

The Laravel repo does not contain migrations for its domain collections. Model fillable fields, primary keys, and relationships were used to define the MongoDB schemas. Before migrating SQL data, preserve the numeric legacy IDs and initialize the `counters` documents (`owners`, `pets`, `vets`, `medicines`, `reservations`) above each collection's current maximum ID.

## Migrated API

All Laravel API routes under `/api` are retained:

- Authentication: `POST /owners/register`, `POST /login`
- Public: `GET /public/vets-count`
- Medicines: list, read, create, update, and delete at `/medicine` (admin only)
- Owners: list, read, update, and deactivate at `/owners` (admin only)
- Pets: list, read, create, update, and deactivate at `/pets` (owner/admin; owners can access only their pets)
- Veterinarians: list and read at `/vets` (owner/admin); create, update, and deactivate (admin only)
- Reservations: list and delete at `/reservations` (owner/admin); create (owner only)

Protected routes use `Authorization: Bearer <JWT>`. Owner and veterinarian deletion is a status change; deleting an owner also deactivates their active pets. API validation and reservation ownership/availability rules follow the Laravel controllers and services.
