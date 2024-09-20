import React, { useEffect, useState } from 'react';
import { db, auth } from '../../FirebaseConfig/Firebaseconfig';
import { collection, getDocs, updateDoc, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword,deleteUser } from 'firebase/auth';
import AdminDashboard from '../Dashboard/AdminDashboard';
import { Button, Form, Col, Row, Pagination } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import "./Users.css";
import { ThreeDots } from 'react-loader-spinner';
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

const UserTable = () => {
  const [roleFilter, setRoleFilter] = useState('All');
  const [collapsed, setCollapsed] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(null); // State to track the loading status

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()  // Spread the document data into the object
      }));
  
      // Sort users by createdAt timestamp in descending order
      const sortedUsers = usersList.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
      
      setUsers(sortedUsers); // Set sorted data to state
    } catch (error) {
      console.error("Error fetching users: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);



  const generateStaffId = async (role) => {
    const prefix = role === "Employee" ? "EMPID0" :"UNKNOWN";
    
    const counterRef = doc(db, 'counters', role); // 'counters' is the collection name
    const counterDoc = await getDoc(counterRef);
    
    let number = 1;
    if (counterDoc.exists()) {
      number = counterDoc.data().lastId + 1;
      await updateDoc(counterRef, { lastId: number });
    } else {
      await setDoc(counterRef, { lastId: number });
    }
    
    return `${prefix}${String(number).padStart(3, '0')}`; // Format to ensure 3-digit number
  };

  const handleStatusChange = async (userId, newStatus) => {
    if (newStatus === "Verified") {
      const confirmed = window.confirm("Are you sure you want to verify this employee?");
      if (!confirmed) return;
  
      setLoading(true);
      setStatusLoading(userId);
  
      try {
        const oldUserDocRef = doc(db, 'users', userId);
        const oldUserSnapshot = await getDoc(oldUserDocRef);
        if (!oldUserSnapshot.exists()) {
          throw new Error("User document not found");
        }
  
        const user = oldUserSnapshot.data();
        let updateData = { status: newStatus };
  
        const formattedName = user.name.charAt(0).toUpperCase() + user.name.slice(1).toLowerCase();
        const newPassword = `${formattedName.replace(/\s+/g, '')}@123`;
        const staffId = await generateStaffId(user.role);
        updateData = { ...updateData, password: newPassword, employeeUid: '', staffId };
  
        const emailPayload = {
          to_email: [user.email],
          subject: "Your Account Details",
          message: `
          <p></p>Your account has been verified. Your login credentials are:
          <p>Email: ${user.email}</p>
          <p>Password: ${newPassword}</p>
          `
        };
  
        await fetch('https://saikrishnaapi.vercel.app/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailPayload)
        });
  
        const auth = getAuth();
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, user.email, newPassword);
          const newUser = userCredential.user; // Corrected declaration here
  
          const userUid = newUser.uid;
          const newUserDocRef = doc(db, 'users', userUid);
          await setDoc(newUserDocRef, { ...user, ...updateData, employeeUid: userUid });
  
          await deleteDoc(oldUserDocRef);
  
          // Re-fetch and sort users
          await fetchUsers(); // Ensure to call fetchUsers to get the updated and sorted data
  
        } catch (authError) {
          console.error('Error creating user in Firebase Authentication:', authError);
        }
      } catch (error) {
        console.error('Error updating status:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // Update status directly for other values
      try {
        const oldUserDocRef = doc(db, 'users', userId);
        await updateDoc(oldUserDocRef, { status: newStatus });
  
        // Re-fetch and sort users
        await fetchUsers(); // Ensure to call fetchUsers to get the updated and sorted data
  
      } catch (error) {
        console.error('Error updating status:', error);
      } finally {
        setStatusLoading(null); // Clear the loading state after updating
      }
    }
  };
  
  


  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesSearchTerm = Object.values(user).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesRole && matchesSearchTerm;
  });

  const indexOfLastUser = currentPage * pageSize;
  const indexOfFirstUser = indexOfLastUser - pageSize;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    return (
      <Pagination>
        <Pagination.Prev
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        />
        {pages}
        <Pagination.Next
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

  const downloadPdf = () => {
    const doc = new jsPDF();

    const tableColumn = ["S.No", "Name", "Role", "Project Assigned", "Email", "Phone Number", "Status", "Password"];
    const tableRows = [];

    filteredUsers.forEach((user, index) => {
      const userData = [
        index + 1,
        user.name,
        user.role,
        user.project,
        user.email,
        user.mobileNumber,
        user.status,
        user.status === "Disabled" ? "Disabled" : user.password
      ];
      tableRows.push(userData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text("User Data", 14, 15);
    doc.save("user_data.pdf");
  };
  
  const handleDelete = async (userId) => {
    const confirmation = window.confirm("Are you sure you want to delete this user?");
    if (!confirmation) {
      return; // User canceled the deletion
    }
  
    try {
      // Get the current user from Firebase Authentication
      const user = auth.currentUser;
  
      if (user) {
        // Prompt the user for their password to re-authenticate
        const password = window.prompt("Please enter your password to confirm user deletion:");
  
        if (!password) {
          throw new Error("Password is required for re-authentication.");
        }
  
        // Create credential with email and password
        const credential = EmailAuthProvider.credential(user.email, password);
  
        // Re-authenticate the user
        await reauthenticateWithCredential(user, credential);
  
        // Now delete the user from Firebase Authentication
        await deleteUser(user);
  
        console.log("User successfully deleted from Firebase Authentication.");
      } else {
        throw new Error("No user is currently signed in.");
      }
  
      // Now delete the user's document from Firestore
      await deleteDoc(doc(db, "users", userId));
  
      // Update your local state if necessary (e.g., remove from the UI)
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  
      console.log("User's document successfully deleted from Firestore.");
    } catch (error) {
      console.error("Error deleting user:", error.message);
      if (error.code === 'auth/wrong-password') {
        alert('Incorrect password. Please try again.');
      } else if (error.code === 'auth/user-not-found') {
        alert('User not found. Please refresh and try again.');
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };
  

  useEffect(() => {
      const fetchData = async () => {
        // Simulate a network request
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false); // Set loading to false after data is fetched
      };
  
      fetchData();
    }, []);
  
    if (loading) {
      return (
        <div className="loader-container">
          <ThreeDots 
            height="80" 
            width="80" 
            radius="9"
            color="#00BFFF"
            ariaLabel="three-dots-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      );
    }

  return (
    <div className='users-container'>
      <AdminDashboard onToggleSidebar={setCollapsed} />
      <div className={`users-content ${collapsed ? 'collapsed' : ''}`}>
      <h2 className='text-center'>Staff</ h2>
        <Form className="my-3">
        <Row className="align-items-center justify-content-between">
  <Col xs="auto" className="my-1">
    <div className="position-relative rows-select">
      <Form.Control 
        as="select" 
        value={pageSize} 
        onChange={handlePageSizeChange}
        style={{ paddingRight: '30px' }} // Adjust to make space for the icon
      >
        <option value={5}>5 rows</option>
        <option value={10}>10 rows</option>
        <option value={15}>15 rows</option>
        <option value={20}>20 rows</option>
      </Form.Control>
      <span 
        className="dropdown-icon" 
        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      >
        ▼
      </span>
    </div>
  </Col>

  <Col xs="auto" className="my-1 ml-auto">
    <Form className="d-flex">
      <Form.Control
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearch}
        style={{ paddingRight: '30px' }}
      />
  
    </Form>
  </Col>
</Row>

        </Form>
        <div className="table-responsive mt-3">
          <table className="table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Role</th>
                
                <th>Email</th>
                <th>Phone Number</th>
                <th>Status</th>
                <th>Staff Id</th>
                <th>Password</th>
                <th>Actions</th> 
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>{indexOfFirstUser + index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.role}</td>
               
                  <td>{user.email}</td>
                  <td>{user.mobileNumber}</td>
                  <td>
        {statusLoading === user.id ? ( // Show loader if the status of this user is being updated
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        ) : (
          <select
            value={user.status}
            onChange={(e) => {
              if (user.status !== "Disabled") { // Only handle change if not disabled
                handleStatusChange(user.id, e.target.value);
              }
            }}
          >
            <option value="Not Verified" disabled={user.status === "Verified"}>Not Verified</option>
            <option value="Verified">Verified</option>
          </select>
        )}
      </td>

      <th>{user.staffId || 'NA'}</th>
                  <td>{user.status === "Disabled" ? "Disabled" : user.password}</td>
                  <td>
                    <button style={{ background: '#dc3545' }} onClick={() => handleDelete(user.id)}><FontAwesomeIcon icon={faTrash} /></button>
                  </td> 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination-container">
          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default UserTable;
