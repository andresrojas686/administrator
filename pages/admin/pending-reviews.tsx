import { useState } from 'react';
import useSWR from 'swr';
import styles from '../styles/PendingReviews.module.css';

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

  if (error) return <div id="errorMessage">Failed to load reviews</div>;
  if (!reviews) return <div id="loadingMessage">Loading...</div>;

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
      alert(`Review status updated to ${newStatus}`);
    } catch (error) {
      console.error(error);
      alert('Error updating review status');
    }
  };

  return (
    <div id="reviewsContainer" className={styles.container}>
      <h1 id="title">Reviews</h1>
      <table id="reviewsTable" className={styles.table}>
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
                {review.status !== 'approved' && (
                  <button id={`approveButton-${review.id}`} onClick={() => updateReviewStatus(review.id, 'approved')}>
                    Approve
                  </button>
                )}
                {review.status !== 'rejected' && (
                  <button id={`rejectButton-${review.id}`} onClick={() => updateReviewStatus(review.id, 'rejected')}>
                    Reject
                  </button>
                )}
                {review.status !== 'pending' && (
                  <button id={`pendingButton-${review.id}`} onClick={() => updateReviewStatus(review.id, 'pending')}>
                    Set to Pending
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div id="paginationControls" className={styles.pagination}>
        <button id="prevPageButton" onClick={handlePrevPage} disabled={page === 1}>
          Previous
        </button>
        <button id="nextPageButton" onClick={handleNextPage}>Next</button>
      </div>
    </div>
  );
}
