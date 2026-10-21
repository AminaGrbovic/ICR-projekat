# Express projekat

Jednostavan Node.js projekat napravljen pomoću Expressa.

## Pokretanje

Instaliraj zavisnosti:

```bash
npm install
```

Pokreni server:

```bash
npm start
```

Za razvoj, uz automatsko ponovno pokretanje pri izmjeni fajlova:

```bash
npm run dev
```

Server po zadanim postavkama koristi port `3000`. Možeš postaviti drugi port preko varijable okruženja `PORT`.

- `GET /` — početna ruta
- `GET /api/health` — provjera statusa servera
