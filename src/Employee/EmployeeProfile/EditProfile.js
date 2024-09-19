import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { db, storage } from '../../FirebaseConfig/Firebaseconfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import './EditProfile.css';

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [formValues, setFormValues] = useState({
    dob: '',
    qualification: '',
    gender: '',
    role: '',
    staffId: '',
    address: '',
    profilePic: null,
    profilePicName: '',
    adharCard: null,
    adharCardName: '',
    degreeMarksCard: null,
    degreeMarksCardName: '',
    pancard: null,             
    pancardName: '', 
    project: '',
  });
  const [initialValues, setInitialValues] = useState({
    dob: '',
    qualification: '',
    staffId: '',
    gender: '',
    address: '',
    role: '',
    profilePic: null,
    profilePicName: '',
    adharCard: null,
    adharCardName: '',
    degreeMarksCard: null,
    degreeMarksCardName: '',
    pancard: null,               
    pancardName: '', 
    project: '',
  });
  const [uploading, setUploading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user && user.uid) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserDetails(data);
          const fetchedValues = {
            dob: data.dob || '',
            qualification: data.qualification || '',
            staffId: data.staffId || '',
            gender: data.gender || '',
            role:  data.role || '',
            address: data.address || '',
            profilePic: data.profilePic || null,
            profilePicName: '',
            adharCard: data.adharCard || null,
            adharCardName: '',
            degreeMarksCard: data.degreeMarksCard || null,
            degreeMarksCardName: '',
            pancard: data.pancard || null,          
            pancardName: '',          
            project: data.project || '', // Corrected key name
          };
          setFormValues(fetchedValues);
          setInitialValues(fetchedValues);
        } else {
          console.log('No such document!');
        }
      }
    };

    fetchUserDetails();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    let newValues = { ...formValues };
    
    if (files && files.length > 0) {
      const file = files[0];
      newValues = {
        ...newValues,
        [name]: file,
        [`${name}Name`]: file.name,
      };
    } else {
      newValues = {
        ...newValues,
        [name]: value,
      };
    }
    
    setFormValues(newValues);
    
    // Check if the form values are different from initial values
    const hasChanges = Object.keys(newValues).some(
      (key) => newValues[key] !== initialValues[key]
    );
    setButtonDisabled(!hasChanges); // Enable button if there are changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setButtonDisabled(true);
  
    try {
      let profilePicURL = formValues.profilePic;
      let adharCardURL = formValues.adharCard;
      let degreeMarksCardURL = formValues.degreeMarksCard;
      let pancardURL = formValues.pancard;
      // Upload profile picture
      if (formValues.profilePic && typeof formValues.profilePic === 'object') {
        const file = formValues.profilePic;
        const storageRef = ref(storage, `profile_pics/${user.uid}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        profilePicURL = await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            reject,
            async () => {
              try {
                resolve(await getDownloadURL(uploadTask.snapshot.ref));
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      }

      // Upload Adhar Card
      if (formValues.adharCard && typeof formValues.adharCard === 'object') {
        const file = formValues.adharCard;
        const storageRef = ref(storage, `adhar_cards/${user.uid}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        adharCardURL = await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            reject,
            async () => {
              try {
                resolve(await getDownloadURL(uploadTask.snapshot.ref));
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      }

      // Upload Degree Marks Card
      if (formValues.degreeMarksCard && typeof formValues.degreeMarksCard === 'object') {
        const file = formValues.degreeMarksCard;
        const storageRef = ref(storage, `degree_marks_cards/${user.uid}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        degreeMarksCardURL = await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            reject,
            async () => {
              try {
                resolve(await getDownloadURL(uploadTask.snapshot.ref));
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      }

      if (formValues.pancard && typeof formValues.pancard === 'object') {
        const file = formValues.pancard;
        const storageRef = ref(storage, `pancards/${user.uid}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        pancardURL = await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            reject,
            async () => {
              try {
                resolve(await getDownloadURL(uploadTask.snapshot.ref));
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      }


      // Update profile with URLs of uploaded files and other form values
      await updateProfile({
        ...formValues,
        profilePic: profilePicURL,
        adharCard: adharCardURL,
        degreeMarksCard: degreeMarksCardURL,
        pancard: pancardURL,
      });

      alert('Profile updated successfully.');
      navigate('/e-profile'); // Navigate to /profile
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setUploading(false);
      resetForm(); // Reset the form and disable the button after saving
    }
  };

  const updateProfile = async (updates) => {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, updates);
  };

  const resetForm = () => {
    setFormValues(initialValues);
    setButtonDisabled(true);
  };

  const handleCancel = () => {
    resetForm();
    navigate('/e-profile');
  };

  return (
    <div className="edit-profile-container">
      <h1>Edit Profile</h1>
      {userDetails ? (
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
            <label>Name:</label>
            <input type="text" value={userDetails.name || ''} readOnly />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" value={userDetails.email || ''} readOnly />
          </div>
          <div className="form-group">
            <label>Mobile Number:</label>
            <input type="text" value={userDetails.mobileNumber || ''} readOnly />
          </div>

          <div className="form-group">
            <label>Role:</label>
            <input
              type="text"
              name="role"
              value={formValues.role}
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Staff-Id:</label>
            <input
              type="text"
              name="staffId"
              value={formValues.staffId}
              onChange={handleChange}
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Project:</label>
            <input
              type="text"
              name="project"
              value={formValues.project}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Date of Birth:</label>
            <input
              type="date"
              name="dob"
              value={formValues.dob}
              onChange={handleChange}
              max={today}
              required
            />
          </div>

         
          <div className="form-group">
            <label>Qualification:</label>
            <input
              type="text"
              name="qualification"
              value={formValues.qualification}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Gender:</label>
            <select
              name="gender"
              value={formValues.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          
          <div className="form-group">
            <label>Address:</label>
            <textarea
              name="address"
              value={formValues.address}
              onChange={handleChange}
              required
            />
          </div>



          {/* <div className="form-group">
            <label>Profile Picture:</label>
            {formValues.profilePic && formValues.profilePic instanceof File ? (
              <div>
                <img
                  src={URL.createObjectURL(formValues.profilePic)}
                  alt="Profile Preview"
                  className="image-preview"
                />
              </div>
            ) : userDetails.profilePic ? (
              <div className="profile-pic-preview">
                <img
                  src={userDetails.profilePic}
                  alt="Profile"
                  className="image-preview"
                />
              </div>
            ) : null}
            <input
              type="file"
              name="profilePic"
              accept="image/*"
              onChange={handleChange}
            />
          </div> */}

          <div className="form-group">
            <label>Profile Picture:
              {formValues.profilePic && (

                <a href={formValues.profilePic} style={{ marginLeft: "20px", textDecoration: "none", fontWeight: "bold" }} target="_blank" rel="noopener noreferrer">View </a>

              )}</label>
            <input
              type="file"
              name="profilePic"
              accept="image/*"
              onChange={handleChange}
            />
          </div>



          {/* <div className="form-group">
            <label>Adhar Card:</label>
            {formValues.adharCard && formValues.adharCard instanceof File ? (
              <div>{formValues.adharCardName}</div>
            ) : userDetails.adharCard ? (
              <div>{userDetails.adharCardName}</div>
            ) : null}
            <input
              type="file"
              name="adharCard"
              accept="image/*"
              onChange={handleChange}
            />
          </div> */}



          <div className="form-group">
            <label>Upload Aadhaar Card:
              {formValues.adharCard && (

                <a href={formValues.adharCard} style={{ marginLeft: "20px", textDecoration: "none", fontWeight: "bold" }} target="_blank" rel="noopener noreferrer">View </a>

              )}</label>
            <input
              type="file"
              name="adharCard"
              accept="image/*,application/pdf"
              onChange={handleChange}
            />
          </div>

          {/* <div className="form-group">
            <label>Pancard:</label>
            {formValues.pancard && formValues.pancard instanceof File ? (
              <div>{formValues.pancardName}</div>
            ) : userDetails.pancard ? (
              <div>{userDetails.pancardName}</div>
            ) : null}
            <input
              type="file"
              name="pancard"
              accept="image/*"
              onChange={handleChange}
            />
          </div> */}

          <div className="form-group">
            <label>Upload PAN Card:
              {formValues.pancard && (

                <a href={formValues.pancard} style={{ marginLeft: "20px", textDecoration: "none", fontWeight: "bold" }} target="_blank" rel="noopener noreferrer">View </a>

              )}</label>
            <input
              type="file"
              name="pancard"
              accept="image/*,application/pdf"
              onChange={handleChange}
            />
          </div>


          {/* <div className="form-group">
            <label>Degree Marks Card:</label>
            {formValues.degreeMarksCard && formValues.degreeMarksCard instanceof File ? (
              <div>{formValues.degreeMarksCardName}</div>
            ) : userDetails.degreeMarksCard ? (
              <div>{userDetails.degreeMarksCardName}</div>
            ) : null}
            <input
              type="file"
              name="degreeMarksCard"
              accept="image/*"
              onChange={handleChange}
            />
          </div> */}

          <div className="form-group">
            <label>Degree Marks Card:
              {formValues.degreeMarksCard && (

                <a href={formValues.degreeMarksCard} style={{ marginLeft: "20px", textDecoration: "none", fontWeight: "bold" }} target="_blank" rel="noopener noreferrer">View </a>

              )}</label>
            <input
              type="file"
              name="degreeMarksCard"
              accept="image/*,application/pdf"
              onChange={handleChange}
            />
          </div>
          
          <div>
            <div className='employeeedit-button-container '>
            <button type="button" className="cancel-button-editprofile" onClick={handleCancel}>
              Close
            </button>
            <button type="submit" className="save-button-editprofile" disabled={buttonDisabled || uploading}>
              {uploading ? 'Saving...' : 'Save'}
            </button>
            </div>
          </div>
        </form>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default EditProfile;
