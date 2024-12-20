import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Replace Redirect with Navigate
import "bootstrap/dist/css/bootstrap.min.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { QueryClient, QueryClientProvider } from "react-query";
import { AuthProvider }  from  "./Context/AuthContext";
import Login from "./Employee/Login/Login";
import Registration from "./Employee/Registration/Register";
import AdminLogin from "./Admin/AdminLogin/AdminLogin"
import Staff from "./Admin/Users/Users";
import Attendance from "./Employee/Attendance/Attendance";
import EmployeeProfile from "./Employee/EmployeeProfile/EmployeeProfile";
import EditProfile from "./Employee/EmployeeProfile/EditProfile";
import ViewAttendance from "./Employee/Attendance/ViewAttendance";
import AdminAttendance from "./Admin/Attendance/AdminAttendance";
import MonthlyAttendance from "./Admin/Attendance/MontlyAttendance";
import AddHoliday from "./Admin/Calendar/Calendar";
import Calendar from "./Employee/EmployeeCalendar/Calendar"
import Holidays from "./Admin/Calendar/Holidaylist";
import Payslips from "./Admin/Payslips/Payslips";
import EmployeePayslipTable from "./Employee/Payslip/EmployeePayslip";
import AdminDashboard from "./Admin/AdminDashboard/Dashboard";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>

<AuthProvider>
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/Register" element={<Registration />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/staff" element={<Staff />} />
      <Route path="/e-attendance" element={<Attendance />} />
      <Route path="/e-profile" element={<EmployeeProfile />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/e-view-attendance" element={<ViewAttendance />} />
      <Route path="/employee-payslip-table" element={<EmployeePayslipTable/>} />
      <Route path="/admin-attendance" element={<AdminAttendance />} />
      <Route path="/monthly-attendance" element={<MonthlyAttendance />} />
      <Route path="/a-calendar" element={<AddHoliday />} />
      <Route path="/e-calendar" element={<Calendar />} />
      <Route path="/a-holiday" element={<Holidays />} />
      <Route path="/a-payslip" element={<Payslips/>} />
      <Route path="/a-dashboard" element={<AdminDashboard/>} />
      </Routes>
      {/* <SessionListener/> */}
    </BrowserRouter>
    </AuthProvider>


   

    </QueryClientProvider>
  );
}

export default App;
