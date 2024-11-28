import React, { useState } from 'react';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { auth } from "../../FirebaseConfig/Firebaseconfig"
import logo from "../../Img/bkarts.jpg" 
import "./AdminLogin.css";


const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (email === 'admin@gmail.com' && password === 'Admin@123') {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/a-dashboard'); 
      } else {
        setErrorMsg('Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Firebase login error:', error.code, error.message);
      setErrorMsg('Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = email.trim() === 'admin@gmail.com' && password.trim() === 'Admin@123';

  return (
    <div className="d-flex justify-content-center align-items-center mt-5 pt-5">
      <div className="card" style={{ width: '36rem' }}>
        <div className="card-body">
          <div className="text-center">
            <img src={logo} alt="Logo" className="mb-2" style={{ width: '350px', height: '100px' }} />
            <h3>Login</h3>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" style={{ fontWeight: 'bold' }}>Email</label><br/>
              <input
                type="email"
                className="input-admin-login-email mt-1"
                id="email"
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3 position-relative">
              <label htmlFor="password" style={{ fontWeight: 'bold' }}>Password</label><br/>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-admin-login-password mt-1"
                id="password"
                placeholder="Enter Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                onClick={togglePasswordVisibility}
                className="position-absolute"
                style={{ right: '10px', top: '46px', cursor: 'pointer' }}
              />
            </div>
            {errorMsg && <div className="text-danger text-center">{errorMsg}</div>}
            <div className="text-center">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
