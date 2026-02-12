-- Tabla para persistir el estado del tablero CRM (posición de leads, columnas, seguidores, etiquetas).
-- Ejecutar este script una vez en la base de datos (Vercel Postgres / Neon) tras enlazar el proyecto.

CREATE TABLE IF NOT EXISTS board_state (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fila inicial para el board por defecto (estado vacío válido: columnas por defecto, sin seguidores).
-- La app rellenará con getInitialBoardState() si data está vacío; este INSERT evita errores en el primer GET.
INSERT INTO board_state (id, data, updated_at)
VALUES (
  'default',
  '{"columns":[{"id":"col-default-1","title":"Nuevo","order":0,"followerIds":[]},{"id":"col-default-2","title":"Contactado","order":1,"followerIds":[]},{"id":"col-default-3","title":"Interesado","order":2,"followerIds":[]},{"id":"col-default-4","title":"Negociación","order":3,"followerIds":[]},{"id":"col-default-5","title":"Cliente","order":4,"followerIds":[]},{"id":"col-default-6","title":"Perdido","order":5,"followerIds":[]}],"followers":{},"tags":[{"id":"tag-1","name":"VIP","color":"#f59e0b"},{"id":"tag-2","name":"Prioritario","color":"#ef4444"},{"id":"tag-3","name":"Seguimiento","color":"#3b82f6"}]}'::jsonb,
  NOW()
)
ON CONFLICT (id) DO NOTHING;
