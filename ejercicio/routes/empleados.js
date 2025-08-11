const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET - Obtener todos los empleados
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM empleados ORDER BY id_empleado');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ success: false, error: 'Error al obtener empleados' });
  }
});

// GET - Obtener un empleado por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM empleados WHERE id_empleado = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Empleado no encontrado' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error al obtener empleado:', error);
    res.status(500).json({ success: false, error: 'Error al obtener empleado' });
  }
});

// POST - Crear un nuevo empleado
router.post('/', async (req, res) => {
  try {
    const { nombre_empleado } = req.body;
    
    if (!nombre_empleado || nombre_empleado.trim() === '') {
      return res.status(400).json({ success: false, error: 'El nombre del empleado es requerido' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO empleados (nombre_empleado) VALUES (?)',
      [nombre_empleado.trim()]
    );
    
    const [newEmployee] = await pool.execute(
      'SELECT * FROM empleados WHERE id_empleado = ?',
      [result.insertId]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Empleado creado exitosamente',
      data: newEmployee[0]
    });
  } catch (error) {
    console.error('Error al crear empleado:', error);
    res.status(500).json({ success: false, error: 'Error al crear empleado' });
  }
});

// PUT - Actualizar un empleado
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_empleado } = req.body;
    
    if (!nombre_empleado || nombre_empleado.trim() === '') {
      return res.status(400).json({ success: false, error: 'El nombre del empleado es requerido' });
    }
    
    const [result] = await pool.execute(
      'UPDATE empleados SET nombre_empleado = ? WHERE id_empleado = ?',
      [nombre_empleado.trim(), id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Empleado no encontrado' });
    }
    
    const [updatedEmployee] = await pool.execute(
      'SELECT * FROM empleados WHERE id_empleado = ?',
      [id]
    );
    
    res.json({ 
      success: true, 
      message: 'Empleado actualizado exitosamente',
      data: updatedEmployee[0]
    });
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar empleado' });
  }
});

// DELETE - Eliminar un empleado
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el empleado tiene préstamos asociados
    const [prestamos] = await pool.execute(
      'SELECT COUNT(*) as count FROM prestamos WHERE id_empleado_responsable = ?',
      [id]
    );
    
    if (prestamos[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se puede eliminar el empleado porque tiene préstamos asociados' 
      });
    }
    
    const [result] = await pool.execute(
      'DELETE FROM empleados WHERE id_empleado = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Empleado no encontrado' });
    }
    
    res.json({ success: true, message: 'Empleado eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar empleado' });
  }
});

module.exports = router; 