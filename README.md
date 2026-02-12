# CRM Seguidores Instagram

Panel visual tipo Kanban para gestionar seguidores de Instagram. Permite mover seguidores entre columnas del funnel, asignar etiquetas, y llevar seguimiento con notas.

## Características

- **Tablero Kanban**: Arrastra y suelta seguidores entre columnas
- **Columnas personalizables**: Agrega, edita, elimina y reordena columnas del funnel
- **Etiquetas**: Crea etiquetas con colores y asígnalas a seguidores
- **Notas/Mensajes**: Historial de notas con fecha para cada seguidor
- **Búsqueda y filtros**: Busca por nombre o usuario, filtra por etiquetas
- **Persistencia**: La posición de los leads (columna y orden), seguidores, etiquetas y notas se guardan en base de datos (Vercel Postgres). En local o sin DB se usa localStorage como respaldo.
- **Exportar/Importar**: Backup y restauración de datos en JSON

## Requisitos

- Node.js 18+
- Para persistencia en producción: cuenta en [Vercel](https://vercel.com) y base de datos **Vercel Postgres** (o Neon) enlazada al proyecto.

## Desarrollo local

```bash
npm install
cp .env.example .env.local
```

Crea una base Postgres en el [dashboard de Vercel](https://vercel.com/dashboard) (Storage → Postgres) y copia la URL de conexión a `POSTGRES_URL` en `.env.local`. Opcional: ejecuta el script de migración en la consola SQL de Vercel (ver Deploy).

Si no configuras `POSTGRES_URL`, la app cargará y guardará en **localStorage**; la API devolverá error y el hook usará la caché local.

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
npm start
```

## Deploy en Vercel

1. Sube el proyecto a GitHub (o GitLab) y conecta el repositorio en [vercel.com](https://vercel.com).
2. Vercel detectará Next.js automáticamente.
3. En el proyecto de Vercel: **Storage** → **Create Database** → **Postgres** (Vercel Postgres / Neon). Enlaza la base al proyecto para que se inyecten las variables de entorno (`POSTGRES_URL`, etc.).
4. **Migración**: En la pestaña SQL del almacenamiento Postgres, ejecuta el contenido de `scripts/init-board-state.sql` (crea la tabla `board_state` e inserta la fila inicial).
5. Haz **Deploy** (o redeploy si ya estaba desplegado).

Tras el deploy, la posición de los leads, columnas, seguidores y etiquetas se guardan en la base de datos y persisten al recargar o usar otro dispositivo.
