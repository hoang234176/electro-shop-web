import React from 'react';
import './ReviewSummary.css';

interface ReviewSummaryProps {
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: {
        star1: number;
        star2: number;
        star3: number;
        star4: number;
        star5: number;
    };
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({ averageRating, totalReviews, ratingBreakdown }) => {
    const ratingLevels = [5, 4, 3, 2, 1];

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(<span key={i} className={i < rating ? "star active" : "star"}>★</span>);
        }
        return stars;
    };

    if (!totalReviews || Number(totalReviews) <= 0) {
        return null; // Ẩn component nếu chưa có lượt đánh giá nào
    }

    return (
        <div className="review-summary">
            <div className="summary-left">
                <p className="average-rating">{averageRating.toFixed(1)}/5</p>
                <div className="stars">{renderStars(averageRating)}</div>
                <p className="total-reviews">({totalReviews} đánh giá)</p>
            </div>
            <div className="summary-right">
                {ratingLevels.map(level => {
                    const count = ratingBreakdown[`star${level}` as keyof typeof ratingBreakdown] || 0;
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                        <div key={level} className="rating-bar-row">
                            <span className="rating-bar-label">{level} sao</span>
                            <div className="rating-bar-container">
                                <div className="rating-bar-fill" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="rating-bar-count">{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReviewSummary;