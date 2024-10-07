import React, { useState, useEffect } from "react";
import EmployeeDashboard from "../EmployeeDashboard/EmployeeDashboard";
import { useAuth } from "../../Context/AuthContext";
import { db } from '../../FirebaseConfig/Firebaseconfig';
import { doc, getDoc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore';
import "./Attendance.css";
import Map from "./Map";
import { Modal, Button } from 'react-bootstrap'; // Assuming you're using Bootstrap for styling

const Attendance = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const [address, setAddress] = useState("");
  const [attendanceData, setAttendanceData] = useState(null);
  const [checkInPerformed, setCheckInPerformed] = useState(false);
  const [checkOutPerformed, setCheckOutPerformed] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // New state for modal
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const attendanceRef = doc(db, 'attendance', user.uid);

    const unsubscribe = onSnapshot(attendanceRef, (attendanceSnap) => {
      if (attendanceSnap.exists()) {
        setAttendanceData(attendanceSnap.data());
        const today = formatDate(new Date());
        if (attendanceSnap.data()[today]) {
          setCheckInPerformed(!!attendanceSnap.data()[today].checkInTime);
          setCheckOutPerformed(!!attendanceSnap.data()[today].checkOutTime);
        }
      } else {
        setAttendanceData(null);
      }
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      const uid = user.uid;
      const now = new Date();
      const today = formatDate(now);

      await setDoc(doc(db, "attendance", uid), {
        [today]: {
          checkInTime: now,
          employeeName: user.name,
          employeeUid: user.uid,
          checkInLocation: address,
        }
      }, { merge: true });

      setCheckInPerformed(true);
      alert("Checked in successfully!");
    } catch (error) {
      console.error("Error recording check-in:", error);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setIsCheckingOut(true);
    try {
      const attendanceRef = doc(db, 'attendance', user.uid);
      const attendanceSnap = await getDoc(attendanceRef);
      const today = formatDate(new Date());

      if (attendanceSnap.exists()) {
        const checkInData = attendanceSnap.data()[today];
        if (checkInData && checkInData.checkInTime) {
          const checkInTime = checkInData.checkInTime.toDate();
          const now = new Date();
          const durationMillis = now.getTime() - checkInTime.getTime();

          if (durationMillis < 0) {
            alert("Check-out time cannot be earlier than check-in time.");
            return;
          }

          const durationSeconds = Math.floor(durationMillis / 1000);
          const durationMinutes = Math.floor(durationSeconds / 60);
          const durationHours = Math.floor(durationMinutes / 60);
          const formattedDuration = `${durationHours} hours and ${durationMinutes % 60} minutes`;

          await updateDoc(attendanceRef, {
            [`${today}.checkOutTime`]: now,
            [`${today}.checkOutLocation`]: address,
            [`${today}.duration`]: formattedDuration,
            [`${today}.statuses`]: 'Present',
          });

          setCheckOutPerformed(true);
          alert("Checked out successfully!");
        } else {
          alert("No check-in record found for today.");
        }
      } else {
        alert("No attendance record found for today.");
      }
    } catch (error) {
      console.error("Error recording check-out:", error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleRequest = async () => {
    const uid = user.uid;
    const today = formatDate(new Date());

    try {
      // Update attendance document with the comment
      await updateDoc(doc(db, 'attendance', uid), {
        [`${today}.request`]: comment, // Store the comment along with attendance data
      });

      alert("Request submitted successfully!");
      setShowModal(false);
      setComment("");
    } catch (error) {
      console.error("Error submitting request:", error);
    }
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const today = formatDate(new Date());

  return (
    <div className="attendance-container">
      <EmployeeDashboard />
      <div className={`attendance-content ${collapsed ? "collapsed" : ""}`}>
        <h1 className="mt-5">My Attendance</h1>
        <div className="attendance-card mt-3">
          <h5>Welcome, {user.name}</h5>
          <div className="calendar-input mt-2">
            <p><strong>Date:</strong> {today}</p>
          </div>

          {attendanceData && attendanceData[today] ? (
            <>
              <p><strong>Check-in Time:</strong> {attendanceData[today].checkInTime?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'N/A'}</p>
              <p><strong>Check-in Location:</strong> {attendanceData[today].checkInLocation || 'N/A'}</p>
              <p><strong>Check-out Time:</strong> {attendanceData[today].checkOutTime?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'N/A'}</p>
              <p><strong>Check-out Location:</strong> {attendanceData[today].checkOutLocation || 'N/A'}</p>
            </>
          ) : (
            <p>No attendance data for today.</p>
          )}
          {/* Request Button */}
          <div className="attendance-buttons mt-3">
            <button className="request-button btn btn-primary" onClick={() => setShowModal(true)}>
              Request
            </button>
          </div>

          {/* Check-in Button */}
          {!checkInPerformed && (
            <div className="attendance-buttons mt-2">
              <button className="checkin-button" onClick={handleCheckIn} disabled={isCheckingIn}>
                {isCheckingIn ? "Checking In..." : "Check-in"}
              </button>
            </div>
          )}

          {/* Check-out Button */}
          {checkInPerformed && !checkOutPerformed && (
            <div className="attendance-buttons mt-2">
              <button className="checkout-button" onClick={handleCheckOut} disabled={isCheckingOut}>
                {isCheckingOut ? "Checking Out..." : "Check-out"}
              </button>
            </div>
          )}

          <Map onCheckIn={setAddress} />

          
        </div>
      </div>

      {/* Modal for comment input */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Submit a Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="form-group">
              <label htmlFor="comment">Comment</label>
              <input
                type="text"
                className="form-control"
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleRequest}>
            Submit Request
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Attendance;
