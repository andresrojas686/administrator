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
  const [activeTab, setActiveTab] = useState('pending'); // Nuevo estado para controlar la pestaña activa
  const limit = 10;

  const { data: reviews, error, mutate } = useSWR<Review[]>(`http://localhost:3010/admin/reviews?page=${page}&limit=${limit}`, fetcher);

  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setPage((prev) => prev + 1);

  if (error) return <div>Failed to load reviews</div>;
  if (!reviews) return <div>Loading...</div>;

  const updateReviewStatus = async (id: string, newStatus: 'approved' | 'pending' | 'rejected') => {
    try {
      const response = await fetch(`http://localhost:3010/admin/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update review status');

      mutate();
      alert(`Review status updated to ${newStatus}`);
    } catch (error) {
      console.error(error);
      alert('Error updating review status');
    }
  };

  const filteredReviews = reviews.filter((review) => review.status === activeTab);

  return (
    <div className={styles.container}>
      <h1>Reviews Management</h1>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Reviews
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'approved' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Approved Reviews
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'rejected' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          Rejected Reviews
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
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
            {filteredReviews.map((review) => (
              <tr key={review.id}>
                <td>{review.reviewerId}</td>
                <td>{review.comment}</td>
                <td>{review.rating}</td>
                <td className={styles.actionsButtons}>
                  {activeTab !== 'approved' && (
                    <button
                      className={styles.popupButtonApprove}
                      onClick={() => updateReviewStatus(review.id, 'approved')}
                    >
                      Approve
                    </button>
                  )}
                  {activeTab !== 'rejected' && (
                    <button
                      className={styles.popupButtonDecline}
                      onClick={() => updateReviewStatus(review.id, 'rejected')}
                    >
                      Reject
                    </button>
                  )}
                  {activeTab === 'approved' && (
                    <button
                      className={styles.popupButtonPending}
                      onClick={() => updateReviewStatus(review.id, 'pending')}
                    >
                      Set as Pending
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <button onClick={handlePrevPage} disabled={page === 1}>Previous</button>
        <button onClick={handleNextPage}>Next</button>
      </div>
    </div>
  );
}