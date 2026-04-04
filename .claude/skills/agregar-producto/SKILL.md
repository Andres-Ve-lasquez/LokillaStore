---
name: agregar-producto
description: Guía paso a paso para agregar un nuevo producto a Lookilla Store desde el panel admin.
---

## Cómo agregar un producto a Lookilla Store

El proyecto usa el panel admin en producción para gestionar productos. No se edita código para agregar productos.

### Pasos:

1. Ve a **https://lookilla-store.vercel.app/gestion-lk-2024/login**
2. Ingresa la contraseña del admin
3. En la pestaña **📦 Productos**, completa el formulario:
   - **Nombre**: nombre del producto
   - **SKU**: código opcional (ej. LAZ-001)
   - **Descripción**: descripción del producto
   - **Precio**: en pesos chilenos (sin puntos ni comas)
   - **Stock**: cantidad disponible
   - **Stock mínimo**: cuándo alertar stock bajo (ej. 5)
   - **Colección**: categoría del producto
   - **Imagen**: sube una foto PNG o JPG
4. Haz clic en **Agregar producto**

### Colecciones disponibles actualmente:
Poleras, Relojes, Calcetines, Billeteras, Zapatillas, Cortavientos, Totebag, Tazas

### Notas:
- Las imágenes se guardan en base64 en MongoDB — usa imágenes pequeñas (< 500KB)
- El stock se descuenta automáticamente cuando se completa una compra con WebPay
- Si el stock llega al mínimo, aparece alerta en el panel admin

Si $ARGUMENTS contiene detalles de un producto específico, ayuda a preparar los datos para ingresar al formulario.
