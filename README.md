# API Express con pnpm, cookie y Bearer

API de registro, inicio de sesion y productos. Usa la misma organizacion de `config.js`, `index.js`, `app.js`, Mongoose, controladores y `validateAuthCookie`.

- **Web:** el JWT (con el id y el `userType`) se guarda en la cookie `authCookie`.
- **Movil:** el mismo JWT se devuelve en el JSON y se envia con `Authorization: Bearer <token>`.
- La cabecera `X-Client: mobile` pide el token. Si no va esa cabecera, la respuesta es para web y crea la cookie.

## Requisitos

- Node.js 18 o superior
- pnpm 8 o superior
- MongoDB en ejecucion

## Instalacion

```powershell
pnpm install
Copy-Item .env.example .env
pnpm dev
```

El servidor queda en `http://localhost:4000`.

En `.env`, `DB_URI` y `JWT_secret_key` tienen que tener valor. El resto de variables estan en `config.js` para correo, Cloudinary, Wompi y Mailjet.

## Rutas

| Metodo | Ruta | Auth |
| --- | --- | --- |
| `POST` | `/api/registerCustomer` | No. Body: `name`, `email`, `password`. Guarda en `Customers` |
| `POST` | `/api/registerAdmin` | No. Body: `name`, `email`, `password`. Guarda en `Admins` |
| `POST` | `/api/loginCustomers` | No. Body: `email`, `password`. Al tercer fallo bloquea 15 minutos |
| `POST` | `/api/loginAdmins` | No. Body: `email`, `password`. El token sale con `userType: "Admin"` |
| `POST` | `/api/logout` | Borra la cookie `authCookie` |
| `GET` | `/api/products` | Cookie o Bearer. `Customer` o `Admin` |
| `POST` | `/api/products` | Cookie o Bearer. Solo `Admin` |
| `GET` | `/api/products/lowStock` | No |
| `POST` | `/api/products/priceRange` | No. Body: `min`, `max` |
| `GET` | `/api/products/count` | No |
| `POST` | `/api/products/searchName` | No. Body: `name` |
| `GET` | `/api/products/:id` | No |
| `PUT` | `/api/products/:id` | No |
| `DELETE` | `/api/products/:id` | No |

En la web, `fetch` debe usar `credentials: 'include'`. El origen permitido es `http://localhost:5173` o `http://localhost:5174`.

En movil:

```http
POST /api/loginCustomers
Content-Type: application/json
X-Client: mobile

{ "email": "ana@example.com", "password": "secreto123" }
```

```http
GET /api/products
Authorization: Bearer <token>
```
