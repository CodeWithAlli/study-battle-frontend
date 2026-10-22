# 🎓 Study Battle - Documentación del Proyecto

## 📋 Requisitos Previos
- **Backend:** Python 3.12+, FastAPI, spaCy (`es_core_news_sm`).
- **Frontend:** Node.js (v20+), React, Vite, Tailwind CSS.
- **Base de Datos:** Supabase (PostgreSQL + Realtime).

## 🚀 Cómo Ejecutar en Local
Para probar el proyecto en tu computadora, necesitas dos terminales:

**Terminal 1 (Backend):**
\`\`\`bash
cd backend
source venv/Scripts/activate  # En Windows
uvicorn main:app --reload --port 8000
\`\`\`

**Terminal 2 (Frontend):**
\`\`\`bash
cd frontend
npm run dev
\`\`\`

## ✅ Checklist de Pruebas - FASE 3 (El Juego)

Sigue estos pasos para verificar que la Fase 3 está completa y funcionando:

### A. Flujo del Profesor (Anfitrión)
- [ ] El profesor entra a `http://localhost:5173/create`.
- [ ] Pega un texto de al menos 3 oraciones (Ej: "Marie Curie descubrió el polonio..."). Pide 3 preguntas.
- [ ] Hace clic en "Generar Preguntas". (Nota: Si el backend en Render está dormido, tardará ~30s. Local es instantáneo).
- [ ] Es redirigido al **Lobby** y ve el código de sala.
- [ ] Al menos un alumno se une en otra ventana (incógnito).
- [ ] El profesor ve al alumno aparecer **en tiempo real**.
- [ ] El profesor hace clic en "Empezar Partida".
- [ ] El profesor ve la pantalla de juego. **No ve los botones de x1/x2/x3**, solo ve las opciones de respuesta bloqueadas y el reloj corriendo.

### B. Flujo del Alumno (Jugador)
- [ ] El alumno entra a `http://localhost:5173/join`.
- [ ] Ingresa el código y su nombre.
- [ ] Entra al Lobby y ve el mensaje "Esperando al profesor...".
- [ ] Al iniciar la partida, ve la pregunta y **los 3 botones de multiplicador** (x1, x2, x3).
- [ ] Selecciona "x3" y luego hace clic en una opción de respuesta.
- [ ] **Verde/Rojo:** Ve inmediatamente si acertó (verde) o falló (rojo), y las demás opciones se bloquean.

### C. Temporizador (Timer) y Sincronización
- [ ] Al iniciar una pregunta, el reloj (barra superior) empieza a bajar de 20 a 0.
- [ ] Si el tiempo llega a 0 antes de que el alumno responda, **la respuesta se revela automáticamente** (se muestra en verde la correcta) y el alumno ya no puede elegir.
- [ ] **El Profe hace clic en "Siguiente Pregunta"**.
- [ ] El alumno (sin recargar la página) ve la Pregunta 2 y su reloj se reinicia a 20.

### D. Base de Datos (Verificación en Supabase)
- [ ] Ve a Supabase → Table Editor → `answers`.
- [ ] Verifica que cada respuesta del alumno esté guardada con su `multiplier` (1, 2 o 3), `is_correct` (true/false) y `delta` (ej: 300 o -200).
- [ ] Ve a `players` y verifica que el `score` del alumno se haya sumado o restado correctamente.

---

## ⚠️ Solución de Problemas Comunes (Troubleshooting)
- **Error RLS al dar "Siguiente pregunta":** Ejecuta en Supabase SQL Editor:
  `create policy "public update games" on public.games for update to anon using (true);`
- **No cargan las preguntas (Local):** Verifica que el backend esté corriendo en `http://localhost:8000` y que en el `.env` del frontend la variable `VITE_API_URL` apunte a local si estás probando local, o a Render si estás probando en la nube.
- **El alumno no aparece en tiempo real:** Ve a Supabase → Database → Replication y asegúrate de que `players` esté en la publicación `supabase_realtime`.
