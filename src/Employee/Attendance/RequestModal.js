// RequestModal.js
import React, { useState } from 'react';
import { db } from '../../FirebaseConfig/Firebaseconfig'; // import Firestore configuration
import { collection, addDoc } from 'firebase/firestore';
import './RequestModal.css';

const RequestModal = ({ isOpen, onClose, onSubmit }) => {
    const [comment, setComment] = useState('');

    const handleCommentChange = (e) => {
        setComment(e.target.value);
    };

    const handleSubmit = async () => {
        try {
            // Add the comment to the attendance collection
            await addDoc(collection(db, 'attendance'), {
                comment,
                timestamp: new Date() // optional, adds a timestamp
            });
            onSubmit(comment);
            setComment(''); // Clear comment after submission
            onClose(); // Close the modal after submission
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="custom-modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Request</h2>
                <div className="form-group">
                    <label htmlFor="comment">Comments:</label>
                    <textarea
                        id="comment"
                        className="form-control"
                        value={comment}
                        onChange={handleCommentChange}
                        placeholder="Enter your comment here"
                    />
                </div>
                <div className="modal-actions">
                    <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default RequestModal;
