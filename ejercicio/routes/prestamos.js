const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET - Obtener todos los préstamos con información relacionada
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id_prestamo,
        p.fecha_prestamo,
        p.fecha_devolucion,
        e.id_estudiante,
        e.nombre_estudiante,
        e.carrera,
        l.isbn,
        l.titulo,
        l.autor,
        emp.id_empleado,
        emp.nombre_empleado
      FROM prestamos p
      INNER JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
      INNER JOIN libros l ON p.isbn = l.isbn
      INNER JOIN empleados emp ON p.id_empleado_responsable = emp.id_empleado
      ORDER BY p.fecha_prestamo DESC
    `;
    
    const [rows] = await pool.execute(query);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener préstamos:', error);
    res.status(500).json({ success: false, error: 'Error al obtener préstamos' });
  }
});

// GET - Obtener un préstamo por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        p.id_prestamo,
        p.fecha_prestamo,
        p.fecha_devolucion,
        e.id_estudiante,
        e.nombre_estudiante,
        e.carrera,
        l.isbn,
        l.titulo,
        l.autor,
        emp.id_empleado,
        emp.nombre_empleado
      FROM prestamos p
      INNER JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
      INNER JOIN libros l ON p.isbn = l.isbn
      INNER JOIN empleados emp ON p.id_empleado_responsable = emp.id_empleado
      WHERE p.id_prestamo = ?
    `;
    
    const [rows] = await pool.execute(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Préstamo no encontrado' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error al obtener préstamo:', error);
    res.status(500).json({ success: false, error: 'Error al obtener préstamo' });
  }
});

// POST - Crear un nuevo préstamo
router.post('/', async (req, res) => {
  try {
    const { id_estudiante, isbn, fecha_prestamo, fecha_devolucion, id_empleado_responsable } = req.body;
    
    if (!id_estudiante || !isbn || !fecha_prestamo || !id_empleado_responsable) {
      return res.status(400).json({ 
        success: false, 
        error: 'Los campos id_estudiante, isbn, fecha_prestamo e id_empleado_responsable son requeridos' 
      });
    }
    
    // Verificar que el estudiante existe
    const [estudiante] = await pool.execute(
      'SELECT id_estudiante FROM estudiantes WHERE id_estudiante = ?',
      [id_estudiante]
    );
    
    if (estudiante.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'El estudiante no existe' 
      });
    }
    
    // Verificar que el libro existe
    const [libro] = await pool.execute(
      'SELECT isbn FROM libros WHERE isbn = ?',
      [isbn]
    );
    
    if (libro.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'El libro no existe' 
      });
    }
    
    // Verificar que el empleado existe
    const [empleado] = await pool.execute(
      'SELECT id_empleado FROM empleados WHERE id_empleado = ?',
      [id_empleado_responsable]
    );
    
    if (empleado.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'El empleado no existe' 
      });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO prestamos (id_estudiante, isbn, fecha_prestamo, fecha_devolucion, id_empleado_responsable) VALUES (?, ?, ?, ?, ?)',
      [id_estudiante, isbn, fecha_prestamo, fecha_devolucion || null, id_empleado_responsable]
    );
    
    const [newPrestamo] = await pool.execute(
      'SELECT * FROM prestamos WHERE id_prestamo = ?',
      [result.insertId]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Préstamo creado exitosamente',
      data: newPrestamo[0]
    });
  } catch (error) {
    console.error('Error al crear préstamo:', error);
    res.status(500).json({ success: false, error: 'Error al crear préstamo' });
  }
});

// PUT - Actualizar un préstamo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_estudiante, isbn, fecha_prestamo, fecha_devolucion, id_empleado_responsable } = req.body;
    
    if (!id_estudiante || !isbn || !fecha_prestamo || !id_empleado_responsable) {
      return res.status(400).json({ 
        success: false, 
        error: 'Los campos id_estudiante, isbn, fecha_prestamo e id_empleado_responsable son requeridos' 
      });
    }
    
    // Verificar que el préstamo existe
    const [prestamoExistente] = await pool.execute(
      'SELECT id_prestamo FROM prestamos WHERE id_prestamo = ?',
      [id]
    );
    
    if (prestamoExistente.length === 0) {
      return res.status(404).json({ success: false, error: 'Préstamo no encontrado' });
    }
    
    // Verificar que el estudiante existe
    const [estudiante] = await pool.execute(
      'SELECT id_estudiante FROM estudiantes WHERE id_estudiante = ?',
      [id_estudiante]
    );
    
    if (estudiante.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'El estudiante no existe' 
      });
    }
    
    // Verificar que el libro existe
    const [libro] = await pool.execute(
      'SELECT isbn FROM libros WHERE isbn = ?',
      [isbn]
    );
    
    if (libro.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'El libro no existe' 
      });
    }
    
    // Verificar que el empleado existe
    const [empleado] = await pool.execute(
      'SELECT id_empleado FROM empleados WHERE id_empleado = ?',
      [id_empleado_responsable]
    );
    
    if (empleado.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'El empleado no existe' 
      });
    }
    
    const [result] = await pool.execute(
      'UPDATE prestamos SET id_estudiante = ?, isbn = ?, fecha_prestamo = ?, fecha_devolucion = ?, id_empleado_responsable = ? WHERE id_prestamo = ?',
      [id_estudiante, isbn, fecha_prestamo, fecha_devolucion || null, id_empleado_responsable, id]
    );
    
    const [updatedPrestamo] = await pool.execute(
      'SELECT * FROM prestamos WHERE id_prestamo = ?',
      [id]
    );
    
    res.json({ 
      success: true, 
      message: 'Préstamo actualizado exitosamente',
      data: updatedPrestamo[0]
    });
  } catch (error) {
    console.error('Error al actualizar préstamo:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar préstamo' });
  }
});

// DELETE - Eliminar un préstamo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM prestamos WHERE id_prestamo = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Préstamo no encontrado' });
    }
    
    res.json({ success: true, message: 'Préstamo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar préstamo:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar préstamo' });
  }
});

// GET - Obtener préstamos por estudiante
router.get('/estudiante/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        p.id_prestamo,
        p.fecha_prestamo,
        p.fecha_devolucion,
        l.isbn,
        l.titulo,
        l.autor,
        emp.nombre_empleado
      FROM prestamos p
      INNER JOIN libros l ON p.isbn = l.isbn
      INNER JOIN empleados emp ON p.id_empleado_responsable = emp.id_empleado
      WHERE p.id_estudiante = ?
      ORDER BY p.fecha_prestamo DESC
    `;
    
    const [rows] = await pool.execute(query, [id]);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener préstamos del estudiante:', error);
    res.status(500).json({ success: false, error: 'Error al obtener préstamos del estudiante' });
  }
});

// GET - Obtener préstamos por libro
router.get('/libro/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    const query = `
      SELECT 
        p.id_prestamo,
        p.fecha_prestamo,
        p.fecha_devolucion,
        e.nombre_estudiante,
        e.carrera,
        emp.nombre_empleado
      FROM prestamos p
      INNER JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
      INNER JOIN empleados emp ON p.id_empleado_responsable = emp.id_empleado
      WHERE p.isbn = ?
      ORDER BY p.fecha_prestamo DESC
    `;
    
    const [rows] = await pool.execute(query, [isbn]);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener préstamos del libro:', error);
    res.status(500).json({ success: false, error: 'Error al obtener préstamos del libro' });
  }
});

module.exports = router; 