import { Request, Response } from 'express';
import { LessonModel } from '@models/lesson.model';
import { httpStatus } from '@utils/httpStatus';

export const LessonController = {
  async getBySectionId(req: Request, res: Response) {
    try {
      const { sectionId } = req.params;
      const lessons = await LessonModel.findBySectionId(sectionId);

      res.json({
        success: true,
        data: lessons,
      });
    } catch (error: any) {
      console.error('Get lessons error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch lessons',
        error: error.message,
      });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { includeQuiz } = req.query;

      const lesson = await LessonModel.findById(id, includeQuiz === 'true');

      if (!lesson) {
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: 'Lesson not found',
        });
      }

      res.json({
        success: true,
        data: lesson,
      });
    } catch (error: any) {
      console.error('Get lesson error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch lesson',
        error: error.message,
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const lessonData = req.body;
      const lesson = await LessonModel.create(lessonData);

      res.status(httpStatus.CREATED).json({
        success: true,
        data: lesson,
      });
    } catch (error: any) {
      console.error('Create lesson error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to create lesson',
        error: error.message,
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const lessonData = req.body;

      const lesson = await LessonModel.update(id, lessonData);

      if (!lesson) {
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: 'Lesson not found',
        });
      }

      res.json({
        success: true,
        data: lesson,
      });
    } catch (error: any) {
      console.error('Update lesson error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to update lesson',
        error: error.message,
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await LessonModel.delete(id);

      res.json({
        success: true,
        message: 'Lesson deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete lesson error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to delete lesson',
        error: error.message,
      });
    }
  },

  async addQuizQuestions(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { questions } = req.body;

      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Questions array is required',
        });
      }

      const result = await LessonModel.addQuizQuestions(id, questions);

      res.status(httpStatus.CREATED).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Add quiz questions error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to add quiz questions',
        error: error.message,
      });
    }
  },

  async updateQuizQuestion(req: Request, res: Response) {
    try {
      const { questionId } = req.params;
      const questionData = req.body;

      const question = await LessonModel.updateQuizQuestion(questionId, questionData);

      res.json({
        success: true,
        data: question,
      });
    } catch (error: any) {
      console.error('Update quiz question error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to update quiz question',
        error: error.message,
      });
    }
  },

  async deleteQuizQuestion(req: Request, res: Response) {
    try {
      const { questionId } = req.params;
      await LessonModel.deleteQuizQuestion(questionId);

      res.json({
        success: true,
        message: 'Quiz question deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete quiz question error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to delete quiz question',
        error: error.message,
      });
    }
  },

  async reorder(req: Request, res: Response) {
    try {
      const { section_id, lessons } = req.body;

      if (!section_id || !lessons) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Section ID and lessons are required',
        });
      }

      await LessonModel.reorder(section_id, lessons);

      res.json({
        success: true,
        message: 'Lessons reordered successfully',
      });
    } catch (error: any) {
      console.error('Reorder lessons error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to reorder lessons',
        error: error.message,
      });
    }
  },
};