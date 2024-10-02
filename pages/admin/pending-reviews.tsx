import { useState } from 'react';
import useSWR from 'swr';
import styles from '../styles/PendingReviews.module.css'

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Review {
  id: string;
  reviewerId: string;
  comment: string;
  rating: number;
  status: string;
}

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: reviews, error, mutate } = useSWR<Review[]>(`http://localhost:3010/public/reviews?page=1&limit=10`, fetcher);

  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setPage((prev) => prev + 1);

  if (error) return <div>Failed to load reviews</div>;
  if (!reviews) return <div>Loading...</div>;

  // Función para actualizar el estado de una review
  const updateReviewStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3010/admin/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update review status');
      }

      // Vuelve a cargar las reviews después de actualizar
      mutate(); // Esto recarga los datos de SWR
      alert('Review status updated');
    } catch (error) {
      console.error(error);
      alert('Error updating review status');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Reviews</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Reviewer ID</th>
            <th>Comment</th>
            <th>Rating</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id}>
              <td>{review.reviewerId}</td>
              <td>{review.comment}</td>
              <td>{review.rating}</td>
              <td>{review.status}</td>
              <td>
                {review.status === 'pending' && (
                  <button onClick={() => updateReviewStatus(review.id, 'approved')}>
                    Approve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <button onClick={handlePrevPage} disabled={page === 1}>
          Previous
        </button>
        <button onClick={handleNextPage}>Next</button>
      </div>
    </div>
  );
}
