# Backend API

## Requisitos
- Node.js >= 18
- MySQL

## Instalación

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Configura la base de datos:
   - Crea un archivo `.env` en la carpeta `backend` con el siguiente contenido:
     ```env
     DATABASE_URL="mysql://usuario:contraseña@localhost:3306/nombre_basedatos"
     ```
   - Reemplaza los valores con los de tu base de datos MySQL.

3. Inicializa Prisma y la base de datos:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

El backend estará disponible en http://localhost:4000 

---

### Siguientes pasos recomendados

1. **Prueba el endpoint directamente**  
   Usa Postman o curl para hacer una petición POST a:
   ```
   http://localhost:4000/api/expenses
   ```
   con un body como:
   ```json
   {
     "amount": 100,
     "description": "Test",
     "date": "2024-07-23T14:30:00.000Z",
     "userId": 1,
     "categoryId": 1
   }
   ```
   Si no ves logs en la consola del backend, la petición no está llegando.

2. **Verifica que el backend esté corriendo**  
   Debes ver en la terminal:  
   `Server running on port 4000`

3. **Verifica la URL en el frontend**  
   Asegúrate de que el frontend esté enviando las peticiones a `http://localhost:4000/api/expenses`.

4. **(Opcional) Agrega CORS al backend**  
   Si el frontend y backend corren en diferentes puertos, puede ser un problema de CORS. ¿Quieres que agregue soporte CORS al backend?

---

¿Puedes probar el endpoint con Postman/curl y decirme si ves logs en la consola del backend?  
¿O quieres que agregue CORS para descartar problemas de origen cruzado? 

---

¡Vamos a solucionarlo ya mismo!  
Voy a hacer un diagnóstico rápido y directo para que los datos se almacenen en la tabla `expense`.

---

## 1. **Verifica la conexión real a la base de datos**

Agrega este log en `backend/src/prisma/client.ts` para ver a qué base de datos se conecta Prisma:

```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('Prisma client initialized with DB:', process.env.DATABASE_URL);

export default prisma;
```

**Reinicia el backend** y fíjate qué URL aparece en la terminal.  
¿Es la base de datos correcta? ¿Coincide con la que revisás con MySQL?

---

## 2. **Prueba el endpoint directo y revisa logs**

Haz un POST directo con curl o Postman a:
```
http://localhost:4000/api/expenses
```
Body:
```json
{
  "amount": 100,
  "description": "Test",
  "date": "2024-07-23T14:30:00.000Z",
  "userId": 1,
  "categoryId": 1
}
```
¿Aparece algún log en la terminal?  
¿La respuesta es 201 o error?

---

## 3. **Verifica la tabla y la base de datos**

En tu consola de MySQL, ejecuta:
```sql
SELECT * FROM Expense;
```
¿Aparece el registro?

---

## 4. **¿Quieres que agregue un endpoint de debug para mostrar la base y los datos?**

Puedo crear un endpoint `/api/debug` que te muestre la base de datos conectada y los datos actuales.

---

## 5. **¿Quieres que revise el código del endpoint y lo reescriba desde cero?**

Puedo reescribir el endpoint de creación de gastos con logs y validaciones para que veas exactamente qué pasa.

---

**Decime cuál de estas opciones preferís:**
- Revisar la conexión y mostrar la base real.
- Crear un endpoint de debug.
- Reescribir el endpoint de creación de gastos con logs y validaciones.
- O si querés, hago todo junto.

¡Confirmame y lo hago YA! 