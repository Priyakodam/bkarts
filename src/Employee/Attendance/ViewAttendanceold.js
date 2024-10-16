import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { db } from '../../FirebaseConfig/Firebaseconfig';
import { doc, getDoc } from 'firebase/firestore';
import EmployeeDashboard from '../EmployeeDashboard/EmployeeDashboard';
import { Pagination } from 'react-bootstrap';
import './ViewAttendance.css';
import { faEye, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

// Utility function to get the start date of the week
const getWeekStartDate = (date) => {
    const startDate = new Date(date);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust if day is Sunday
    startDate.setDate(diff);
    startDate.setHours(0, 0, 0, 0);
    return startDate;
};

const AttendanceTable = () => {
    const { user } = useAuth();
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
    const [selectedDetails, setSelectedDetails] = useState({});
    const [currentWeekStartDate, setCurrentWeekStartDate] = useState(getWeekStartDate(new Date()));

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5; // Number of records per page
    const maxButtonsToShow = 5; // Maximum pagination buttons to show

    // Pagination calculations
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = attendanceData.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(attendanceData.length / recordsPerPage);

    useEffect(() => {
        const fetchAttendanceData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const attendanceRef = doc(db, 'attendance', user.uid);
                const attendanceSnap = await getDoc(attendanceRef);

                if (attendanceSnap.exists()) {
                    const data = attendanceSnap.data() || {};
                    // Convert attendance data into an array and parse dates
                    const attendanceArray = Object.entries(data).map(([dateStr, record]) => ({
                        date: dateStr,
                        ...record,
                    }));
                    setAttendanceData(attendanceArray);
                } else {
                    setAttendanceData([]);
                }
            } catch (error) {
                console.error('Error fetching attendance data:', error);
                setError('Failed to fetch attendance data.');
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceData();
    }, [user]);

    useEffect(() => {
        // Filter attendance data for the current week whenever the week changes
        filterAttendanceForWeek(currentWeekStartDate);
    }, [currentWeekStartDate, attendanceData]);

    const filterAttendanceForWeek = (weekStartDate) => {
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekStartDate.getDate() + 6);
        weekEndDate.setHours(23, 59, 59, 999);

        const filteredData = attendanceData.filter((record) => {
            const recordDate = new Date(record.date.split('-').reverse().join('-')); // Assuming date format is 'dd-mm-yyyy'
            return recordDate >= weekStartDate && recordDate <= weekEndDate;
        });

        // Sort the filtered data by date
        filteredData.sort((a, b) => {
            const dateA = new Date(a.date.split('-').reverse().join('-'));
            const dateB = new Date(b.date.split('-').reverse().join('-'));
            return dateA - dateB;
        });

        setFilteredAttendance(filteredData);
        setCurrentPage(1); // Reset to first page whenever data changes
    };

    const [filteredAttendance, setFilteredAttendance] = useState([]);

    // Pagination calculations for filtered data
    const totalFilteredPages = Math.ceil(filteredAttendance.length / recordsPerPage);
    const indexOfLastFilteredRecord = currentPage * recordsPerPage;
    const indexOfFirstFilteredRecord = indexOfLastFilteredRecord - recordsPerPage;
    const currentFilteredRecords = filteredAttendance.slice(
        indexOfFirstFilteredRecord,
        indexOfLastFilteredRecord
    );

    function formatDate(dateString) {
        // Check if dateString is not a string and convert it if necessary
        if (dateString instanceof Date) {
            dateString = dateString.toISOString().split('T')[0]; // Convert Date to 'YYYY-MM-DD' format
        } else if (typeof dateString !== 'string') {
            console.error('formatDate expects a string or Date object');
            return ''; // Return an empty string or handle the error as needed
        }

        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
    }


    const handlePreviousWeek = () => {
        const newStartDate = new Date(currentWeekStartDate);
        newStartDate.setDate(newStartDate.getDate() - 7);
        setCurrentWeekStartDate(getWeekStartDate(newStartDate));
    };

    const handleNextWeek = () => {
        if (nextWeekDisabled) return; // Do nothing if next week is disabled

        const newStartDate = new Date(currentWeekStartDate);
        newStartDate.setDate(newStartDate.getDate() + 7);
        setCurrentWeekStartDate(getWeekStartDate(newStartDate));
    };


    const renderPagination = () => {
        let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
        let endPage = Math.min(totalFilteredPages, startPage + maxButtonsToShow - 1);

        if (endPage - startPage + 1 < maxButtonsToShow) {
            startPage = Math.max(1, endPage - maxButtonsToShow + 1);
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
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
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                />
                {startPage > 1 && <Pagination.Ellipsis />}
                {pages}
                {endPage < totalFilteredPages && <Pagination.Ellipsis />}
                <Pagination.Next
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalFilteredPages))}
                    disabled={currentPage === totalFilteredPages}
                />
            </Pagination>
        );
    };

    const nextWeekDisabled = (() => {
        const nextWeekStartDate = new Date(currentWeekStartDate);
        nextWeekStartDate.setDate(nextWeekStartDate.getDate() + 7);
        return nextWeekStartDate > new Date(); // Disables if the next week's start date is in the future
    })();


    const openModal = (data) => {
        console.log('Selected details:', data);
        setSelectedDetails(data);
        setIsModalOpen(true);
    };

    // Function to close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDetails({});
    };


    return (
        <div className='view-attendance-container'>
            <EmployeeDashboard onToggleSidebar={setCollapsed} />
            <div className={`view-attendance-content ${collapsed ? 'collapsed' : ''}`}>
                <div className="navigation-buttons d-flex align-items-center">
                    <FaArrowLeft
                        onClick={handlePreviousWeek}
                        style={{ cursor: 'pointer' }}
                        size={24}
                    />
                    &nbsp; &nbsp;
                    <h2 className='attendance-heading'>
                        Attendance for {formatDate(currentWeekStartDate)} to{' '}
                        {formatDate(new Date(currentWeekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000))}
                    </h2>
                    &nbsp; &nbsp;
                    <FaArrowRight
                        onClick={handleNextWeek}
                        style={{
                            cursor: nextWeekDisabled ? 'not-allowed' : 'pointer',
                            color: nextWeekDisabled ? 'gray' : 'inherit'
                        }}
                        size={24}
                        disabled={nextWeekDisabled}
                    />
                </div>


                {loading ? (
                    <div>Loading attendance data...</div>
                ) : error ? (
                    <div>{error}</div>
                ) : (
                    <>
                        <div className="table-responsive mt-3">
                            <table className="table table-striped mt-3">
                                <thead>
                                    <tr className='td'>
                                        <th>S.No</th>
                                        <th>Date</th>
                                        <th>Check-In</th>
                                        <th>Check-Out</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentFilteredRecords.length > 0 ? (
                                        currentFilteredRecords.map((data, index) => (
                                            <tr key={index} className='td'>
                                                <td>{indexOfFirstFilteredRecord + index + 1}</td>
                                                <td>{data.date}</td>
                                                <td>
                                                    {data.checkInTime
                                                        ? new Date(data.checkInTime.seconds * 1000).toLocaleTimeString()
                                                        : 'N/A'}
                                                </td>
                                                <td>
                                                    {data.checkOutTime
                                                        ? new Date(data.checkOutTime.seconds * 1000).toLocaleTimeString()
                                                        : 'N/A'}
                                                </td>
                                                <td>
                                                    {data.duration
                                                        || 'N/A'}
                                                </td>
                                                <td>
                                                    {data.statuses
                                                        || 'N/A'}
                                                </td>
                                                <td>
                                                    <button className="btn btn-primary" onClick={() => openModal(data)}>
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </button>
                                                    
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center">
                                                No attendance records available for this week.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="d-flex justify-content-center mt-3">
                            {renderPagination()}
                        </div>
                    </>
                )}

                {isModalOpen && (
                    <div className="custom-modal">
                        <div className="modal-content1">
                            <span className="close" onClick={closeModal}>&times;</span>
                            <h2>Details</h2>
                            <p><strong>Check-In Location:</strong> {selectedDetails.checkInLocation || 'N/A'}</p>
                            <p><strong>Check-Out Location:</strong> {selectedDetails.checkOutLocation || 'N/A'}</p>
                            {/* <p><strong>Check-In Image: </strong>
<a href={selectedDetails.checkInImageUrl} target="_blank" rel="noopener noreferrer" className="checkin-image-link"
style={{textDecoration:"none"}}>
                View Image
              </a></p> */}
                            {/* <p><strong>Check-Out Image: </strong>
<a href={selectedDetails.checkOutImageUrl} target="_blank" rel="noopener noreferrer" className="checkin-image-link" style={{textDecoration:"none"}}>
                View Image
              </a></p> */}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceTable;











/////////////////////////////////////////////////////



// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../Context/AuthContext';
// import { db } from '../../FirebaseConfig/Firebaseconfig';
// import { doc, getDoc, updateDoc } from 'firebase/firestore';
// import EmployeeDashboard from '../EmployeeDashboard/EmployeeDashboard';
// import { Pagination } from 'react-bootstrap';
// import './ViewAttendance.css';
// import { faEye, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

// const getWeekStartDate = (date) => {
//     const startDate = new Date(date);
//     const day = startDate.getDay();
//     const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
//     startDate.setDate(diff);
//     startDate.setHours(0, 0, 0, 0);
//     return startDate;
// };

// const AttendanceTable = () => {
//     const { user } = useAuth();
//     const [attendanceData, setAttendanceData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [collapsed, setCollapsed] = useState(false);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
//     const [selectedDetails, setSelectedDetails] = useState({});
//     const [currentWeekStartDate, setCurrentWeekStartDate] = useState(getWeekStartDate(new Date()));
//     const [currentPage, setCurrentPage] = useState(1);
//     const recordsPerPage = 5;
//     const maxButtonsToShow = 5;
//     const [requestComment, setRequestComment] = useState('');
//     const [selectedRecord, setSelectedRecord] = useState(null);

//     const indexOfLastRecord = currentPage * recordsPerPage;
//     const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
//     const currentRecords = attendanceData.slice(indexOfFirstRecord, indexOfLastRecord);
//     const totalPages = Math.ceil(attendanceData.length / recordsPerPage);

//     useEffect(() => {
//         const fetchAttendanceData = async () => {
//             if (!user) return;
//             setLoading(true);
//             try {
//                 const attendanceRef = doc(db, 'attendance', user.uid);
//                 const attendanceSnap = await getDoc(attendanceRef);

//                 if (attendanceSnap.exists()) {
//                     const data = attendanceSnap.data() || {};
//                     const attendanceArray = Object.entries(data).map(([dateStr, record]) => ({
//                         date: dateStr,
//                         ...record,
//                     }));
//                     setAttendanceData(attendanceArray);
//                 } else {
//                     setAttendanceData([]);
//                 }
//             } catch (error) {
//                 console.error('Error fetching attendance data:', error);
//                 setError('Failed to fetch attendance data.');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchAttendanceData();
//     }, [user]);

//     useEffect(() => {
//         filterAttendanceForWeek(currentWeekStartDate);
//     }, [currentWeekStartDate, attendanceData]);

//     const filterAttendanceForWeek = (weekStartDate) => {
//         const weekEndDate = new Date(weekStartDate);
//         weekEndDate.setDate(weekStartDate.getDate() + 6);
//         weekEndDate.setHours(23, 59, 59, 999);

//         const filteredData = attendanceData.filter((record) => {
//             const recordDate = new Date(record.date.split('-').reverse().join('-'));
//             return recordDate >= weekStartDate && recordDate <= weekEndDate;
//         });

//         filteredData.sort((a, b) => {
//             const dateA = new Date(a.date.split('-').reverse().join('-'));
//             const dateB = new Date(b.date.split('-').reverse().join('-'));
//             return dateA - dateB;
//         });

//         setFilteredAttendance(filteredData);
//         setCurrentPage(1);
//     };

//     const [filteredAttendance, setFilteredAttendance] = useState([]);
//     const totalFilteredPages = Math.ceil(filteredAttendance.length / recordsPerPage);
//     const indexOfLastFilteredRecord = currentPage * recordsPerPage;
//     const indexOfFirstFilteredRecord = indexOfLastFilteredRecord - recordsPerPage;
//     const currentFilteredRecords = filteredAttendance.slice(
//         indexOfFirstFilteredRecord,
//         indexOfLastFilteredRecord
//     );

//     function formatDate(dateString) {
//         if (dateString instanceof Date) {
//             dateString = dateString.toISOString().split('T')[0];
//         } else if (typeof dateString !== 'string') {
//             console.error('formatDate expects a string or Date object');
//             return '';
//         }

//         const [year, month, day] = dateString.split('-');
//         return `${day}-${month}-${year}`;
//     }

//     const handlePreviousWeek = () => {
//         const newStartDate = new Date(currentWeekStartDate);
//         newStartDate.setDate(newStartDate.getDate() - 7);
//         setCurrentWeekStartDate(getWeekStartDate(newStartDate));
//     };

//     const handleNextWeek = () => {
//         if (nextWeekDisabled) return;

//         const newStartDate = new Date(currentWeekStartDate);
//         newStartDate.setDate(newStartDate.getDate() + 7);
//         setCurrentWeekStartDate(getWeekStartDate(newStartDate));
//     };

//     const renderPagination = () => {
//         let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
//         let endPage = Math.min(totalFilteredPages, startPage + maxButtonsToShow - 1);

//         if (endPage - startPage + 1 < maxButtonsToShow) {
//             startPage = Math.max(1, endPage - maxButtonsToShow + 1);
//         }

//         const pages = [];
//         for (let i = startPage; i <= endPage; i++) {
//             pages.push(
//                 <Pagination.Item
//                     key={i}
//                     active={i === currentPage}
//                     onClick={() => setCurrentPage(i)}
//                 >
//                     {i}
//                 </Pagination.Item>
//             );
//         }

//         return (
//             <Pagination>
//                 <Pagination.Prev
//                     onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                     disabled={currentPage === 1}
//                 />
//                 {startPage > 1 && <Pagination.Ellipsis />}
//                 {pages}
//                 {endPage < totalFilteredPages && <Pagination.Ellipsis />}
//                 <Pagination.Next
//                     onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalFilteredPages))}
//                     disabled={currentPage === totalFilteredPages}
//                 />
//             </Pagination>
//         );
//     };

//     const nextWeekDisabled = (() => {
//         const nextWeekStartDate = new Date(currentWeekStartDate);
//         nextWeekStartDate.setDate(nextWeekStartDate.getDate() + 7);
//         return nextWeekStartDate > new Date();
//     })();

//     const openModal = (data) => {
//         setSelectedDetails(data);
//         setIsModalOpen(true);
//     };

//     const closeModal = () => {
//         setIsModalOpen(false);
//         setSelectedDetails({});
//     };

//     const openRequestModal = (record) => {
//         setSelectedRecord(record);
//         setIsRequestModalOpen(true);
//     };

//     const closeRequestModal = () => {
//         setIsRequestModalOpen(false);
//         setRequestComment('');
//     };

//     const handleRequestSubmit = async () => {
//         if (!selectedRecord || !user) return;
//         try {
//             const attendanceRef = doc(db, 'attendance', user.uid);
//             await updateDoc(attendanceRef, {
//                 [`${selectedRecord.date}.requestComment`]: requestComment,
//             });
//             setAttendanceData((prevData) =>
//                 prevData.map((item) =>
//                     item.date === selectedRecord.date ? { ...item, requestComment } : item
//                 )
//             );
//             closeRequestModal();
//         } catch (error) {
//             console.error('Error saving request comment:', error);
//         }
//     };

//     return (
//         <div className='view-attendance-container'>
//             <EmployeeDashboard onToggleSidebar={setCollapsed} />
//             <div className={`view-attendance-content ${collapsed ? 'collapsed' : ''}`}>
//                 <div className="navigation-buttons d-flex align-items-center">
//                     <FaArrowLeft onClick={handlePreviousWeek} style={{ cursor: 'pointer' }} size={24} />
//                     &nbsp; &nbsp;
//                     <h2 className='attendance-heading'>
//                         Attendance for {formatDate(currentWeekStartDate)} to{' '}
//                         {formatDate(new Date(currentWeekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000))}
//                     </h2>
//                     &nbsp; &nbsp;
//                     <FaArrowRight
//                         onClick={handleNextWeek}
//                         style={{
//                             cursor: nextWeekDisabled ? 'not-allowed' : 'pointer',
//                             color: nextWeekDisabled ? 'gray' : 'inherit'
//                         }}
//                         size={24}
//                     />
//                 </div>

//                 {loading ? (
//                     <div>Loading...</div>
//                 ) : error ? (
//                     <div>{error}</div>
//                 ) : (
//                     <>
//                         <table className='attendance-table'>
//                             <thead>
//                                 <tr>
//                                     <th>Date</th>
//                                     <th>Clock In</th>
//                                     <th>Clock Out</th>
//                                     <th>Status</th>
//                                     <th>Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {currentFilteredRecords.map((data) => (
//                                     <tr key={data.date}>
//                                         <td>{data.date}</td>
//                                         <td>{data.clockIn || '--'}</td>
//                                         <td>{data.clockOut || '--'}</td>
//                                         <td>{data.status || '--'}</td>
//                                         <td>
//                                             <FontAwesomeIcon
//                                                 icon={faEye}
//                                                 style={{ cursor: 'pointer' }}
//                                                 onClick={() => openModal(data)}
//                                                 title="View Details"
//                                             />
//                                             &nbsp; &nbsp;
//                                             <FontAwesomeIcon
//                                                 icon={faPaperPlane}
//                                                 style={{ cursor: 'pointer' }}
//                                                 onClick={() => openRequestModal(data)}
//                                                 title="Request"
//                                             />
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                         {renderPagination()}
//                     </>
//                 )}

//                 {isModalOpen && (
//                     <div className="modal-overlay">
//                         <div className="modal-box">
//                             <h3>Details</h3>
//                             <p>Date: {selectedDetails.date}</p>
//                             <p>Clock In: {selectedDetails.clockIn || '--'}</p>
//                             <p>Clock Out: {selectedDetails.clockOut || '--'}</p>
//                             <p>Status: {selectedDetails.status || '--'}</p>
//                             <button onClick={closeModal}>Close</button>
//                         </div>
//                     </div>
//                 )}

//                 {isRequestModalOpen && (
//                     <div className="modal-overlay">
//                         <div className="modal-box">
//                             <h3>Request Comment</h3>
//                             <input
//                                 type="text"
//                                 value={requestComment}
//                                 onChange={(e) => setRequestComment(e.target.value)}
//                                 placeholder="Enter your comment"
//                             />
//                             <button onClick={handleRequestSubmit}>Submit</button>
//                             <button onClick={closeRequestModal}>Cancel</button>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default AttendanceTable;






// import React, { useState, useEffect } from 'react';
// import { db } from '../../FirebaseConfig/Firebaseconfig'; // Adjust the import path
// import { collection, getDocs, query, where } from 'firebase/firestore';
// import AdminDashboard from '../Dashboard/AdminDashboard';
// import './AdminAttendance.css';
// import { FaArrowLeft, FaArrowRight, FaEye } from 'react-icons/fa';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { Modal, Button } from 'react-bootstrap';
// import ReactPaginate from 'react-paginate';
// import { ThreeDots } from 'react-loader-spinner';

// const Attendance = () => {
//     const [collapsed, setCollapsed] = useState(false);
//     const [users, setUsers] = useState([]);
//     const [attendanceData, setAttendanceData] = useState([]);
//     const [currentDate, setCurrentDate] = useState(new Date());
//     const [roleFilter, setRoleFilter] = useState('All');
//     const [searchQuery, setSearchQuery] = useState('');
//     const [currentPage, setCurrentPage] = useState(0);
//     const [entriesPerPage] = useState(5);
//     const [showModal, setShowModal] = useState(false);
//     const [selectedComment, setSelectedComment] = useState('');
//     const [modalImage, setModalImage] = useState('');
//     const [isLoading, setIsLoading] = useState(false);

//     const today = new Date();

//     const formatDuration = (seconds) => {
//         const hours = Math.floor(seconds / 3600);
//         const minutes = Math.floor((seconds % 3600) / 60);
//         const secs = seconds % 60;
//         return `${hours}h ${minutes}m ${secs}s`;
//     };

//     const formatDateForKey = (date) => {
//         const day = String(date.getDate()).padStart(2, '0');
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const year = date.getFullYear();
//         return `${day}-${month}-${year}`;
//     };

//     const fetchUsers = async () => {
//         try {
//             // Create a query to fetch users where status is 'verified'
//             const q = query(collection(db, 'users'), where('status', '==', 'Verified'));

//             const querySnapshot = await getDocs(q);
//             const userData = querySnapshot.docs.map(doc => ({
//                 id: doc.id,
//                 ...doc.data()
//             }));

//             // Sort by createdAt timestamp
//             userData.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

//             setUsers(userData);
//         } catch (error) {
//             console.error("Error fetching verified users data: ", error);
//         }
//     };

//     const fetchAttendance = async () => {
//         try {
//             const querySnapshot = await getDocs(collection(db, 'attendance'));
//             const attendance = querySnapshot.docs.map(doc => ({
//                 id: doc.id,
//                 ...doc.data()
//             }));
//             setAttendanceData(attendance);
//         } catch (error) {
//             console.error("Error fetching attendance data: ", error);
//         }
//     };

//     useEffect(() => {
//         fetchUsers();
//         fetchAttendance();
//     }, []);

//     const todayKey = formatDateForKey(currentDate);

//     // Process the nested attendance data
//     const processAttendanceData = () => {
//         return attendanceData.map(doc => {
//             const dateData = doc[todayKey] || {};
//             return {
//                 id: doc.id,
//                 employeeName: dateData.employeeName || 'N/A',
//                 checkInTime: dateData.checkInTime ? new Date(dateData.checkInTime.seconds * 1000).toLocaleTimeString() : 'N/A',
//                 checkInLocation: dateData.checkInLocation || 'N/A',
//                 checkInImageUrl: dateData.checkInImageUrl || null,
//                 checkOutTime: dateData.checkOutTime ? new Date(dateData.checkOutTime.seconds * 1000).toLocaleTimeString() : 'N/A',
//                 checkOutLocation: dateData.checkOutLocation || 'N/A',
//                 checkOutImageUrl: dateData.checkOutImageUrl || null,
//                 statuses: dateData.statuses || 'N/A',
//                 duration: dateData.duration || 'N/A',
//                 requestComment: dateData.requestComment || 'No Comments'
//             };
//         });
//     };

//     const combinedData = users
//         .filter(user => roleFilter === 'All' || user.role === roleFilter)
//         .map(user => {
//             const userAttendance = processAttendanceData().find(entry => entry.id === user.id);
//             return {
//                 ...user,
//                 ...userAttendance
//             };
//         });

//     const filteredData = combinedData.filter(user =>
//         Object.keys(user).some(key =>
//             String(user[key]).toLowerCase().includes(searchQuery.toLowerCase())
//         )
//     );

//     const handlePrevious = () => {
//         const prevDate = new Date(currentDate);
//         prevDate.setDate(currentDate.getDate() - 1);
//         setCurrentDate(prevDate);
//     };

//     const handleNext = () => {
//         const nextDate = new Date(currentDate);
//         nextDate.setDate(nextDate.getDate() + 1);
//         if (nextDate <= new Date()) {
//             setCurrentDate(nextDate);
//         }
//     };

//     const isToday = formatDateForKey(currentDate) === formatDateForKey(today);

//     const formatDate = (date) => {
//         const day = String(date.getDate()).padStart(2, '0');
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const year = date.getFullYear();
//         return `${day}-${month}-${year}`;
//     };

//     const handleDownloadPDF = () => {
//         const doc = new jsPDF();
//         doc.text(`Attendance Report - ${formatDate(currentDate)}`, 14, 10);

//         const tableColumn = ["S.No", "Name", "Role", "Check-In", "Check-In Location", "Check-In Image", "Check-Out", "Check-Out Location", "Check-Out Image", "Status", "Duration"];
//         const tableRows = [];

//         combinedData.forEach((user, index) => {
//             const userData = [
//                 index + 1,
//                 user.name || 'N/A',
//                 user.role || 'N/A',
//                 user.checkInTime || 'N/A',
//                 user.checkInLocation || 'N/A',
//                 user.checkInImageUrl ? 'View Image' : 'N/A',
//                 user.checkOutTime || 'N/A',
//                 user.checkOutLocation || 'N/A',
//                 user.checkOutImageUrl ? 'View Image' : 'N/A',
//                 user.statuses || 'N/A',
//                 user.duration || 'N/A',
//                 user.requestComment || 'No Comments'
//             ];
//             tableRows.push(userData);
//         });

//         doc.autoTable(tableColumn, tableRows, { startY: 20 });
//         doc.save(`Attendance_Report_${formatDate(currentDate)}.pdf`);
//     };

//     const handlePageClick = ({ selected }) => {
//         setCurrentPage(selected);
//     };

//     const offset = currentPage * entriesPerPage;
//     const paginatedData = filteredData.slice(offset, offset + entriesPerPage);

//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchData = async () => {
//             await new Promise(resolve => setTimeout(resolve, 2000));
//             setLoading(false);
//         };
//         fetchData();
//     }, []);

//     if (loading) {
//         return (
//             <div className="loader-container">
//                 <ThreeDots
//                     height="80"
//                     width="80"
//                     radius="9"
//                     color="#00BFFF"
//                     ariaLabel="three-dots-loading"
//                     wrapperStyle={{}}
//                     wrapperClass=""
//                     visible={true}
//                 />
//             </div>
//         );
//     }

//     const handleShowModal = (comment) => {
//         setSelectedComment(comment);
//         setShowModal(true);
//     };

//     const handleCloseModal = () => {
//         setShowModal(false);
//         setSelectedComment('');
//     };
//     return (
//         <div className='attendance-container'>
//             <AdminDashboard onToggleSidebar={setCollapsed} />
//             <div className={`attendance-content ${collapsed ? 'collapsed' : ''}`}>
//                 <div className="d-flex justify-content-center">
//                     <div className="navigation-buttons d-flex align-items-center">
//                         <FaArrowLeft
//                             onClick={handlePrevious}
//                             style={{ cursor: 'pointer' }}
//                             size={24}
//                         />
//                         &nbsp; &nbsp;
//                         <h2 className='attendance-heading'>Attendance for {formatDate(currentDate)}</h2>
//                         &nbsp; &nbsp;
//                         <FaArrowRight
//                             onClick={handleNext}
//                             style={{ cursor: isToday ? 'not-allowed' : 'pointer', opacity: isToday ? 0.5 : 1 }}
//                             size={24}
//                             disabled={isToday}
//                         />
//                     </div>
//                 </div>

//                 <div className="filter-container d-flex  mt-3">
//                     <div>
//                         <input
//                             type="text"
//                             placeholder="Search..."
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                             className="attendance-search"
//                         />
//                     </div>
//                     &nbsp; &nbsp;
//                     <button className="btn btn-primary" onClick={handleDownloadPDF}>Download PDF</button>
//                 </div>

//                 <table className="attendance-table">
//                     <thead>
//                         <tr>
//                             <th>S.No</th>
//                             <th>Name</th>
//                             <th>Role</th>
//                             <th>Check-In Time</th>
//                             <th>Check-In Location</th>
//                             {/* <th>Check-In Image</th> */}
//                             <th>Check-Out Time</th>
//                             <th>Check-Out Location</th>
//                             {/* <th>Check-Out Image</th> */}
//                             <th>Status</th>
//                             <th>Duration</th>
//                             <th>Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {paginatedData.map((user, index) => (
//                             <tr key={user.id}>
//                                 <td>{offset + index + 1}</td>
//                                 <td>{user.name || 'N/A'}</td>
//                                 <td>{user.role || 'N/A'}</td>
//                                 <td>{user.checkInTime || 'N/A'}</td>
//                                 <td>{user.checkInLocation || 'N/A'}</td>
//                                 {/* <td>
//                                     {user.checkInImageUrl ? (
//                                         <a href={user.checkInImageUrl} target="_blank" rel="noopener noreferrer" className="checkin-image-link">
//                                             View Image
//                                         </a>
//                                     ) : 'N/A'}
//                                 </td> */}
//                                 <td>{user.checkOutTime || 'N/A'}</td>
//                                 <td>{user.checkOutLocation || 'N/A'}</td>
//                                 {/* <td>
//                                     {user.checkOutImageUrl ? (
//                                         <a href={user.checkOutImageUrl} target="_blank" rel="noopener noreferrer" className="checkout-image-link">
//                                             View Image
//                                         </a>
//                                     ) : 'N/A'}
//                                 </td> */}
//                                 <td>{user.statuses || 'N/A'}</td>
//                                 <td>{user.duration || 'N/A'}</td>
//                                 <td><Button
//                                     variant="link"
//                                     onClick={() => handleShowModal(user.requestComment || 'No comments')}
//                                 >
//                                     <FaEye /> {/* Eye icon */}
//                                 </Button></td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>

//                 <ReactPaginate
//                     previousLabel={"Previous"}
//                     nextLabel={"Next"}
//                     breakLabel={"..."}
//                     pageCount={Math.ceil(filteredData.length / entriesPerPage)}
//                     marginPagesDisplayed={2}
//                     pageRangeDisplayed={5}
//                     onPageChange={handlePageClick}
//                     containerClassName={"pagination"}
//                     pageClassName={"page-item"}
//                     pageLinkClassName={"page-link"}
//                     previousClassName={"page-item"}
//                     previousLinkClassName={"page-link"}
//                     nextClassName={"page-item"}
//                     nextLinkClassName={"page-link"}
//                     breakClassName={"page-item"}
//                     breakLinkClassName={"page-link"}
//                     activeClassName={"active"}
//                 />


//                 {showModal && (
//                     <div className="modal">
//                         <div className="modal-content">
//                             <span className="close" onClick={() => setShowModal(false)}>&times;</span>
//                             {isLoading && <ThreeDots height="80" width="80" radius="9" color="#00BFFF" ariaLabel="three-dots-loading" />}
//                             <img
//                                 src={modalImage}
//                                 alt="Attendance"
//                                 className="modal-image"
//                             />
//                         </div>
//                     </div>
//                 )}

//                 {/* Modal for displaying comments */}
//                 <Modal show={showModal} onHide={handleCloseModal}>
//                     <Modal.Header closeButton>
//                         <Modal.Title>Comments</Modal.Title>
//                     </Modal.Header>
//                     <Modal.Body>{selectedComment}</Modal.Body>
//                     <Modal.Footer>
//                         <Button variant="success" >
//                             Accept
//                         </Button>
//                         <Button variant="danger" >
//                             Reject
//                         </Button>
//                     </Modal.Footer>
//                 </Modal>
//             </div>
//         </div>
//     );
// };

// export default Attendance;
