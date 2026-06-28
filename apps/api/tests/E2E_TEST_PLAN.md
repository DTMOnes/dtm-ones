# E2E Test Plan

## Objetivo

Definir una matriz clara de pruebas e2e para los routers de FastAPI, cubriendo el contrato observable de cada endpoint: autenticacion, roles, respuestas exitosas, errores relevantes y datos necesarios para ejecutar los escenarios.

Este documento es una guia editable para implementar los tests mas adelante. No contiene codigo de tests.

## Reglas De Alcance

- Probar los endpoints montados por `apps/api/src/main.py`.
- Validar comportamiento HTTP real: metodo, path, status code, payload de respuesta y efectos persistidos en base de datos cuando aplique.
- Usar requests con campos `camelCase`, ya que los schemas aceptan y emiten aliases camelCase.
- Cubrir errores de autenticacion comunes en endpoints protegidos: sin bearer token, token invalido y usuario eliminado.
- Cubrir errores de autorizacion en endpoints admin con un usuario autenticado de rol `user`.
- Cubrir validaciones 422 importantes de Pydantic, sin intentar testear exhaustivamente cada combinacion de longitud/campo si ya hay una muestra representativa por schema.
- Mockear servicios externos como blob storage para no depender de red ni de infraestructura externa.
- No modificar codigo de la API como parte de este plan.
- No escribir tests hasta que se tome esta matriz como referencia.

## Fixtures Base

- `api_client`: cliente HTTP async contra la app FastAPI.
- `db_session`: sesion de base de datos aislada por test, con limpieza entre casos.
- `user_factory`: crea usuarios con email, password hasheada y rol.
- `admin_user`: usuario con rol `admin`.
- `regular_user`: usuario con rol `user`.
- `admin_token`: access token valido para `admin_user`.
- `regular_user_token`: access token valido para `regular_user`.
- `invalid_token`: bearer token malformado o firmado con otra clave.
- `auth_headers(user_or_token)`: helper para construir `Authorization: Bearer ...`.
- `refresh_token_factory`: crea refresh tokens validos, revocados o expirados.
- `category_factory`: crea categorias.
- `player_factory`: crea players.
- `player_category_factory`: vincula players con categorias.
- `player_media_factory`: crea media de tipo `image`, `institutional_picture` o `video`.
- `contact_request_factory`: crea solicitudes de contacto.
- `blob_put_mock`: mock de `services.blob.put` que devuelve una URL estable.
- `blob_delete_mock`: mock de `services.blob.delete`; debe aceptar tanto `str` como `list[str]`.
- `image_upload_file`: archivo multipart pequeno con content type permitido.
- `valid_youtube_url`: URL valida de YouTube, por ejemplo `https://www.youtube.com/watch?v=dQw4w9WgXcQ`.
- Los ids de `User` y `RefreshToken` son `str`; los ids de categorias, players, player media y contact requests son UUID.

## Matriz De Endpoints

| Endpoint | Auth | Rol | Happy path | Errores importantes | Fixtures |
|---|---:|---:|---|---|---|
| `GET /health` | No | Ninguno | Devuelve `{"status":"ok"}`. | Ninguno relevante. | `api_client` |
| `POST /auth/login` | No | Ninguno | Login con email case-insensitive; devuelve `access_token`, `refresh_token`, `token_type`, `expires_in` y `user`. | 401 credenciales invalidas; 422 email invalido o password vacio. | `regular_user` |
| `POST /auth/refresh` | No | Ninguno | Refresh valido emite nuevo access/refresh token y revoca el token anterior. | 401 token inexistente, revocado o expirado; 401 usuario eliminado; 422 `refresh_token` vacio. | `regular_user`, `refresh_token_factory` |
| `POST /auth/logout` | No | Ninguno | Revoca refresh token valido y responde mensaje de exito. | Token inexistente tambien responde exito; 422 `refresh_token` vacio. | `refresh_token_factory` |
| `GET /auth/me` | Si | Usuario existente | Devuelve el usuario asociado al bearer token. | 401 sin token; 401 token invalido; 401 refresh token usado como access token; 401 usuario eliminado. | `regular_user_token`, `admin_token`, `invalid_token` |
| `GET /categories` | No | Ninguno | Lista categorias ordenadas por creacion desc con `player_count`; filtra por `q`. | 422 `q` vacio; 422 `q` mayor a 50 caracteres. | `category_factory`, `player_factory`, `player_category_factory` |
| `GET /categories/{category_id}` | No | Ninguno | Devuelve categoria con lista de players. | 404 categoria inexistente; 422 UUID invalido. | `category_factory`, `player_factory`, `player_category_factory` |
| `POST /categories` | Si | Usuario existente | Crea categoria con status `201` y devuelve `id`, `name`, `created_at`, `updated_at`. | 401 sin token; 401 token invalido; 422 nombre vacio o mayor a 100 caracteres. | `regular_user_token` |
| `PATCH /categories/{category_id}` | Si | Usuario existente | Actualiza nombre de categoria. | 404 categoria inexistente; 401 auth; 422 UUID invalido; 422 nombre invalido. | `regular_user_token`, `category_factory` |
| `DELETE /categories/{category_id}` | Si | Usuario existente | Borra categoria y responde mensaje de exito. | 404 categoria inexistente; 401 auth; 422 UUID invalido. | `regular_user_token`, `category_factory` |
| `DELETE /categories/{category_id}/players/{player_id}` | Si | Usuario existente | Remueve la relacion entre player y categoria. | 404 si no existe la relacion, incluyendo categoria inexistente, player inexistente o player que no pertenece a la categoria; 401 auth; 422 UUID invalido. | `regular_user_token`, `category_factory`, `player_factory`, `player_category_factory` |
| `GET /players` | No | Ninguno | Lista players ordenados por creacion desc con categorias y media; filtra por `q`; filtra por una o varias categorias con `c`. | 404 categoria filtrada inexistente; 422 `q` vacio; 422 `q` mayor a 50 caracteres; no afirmar 422 para `c` con UUID invalido sin confirmarlo ejecutando contra DB. | `player_factory`, `category_factory`, `player_category_factory`, `player_media_factory` |
| `GET /players/{player_id}` | No | Ninguno | Devuelve player con categorias y media. | 404 player inexistente; 422 UUID invalido. | `player_factory`, `category_factory`, `player_category_factory`, `player_media_factory` |
| `POST /players` | Si | Usuario existente | Crea player con status `201`, con o sin categorias. | 404 categoria inexistente; 401 auth; 422 campos vacios o mayores al maximo; 422 categorias duplicadas. | `regular_user_token`, `category_factory` |
| `PATCH /players/{player_id}` | Si | Usuario existente | Actualiza campos parciales; reemplaza categorias cuando se envia `category_ids`. | 404 player inexistente; 404 categoria inexistente; 401 auth; 422 UUID invalido; 422 campos invalidos; 422 categorias duplicadas. | `regular_user_token`, `player_factory`, `category_factory`, `player_category_factory` |
| `DELETE /players/{player_id}` | Si | Usuario existente | Borra player; si tiene imagenes, invoca borrado de blobs. | 404 player inexistente; 401 auth; 422 UUID invalido; fallo del blob service si se decide cubrir. | `regular_user_token`, `player_factory`, `player_media_factory`, `blob_delete_mock` |
| `POST /players/{player_id}/media/image` | Si | Usuario existente | Sube imagen multipart con campo form `media_type=image` o `media_type=institutional_picture`; crea media con status `201` y devuelve URL. | 400 media type invalido; 400 content type no soportado; 404 player inexistente; 401 auth; 422 UUID o multipart invalido. | `regular_user_token`, `player_factory`, `image_upload_file`, `blob_put_mock` |
| `POST /players/{player_id}/media/video` | Si | Usuario existente | Agrega media de video con status `201` y URL valida de YouTube. | 404 player inexistente; 401 auth; 422 URL no YouTube; 422 UUID invalido. | `regular_user_token`, `player_factory`, `valid_youtube_url` |
| `DELETE /player-media/{media_id}` | Si | Usuario existente | Borra video; borra imagen y llama a blob delete si el media es `image` o `institutional_picture`. | 404 media inexistente; 401 auth; 422 UUID invalido; fallo del blob service si se decide cubrir. | `regular_user_token`, `player_media_factory`, `blob_delete_mock` |
| `GET /users` | Si | Admin | Lista usuarios ordenados por creacion desc. | 401 sin token; 401 token invalido; 403 usuario normal. | `admin_token`, `regular_user_token`, `user_factory` |
| `GET /users/{user_id}` | Si | Admin | Devuelve detalle de usuario con `admin_count` e `is_only_admin`. | 404 usuario inexistente; 401/403 auth. | `admin_token`, `admin_user`, `regular_user`, `user_factory` |
| `POST /users` | Si | Admin | Crea usuario o admin con status `201`; normaliza email a lowercase. | 409 email duplicado; 401/403 auth; 422 email invalido; 422 password menor a 8; 422 nombre vacio; 422 rol fuera de `user` o `admin`. | `admin_token`, `regular_user_token`, `user_factory` |
| `PATCH /users/{user_id}` | Si | Admin | Actualiza nombre/email; normaliza email a lowercase. | 404 usuario inexistente; 409 email duplicado; 401/403 auth; 422 email o nombre invalido. | `admin_token`, `user_factory` |
| `PATCH /users/{user_id}/password` | Si | Admin | Cambia password y permite login con la nueva password. | 404 usuario inexistente; 401/403 auth; 422 password menor a 8; 422 confirmacion distinta. | `admin_token`, `user_factory` |
| `PATCH /users/{user_id}/role` | Si | Admin | Cambia rol entre `user` y `admin`. | 400 no quitar rol admin al unico admin; 404 usuario inexistente; 401/403 auth; 422 rol invalido. | `admin_token`, `admin_user`, `regular_user`, `user_factory` |
| `DELETE /users/{user_id}` | Si | Admin | Borra otro usuario. | 400 no borrar el unico admin; 400 no borrar la propia cuenta; 404 usuario inexistente; 401/403 auth. | `admin_token`, `admin_user`, `regular_user`, `user_factory` |
| `GET /contact-requests` | Si | Admin | Lista solicitudes ordenadas por creacion desc. | 401 sin token; 401 token invalido; 403 usuario normal. | `admin_token`, `regular_user_token`, `contact_request_factory` |
| `POST /contact-requests` | No | Ninguno | Crea solicitud publica con status `201` y devuelve mensaje de exito. | 422 email invalido; 422 mensaje vacio; 422 mensaje mayor a 5000 caracteres. | `api_client` |
| `DELETE /contact-requests/{request_id}` | Si | Admin | Borra solicitud de contacto. | 404 solicitud inexistente; 401/403 auth; 422 UUID invalido. | `admin_token`, `contact_request_factory` |

## Riesgos A Validar

- La rotacion de refresh tokens debe revocar el token anterior; reutilizarlo tiene que fallar con 401.
- Los endpoints protegidos dependen de que el usuario siga existiendo al momento del request.
- Los endpoints admin no deben aceptar usuarios autenticados con rol `user`.
- Las respuestas y request bodies JSON de FastAPI deben mantenerse en `snake_case`, especialmente `created_at`, `updated_at`, `refresh_token`, `expires_in`, `category_ids`, `player_count`, `media_type`, `admin_count` e `is_only_admin`.
- El upload multipart de imagenes tambien recibe el campo form `media_type`.
- Los filtros de players por multiples categorias deben devolver solo players que pertenezcan a todas las categorias pedidas.
- El borrado de players y media debe limpiar blobs solo para tipos de imagen: `image` e `institutional_picture`; los videos no deben llamar al blob service.
- El mock de borrado de blobs debe cubrir delete de player con multiples URLs y delete de media con una URL unica.
- Las operaciones que cambian categorias de un player deben reemplazar relaciones sin dejar vinculos viejos.
- Las reglas de unico admin deben impedir degradar o borrar al ultimo administrador.
- La creacion y actualizacion de usuarios deben normalizar email a lowercase y manejar duplicados con 409.
- Los tests de upload multipart deben aislar el storage externo mediante mocks deterministas.
- Los errores 422 generados por Pydantic pueden cambiar en estructura entre versiones; conviene afirmar status code y campos clave, no snapshots completos salvo que sean estables.
- No afirmar orden de listas anidadas (`players`, `categories` o `media`) salvo que el codigo agregue un `order_by` explicito.
- El comportamiento de errores de blob service y de `GET /players?c=<uuid-invalido>` no puede confirmarse solo por validacion de FastAPI/Pydantic; dejarlo como duda hasta ejecutarlo o definir manejo explicito.

## Orden Recomendado De Implementacion De Tests

1. Infraestructura base: `api_client`, `db_session`, factories, helpers de auth headers y limpieza de base de datos.
2. Auth: `login`, `refresh`, `logout` y `me`, porque desbloquean los helpers para el resto de endpoints.
3. Autorizacion transversal: casos comunes 401/403 para usuario regular y admin.
4. Lecturas publicas: `health`, `GET /categories`, `GET /categories/{id}`, `GET /players`, `GET /players/{id}`.
5. Mutaciones de categorias y players sin media, incluyendo validaciones 404/422.
6. Media de players, con mocks de blob para upload y delete.
7. Usuarios admin, especialmente duplicados, cambio de password, cambio de rol y reglas de unico admin.
8. Contact requests: creacion publica, listado admin y borrado.
9. Casos de regresion de mayor riesgo: refresh token reuse, filtros por multiples categorias, reglas de unico admin y limpieza de blobs.
