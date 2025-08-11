const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET - Obtener todos los estudiantes
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM estudiantes ORDER BY id_estudiante');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    res.status(500).json({ success: false, error: 'Error al obtener estudiantes' });
  }
});

// GET - Obtener un estudiante por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM estudiantes WHERE id_estudiante = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Estudiante no encontrado' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error al obtener estudiante:', error);
    res.status(500).json({ success: false, error: 'Error al obtener estudiante' });
  }
});

// POST - Crear un nuevo estudiante
router.post('/', async (req, res) => {
  try {
    const { id_estudiante, nombre_estudiante, carrera } = req.body;
    
    if (!id_estudiante || !nombre_estudiante || !carrera) {
      return res.status(400).json({ 
        success: false, 
        error: 'Todos los campos son requeridos: id_estudiante, nombre_estudiante, carrera' 
      });
    }
    
    // Verificar si el ID ya existe
    const [existing] = await pool.execute(
      'SELECT id_estudiante FROM estudiantes WHERE id_estudiante = ?',
      [id_estudiante]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Ya existe un estudiante con ese ID' 
      });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO estudiantes (id_estudiante, nombre_estudiante, carrera) VALUES (?, ?, ?)',
      [id_estudiante, nombre_estudiante.trim(), carrera.trim()]
    );
    
    const [newStudent] = await pool.execute(
      'SELECT * FROM estudiantes WHERE id_estudiante = ?',
      [id_estudiante]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Estudiante creado exitosamente',
      data: newStudent[0]
    });
  } catch (error) {
    console.error('Error al crear estudiante:', error);
    res.status(500).json({ success: false, error: 'Error al crear estudiante' });
  }
});

// PUT - Actualizar un estudiante
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_estudiante, carrera } = req.body;
    
    if (!nombre_estudiante || !carrera) {
      return res.status(400).json({ 
        success: false, 
        error: 'Los campos nombre_estudiante y carrera son requeridos' 
      });
    }
    
    const [result] = await pool.execute(
      'UPDATE estudiantes SET nombre_estudiante = ?, carrera = ? WHERE id_estudiante = ?',
      [nombre_estudiante.trim(), carrera.trim(), id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Estudiante no encontrado' });
    }
    
    const [updatedStudent] = await pool.execute(
      'SELECT * FROM estudiantes WHERE id_estudiante = ?',
      [id]
    );
    
    res.json({ 
      success: true, 
      message: 'Estudiante actualizado exitosamente',
      data: updatedStudent[0]
    });
  } catch (error) {
    console.error('Error al actualizar estudiante:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar estudiante' });
  }
});

// DELETE - Eliminar un estudiante
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el estudiante tiene préstamos asociados
    const [prestamos] = await pool.execute(
      'SELECT COUNT(*) as count FROM prestamos WHERE id_estudiante = ?',
      [id]
    );
    
    if (prestamos[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se puede eliminar el estudiante porque tiene préstamos asociados' 
      });
    }
    
    const [result] = await pool.execute(
      'DELETE FROM estudiantes WHERE id_estudiante = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Estudiante no encontrado' });
    }
    
    res.json({ success: true, message: 'Estudiante eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar estudiante:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar estudiante' });
  }
});

module.exports = router; 