import { Request, Response, NextFunction } from 'express';

export const validateCourseCreate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title } = req.body;

  if (!title || typeof title !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Title is required',
    });
  }

  if (title.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Title must be less than 100 characters',
    });
  }

  next();
};

export const validateSectionCreate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, course_id } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: 'Title is required',
    });
  }

  if (!course_id) {
    return res.status(400).json({
      success: false,
      message: 'Course ID is required',
    });
  }

  next();
};

export const validateLessonCreate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, section_id, content_type } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: 'Title is required',
    });
  }

  if (!section_id) {
    return res.status(400).json({
      success: false,
      message: 'Section ID is required',
    });
  }

  if (!content_type || !['video', 'article', 'quiz', 'pdf'].includes(content_type)) {
    return res.status(400).json({
      success: false,
      message: 'Valid content type is required',
    });
  }

  next();
};

export const validateEnrollmentCreate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { course_id } = req.body;

  if (!course_id) {
    return res.status(400).json({
      success: false,
      message: 'Course ID is required',
    });
  }

  next();
};