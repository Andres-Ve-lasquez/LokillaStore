---
name: deploy
description: Hace commit de todos los cambios pendientes y los sube a GitHub (Vercel se despliega automáticamente). Uso: /deploy "mensaje del commit"
argument-hint: "mensaje del commit"
allowed-tools: Bash
---

Haz commit de todos los cambios pendientes en el proyecto Lookilla Store y súbelos a GitHub.

Mensaje del commit: $ARGUMENTS

Pasos:
1. Ejecuta `git status` para ver qué archivos cambiaron
2. Ejecuta `git add -A` para agregar todos los cambios
3. Crea el commit con el mensaje proporcionado en $ARGUMENTS (si no hay mensaje, usa uno descriptivo basado en los cambios)
4. Ejecuta `git push` para subir a GitHub
5. Informa que Vercel desplegará automáticamente en ~1-2 minutos en https://lookilla-store.vercel.app

Trabaja en el directorio: /c/Users/alexa/Documents/Pagina WEB/mi-catalogo
