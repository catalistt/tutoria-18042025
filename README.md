# TutorIA - Plataforma Educativa Potenciada por IA

TutorIA es una plataforma educativa en línea, alineada con el programa del Ministerio de Educación de Chile y potenciada por Inteligencia Artificial, que ofrece apoyo académico personalizado para estudiantes mediante rutas de aprendizaje dinámicas, asistencia contextual y elementos de gamificación.

![TutorIA Logo](frontend/public/logo192.png)

## Características Principales

### 1. Rutas de Aprendizaje Personalizadas

- Generación dinámica basada en el nivel actual del estudiante
- Adaptación progresiva según resultados y ritmo de aprendizaje
- Secuenciación inteligente de contenidos y dificultad
- Recomendaciones personalizadas para optimizar el aprendizaje

### 2. Chatbot Contextual

- Asistencia en tiempo real durante la resolución de problemas
- Contextualización con el historial académico del estudiante
- Explicaciones adaptadas al nivel de comprensión
- Sugerencias proactivas basadas en patrones de error detectados

### 3. Sistema de Gamificación

- Niveles de progreso con desbloqueo de contenido
- Insignias y logros por competencias adquiridas
- Rachas de estudio para fomentar constancia
- Desafíos semanales con recompensas específicas

### 4. Dashboard de Seguimiento

- Visualización de progreso por materia, unidad y habilidad
- Análisis de tendencias de aprendizaje
- Identificación de fortalezas y debilidades
- Métricas de engagement con la plataforma

## Tecnologías Utilizadas

### Frontend
- React
- Redux Toolkit
- Tailwind CSS
- Chart.js
- Framer Motion

### Backend
- Node.js
- Express
- MongoDB con Mongoose
- JWT para autenticación
- Socket.io

### IA
- OpenAI API
- Algoritmos de personalización propios

### DevOps
- Docker
- GitHub Actions
- MongoDB Atlas
- AWS

## Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- MongoDB (v5.0 o superior)
- NPM (v8 o superior)
- Docker y Docker Compose (opcional)

### Configuración Local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tutoria/tutoria-app.git
   cd tutoria-app
   ```

2. **Instalar dependencias**
   ```bash
   # Instalar dependencias del proyecto root
   npm install
   
   # Instalar dependencias del frontend
   cd frontend
   npm install
   
   # Instalar dependencias del backend
   cd ../backend
   npm install
   
   # Instalar dependencias del servicio IA
   cd ../ai-service
   npm install
   ```

3. **Configurar variables de entorno**
   - Copia los archivos `.env.example` a `.env` en cada directorio:
     ```bash
     cp .env.example .env
     cd frontend && cp .env.example .env
     cd ../backend && cp .env.example .env
     cd ../ai-service && cp .env.example .env
     ```
   - Edita los archivos `.env` con tus configuraciones

4. **Iniciar la aplicación en modo desarrollo**
   ```bash
   # Desde el directorio raíz
   npm run dev
   ```

5. **Acceder a la aplicación**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API: [http://localhost:5000](http://localhost:5000)
   - Servicio IA: [http://localhost:5001](http://localhost:5001)

### Configuración con Docker

1. **Configurar variables de entorno**
   - Copia el archivo `.env.example` a `.env` en el directorio raíz:
     ```bash
     cp .env.example .env
     ```
   - Edita el archivo `.env` con tus configuraciones

2. **Construir e iniciar los contenedores**
   ```bash
   docker-compose up -d
   ```

3. **Acceder a la aplicación**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API: [http://localhost:5000](http://localhost:5000)
   - Servicio IA: [http://localhost:5001](http://localhost:5001)

## Estructura del Proyecto

```
tutoria/
├── frontend/                   # Aplicación React
│   ├── public/                 # Archivos públicos
│   └── src/                    # Código fuente
│       ├── assets/             # Recursos estáticos
│       ├── components/         # Componentes React
│       ├── contexts/           # Contextos React
│       ├── hooks/              # Custom hooks
│       ├── layouts/            # Layouts de página
│       ├── pages/              # Páginas completas
│       ├── services/           # Servicios API
│       ├── store/              # Estado global Redux
│       ├── styles/             # Estilos globales
│       └── utils/              # Utilidades
│
├── backend/                    # Servidor Node.js/Express
│   └── src/                    # Código fuente
│       ├── config/             # Configuraciones
│       ├── controllers/        # Controladores
│       ├── middleware/         # Middleware
│       ├── models/             # Modelos Mongoose
│       ├── routes/             # Rutas API
│       ├── services/           # Servicios
│       └── utils/              # Utilidades
│
├── ai-service/                 # Microservicio de IA
│   └── src/                    # Código fuente
│       ├── controllers/        # Controladores
│       ├── models/             # Modelos
│       ├── services/           # Servicios IA
│       └── utils/              # Utilidades
│
├── docker-compose.yml          # Configuración Docker
└── README.md                   # Este archivo
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/reset-password` - Solicitar reseteo de contraseña
- `POST /api/auth/reset-password/:token` - Resetear contraseña

### Usuarios
- `GET /api/users/profile` - Obtener perfil del usuario
- `PUT /api/users/profile` - Actualizar perfil del usuario

### Materias
- `GET /api/materias` - Obtener todas las materias
- `GET /api/materias/:id` - Obtener materia específica
- `GET /api/materias/user/:userId` - Obtener materias del usuario

### Rutas de Aprendizaje
- `GET /api/rutas/usuario/:userId/materia/:materiaId` - Obtener ruta personalizada
- `POST /api/rutas/usuario/:userId/materia/:materiaId` - Crear/actualizar ruta
- `GET /api/rutas/usuario/:userId/materia/:materiaId/modulo/:moduloOrden/preguntas` - Obtener preguntas de un módulo

### Sesiones
- `POST /api/sesiones` - Crear sesión
- `PUT /api/sesiones/:sesionId` - Finalizar sesión
- `GET /api/sesiones/usuario/:userId` - Obtener historial de sesiones

### Gamificación
- `GET /api/gamificacion/usuario/:userId` - Obtener datos de gamificación
- `PUT /api/gamificacion/usuario/:userId/racha` - Actualizar racha diaria
- `PUT /api/gamificacion/usuario/:userId/desafio/:desafioId/completar` - Completar desafío

### Chatbot
- `POST /api/chatbot/mensaje` - Procesar mensaje
- `POST /api/chatbot/pregunta/:preguntaId/valoracion` - Valorar respuesta

## Contribuir

1. Haz un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Realiza tus cambios
4. Realiza commit de tus cambios (`git commit -m 'Add some amazing feature'`)
5. Sube tus cambios (`git push origin feature/amazing-feature`)
6. Abre un Pull Request

---

Desarrollado con ❤️ para estudiantes chilenos