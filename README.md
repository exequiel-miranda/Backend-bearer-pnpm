# Cross-Platform Express API Gateway

### Backend RESTful en Node.js con Autenticacion Bearer Token para Web y React Native

[Caracteristicas](#caracteristicas-principales) • [Arquitectura](#arquitectura-del-proyecto) • [Inicio Rapido](#inicio-rapido) • [Autenticacion Bearer](#autenticacion-y-bearer-token) • [Consumo Web y Movil](#integracion-con-clientes-web-y-react-native) • [Endpoints](#documentacion-de-la-api)

---

## Tabla de Contenidos

- [Vision General](#vision-general)
- [Caracteristicas Principales](#caracteristicas-principales)
- [Stack Tecnologico](#stack-tecnologico)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Requisitos Previos e Instalacion](#requisitos-previos-e-instalacion)
- [Autenticacion y Bearer Token](#autenticacion-y-bearer-token)
- [Integracion con Clientes (Web y React Native)](#integracion-con-clientes-web-y-react-native)
- [Documentacion de la API](#documentacion-de-la-api)
- [Comandos pnpm Disponibles](#comandos-pnpm-disponibles)
- [Seguridad y Buenas Practicas](#seguridad-y-buenas-practicas)
- [Licencia](#licencia)

---

## Vision General

Este repositorio proporciona la arquitectura base para una **API RESTful** robusta y escalable construida con Node.js y Express. La solución está diseñada específicamente para dar soporte desacoplado e interoperable tanto a aplicaciones web (SPA/SSR) como a aplicaciones móviles nativas creadas con React Native (iOS y Android).

Mediante la implementación del estándar **Bearer Token (JWT)** en las cabeceras HTTP (`Authorization: Bearer <token>`), la API elimina la dependencia de cookies de sesión, simplificando la gestión de peticiones entre dominios (CORS) y garantizando compatibilidad nativa en clientes móviles.

---

## Caracteristicas Principales

* **Rendimiento optimizado con pnpm:** Gestion eficiente del espacio en disco y velocidad de instalacion de dependencias mediante enlaces duros (*hard links*).
* **Autenticacion sin Estado (Stateless):** Verificacion de firmas mediante JSON Web Tokens pasados obligatoriamente en el encabezado `Authorization`.
* **Soporte Multiplataforma:** Configuracion CORS flexible adaptada tanto para navegadores como para llamadas de red nativas en Android/iOS.
* **Seguridad de Cabeceras HTTP:** Integracion de middlewares como Helmet para la mitigacion de vulnerabilidades web comunes.
* **Manejo Centralizado de Errores:** Respuestas estandarizadas en formato JSON para excepciones del sistema, errores de validacion y fallos de autenticacion.
* **Estructura Modular Clean Architecture:** Separacion estricta entre capa de ruteo, controladores, middlewares, servicios y modelos.

---

## Stack Tecnologico

| Tecnologia | Funcion | Descripcion |
| --- | --- | --- |
| **Node.js** | Runtime | Entorno de ejecucion JavaScript del lado del servidor. |
| **Express.js** | Framework Web | Infraestructura de ruteo, middlewares y controladores. |
| **pnpm** | Package Manager | Gestor de paquetes rapido, eficiente y determinista. |
| **JSON Web Token (JWT)** | Segurización | Estándar RFC 7519 para emision y validacion de tokens. |
| **Dotenv** | Configuracion | Carga dinámica de variables de entorno desde `.env`. |
| **Cors & Helmet** | Seguridad HTTP | Proteccion contra exploits conocidos y gestion de orígenes permitidos. |

---

## Arquitectura del Proyecto

El proyecto sigue una disposicion jerarquica limpia para facilitar la escalabilidad y el mantenimiento del codigo:

```text
.
├── src/
│   ├── config/          # Variables de entorno y configuraciones globales
│   ├── controllers/     # Controladores de peticiones HTTP
│   ├── middlewares/     # Middlewares de autenticacion, validacion y CORS
│   ├── models/          # Modelos de datos y esquemas
│   ├── routes/          # Definición de rutas y mapeo de endpoints
│   ├── services/        # Logica de negocio encapsulada y reutilizable
│   ├── utils/           # Utilidades (generación/verificación JWT, helpers)
│   └── app.js           # Inicialización del servidor Express
├── .env.example         # Plantilla de variables de entorno
├── .gitignore           # Exclusiones de control de versiones
├── package.json         # Definición de dependencias y scripts
├── pnpm-lock.yaml       # Archivo de bloqueo de versiones de pnpm
└── README.md            # Documentación general del repositorio
```

---

## Requisitos Previos e Instalacion

### Requisitos Previos

Asegurate de contar con el siguiente software instalado en tu entorno de desarrollo:

* **Node.js:** Version `18.0.0` o superior.
* **pnpm:** Version `8.0.0` o superior (instalable mediante `npm install -g pnpm`).

### Pasos de Instalacion

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/tu-repositorio.git
   cd tu-repositorio
   ```

2. **Instalar dependencias con pnpm:**
   ```bash
   pnpm install
   ```

3. **Configurar el archivo de entorno:**
   Copia el archivo de ejemplo `.env.example` y crea el archivo `.env`:
   ```bash
   cp .env.example .env
   ```

   Edita el archivo `.env` asignando valores reales a las variables:
   ```env
   PORT=4000
   NODE_ENV=development
   JWT_SECRET=tu_clave_secreta_altamente_segura_aqui
   JWT_EXPIRES_IN=7d
   ```

4. **Iniciar el servidor en modo desarrollo:**
   ```bash
   pnpm dev
   ```

   El servidor quedará escuchando en: `http://localhost:4000/api/v1`

---

## Autenticacion y Bearer Token

### Flujo de Trabajo del Token Bearer

```text
+-----------------------------------+
|  Cliente (Web / React Native)     |
+-----------------------------------+
                  |
                  | 1. POST /api/v1/auth/login (credenciales)
                  v
+-----------------------------------+
|        Servidor Express           |
+-----------------------------------+
                  |
                  | 2. Valida credenciales y firma JWT
                  v
+-----------------------------------+
|  Cliente almacena el Token        |
|  (localStorage / SecureStore)     |
+-----------------------------------+
                  |
                  | 3. Petición GET/POST con Header: Authorization: Bearer <TOKEN>
                  v
+-----------------------------------+
|  Middleware de Autenticación      |
+-----------------------------------+
                  |
                  +---> [ Invalid/Sin Token ] ---> Devuelve HTTP 401 Unauthorized
                  |
                  +---> [ Token Válido ]    ---> Permite acceso al controlador
```

### Formato de la Cabecera HTTP

Cualquier peticion dirigida a rutas protegidas **debe incluir** la siguiente cabecera HTTP:

```http
Authorization: Bearer <TU_JSON_WEB_TOKEN_AQUI>
```

---

## Integracion con Clientes (Web y React Native)

### 1. Cliente Web (React / Axios)

En la aplicacion web se puede configurar un interceptor global para adjuntar automáticamente la cabecera en cada peticion:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api/v1',
});

// Interceptor de peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};
```

### 2. Cliente Movil (React Native / Expo SecureStore)

En React Native, el token debe guardarse utilizando mecanismos de almacenamiento seguro como `expo-secure-store` o `react-native-keychain`.

```javascript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const mobileApi = axios.create({
  baseURL: 'https://api.tudominio.com/api/v1',
});

// Interceptor para inyectar token en React Native
mobileApi.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('user_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Funcion para inicio de sesion y almacenamiento seguro
export const login = async (email, password) => {
  const response = await mobileApi.post('/auth/login', { email, password });
  const { token } = response.data;

  // Almacenar de forma encriptada en el dispositivo
  await SecureStore.setItemAsync('user_token', token);
  return response.data;
};
```

---

## Documentacion de la API

### Endpoints Publicos

| Metodo | Endpoint | Descripcion | Body Payload |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Registro de nuevo usuario. | `{ "name", "email", "password" }` |
| `POST` | `/api/v1/auth/login` | Autenticación y obtención de token Bearer. | `{ "email", "password" }` |

### Endpoints Protegidos (Requieren Token Bearer)

| Metodo | Endpoint | Descripcion | Autenticacion |
| --- | --- | --- | --- |
| `GET` | `/api/v1/users/profile` | Consulta la información del usuario autenticado. | Requiere `Bearer Token` |
| `PUT` | `/api/v1/users/profile` | Actualiza la información del perfil del usuario. | Requiere `Bearer Token` |
| `GET` | `/api/v1/data/protected` | Retorna recursos restringidos del sistema. | Requiere `Bearer Token` |

### Ejemplos de Respuestas HTTP

#### Respuesta Exitosa de Autenticacion (HTTP 200 OK)

```json
{
  "status": "success",
  "message": "Autenticacion exitosa",
  "data": {
    "user": {
      "id": "usr_1029384756",
      "name": "Alex Dev",
      "email": "alex@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl8xMDI5Mzg0NzU2In0.sample_signature"
  }
}
```

#### Respuesta de Error por Token Faltante o Invalido (HTTP 401 Unauthorized)

```json
{
  "status": "error",
  "code": 401,
  "message": "Acceso denegado. No se proporciono un token Bearer valido o la sesion ha expirado."
}
```

---

## Comandos pnpm Disponibles

| Comando | Descripcion |
| --- | --- |
| `pnpm dev` | Inicia el servidor de desarrollo con recarga automatica en cambios. |
| `pnpm start` | Ejecuta el servidor optimizado para entornos de produccion. |
| `pnpm lint` | Ejecuta las verificaciones de analisis estatico de codigo. |
| `pnpm test` | Inicia la ejecucion de la suite de pruebas unitarias e integradas. |

---

## Seguridad y Buenas Practicas

1. **Claves de Firma Seguras:** La variable `JWT_SECRET` debe ser una cadena compleja generada aleatoriamente y almacenada de forma estricta en las variables de entorno.
2. **Encriptacion de Almacenamiento Movil:** En aplicaciones React Native nunca guardes tokens JWT en `AsyncStorage` plano. Emplea siempre soluciones basadas en KeyChain / Keystore.
3. **Servicio bajo HTTPS:** En produccion, la API siempre debe ser servida bajo HTTPS para prevenir ataques de interceptacion de credenciales (Man-in-the-Middle).
4. **Politicas CORS Restringidas:** Define explicitamente los dominios permitidos en la configuracion del middleware `cors` para evitar solicitudes web no autorizadas.

---

## Licencia

Este proyecto se encuentra bajo la licencia **MIT**. Para mas información, consulta el archivo `LICENSE`.