---
name: estado
description: Muestra el estado actual del proyecto Lookilla Store: cambios pendientes, último commit, y páginas disponibles.
allowed-tools: Bash
---

Muestra un resumen rápido del estado del proyecto Lookilla Store.

Ejecuta estos comandos en /c/Users/alexa/Documents/Pagina WEB/mi-catalogo:

1. `git status` — archivos modificados sin commit
2. `git log --oneline -5` — últimos 5 commits
3. `git diff --stat HEAD` — resumen de cambios pendientes

Luego muestra un resumen claro con:
- Cuántos archivos tienen cambios pendientes
- Cuál fue el último commit y cuándo
- Si hay algo por pushear a GitHub
- Recuerda que el sitio live está en: https://lookilla-store.vercel.app
- Panel admin en: https://lookilla-store.vercel.app/gestion-lk-2024/login
