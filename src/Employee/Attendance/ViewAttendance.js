import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { db } from '../../FirebaseConfig/Firebaseconfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import EmployeeDashboard from '../EmployeeDashboard/EmployeeDashboard';
import { Pagination } from 'react-bootstrap';
import './ViewAttendance.css';
import './RequestModal.css';
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
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [currentWeekStartDate, setCurrentWeekStartDate] = useState(getWeekStartDate(new Date()));
    const [requestComment, setRequestComment] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);
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

    const openRequestModal = (record) => {
        setSelectedRecord(record);
        setIsRequestModalOpen(true);
    };

    const closeRequestModal = () => {
        setIsRequestModalOpen(false);
        setRequestComment('');
    };

    const handleRequestSubmit = async () => {
        if (!selectedRecord || !user) return;
        try {
            const attendanceRef = doc(db, 'attendance', user.uid);
            await updateDoc(attendanceRef, {
                [`${selectedRecord.date}.requestComment`]: requestComment,
            });
            setAttendanceData((prevData) =>
                prevData.map((item) =>
                    item.date === selectedRecord.date ? { ...item, requestComment } : item
                )
            );
            closeRequestModal();
            
            alert("Your request has been submitted successfully!");
        } catch (error) {
            console.error('Error saving request comment:', error);
        }
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
                                                    <FontAwesomeIcon
                                                        icon={faPaperPlane}
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => openRequestModal(data)}
                                                        title="Request"
                                                    />
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

                        </div>
                    </div>
                )}
                {isRequestModalOpen && (


                    <div className="custom-modal">
                        <div className="modal-content">
                            {/* <span className="close" onClick={onClose}>&times;</span> */}
                            <h2>Request</h2>
                            <div className="form-group">
                                <label htmlFor="comment">Comments:</label>
                                <textarea
                                    id="comment"
                                    className="form-control"
                                    value={requestComment}
                                    onChange={(e) => setRequestComment(e.target.value)}
                                    placeholder="Enter your comment here"
                                />
                            </div>
                            <div className="modal-actions">
                                <button className="btn btn-primary" onClick={handleRequestSubmit}>Submit</button>
                                <button className="btn btn-secondary" onClick={closeRequestModal}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceTable;