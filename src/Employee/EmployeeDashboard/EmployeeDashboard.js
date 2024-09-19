import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from '../../Context/AuthContext';
import { FaUser,FaUserCheck , FaUsers,FaSignOutAlt, FaClock,FaFileExport ,FaVideo,FaRegCalendarAlt, FaCalendarCheck, FaCalendar, FaFileAlt,  FaBoxes, FaClipboardList    } from "react-icons/fa";
import "./EmployeeDashboard.css";
// import Logout from "./LogOut";
import Profile from "./Profile";
import logo from "../../Img/Company_logo.png";


const EmployeeDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();

    return (
        <>
            <div className="header">
                <div className="header-left">
                    <img src={logo} alt="Logo" className="company-logo" />
                </div>
                <div className="header-right">
                    <div className="logout-button2">
                        {/* <Logout /> */}
                        <Profile/>
                    </div>
                </div>
            </div>

            <div className="sidebar">
                <ul className="nav">
                    <li className={`nav-item ${location.pathname === '/e-attendance' ? 'active' : ''}`}>
                        <Link className="nav-link" to="/e-attendance">
                            <FaUserCheck className="nav-icon" />
                            
                        </Link>
                    </li>

                    <li className={`nav-item ${location.pathname === '/e-view-attendance' ? 'active' : ''}`}>
                        <Link className="nav-link" to="/e-view-attendance">
                            <FaUserCheck className="nav-icon" />
                            
                        </Link>
                    </li>

                    {/* <li className={`nav-item ${location.pathname === '/e-view-attendance' ? 'active' : ''}`}>
                        <Link className="nav-link" to="/e-view-attendance">
                            <FaCalendarCheck className="nav-icon" />
                            
                        </Link>
                    </li> */}
                    
                
                    
                    
                   


                </ul>
            </div>
        </>
    );
};

export default EmployeeDashboard;
