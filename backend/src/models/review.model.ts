import { supabase, supabaseAdmin } from '@config/supabase';

export interface Review {
    id: string;
    user_id: string;
    course_id: string;
    rating: number;
    comment: string;
    created_at: string;
    updated_at: string;
}

export interface ReviewWithUser extends Review {
    user: {
        id: string;
        full_name: string;
        avatar_url: string;
    };
}

export const ReviewModel = {
    /**
     * Create a new review or update existing one (UPSERT)
     */
    async create(data: {
        user_id: string;
        course_id: string;
        rating: number;
        comment: string;
    }): Promise<Review> {
        const { data: review, error } = await supabaseAdmin
            .from('reviews')
            .upsert(
                {
                    user_id: data.user_id,
                    course_id: data.course_id,
                    rating: data.rating,
                    comment: data.comment,
                },
                { onConflict: 'user_id,course_id' }
            )
            .select()
            .single();

        if (error) throw error;
        return review;
    },

    /**
     * Update an existing review
     */
    async update(
        id: string,
        data: { rating?: number; comment?: string }
    ): Promise<Review> {
        const { data: review, error } = await supabase
            .from('reviews')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return review;
    },

    /**
     * Delete a review
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabaseAdmin.from('reviews').delete().eq('id', id);

        if (error) throw error;
    },

    /**
     * Find a review by ID
     */
    async findById(id: string): Promise<Review | null> {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }

        return data;
    },

    /**
     * Get all reviews for a course with user profile info
     */
    async findByCourseId(courseId: string): Promise<ReviewWithUser[]> {
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('course_id', courseId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch user profiles for each review
        const reviewsWithUsers: ReviewWithUser[] = [];
        for (const review of reviews || []) {
            const { data: userProfile } = await supabaseAdmin
                .from('user_profiles')
                .select('id, full_name, avatar_url')
                .eq('id', review.user_id)
                .single();

            reviewsWithUsers.push({
                ...review,
                user: userProfile || {
                    id: review.user_id,
                    full_name: 'Unknown User',
                    avatar_url: '',
                },
            });
        }

        return reviewsWithUsers;
    },

    /**
     * Get a user's review for a specific course
     */
    async findByUserAndCourse(
        userId: string,
        courseId: string
    ): Promise<Review | null> {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }

        return data;
    },

    /**
     * Calculate average rating and total count for a course
     */
    async getCourseAverageRating(
        courseId: string
    ): Promise<{ average: number; count: number }> {
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('rating')
            .eq('course_id', courseId);

        if (error) throw error;

        if (!reviews || reviews.length === 0) {
            return { average: 0, count: 0 };
        }

        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        const average = total / reviews.length;

        return {
            average: Math.round(average * 10) / 10, // Round to 1 decimal place
            count: reviews.length,
        };
    },
};
