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

  const { data: reviews, error, mutate } = useSWR<Review[]>(`http://localhost:3010/admin/reviews?page=1&limit=10`, fetcher);

  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setPage((prev) => prev + 1);

  if (error) return <div>Failed to load reviews</div>;
  if (!reviews) return <div>Loading...</div>;

  // Función para actualizar el estado de una review
  const updateReviewStatus = async (id: string, newStatus: 'approved' | 'pending' | 'rejected') => {
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

      // Recargar las reviews después de actualizar
      mutate(); // Esto recarga los datos de SWR
      alert(`Review status updated to ${newStatus}`);
    } catch (error) {
      console.error(error);
      alert('Error updating review status');
    }
  };

  // Filtrar las reviews por estado
  const pendingReviews = reviews.filter((review) => review.status === 'pending');
  const approvedReviews = reviews.filter((review) => review.status === 'approved');
  const rejectedReviews = reviews.filter((review) => review.status === 'rejected');

  return (
    <div className={styles.container}>
      <h1>Reviews Management</h1>

      <div className={styles.columns}>
        {/* Columna de Pending Reviews */}
        <div className={styles.column}>
          <h2>Pending Reviews</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Reviewer ID</th>
                <th>Comment</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingReviews.map((review) => (
                <tr key={review.id}>
                  <td>{review.reviewerId}</td>
                  <td>{review.comment}</td>
                  <td>{review.rating}</td>
                  <td className={styles.actionsButtons}>
                    <button className={styles.popupButtonApprove} onClick={() => updateReviewStatus(review.id, 'approved')}>Approve</button>
                    <button className={styles.popupButtonDecline} onClick={() => updateReviewStatus(review.id, 'rejected')}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Columna de Approved Reviews */}
        <div className={styles.column}>
          <h2>Approved Reviews</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Reviewer ID</th>
                <th>Comment</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvedReviews.map((review) => (
                <tr key={review.id}>
                  <td>{review.reviewerId}</td>
                  <td>{review.comment}</td>
                  <td>{review.rating}</td>
                  <td className={styles.actionsButtons}>
                    <button className={styles.popupButtonPending} onClick={() => updateReviewStatus(review.id, 'pending')}>Set as Pending</button>
                    <button className={styles.popupButtonDecline} onClick={() => updateReviewStatus(review.id, 'rejected')}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Columna de Rejected Reviews */}
        <div className={styles.column}>
          <h2>Rejected Reviews</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Reviewer ID</th>
                <th>Comment</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rejectedReviews.map((review) => (
                <tr key={review.id}>
                  <td>{review.reviewerId}</td>
                  <td>{review.comment}</td>
                  <td>{review.rating}</td>
                  <td className={styles.actionsButtons}>
                    <button  className={styles.popupButtonPending} onClick={() => updateReviewStatus(review.id, 'pending')}>Set as Pending</button>
                    <button className={styles.popupButtonApprove} onClick={() => updateReviewStatus(review.id, 'approved')}>Approve</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.pagination}>
        <button onClick={handlePrevPage} disabled={page === 1}>Previous</button>
        <button onClick={handleNextPage}>Next</button>
      </div>
    </div>
  );
}