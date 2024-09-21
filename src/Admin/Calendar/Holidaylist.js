import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './../../FirebaseConfig/Firebaseconfig';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';

import "./Holidaylist.css";
import AdminDashboard from '../Dashboard/AdminDashboard';

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

function Holidays() {
    const navigate = useNavigate();
  const [holidays, setHolidays] = useState([]);
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
  const handleAddLeaveClick = () => {
    navigate('/a-calendar'); // Navigate to the /a-addemployee page
  };

  return (
<div className="admin-holiday-container">
  <AdminDashboard  onToggleSidebar={setCollapsed} />
  <div className={`admin-holiday-content ${collapsed ? "collapsed" : ""}`}>

      <h2 className='text-center'>Holiday Calendar</ h2>
      <div className="col text-end mt-3 mb-3">
      <button className="btn btn-primary" onClick={handleAddLeaveClick}>
        Add Holiday
      </button>
    </div>
      <Calendar
        localizer={localizer}
        events={holidays}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
    </div>
  );
}

export default Holidays;
