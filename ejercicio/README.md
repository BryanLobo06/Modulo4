# Sistema de Gestión de Biblioteca

Una aplicación web completa para gestionar una biblioteca con empleados, estudiantes, libros y préstamos. 
Desarrollada con Node.js, Express, MySQL y tecnologías web modernas.

## 🚀 Características

- **Gestión completa de empleados**: Crear, leer, actualizar y eliminar empleados
- **Gestión de estudiantes**: Administrar información de estudiantes y sus carreras
- **Catálogo de libros**: Gestionar libros con ISBN, título y autor
- **Sistema de préstamos**: Registrar y gestionar préstamos de libros
- **Interfaz moderna**: Diseño responsive y amigable
- **Validaciones**: Verificación de integridad referencial
- **API RESTful**: Endpoints bien estructurados
- **Seguridad**: Configuración de seguridad con Helmet y rate limiting

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web
- **MySQL2**: Driver de MySQL
- **Helmet**: Seguridad HTTP
- **CORS**: Cross-Origin Resource Sharing
- **dotenv**: Variables de entorno

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos y responsive
- **JavaScript ES6+**: Funcionalidad dinámica
- **Font Awesome**: Iconos

### Base de Datos
- **MySQL**: Sistema de gestión de base de datos

## 📋 Requisitos Previos

- Node.js (versión 14 o superior)
- MySQL (versión 5.7 o superior)
- npm o yarn

## 🔧 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/BryanLobo06/Modulo4.git
cd biblioteca-app
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar la base de datos

#### Opción A: Usar el archivo SQL proporcionado
1. Importa el archivo `biblioteca.sql` en tu servidor MySQL
2. Crea la base de datos `biblioteca` si no existe

#### Opción B: Crear manualmente
Ejecuta las siguientes consultas SQL:

```sql
CREATE DATABASE IF NOT EXISTS biblioteca;
USE biblioteca;

CREATE TABLE empleados (
  id_empleado int(11) NOT NULL AUTO_INCREMENT,
  nombre_empleado varchar(100) NOT NULL,
  PRIMARY KEY (id_empleado)
);

CREATE TABLE estudiantes (
  id_estudiante int(11) NOT NULL,
  nombre_estudiante varchar(100) NOT NULL,
  carrera varchar(100) NOT NULL,
  PRIMARY KEY (id_estudiante)
);

CREATE TABLE libros (
  isbn varchar(20) NOT NULL,
  titulo varchar(255) NOT NULL,
  autor varchar(100) NOT NULL,
  PRIMARY KEY (isbn)
);

CREATE TABLE prestamos (
  id_prestamo int(11) NOT NULL AUTO_INCREMENT,
  id_estudiante int(11) NOT NULL,
  isbn varchar(20) NOT NULL,
  fecha_prestamo date NOT NULL,
  fecha_devolucion date DEFAULT NULL,
  id_empleado_responsable int(11) NOT NULL,
  PRIMARY KEY (id_prestamo),
  FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante),
  FOREIGN KEY (isbn) REFERENCES libros(isbn),
  FOREIGN KEY (id_empleado_responsable) REFERENCES empleados(id_empleado)
);
```

Edita el archivo `.env` con tus credenciales:

```env
# Configuración de la base de datos
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=biblioteca
DB_PORT=3306

# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de seguridad
JWT_SECRET=tu_secreto_jwt_aqui
```

### 4. Ejecutar la aplicación

#### Modo desarrollo (con nodemon)
```bash
npm run dev
```

#### Modo producción
```bash
npm start
```

La aplicación estará disponible en: `http://localhost:5500`

## 📖 Uso

### Interfaz Web

1. **Navegación**: Usa las pestañas para cambiar entre las diferentes secciones
2. **Agregar registros**: Haz clic en "Nuevo [Entidad]" para crear nuevos registros
3. **Editar**: Usa el botón "Editar" en cada fila para modificar registros
4. **Eliminar**: Usa el botón "Eliminar" para borrar registros (con confirmación)

### API Endpoints

#### Empleados
- `GET /api/empleados` - Obtener todos los empleados
- `GET /api/empleados/:id` - Obtener un empleado específico
- `POST /api/empleados` - Crear un nuevo empleado
- `PUT /api/empleados/:id` - Actualizar un empleado
- `DELETE /api/empleados/:id` - Eliminar un empleado

#### Estudiantes
- `GET /api/estudiantes` - Obtener todos los estudiantes
- `GET /api/estudiantes/:id` - Obtener un estudiante específico
- `POST /api/estudiantes` - Crear un nuevo estudiante
- `PUT /api/estudiantes/:id` - Actualizar un estudiante
- `DELETE /api/estudiantes/:id` - Eliminar un estudiante

#### Libros
- `GET /api/libros` - Obtener todos los libros
- `GET /api/libros/:isbn` - Obtener un libro específico
- `POST /api/libros` - Crear un nuevo libro
- `PUT /api/libros/:isbn` - Actualizar un libro
- `DELETE /api/libros/:isbn` - Eliminar un libro

#### Préstamos
- `GET /api/prestamos` - Obtener todos los préstamos con información relacionada
- `GET /api/prestamos/:id` - Obtener un préstamo específico
- `POST /api/prestamos` - Crear un nuevo préstamo
- `PUT /api/prestamos/:id` - Actualizar un préstamo
- `DELETE /api/prestamos/:id` - Eliminar un préstamo
- `GET /api/prestamos/estudiante/:id` - Obtener préstamos por estudiante
- `GET /api/prestamos/libro/:isbn` - Obtener préstamos por libro

## 🔒 Seguridad

- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configuración de Cross-Origin Resource Sharing
- **Rate Limiting**: Limitación de requests por IP
- **Validación de datos**: Verificación de entrada en el servidor
- **Integridad referencial**: Verificación de relaciones antes de eliminar

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
1. Verifica que MySQL esté ejecutándose
2. Confirma las credenciales en el archivo `.env`
3. Asegúrate de que la base de datos `biblioteca` exista

### Error de puerto en uso
Cambia el puerto en el archivo `.env`:
```env
PORT=3001
```

### Error de dependencias
```bash
rm -rf node_modules package-lock.json
npm install

```
