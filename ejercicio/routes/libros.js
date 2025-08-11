const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET - Obtener todos los libros
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM libros ORDER BY titulo');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener libros:', error);
    res.status(500).json({ success: false, error: 'Error al obtener libros' });
  }
});

// GET - Obtener un libro por ISBN
router.get('/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    const [rows] = await pool.execute('SELECT * FROM libros WHERE isbn = ?', [isbn]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Libro no encontrado' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error al obtener libro:', error);
    res.status(500).json({ success: false, error: 'Error al obtener libro' });
  }
});

// POST - Crear un nuevo libro
router.post('/', async (req, res) => {
  try {
    const { isbn, titulo, autor } = req.body;
    
    if (!isbn || !titulo || !autor) {
      return res.status(400).json({ 
        success: false, 
        error: 'Todos los campos son requeridos: isbn, titulo, autor' 
      });
    }
    
    // Verificar si el ISBN ya existe
    const [existing] = await pool.execute(
      'SELECT isbn FROM libros WHERE isbn = ?',
      [isbn]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Ya existe un libro con ese ISBN' 
      });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO libros (isbn, titulo, autor) VALUES (?, ?, ?)',
      [isbn.trim(), titulo.trim(), autor.trim()]
    );
    
    const [newBook] = await pool.execute(
      'SELECT * FROM libros WHERE isbn = ?',
      [isbn]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Libro creado exitosamente',
      data: newBook[0]
    });
  } catch (error) {
    console.error('Error al crear libro:', error);
    res.status(500).json({ success: false, error: 'Error al crear libro' });
  }
});

// PUT - Actualizar un libro
router.put('/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    const { titulo, autor } = req.body;
    
    if (!titulo || !autor) {
      return res.status(400).json({ 
        success: false, 
        error: 'Los campos titulo y autor son requeridos' 
      });
    }
    
    const [result] = await pool.execute(
      'UPDATE libros SET titulo = ?, autor = ? WHERE isbn = ?',
      [titulo.trim(), autor.trim(), isbn]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Libro no encontrado' });
    }
    
    const [updatedBook] = await pool.execute(
      'SELECT * FROM libros WHERE isbn = ?',
      [isbn]
    );
    
    res.json({ 
      success: true, 
      message: 'Libro actualizado exitosamente',
      data: updatedBook[0]
    });
  } catch (error) {
    console.error('Error al actualizar libro:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar libro' });
  }
});

// DELETE - Eliminar un libro
router.delete('/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    
    // Verificar si el libro tiene préstamos asociados
    const [prestamos] = await pool.execute(
      'SELECT COUNT(*) as count FROM prestamos WHERE isbn = ?',
      [isbn]
    );
    
    if (prestamos[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se puede eliminar el libro porque tiene préstamos asociados' 
      });
    }
    
    const [result] = await pool.execute(
      'DELETE FROM libros WHERE isbn = ?',
      [isbn]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Libro no encontrado' });
    }
    
    res.json({ success: true, message: 'Libro eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar libro:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar libro' });
  }
});

module.exports = router; 