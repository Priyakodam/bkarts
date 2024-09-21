import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './../../FirebaseConfig/Firebaseconfig';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import EmployeeDashboard from '../EmployeeDashboard/EmployeeDashboard';
import { Modal, Button } from 'react-bootstrap'; // Import Bootstrap Modal and Button
import "./Calendar.css";

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const [showModal, setShowModal] = useState(false); // State to control the modal
  const [selectedEvent, setSelectedEvent] = useState(null); // State to store the selected event
  const localizer = momentLocalizer(moment);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const fetchHolidays = async () => {
      const holidaysCollection = collection(db, 'holidays');
      const holidaysSnapshot = await getDocs(holidaysCollection);
      const holidayList = holidaysSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Transform holidays data into events format required by react-big-calendar
      const events = holidayList.map((holiday) => ({
        id: holiday.id,
        title: holiday.festival,
        start: new Date(formatDate(holiday.date)),
        end: new Date(formatDate(holiday.date)),
      }));

      setHolidays(events);
    };

    fetchHolidays();
  }, []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowModal(true); // Open the modal when an event is clicked
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null); // Clear the selected event when modal closes
  };

  return (
    <div className="calendar-container">
      <EmployeeDashboard />
      <div className={`calendar-content ${collapsed ? "collapsed" : ""}`}>
        <h2 className='text-center'>Holidays</h2>
        <Calendar
          localizer={localizer}
          events={holidays}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          onSelectEvent={handleSelectEvent} // Attach event handler for event click
        />
      </div>

      {/* Modal to display event details */}
      {selectedEvent && (
   <Modal 
   className='d-flex justify-content-center align-items-center'
   dialogClassName="modal-dialog-centered custom-modal-width"
   show={showModal} 
   onHide={handleCloseModal}
 >
   <Modal.Header closeButton>
     <Modal.Title>Holiday Details</Modal.Title>
   </Modal.Header>
   <Modal.Body>
     <p><strong>Festival:</strong> {selectedEvent.title}</p>
     <p><strong>Date:</strong>{new Date(selectedEvent.start).toLocaleDateString('en-IN')} </p>
   </Modal.Body>
   <Modal.Footer>
     <Button variant="secondary" onClick={handleCloseModal}>
       Close
     </Button>
   </Modal.Footer>
 </Modal>
    
      )}
    </div>
  );
}

export default Holidays;
