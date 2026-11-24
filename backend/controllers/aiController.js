const Note = require('../models/Note');
const AIRequest = require('../models/AIRequest');
const { generateSummaryFromAI, generatePracticeQuestionsFromAI } = require('../utils/aiService');
const { AppError } = require('../middleware/errorHandler');

// @desc    Generate AI summary for a note
// @route   POST /api/ai/summary/:noteId
// @access  Private (Chained with custom aiRateLimiter)
const generateSummary = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);
    if (!note) {
      return next(new AppError('Note not found.', 404));
    }

    if (String(note.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return next(new AppError('Forbidden: You can only generate summaries for your own notes.', 403));
    }

    const { summaryText, modelUsed } = await generateSummaryFromAI(note.title, note.content);
    const durationMs = Date.now() - startTime;

    // Save to AIRequest collection for history and admin aggregation
    const aiLog = await AIRequest.create({
      user: req.user._id,
      note: note._id,
      requestType: 'summary',
      promptSnapshot: `Title: ${note.title}\n${note.content.substring(0, 300)}...`,
      response: { summary: summaryText },
      status: 'success',
      modelUsed,
      durationMs
    });

    res.status(200).json({
      success: true,
      message: 'AI summary generated successfully',
      data: {
        id: aiLog._id,
        noteId: note._id,
        noteTitle: note.title,
        summary: summaryText,
        modelUsed,
        durationMs,
        createdAt: aiLog.createdAt
      }
    });
  } catch (error) {
    // If generation failed, log failure in AIRequest for audit
    try {
      if (req.params.noteId) {
        await AIRequest.create({
          user: req.user._id,
          note: req.params.noteId,
          requestType: 'summary',
          promptSnapshot: 'Execution error occurred during generation',
          response: { error: error.message },
          status: 'failed',
          durationMs: Date.now() - startTime
        });
      }
    } catch (_) {
      // Ignore secondary logging error
    }
    next(error);
  }
};

// @desc    Generate practice questions / quiz from a note
// @route   POST /api/ai/questions/:noteId
// @access  Private (Chained with custom aiRateLimiter)
const generatePracticeQuestions = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);
    if (!note) {
      return next(new AppError('Note not found.', 404));
    }

    if (String(note.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return next(new AppError('Forbidden: You can only generate practice questions for your own notes.', 403));
    }

    const { questions, modelUsed } = await generatePracticeQuestionsFromAI(note.title, note.content);
    const durationMs = Date.now() - startTime;

    const aiLog = await AIRequest.create({
      user: req.user._id,
      note: note._id,
      requestType: 'practice_questions',
      promptSnapshot: `Title: ${note.title}\n${note.content.substring(0, 300)}...`,
      response: { questions },
      status: 'success',
      modelUsed,
      durationMs
    });

    res.status(200).json({
      success: true,
      message: 'Practice questions generated successfully',
      data: {
        id: aiLog._id,
        noteId: note._id,
        noteTitle: note.title,
        questions,
        modelUsed,
        durationMs,
        createdAt: aiLog.createdAt
      }
    });
  } catch (error) {
    try {
      if (req.params.noteId) {
        await AIRequest.create({
          user: req.user._id,
          note: req.params.noteId,
          requestType: 'practice_questions',
          promptSnapshot: 'Execution error during question generation',
          response: { error: error.message },
          status: 'failed',
          durationMs: Date.now() - startTime
        });
      }
    } catch (_) {
      // Ignore secondary logging error
    }
    next(error);
  }
};

// @desc    Get user's AI request history
// @route   GET /api/ai/history
// @access  Private
const getAIHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = { user: req.user._id };
    if (type && ['summary', 'practice_questions'].includes(type)) {
      query.requestType = type;
    }

    const [history, total] = await Promise.all([
      AIRequest.find(query)
        .populate('note', 'title subject')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      AIRequest.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: history,
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

module.exports = {
  generateSummary,
  generatePracticeQuestions,
  getAIHistory
};
