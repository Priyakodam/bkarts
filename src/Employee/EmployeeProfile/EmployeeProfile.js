import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import EmployeeDashboard from "../EmployeeDashboard/EmployeeDashboard";
import { db } from '../../FirebaseConfig/Firebaseconfig'; // Adjust the import path if necessary
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './EmployeeProfile.css';


const Profile = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();


      const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user && user.uid) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userDetails = userSnap.data();
          setUserDetails(userDetails);
          // console.log('User Details:', userDetails); 
        } else {
          console.log('No such document!');
        }
      }
    };
  
    fetchUserDetails();
  }, [user]);
  

  const handleEditClick = () => {
    navigate('/edit-profile'); // Adjust the route if necessary
  };

  return (
    <div className="profile-container">
      <EmployeeDashboard onToggleSidebar={setCollapsed} />
      <div className={`profile-content ${collapsed ? 'collapsed' : ''}`}>
        <h1>My Profile</h1>
        
        {userDetails ? (

          
           <div className="profile-card">
           <div className="edit-icon" onClick={handleEditClick}>
             <i className="fas fa-pencil-alt"></i>
           </div>
           <h2>Personal Details</h2>
           <p><strong>Name:</strong> {userDetails.name}</p>
            <p><strong>Email:</strong> {userDetails.email}</p>
            <p><strong>Mobile:</strong> {userDetails.mobileNumber}</p>
            <p><strong>Role:</strong> {userDetails.role || "NA"}</p>
            <p><strong>StaffId:</strong> {userDetails.staffId}</p>
            <p><strong>Date of Birth:</strong> {formatDate(userDetails.dob) || "NA"}</p>
            <p><strong>Gender:</strong> {userDetails.gender || "NA"}</p>
            <p><strong>Qualification:</strong> {userDetails.qualification || "NA"}</p>
            <p><strong>Address:</strong> {userDetails.address || "NA"}</p>
         </div>



        ) : (
          <p>Loading user details...</p>
        )}

        

        

        
      </div>
    </div>
  );
}

export default Profile;
