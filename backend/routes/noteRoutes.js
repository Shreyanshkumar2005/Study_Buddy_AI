const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getSubjects
} = require('../controllers/noteController');
const { verifyToken } = require('../middleware/authMiddleware');

// All note routes require authentication
router.use(verifyToken);

router.get('/', getNotes);
router.get('/subjects', getSubjects);
router.get('/:id', getNoteById);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
