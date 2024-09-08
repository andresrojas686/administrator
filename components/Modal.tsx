import React from 'react';
import styles from './modal.module.css'; // Add your custom styles

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentStatus: string;
  onApprove: () => void;
  onReject: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, documentUrl, documentStatus, onApprove, onReject }) => {
  if (!isOpen) return null;

  const isPending = documentStatus === 'Pending';
  const isApproved = documentStatus === 'Approved';
  const isRejected = documentStatus === 'Rejected';

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <img src={documentUrl} alt="Document" className={styles.documentImage} />
        <p>Status: {documentStatus}</p>

        {isPending && (
          <div className={styles.buttonsContainer}>
            <button onClick={onApprove} className={styles.approveButton}>Approve</button>
            <button onClick={onReject} className={styles.rejectButton}>Reject</button>
          </div>
        )}

        {!isPending && (
          <p>This document cannot be {isApproved ? 'rejected' : 'approved'}.</p>
        )}

        <button onClick={onClose} className={styles.closeButton}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
