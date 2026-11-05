# Veterinary clinic Express API

This project migrates the API routes and business rules from the Laravel application into native ES modules. The existing `GET /` and `GET /api/health` endpoints remain available.

## Run

```bash
npm install
Copy-Item .env.example .env
npm start
```

Set `JWT_SECRET` to the same secret used by Laravel if existing Laravel JWTs must be accepted. `npm run dev` starts the app with Node's watch mode. Swagger UI is available at `/api-docs`.

On first startup, the app creates an admin using `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `.env` if that username does not already exist. For local development, set them to `admin` and `admin`; change the password before exposing the app outside your machine. The public registration endpoint (`POST /api/owners/register`) creates owner accounts only. Admins and owners can use `POST /api/login`.

## Database integration

The server connects to MongoDB using `MONGODB_URI` from `.env` before it starts listening. For a local MongoDB instance, use:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/vet_ambulanta
```

For MongoDB Atlas, set `MONGODB_URI` to the connection string provided by Atlas. The server reports a connection error and exits if the URI is missing or MongoDB cannot be reached.

The Laravel repo does not contain migrations for its domain collections. Model fillable fields, primary keys, and relationships were used to define the MongoDB schemas. Before migrating SQL data, preserve the numeric legacy IDs and initialize the `counters` documents (`owners`, `pets`, `vets`, `medicines`, `reservations`) above each collection's current maximum ID.

## Migrated API

All Laravel API routes under `/api` are retained:

- Authentication: `POST /api/owners/register`, `POST /api/login`
- Veterinarians: count at `/public/vets-count` (authenticated owners and admins)
- Medicines: list, read, create, update, and delete at `/medicine` (admin only)
- Owners: admins can list, read, update, and deactivate any owner; owners can read/update their own profile at `/owners/me`
- Pets: admins can manage all pets; owners can list, create, read, update, and deactivate only their own pets
- Veterinarians: admins can manage veterinarians; authenticated owners can list/read them to book visits
- Reservations: admins can manage all reservations; owners can list/cancel their own and book appointments only for their own pets

Protected routes use `Authorization: Bearer <JWT>`. Owner and veterinarian deletion is a status change; deleting an owner also deactivates their active pets. API validation and reservation ownership/availability rules follow the Laravel controllers and services.
