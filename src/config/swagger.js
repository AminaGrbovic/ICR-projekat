import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

const json = (description, schema) => ({
  description,
  content: { "application/json": { schema } },
});
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const arrayOf = (name) => ({ type: "array", items: ref(name) });
const genericError = json("Error response", ref("Error"));
const validationError = json("Validation failed", ref("ValidationError"));
const databaseError = json("MongoDB is not connected", ref("Error"));

function operation(summary, tag, status, schema, options = {}) {
  const responses = {
    [status]: json(status === 201 ? "Created" : "Successful response", schema),
    429: genericError,
  };
  if (options.auth) {
    responses[401] = genericError;
    responses[403] = genericError;
    responses[503] = databaseError;
    responses[500] = genericError;
  } else {
    responses[503] = databaseError;
    responses[500] = genericError;
  }
  if (options.unauthorized) responses[401] = genericError;
  if (options.notFound) responses[404] = genericError;
  if (options.validation) responses[422] = validationError;

  const result = { summary, tags: [tag], responses };
  if (options.auth) result.security = [{ bearerAuth: [] }];
  if (options.id) {
    result.parameters = [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "integer" },
      },
    ];
  }
  if (options.body) {
    result.requestBody = {
      required: options.bodyRequired !== false,
      content: {
        "application/json": { schema: ref(options.body) },
        "application/x-www-form-urlencoded": { schema: ref(options.body) },
      },
    };
  }
  return result;
}

const auth = (summary, tag, status, schema, options = {}) =>
  operation(summary, tag, status, schema, { ...options, auth: true });

const paths = {
  "/": {
    get: {
      summary: "Express welcome message",
      tags: ["System"],
      responses: {
        200: {
          description: "HTML welcome message",
          content: {
            "text/html": {
              schema: { type: "string", example: "Express server je pokrenut!" },
            },
          },
        },
      },
    },
  },
  "/api/health": {
    get: {
      summary: "Check server health",
      tags: ["System"],
      responses: {
        200: json("Successful response", ref("Health")),
        429: genericError,
      },
    },
  },
  "/api/owners/register": {
    post: operation("Register an owner", "Authentication", 201, ref("RegistrationResult"), {
      body: "OwnerRegistration",
      validation: true,
    }),
  },
  "/api/login": {
    post: operation("Authenticate an admin or active owner", "Authentication", 200, ref("LoginResult"), {
      body: "Credentials",
      validation: true,
      unauthorized: true,
    }),
  },
  "/api/public/vets-count": {
    get: auth("Count active veterinarians", "Veterinarians", 200, ref("Count")),
  },
  "/api/medicine": {
    get: auth("List medicines", "Medicines", 200, arrayOf("Medicine")),
    post: auth("Create a medicine (admin only)", "Medicines", 201, ref("Medicine"), {
      body: "MedicineInput",
      bodyRequired: false,
      validation: true,
    }),
  },
  "/api/medicine/{id}": {
    get: auth("Get a medicine by ID", "Medicines", 200, {
      allOf: [ref("Medicine")],
      nullable: true,
    }, { id: true }),
    put: auth("Update a medicine", "Medicines", 200, ref("Medicine"), {
      id: true,
      body: "MedicineInput",
      bodyRequired: false,
      notFound: true,
      validation: true,
    }),
    delete: auth("Delete a medicine", "Medicines", 200, ref("Message"), {
      id: true,
      notFound: true,
    }),
  },
  "/api/owners": {
    get: auth("List active owners (admin only)", "Owners", 200, arrayOf("Owner")),
  },
  "/api/owners/me": {
    get: auth("Get the authenticated owner's profile", "Owners", 200, ref("Owner")),
    put: auth("Update the authenticated owner's profile", "Owners", 200, ref("Owner"), {
      body: "OwnerInput",
      bodyRequired: false,
      validation: true,
    }),
  },
  "/api/owners/{id}": {
    get: auth("Get an active owner by ID (admin only)", "Owners", 200, ref("Owner"), {
      id: true,
      notFound: true,
    }),
    put: auth("Update an active owner (admin only)", "Owners", 200, ref("Owner"), {
      id: true,
      body: "OwnerInput",
      bodyRequired: false,
      notFound: true,
      validation: true,
    }),
    delete: auth("Deactivate an owner and their active pets (admin only)", "Owners", 200, ref("Message"), {
      id: true,
      notFound: true,
    }),
  },
  "/api/pets": {
    get: auth("List active pets belonging to the owner, or all pets for admin", "Pets", 200, arrayOf("Pet")),
    post: auth("Create a pet for the owner, or assign one as admin", "Pets", 201, ref("Pet"), {
      body: "PetInput",
      bodyRequired: false,
      validation: true,
    }),
  },
  "/api/pets/{id}": {
    get: auth("Get an active pet belonging to the owner, or any pet as admin", "Pets", 200, ref("Pet"), {
      id: true,
      notFound: true,
    }),
    put: auth("Update an active pet belonging to the owner, or any pet as admin", "Pets", 200, ref("Pet"), {
      id: true,
      body: "PetInput",
      bodyRequired: false,
      notFound: true,
      validation: true,
    }),
    delete: auth("Deactivate an active pet belonging to the owner, or any pet as admin", "Pets", 200, ref("Message"), {
      id: true,
      notFound: true,
    }),
  },
  "/api/vets": {
    get: auth("List active veterinarians", "Veterinarians", 200, arrayOf("Vet")),
    post: auth("Create a veterinarian (admin only)", "Veterinarians", 201, ref("Vet"), {
      body: "VetInput",
      bodyRequired: false,
      validation: true,
    }),
  },
  "/api/vets/{id}": {
    get: auth("Get an active veterinarian by ID", "Veterinarians", 200, ref("Vet"), {
      id: true,
      notFound: true,
    }),
    put: auth("Update an active veterinarian (admin only)", "Veterinarians", 200, ref("Vet"), {
      id: true,
      body: "VetInput",
      bodyRequired: false,
      notFound: true,
      validation: true,
    }),
    delete: auth("Deactivate an active veterinarian (admin only)", "Veterinarians", 200, ref("Message"), {
      id: true,
      notFound: true,
    }),
  },
  "/api/reservations": {
    get: auth("List the owner's reservations, or all reservations for admin", "Reservations", 200, arrayOf("Reservation")),
    post: auth("Reserve an appointment for an owned pet, or any pet as admin", "Reservations", 201, ref("Reservation"), {
      body: "ReservationInput",
      validation: true,
    }),
  },
  "/api/reservations/{id}": {
    delete: auth("Cancel an owned reservation, or any reservation as admin", "Reservations", 200, ref("Message"), {
      id: true,
      notFound: true,
    }),
  },
};

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Veterinary clinic API",
      version: "1.0.0",
      description:
        "Laravel API migration. Database-backed endpoints return 503 until MongoDB is connected.",
    },
    servers: [{ url: "/" }],
    tags: [
      { name: "System" },
      { name: "Authentication" },
      { name: "Medicines" },
      { name: "Owners" },
      { name: "Pets" },
      { name: "Veterinarians" },
      { name: "Reservations" },
    ],
    paths,
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        Error: {
          type: "object",
          properties: { message: { type: "string" } },
          required: ["message"],
        },
        ValidationError: {
          type: "object",
          properties: {
            message: { type: "string", example: "The given data was invalid." },
            errors: { type: "object", additionalProperties: { type: "array", items: { type: "string" } } },
          },
          required: ["message", "errors"],
        },
        Message: {
          type: "object",
          properties: { message: { type: "string" } },
          required: ["message"],
        },
        Health: {
          type: "object",
          properties: { status: { type: "string", example: "ok" } },
          required: ["status"],
        },
        Count: {
          type: "object",
          properties: { count: { type: "integer" } },
          required: ["count"],
        },
        OwnerRegistration: {
          type: "object",
          required: ["ime", "prezime", "adresa", "tel", "email", "username", "password"],
          properties: {
            ime: { type: "string", maxLength: 255 },
            prezime: { type: "string", maxLength: 255 },
            adresa: { type: "string", maxLength: 255 },
            tel: { type: "string", maxLength: 255 },
            email: { type: "string", format: "email", maxLength: 255 },
            username: { type: "string", maxLength: 255 },
            password: { type: "string", minLength: 6 },
          },
        },
        Credentials: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string" },
            password: { type: "string" },
          },
        },
        RegistrationResult: {
          type: "object",
          properties: {
            role: { type: "string", enum: ["owner"] },
            owner: {
              type: "object",
              properties: {
                vlasnik_id: { type: "integer" },
                ime: { type: "string" },
                prezime: { type: "string" },
                username: { type: "string" },
              },
            },
            token: { type: "string" },
          },
        },
        LoginResult: {
          type: "object",
          properties: {
            role: { type: "string", enum: ["admin", "owner"] },
            admin: { type: "object", properties: { admin_id: { type: "integer" }, username: { type: "string" } } },
            owner: {
              type: "object",
              properties: {
                vlasnik_id: { type: "integer" },
                username: { type: "string" },
                ime: { type: "string" },
                prezime: { type: "string" },
              },
            },
            token: { type: "string" },
          },
        },
        OwnerInput: {
          type: "object",
          properties: {
            ime: { type: "string" },
            prezime: { type: "string" },
            adresa: { type: "string" },
            tel: { type: "string" },
            email: { type: "string", format: "email" },
            username: { type: "string" },
            password: { type: "string" },
          },
        },
        Owner: {
          allOf: [
            ref("OwnerInput"),
            {
              type: "object",
              properties: {
                vlasnik_id: { type: "integer" },
                status: { type: "integer", enum: [0, 1] },
              },
            },
          ],
        },
        PetInput: {
          type: "object",
          properties: {
            ime: { type: "string" },
            vrsta: { type: "string" },
            rasa: { type: "string" },
            pol: { type: "string" },
            datum_rodjenja: { type: "string" },
            tezina: { type: "number" },
            vlasnik_id: { type: "integer", description: "Required for admin; ignored for owner." },
          },
        },
        Pet: {
          allOf: [
            ref("PetInput"),
            {
              type: "object",
              properties: {
                ljubimac_id: { type: "integer" },
                status: { type: "integer", enum: [0, 1] },
              },
            },
          ],
        },
        VetInput: {
          type: "object",
          properties: {
            ime: { type: "string" },
            prezime: { type: "string" },
            specijalizacija: { type: "string" },
            kontakt: { type: "string" },
          },
        },
        Vet: {
          allOf: [
            ref("VetInput"),
            {
              type: "object",
              properties: {
                veterinar_id: { type: "integer" },
                status: { type: "integer", enum: [0, 1] },
              },
            },
          ],
        },
        MedicineInput: {
          type: "object",
          properties: {
            naziv: { type: "string" },
            cijena: { type: "number" },
          },
        },
        Medicine: {
          allOf: [
            ref("MedicineInput"),
            { type: "object", properties: { lijek_id: { type: "integer" } } },
          ],
        },
        ReservationInput: {
          type: "object",
          required: ["datum", "veterinar_id", "ljubimac_id"],
          properties: {
            datum: { type: "string", format: "date-time" },
            veterinar_id: { type: "integer" },
            ljubimac_id: { type: "integer" },
          },
        },
        Reservation: {
          type: "object",
          properties: {
            rezervacija_id: { type: "integer" },
            datum: { type: "string", format: "date-time" },
            vlasnik_id: { type: "integer" },
            veterinar_id: { type: "integer" },
            ljubimac_id: { type: "integer" },
            owner: { allOf: [ref("Owner")], nullable: true },
            pet: { allOf: [ref("Pet")], nullable: true },
            vet: { allOf: [ref("Vet")], nullable: true },
          },
        },
      },
    },
  },
  apis: [path.join(currentDirectory, "../routes/*.js")],
};

export default swaggerJsdoc(options);
