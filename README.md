# Task Manager API (JWT + Roles)

API d'un gestor de tasques amb **autenticació JWT**, **autorització per propietari** i **rols (user/admin)**.

## Requisits
- Node.js 18+
- MongoDB (local o Atlas)

## Instal·lació

```bash
cd task-manager-api
npm install
```

## Variables d'entorn
Copia el fitxer d'exemple i edita'l:

```bash
cp .env.example .env
```

Variables (mínimes):
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

## Engegar el projecte

```bash
npm start
```

Mode desenvolupament:

```bash
npm run dev
```

## Autenticació
Totes les rutes protegides requereixen:

`Authorization: Bearer <token>`

## Endpoints

### Auth (`/api/auth`)
- `POST /register`
- `POST /login`
- `GET /me` (protected)
- `PUT /profile` (protected)
- `PUT /change-password` (protected)

### Tasks (`/api/tasks`) – Totes protegides
- `GET /stats`
- `POST /`
- `GET /`
- `GET /:id`
- `PUT /:id`
- `DELETE /:id`
- `PUT /:id/image` (body: `{ "imageUrl": "..." }`)
- `PUT /:id/image/reset`

### Upload (`/api/upload`) – Totes protegides
- `POST /local` *(placeholder)*
- `POST /cloud` *(placeholder)*

### Admin (`/api/admin`) – Només rol `admin`
- `GET /users`
- `GET /tasks`
- `DELETE /users/:id`
- `PUT /users/:id/role` (body: `{ "role": "admin" | "user" }`)

## Notes de seguretat
- La contrasenya es guarda xifrada (bcrypt) i **mai** es retorna.
- Les tasques s'associen automàticament a `req.user._id`.
- Un usuari només pot veure/modificar les seves tasques.

## Fitxers clau
- `models/User.js`
- `models/Task.js`
- `middleware/auth.js`
- `middleware/roleCheck.js`
- `controllers/*`
- `routes/*`
- `utils/generateToken.js`
- `utils/errorResponse.js`

