import { supabase } from '@config/supabase';
import { Lesson } from '../types';

export const LessonModel = {
  async findBySectionId(sectionId: string) {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('section_id', sectionId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data;
  },

  async findById(id: string, includeQuiz = false) {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (includeQuiz && data.content_type === 'quiz') {
      const { data: questions } = await supabase
        .from('quiz_questions')
        .select(`
          *,
          answers:quiz_answers(*)
        `)
        .eq('lesson_id', id)
        .order('order_index', { ascending: true });

      return { ...data, quiz_questions: questions };
    }

    return data;
  },

  async create(lessonData: Partial<Lesson>) {
    const { data, error } = await supabase
      .from('lessons')
      .insert([lessonData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, lessonData: Partial<Lesson>) {
    const { data, error } = await supabase
      .from('lessons')
      .update(lessonData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  async addQuizQuestions(lessonId: string, questions: any[]) {
    const { data: insertedQuestions, error: questionError } = await supabase
      .from('quiz_questions')
      .insert(questions.map(q => ({ ...q, lesson_id: lessonId })))
      .select();

    if (questionError) throw questionError;

    // Insert answers
    const allAnswers: any[] = [];
    questions.forEach((q, idx) => {
      if (q.answers && Array.isArray(q.answers)) {
        q.answers.forEach((answer: any) => {
          allAnswers.push({
            ...answer,
            question_id: insertedQuestions[idx].id
          });
        });
      }
    });

    if (allAnswers.length > 0) {
      const { error: answerError } = await supabase
        .from('quiz_answers')
        .insert(allAnswers);

      if (answerError) throw answerError;
    }

    return insertedQuestions;
  },

  async updateQuizQuestion(questionId: string, questionData: any) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .update(questionData)
      .eq('id', questionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteQuizQuestion(questionId: string) {
    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', questionId);

    if (error) throw error;
    return { success: true };
  },

  async reorder(sectionId: string, lessonOrders: { id: string; order_index: number }[]) {
    const updates = lessonOrders.map(({ id, order_index }) =>
      supabase
        .from('lessons')
        .update({ order_index })
        .eq('id', id)
        .eq('section_id', sectionId)
    );

    await Promise.all(updates);
    return { success: true };
  }
};