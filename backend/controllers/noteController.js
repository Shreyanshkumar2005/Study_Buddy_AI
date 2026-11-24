const Note = require('../models/Note');
const { AppError } = require('../middleware/errorHandler');

// @desc    Get all notes for current student (with search, filter, pagination)
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res, next) => {
  try {
    const { search, subject, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter query: student sees only their own notes; admin can see all if specified
    const query = { user: req.user._id };

    if (subject && subject.trim() !== '') {
      query.subject = { $regex: new RegExp(`^${subject.trim()}$`, 'i') };
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    const sortOption = { [sortBy]: order === 'asc' ? 1 : -1 };

    const [notes, total] = await Promise.all([
      Note.find(query).sort(sortOption).skip(skip).limit(limitNum),
      Note.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: notes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get note by ID
// @route   GET /api/notes/:id
// @access  Private
const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return next(new AppError('Note not found.', 404));
    }

    // Role check: only owner or admin can view
    if (String(note.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return next(new AppError('Forbidden: You do not have permission to view this note.', 403));
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res, next) => {
  try {
    const { title, content, subject, tags } = req.body;

    if (!title || !content) {
      return next(new AppError('Please provide both note title and content.', 400));
    }

    const cleanTags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim()).filter(Boolean)
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const note = await Note.create({
      user: req.user._id,
      title: title.trim(),
      content: content.trim(),
      subject: (subject && subject.trim()) || 'General',
      tags: cleanTags
    });

    res.status(201).json({
      success: true,
      message: 'Note created successfully.',
      data: note
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res, next) => {
  try {
    const { title, content, subject, tags } = req.body;

    const note = await Note.findById(req.params.id);
    if (!note) {
      return next(new AppError('Note not found.', 404));
    }

    // Ensure ownership
    if (String(note.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return next(new AppError('Forbidden: You cannot modify notes you do not own.', 403));
    }

    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content.trim();
    if (subject !== undefined) note.subject = subject.trim() || 'General';
    if (tags !== undefined) {
      note.tags = Array.isArray(tags)
        ? tags.map((t) => String(t).trim()).filter(Boolean)
        : typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];
    }

    const updatedNote = await note.save();

    res.status(200).json({
      success: true,
      message: 'Note updated successfully.',
      data: updatedNote
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return next(new AppError('Note not found.', 404));
    }

    // Ensure ownership
    if (String(note.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return next(new AppError('Forbidden: You cannot delete notes you do not own.', 403));
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unique subjects for filtering
// @route   GET /api/notes/subjects
// @access  Private
const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Note.distinct('subject', { user: req.user._id });
    res.status(200).json({
      success: true,
      data: subjects.filter(Boolean)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getSubjects
};
