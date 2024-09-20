import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaUsers,
  FaRegCalendarAlt ,
  FaUserCheck,
  FaCalendarCheck

} from "react-icons/fa";
import { IoHomeOutline } from "react-icons/io5";
import "./AdminDashboard.css";
import Logout from "./LogOut";
import logo from "../../Img/Company_logo.png";

const AdminDashboard = ({ onToggleSidebar }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();


  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    onToggleSidebar(!collapsed);
  };

  const handleNavItemClick = () => {
    if (window.innerWidth <= 768) {
      setCollapsed(true);
    }
  };

  return (
    <>
      <div className="admin-header">
        <div className="admin-header-left">

          <div
            className={`admin-sidebar-toggle ${collapsed ? 'collapsed' : ''}`}
            onClick={toggleSidebar}
          >
            <IoHomeOutline className="toggle-icon" />
          </div> &nbsp;&nbsp;
          <img src={logo} alt="Logo" className="Admin-company-logo" />
        </div>
        <div className="admin-header-right">
          <div className="logout-button">
            <Logout />
          </div>
        </div>
      </div>

      <div className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="admin-position-sticky">
          <ul className="nav flex-column">

            <h2 className="text-center">Admin</h2>

            {/* <li className={`admin-nav-item ${location.pathname === '/a-dashboard' ? 'active' : ''}`}>
              <Link className="nav-link" to="/a-dashboard" onClick={handleNavItemClick}>
                <FaRegChartBar className="admin-nav-icon" />
                {!collapsed && <span className="link_text">Dashboard</span>}
              </Link>
            </li> */}

            <li className={`admin-nav-item ${location.pathname === '/staff' ? 'active' : ''}`}>
              <Link className="nav-link" to="/staff" onClick={handleNavItemClick}>
                <FaUsers className="admin-nav-icon" />
                {!collapsed && <span className="link_text">Staff</span>}
              </Link>
            </li>
            <li className={`admin-nav-item ${location.pathname === '/admin-attendance' ? 'active' : ''}`}>
              <Link className="nav-link" to="/admin-attendance" onClick={handleNavItemClick}>
                <FaUserCheck className="admin-nav-icon" />
                {!collapsed && <span className="link_text">Daily Attendance</span>}
              </Link>
            </li>
            <li className={`admin-nav-item ${location.pathname === '/monthly-attendance' ? 'active' : ''}`}>
              <Link className="nav-link" to="/monthly-attendance" onClick={handleNavItemClick}>
                <FaCalendarCheck className="admin-nav-icon" />
                {!collapsed && <span className="link_text">Monthly Attendance</span>}
              </Link>
            </li>

            <li className={`admin-nav-item ${location.pathname === '/a-holiday' ? 'active' : ''}`}>
              <Link className="nav-link" to="/a-holiday" onClick={handleNavItemClick}>
                <FaRegCalendarAlt  className="admin-nav-icon" />
                {!collapsed && <span className="link_text">Holiday Calendar</span>}
              </Link>
            </li>


          </ul>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
