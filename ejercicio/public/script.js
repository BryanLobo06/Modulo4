// Configuración de la API
const API_BASE_URL = '/api';

// Variables globales
let currentEditId = null;
let currentEditType = null;

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Función de inicialización
function initializeApp() {
    setupTabNavigation();
    setupFormSubmissions();
    setupModalButtons();
    loadInitialData();
    setCurrentDate();
}

// Configurar navegación por pestañas
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remover clase active de todos los botones y contenidos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Agregar clase active al botón clickeado y su contenido
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Cargar datos de la pestaña seleccionada
            loadTabData(targetTab);
        });
    });
}

// Configurar envío de formularios
function setupFormSubmissions() {
    // Formulario de empleados
    document.getElementById('empleado-form').addEventListener('submit', handleEmpleadoSubmit);
    
    // Formulario de estudiantes
    document.getElementById('estudiante-form').addEventListener('submit', handleEstudianteSubmit);
    
    // Formulario de libros
    document.getElementById('libro-form').addEventListener('submit', handleLibroSubmit);
    
    // Formulario de préstamos
    document.getElementById('prestamo-form').addEventListener('submit', handlePrestamoSubmit);
}

// Configurar botones de modales
function setupModalButtons() {
    // Botones para abrir modales
    document.getElementById('btn-nuevo-empleado').addEventListener('click', () => showModal('empleado'));
    document.getElementById('btn-nuevo-estudiante').addEventListener('click', () => showModal('estudiante'));
    document.getElementById('btn-nuevo-libro').addEventListener('click', () => showModal('libro'));
    document.getElementById('btn-nuevo-prestamo').addEventListener('click', () => showModal('prestamo'));
    
    // Botones para cerrar modales
    document.getElementById('close-empleado').addEventListener('click', () => closeModal('empleado'));
    document.getElementById('close-estudiante').addEventListener('click', () => closeModal('estudiante'));
    document.getElementById('close-libro').addEventListener('click', () => closeModal('libro'));
    document.getElementById('close-prestamo').addEventListener('click', () => closeModal('prestamo'));
    
    // Botones cancelar
    document.getElementById('cancel-empleado').addEventListener('click', () => closeModal('empleado'));
    document.getElementById('cancel-estudiante').addEventListener('click', () => closeModal('estudiante'));
    document.getElementById('cancel-libro').addEventListener('click', () => closeModal('libro'));
    document.getElementById('cancel-prestamo').addEventListener('click', () => closeModal('prestamo'));
}

// Cargar datos iniciales
function loadInitialData() {
    loadTabData('empleados');
}

// Cargar datos de una pestaña específica
function loadTabData(tabName) {
    switch(tabName) {
        case 'empleados':
            loadEmpleados();
            break;
        case 'estudiantes':
            loadEstudiantes();
            break;
        case 'libros':
            loadLibros();
            break;
        case 'prestamos':
            loadPrestamos();
            break;
    }
}

// Establecer fecha actual en campos de fecha
function setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    const fechaPrestamo = document.getElementById('prestamo-fecha');
    if (fechaPrestamo) {
        fechaPrestamo.value = today;
    }
}

// ==================== FUNCIONES PARA EMPLEADOS ====================

async function loadEmpleados() {
    try {
        const response = await fetch(`${API_BASE_URL}/empleados`);
        const data = await response.json();
        
        if (data.success) {
            renderEmpleadosTable(data.data);
        } else {
            showToast('Error al cargar empleados', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    }
}

function renderEmpleadosTable(empleados) {
    const tbody = document.querySelector('#empleados-table tbody');
    tbody.innerHTML = '';
    
    empleados.forEach(empleado => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${empleado.id_empleado}</td>
            <td>${empleado.nombre_empleado}</td>
            <td>
                <button class="btn btn-warning btn-sm btn-edit-empleado" data-id="${empleado.id_empleado}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm btn-delete-empleado" data-id="${empleado.id_empleado}">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        
        // Agregar event listeners a los botones
        const editBtn = row.querySelector('.btn-edit-empleado');
        const deleteBtn = row.querySelector('.btn-delete-empleado');
        
        editBtn.addEventListener('click', () => editEmpleado(empleado.id_empleado));
        deleteBtn.addEventListener('click', () => deleteEmpleado(empleado.id_empleado));
        
        tbody.appendChild(row);
    });
}

async function handleEmpleadoSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const empleadoData = {
        nombre_empleado: formData.get('nombre_empleado')
    };
    
    try {
        const url = currentEditId 
            ? `${API_BASE_URL}/empleados/${currentEditId}`
            : `${API_BASE_URL}/empleados`;
        
        const method = currentEditId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(empleadoData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            closeModal('empleado');
            loadEmpleados();
            resetForm('empleado-form');
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    }
}

async function editEmpleado(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/empleados/${id}`);
        const data = await response.json();
        
        if (data.success) {
            currentEditId = id;
            currentEditType = 'empleado';
            
            document.getElementById('empleado-nombre').value = data.data.nombre_empleado;
            document.getElementById('empleado-modal-title').textContent = 'Editar Empleado';
            
            showModal('empleado');
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    }
}

async function deleteEmpleado(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/empleados/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            loadEmpleados();
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    }
}

// ==================== FUNCIONES PARA ESTUDIANTES ====================

async function loadEstudiantes() {
    try {
        const response = await fetch(`${API_BASE_URL}/estudiantes`);
        const data = await response.json();
        
        if (data.success) {
            renderEstudiantesTable(data.data);
        } else {
            showToast('Error al cargar estudiantes', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    }
}

function renderEstudiantesTable(estudiantes) {
    const tbody = document.querySelector('#estudiantes-table tbody');
    tbody.innerHTML = '';
    
    estudiantes.forEach(estudiante => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${estudiante.id_estudiante}</td>
            <td>${estudiante.nombre_estudiante}</td>
            <td>${estudiante.carrera}</td>
            <td>
                <button class="btn btn-warning btn-sm btn-edit-estudiante" data-id="${estudiante.id_estudiante}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm btn-delete-estudiante" data-id="${estudiante.id_estudiante}">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        
        // Agregar event listeners a los botones
        const editBtn = row.querySelector('.btn-edit-estudiante');
        const deleteBtn = row.querySelector('.btn-delete-estudiante');
        
        editBtn.addEventListener('click', () => editEstudiante(estudiante.id_estudiante));
        deleteBtn.addEventListener('click', () => deleteEstudiante(estudiante.id_estudiante));
        
        tbody.appendChild(row);
    });
}

async function handleEstudianteSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const estudianteData = {
        id_estudiante: formData.get('id_estudiante'),
        nombre_estudiante: formData.get('nombre_estudiante'),
        carrera: formData.get('carrera')
    };
    
    try {
        const url = currentEditId 
            ? `${API_BASE_URL}/estudiantes/${currentEditId}`
            : `${API_BASE_URL}/estudiantes`;
        
        const method = currentEditId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(estudianteData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            closeModal('estudiante');
            loadEstudiantes();
            resetForm('estudiante-form');
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    }
}

async function editEstudiante(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/estudiantes/${id}`);
        const data = await response.json();
        
        if (data.success) {
            currentEditId = id;
            currentEditType = 'estudiante';
            
            document.getElementById('estudiante-id').value = data.data.id_estudiante;
            document.getElementById('estudiante-nombre').value = data.data.nombre_estudiante;
            document.getElementById('estudiante-carrera').value = data.data.carrera;
            document.getElementById('estudiante-modal-title').textContent = 'Editar Estudiante';
            
            showModal('estudiante');
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    }
}

async function deleteEstudiante(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este estudiante?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/estudiantes/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            loadEstudiantes();
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    }
}

// ==================== FUNCIONES PARA LIBROS ====================

async function loadLibros() {
    try {
        const response = await fetch(`${API_BASE_URL}/libros`);
        const data = await response.json();
        
        if (data.success) {
            renderLibrosTable(data.data);
        } else {
            showToast('Error al cargar libros', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    }
}

function renderLibrosTable(libros) {
    const tbody = document.querySelector('#libros-table tbody');
    tbody.innerHTML = '';
    
    libros.forEach(libro => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${libro.isbn}</td>
            <td>${libro.titulo}</td>
            <td>${libro.autor}</td>
            <td>
                <button class="btn btn-warning btn-sm btn-edit-libro" data-isbn="${libro.isbn}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm btn-delete-libro" data-isbn="${libro.isbn}">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        
        // Agregar event listeners a los botones
        const editBtn = row.querySelector('.btn-edit-libro');
        const deleteBtn = row.querySelector('.btn-delete-libro');
        
        editBtn.addEventListener('click', () => editLibro(libro.isbn));
        deleteBtn.addEventListener('click', () => deleteLibro(libro.isbn));
        
        tbody.appendChild(row);
    });
}

async function handleLibroSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const libroData = {
        isbn: formData.get('isbn'),
        titulo: formData.get('titulo'),
        autor: formData.get('autor')
    };
    
    try {
        const url = currentEditId 
            ? `${API_BASE_URL}/libros/${currentEditId}`
            : `${API_BASE_URL}/libros`;
        
        const method = currentEditId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(libroData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            closeModal('libro');
            loadLibros();
            resetForm('libro-form');
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    }
}

async function editLibro(isbn) {
    try {
        const response = await fetch(`${API_BASE_URL}/libros/${isbn}`);
        const data = await response.json();
        
        if (data.success) {
            currentEditId = isbn;
            currentEditType = 'libro';
            
            document.getElementById('libro-isbn').value = data.data.isbn;
            document.getElementById('libro-titulo').value = data.data.titulo;
            document.getElementById('libro-autor').value = data.data.autor;
            document.getElementById('libro-modal-title').textContent = 'Editar Libro';
            
            showModal('libro');
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    }
}

async function deleteLibro(isbn) {
    if (!confirm('¿Estás seguro de que quieres eliminar este libro?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/libros/${isbn}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            loadLibros();
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    }
}

// ==================== FUNCIONES PARA PRÉSTAMOS ====================

async function loadPrestamos() {
    try {
        const response = await fetch(`${API_BASE_URL}/prestamos`);
        const data = await response.json();
        
        if (data.success) {
            renderPrestamosTable(data.data);
        } else {
            showToast('Error al cargar préstamos', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    }
}

function renderPrestamosTable(prestamos) {
    const tbody = document.querySelector('#prestamos-table tbody');
    tbody.innerHTML = '';
    
    prestamos.forEach(prestamo => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${prestamo.id_prestamo}</td>
            <td>${prestamo.nombre_estudiante} (${prestamo.id_estudiante})</td>
            <td>${prestamo.titulo} - ${prestamo.autor}</td>
            <td>${formatDate(prestamo.fecha_prestamo)}</td>
            <td>${prestamo.fecha_devolucion ? formatDate(prestamo.fecha_devolucion) : 'Pendiente'}</td>
            <td>${prestamo.nombre_empleado}</td>
            <td>
                <button class="btn btn-warning btn-sm btn-edit-prestamo" data-id="${prestamo.id_prestamo}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm btn-delete-prestamo" data-id="${prestamo.id_prestamo}">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        
        // Agregar event listeners a los botones
        const editBtn = row.querySelector('.btn-edit-prestamo');
        const deleteBtn = row.querySelector('.btn-delete-prestamo');
        
        editBtn.addEventListener('click', () => editPrestamo(prestamo.id_prestamo));
        deleteBtn.addEventListener('click', () => deletePrestamo(prestamo.id_prestamo));
        
        tbody.appendChild(row);
    });
}

async function handlePrestamoSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const prestamoData = {
        id_estudiante: formData.get('id_estudiante'),
        isbn: formData.get('isbn'),
        fecha_prestamo: formData.get('fecha_prestamo'),
        fecha_devolucion: formData.get('fecha_devolucion') || null,
        id_empleado_responsable: formData.get('id_empleado_responsable')
    };
    
    try {
        const url = currentEditId 
            ? `${API_BASE_URL}/prestamos/${currentEditId}`
            : `${API_BASE_URL}/prestamos`;
        
        const method = currentEditId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(prestamoData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            closeModal('prestamo');
            loadPrestamos();
            resetForm('prestamo-form');
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    }
}

async function editPrestamo(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/prestamos/${id}`);
        const data = await response.json();
        
        if (data.success) {
            currentEditId = id;
            currentEditType = 'prestamo';
            
            // Cargar datos para los selects
            await loadSelectData();
            
            document.getElementById('prestamo-estudiante').value = data.data.id_estudiante;
            document.getElementById('prestamo-libro').value = data.data.isbn;
            document.getElementById('prestamo-fecha').value = data.data.fecha_prestamo;
            document.getElementById('prestamo-devolucion').value = data.data.fecha_devolucion || '';
            document.getElementById('prestamo-empleado').value = data.data.id_empleado;
            document.getElementById('prestamo-modal-title').textContent = 'Editar Préstamo';
            
            showModal('prestamo');
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    }
}

async function deletePrestamo(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este préstamo?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/prestamos/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            loadPrestamos();
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    }
}

// ==================== FUNCIONES AUXILIARES ====================

async function loadSelectData() {
    try {
        // Cargar estudiantes
        const estudiantesResponse = await fetch(`${API_BASE_URL}/estudiantes`);
        const estudiantesData = await estudiantesResponse.json();
        
        const estudiantesSelect = document.getElementById('prestamo-estudiante');
        estudiantesSelect.innerHTML = '<option value="">Seleccionar estudiante</option>';
        
        if (estudiantesData.success) {
            estudiantesData.data.forEach(estudiante => {
                const option = document.createElement('option');
                option.value = estudiante.id_estudiante;
                option.textContent = `${estudiante.nombre_estudiante} (${estudiante.id_estudiante})`;
                estudiantesSelect.appendChild(option);
            });
        }
        
        // Cargar libros
        const librosResponse = await fetch(`${API_BASE_URL}/libros`);
        const librosData = await librosResponse.json();
        
        const librosSelect = document.getElementById('prestamo-libro');
        librosSelect.innerHTML = '<option value="">Seleccionar libro</option>';
        
        if (librosData.success) {
            librosData.data.forEach(libro => {
                const option = document.createElement('option');
                option.value = libro.isbn;
                option.textContent = `${libro.titulo} - ${libro.autor}`;
                librosSelect.appendChild(option);
            });
        }
        
        // Cargar empleados
        const empleadosResponse = await fetch(`${API_BASE_URL}/empleados`);
        const empleadosData = await empleadosResponse.json();
        
        const empleadosSelect = document.getElementById('prestamo-empleado');
        empleadosSelect.innerHTML = '<option value="">Seleccionar empleado</option>';
        
        if (empleadosData.success) {
            empleadosData.data.forEach(empleado => {
                const option = document.createElement('option');
                option.value = empleado.id_empleado;
                option.textContent = empleado.nombre_empleado;
                empleadosSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar datos para selects:', error);
        showToast('Error al cargar datos', 'error');
    }
}

// Funciones de modal
function showModal(type) {
    if (type === 'prestamo') {
        loadSelectData();
    }
    
    document.getElementById(`${type}-modal`).style.display = 'block';
}

function closeModal(type) {
    document.getElementById(`${type}-modal`).style.display = 'none';
    resetForm(`${type}-form`);
    currentEditId = null;
    currentEditType = null;
    
    // Resetear títulos de modales
    const titles = ['empleado', 'estudiante', 'libro', 'prestamo'];
    titles.forEach(t => {
        const titleElement = document.getElementById(`${t}-modal-title`);
        if (titleElement) {
            titleElement.textContent = `Nuevo ${t.charAt(0).toUpperCase() + t.slice(1)}`;
        }
    });
}

function resetForm(formId) {
    document.getElementById(formId).reset();
}

// Funciones de utilidad
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Cerrar modales al hacer clic fuera de ellos
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
} 