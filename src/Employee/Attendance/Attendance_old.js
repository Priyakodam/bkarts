import React, { useState, useEffect,useRef  } from "react";
import EmployeeDashboard from "../EmployeeDashboard/EmployeeDashboard";
import { useAuth } from "../../Context/AuthContext";
import { db, storage } from '../../FirebaseConfig/Firebaseconfig'; // Ensure storage is imported
import { doc, getDoc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import storage functions
import "./Attendance.css";
import Map from "./Map";

const Attendance = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const [address, setAddress] = useState("");
  const [attendanceData, setAttendanceData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); // For handling image
  const [imageUrl, setImageUrl] = useState(""); // To store uploaded image URL
  const [checkInPerformed, setCheckInPerformed] = useState(false); // To track check-in status
  const [checkOutPerformed, setCheckOutPerformed] = useState(false); // To track check-out status
  const [isCheckingIn, setIsCheckingIn] = useState(false); // To manage loading state for check-in
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const fileInputRef = useRef(null);

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
        setAttendanceData(null); // Clear data if no document exists
      }
    });
  
    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, [user.uid]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedImage) {
      alert("Please upload an image before checking in."); // Alert if no image is uploaded
      return;
    }
    setIsCheckingIn(true);

    try {
      // Upload image to Firebase Storage
      const imageRef = ref(storage, `attendance_uploads/${user.uid}/${new Date().toISOString()}_${selectedImage.name}`);
      await uploadBytes(imageRef, selectedImage);
      const downloadURL = await getDownloadURL(imageRef);
      setImageUrl(downloadURL);

      const uid = user.uid;
      const now = new Date();
      const today = formatDate(new Date());

      await setDoc(doc(db, "attendance", uid), {
        [today]: {
          checkInTime: now,
          employeeName: user.name,
          employeeUid: user.uid,
          checkInLocation: address,
          checkInImageUrl: downloadURL // Save image URL in Firestore
        }
      }, { merge: true });

      setCheckInPerformed(true);
      setSelectedImage(null); // Clear the image after check-in
      fileInputRef.current.value = "";
      alert("Checked in successfully!");
    } catch (error) {
      console.error("Error recording check-in:", error);
    }finally {
      setIsCheckingIn(false); // Set loading state to false
    }
  };

  const handleCheckOut = async () => {
    if (!selectedImage) {
      alert("Please upload an image before checking out.");
      return;
    }

    setIsCheckingOut(true);

    try {
      const attendanceRef = doc(db, 'attendance', user.uid);
      const attendanceSnap = await getDoc(attendanceRef);
      const today = formatDate(new Date());
      const dateKey = today;

      if (attendanceSnap.exists()) {
        const checkInData = attendanceSnap.data()[dateKey];
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
      

          // Upload image to Firebase Storage
          const imageRef = ref(storage, `attendance_uploads/${user.uid}/${new Date().toISOString()}_${selectedImage.name}`);
          await uploadBytes(imageRef, selectedImage);
          const downloadURL = await getDownloadURL(imageRef);

          await updateDoc(attendanceRef, {
            [`${dateKey}.checkOutTime`]: now,
            [`${dateKey}.checkOutLocation`]: address,
            [`${dateKey}.duration`]: formattedDuration,
            [`${dateKey}.statuses`]: 'Present',
            [`${dateKey}.checkOutImageUrl`]: downloadURL // Save check-out image URL in Firestore
          });

          setCheckOutPerformed(true);
          setSelectedImage(null); // Clear the image after check-out
          alert("Checked out successfully!");
        } else {
          alert("No check-in record found for today.");
        }
      } else {
        alert("No attendance record found for today.");
      }
    } catch (error) {
      console.error("Error recording check-out:", error);
    }finally {
        setIsCheckingOut(false); // Set loading state to false
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
          <p>
            <strong>Check-in Time:</strong> {attendanceData[today].checkInTime?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'N/A'}
          </p>
          <p>
            <strong>Check-in Location:</strong> {attendanceData[today].checkInLocation || 'N/A'}
          </p>
          {attendanceData[today].checkInImageUrl && (
            <p>
              <strong>Check-In Image: </strong> 
              <a href={attendanceData[today].checkInImageUrl} target="_blank" rel="noopener noreferrer" className="checkin-image-link">
                View Image
              </a>
            </p>
          )}
          <p>
            <strong>Check-out Time:</strong> {attendanceData[today].checkOutTime?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'N/A'}
          </p>
          <p>
            <strong>Check-out Location:</strong> {attendanceData[today].checkOutLocation || 'N/A'}
          </p>
          {attendanceData[today].checkOutImageUrl && (
            <p>
              <strong>Check-Out Image: </strong> 
              <a href={attendanceData[today].checkOutImageUrl} target="_blank" rel="noopener noreferrer" className="checkout-image-link">
                View Image
              </a>
            </p>
          )}
        </>
      ) : (
        <p>No attendance data for today.</p>
      )}

      {/* Show image upload only if check-in or check-out is not yet done */}
      {!checkInPerformed || !checkOutPerformed ? (
        <div className="image-upload mt-2">
          <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef}  />
        </div>
      ) : null}

      {/* Check-in Button */}
      {!checkInPerformed && (
        <div className="attendance-buttons mt-2">
          <button className="checkin-button" onClick={handleCheckIn} disabled={isCheckingIn || !selectedImage}>
            {isCheckingIn ? "Checking In..." : "Check-in"}
          </button>
        </div>
      )}

      {/* Check-out Button */}
      {checkInPerformed && !checkOutPerformed && (
        <div className="attendance-buttons mt-2">
          <button className="checkout-button" onClick={handleCheckOut} disabled={isCheckingOut || !selectedImage}>
            {isCheckingOut ? "Checking Out..." : "Check-out"}
          </button>
        </div>
      )}

      <Map onCheckIn={setAddress} />
    </div>
  </div>
</div>


  );
};

export default Attendance;
