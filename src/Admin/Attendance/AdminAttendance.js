import React, { useState, useEffect } from 'react';
import { db } from '../../FirebaseConfig/Firebaseconfig'; // Adjust the import path
import { collection, getDocs } from 'firebase/firestore';
import AdminDashboard from '../Dashboard/AdminDashboard';
import './AdminAttendance.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ReactPaginate from 'react-paginate';
import { ThreeDots } from 'react-loader-spinner';

const Attendance = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [users, setUsers] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [roleFilter, setRoleFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [entriesPerPage] = useState(5);
    const [showModal, setShowModal] = useState(false);
    const [modalImage, setModalImage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const today = new Date();

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}h ${minutes}m ${secs}s`;
    };

    const formatDateForKey = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const userData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            userData.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
            setUsers(userData);
        } catch (error) {
            console.error("Error fetching users data: ", error);
        }
    };

    const fetchAttendance = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'attendance'));
            const attendance = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAttendanceData(attendance);
        } catch (error) {
            console.error("Error fetching attendance data: ", error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchAttendance();
    }, []);

    const todayKey = formatDateForKey(currentDate);

    // Process the nested attendance data
    const processAttendanceData = () => {
        return attendanceData.map(doc => {
            const dateData = doc[todayKey] || {};
            return {
                id: doc.id,
                employeeName: dateData.employeeName || 'N/A',
                checkInTime: dateData.checkInTime ? new Date(dateData.checkInTime.seconds * 1000).toLocaleTimeString() : 'N/A',
                checkInLocation: dateData.checkInLocation || 'N/A',
                checkInImageUrl: dateData.checkInImageUrl || null,
                checkOutTime: dateData.checkOutTime ? new Date(dateData.checkOutTime.seconds * 1000).toLocaleTimeString() : 'N/A',
                checkOutLocation: dateData.checkOutLocation || 'N/A',
                checkOutImageUrl: dateData.checkOutImageUrl || null,
                statuses: dateData.statuses || 'N/A',
                duration: dateData.duration || 'N/A'
            };
        });
    };

    const combinedData = users
        .filter(user => roleFilter === 'All' || user.role === roleFilter)
        .map(user => {
            const userAttendance = processAttendanceData().find(entry => entry.id === user.id);
            return {
                ...user,
                ...userAttendance
            };
        });

    const filteredData = combinedData.filter(user =>
        Object.keys(user).some(key =>
            String(user[key]).toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const handlePrevious = () => {
        const prevDate = new Date(currentDate);
        prevDate.setDate(currentDate.getDate() - 1);
        setCurrentDate(prevDate);
    };

    const handleNext = () => {
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + 1);
        if (nextDate <= new Date()) {
            setCurrentDate(nextDate);
        }
    };

    const isToday = formatDateForKey(currentDate) === formatDateForKey(today);

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.text(`Attendance Report - ${formatDate(currentDate)}`, 14, 10);

        const tableColumn = ["S.No", "Name", "Role", "Check-In", "Check-In Location", "Check-In Image", "Check-Out", "Check-Out Location", "Check-Out Image", "Status", "Duration"];
        const tableRows = [];

        combinedData.forEach((user, index) => {
            const userData = [
                index + 1,
                user.name || 'N/A',
                user.role || 'N/A',
                user.checkInTime || 'N/A',
                user.checkInLocation || 'N/A',
                user.checkInImageUrl ? 'View Image' : 'N/A',
                user.checkOutTime || 'N/A',
                user.checkOutLocation || 'N/A',
                user.checkOutImageUrl ? 'View Image' : 'N/A',
                user.statuses || 'N/A',
                user.duration || 'N/A'
            ];
            tableRows.push(userData);
        });

        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.save(`Attendance_Report_${formatDate(currentDate)}.pdf`);
    };

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    const offset = currentPage * entriesPerPage;
    const paginatedData = filteredData.slice(offset, offset + entriesPerPage);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setLoading(false);
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
        <div className='attendance-container'>
            <AdminDashboard onToggleSidebar={setCollapsed} />
            <div className={`attendance-content ${collapsed ? 'collapsed' : ''}`}>
                <div className="d-flex justify-content-center">
                    <div className="navigation-buttons d-flex align-items-center">
                        <FaArrowLeft
                            onClick={handlePrevious}
                            style={{ cursor: 'pointer' }}
                            size={24}
                        />
                        &nbsp; &nbsp;
                        <h1 className='attendance-heading'>Attendance for {formatDate(currentDate)}</h1>
                        &nbsp; &nbsp;
                        <FaArrowRight
                            onClick={handleNext}
                            style={{ cursor: isToday ? 'not-allowed' : 'pointer', opacity: isToday ? 0.5 : 1 }}
                            size={24}
                            disabled={isToday}
                        />
                    </div>
                </div>

                <div className="filter-container d-flex justify-content-between align-items-center mt-3">
                    <div>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="attendance-search"
                        />
                    </div>
                    
                    <button className="download-btn" onClick={handleDownloadPDF}>Download PDF</button>
                </div>

                <table className="attendance-table">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Check-In Time</th>
                            <th>Check-In Location</th>
                            <th>Check-In Image</th>
                            <th>Check-Out Time</th>
                            <th>Check-Out Location</th>
                            <th>Check-Out Image</th>
                            <th>Status</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((user, index) => (
                            <tr key={user.id}>
                                <td>{offset + index + 1}</td>
                                <td>{user.name || 'N/A'}</td>
                                <td>{user.role || 'N/A'}</td>
                                <td>{user.checkInTime || 'N/A'}</td>
                                <td>{user.checkInLocation || 'N/A'}</td>
                                <td>
                                    {user.checkInImageUrl ? (
                                        <a href={user.checkInImageUrl} target="_blank" rel="noopener noreferrer" className="checkin-image-link">
                                            View Image
                                        </a>
                                    ) : 'N/A'}
                                </td>
                                <td>{user.checkOutTime || 'N/A'}</td>
                                <td>{user.checkOutLocation || 'N/A'}</td>
                                <td>
                                    {user.checkOutImageUrl ? (
                                        <a href={user.checkOutImageUrl} target="_blank" rel="noopener noreferrer" className="checkout-image-link">
                                            View Image
                                        </a>
                                    ) : 'N/A'}
                                </td>
                                <td>{user.statuses || 'N/A'}</td>
                                <td>{user.duration || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <ReactPaginate
                    previousLabel={"Previous"}
                    nextLabel={"Next"}
                    breakLabel={"..."}
                    pageCount={Math.ceil(filteredData.length / entriesPerPage)}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={handlePageClick}
                    containerClassName={"pagination"}
                    pageClassName={"page-item"}
                    pageLinkClassName={"page-link"}
                    previousClassName={"page-item"}
                    previousLinkClassName={"page-link"}
                    nextClassName={"page-item"}
                    nextLinkClassName={"page-link"}
                    breakClassName={"page-item"}
                    breakLinkClassName={"page-link"}
                    activeClassName={"active"}
                />


{showModal && (
    <div className="modal">
        <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            {isLoading && <ThreeDots height="80" width="80" radius="9" color="#00BFFF" ariaLabel="three-dots-loading" />}
            <img
                src={modalImage}
                alt="Attendance"
                className="modal-image"
            />
        </div>
    </div>
)}

            </div>
        </div>
    );
};

export default Attendance;
