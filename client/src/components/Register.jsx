/* TODO - add your code to create a functional React component that renders a registration form */
import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import logo from '../assets/ForwardLogo.svg';
import topLogo from '../assets/Foward_GotoHomapageLogo.svg';
import Brooklyn_05 from '../assets/Brooklyn_05.png';

export default function Register () {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const navigate = useNavigate();

  const handleRegister = async(e) => {
    e.preventDefault();

    try{
      const request = await fetch(`https://forward-capstone-project.onrender.com/api/auth/register`, {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body:JSON.stringify({username, email,password, name, photoURL})
      });
      const response = await request.json();
      console.log(response);
      navigate("/login");
      if(response.token) {
        localStorage.setItem("token", response.token);
        // navigate("/")
      }
    } catch(error) {console.error("Error registering user!", error)}

  };

  return (
    <div>
      <img onClick={() => {navigate(`/Courts`)}} className="topLogo" src={topLogo} alt="Logo" />
      <img className="bigCityImage" src={Brooklyn_05} alt="City Image" />
      <img className="leftLogo" src={logo} alt="Logo" />
    <div className="courtList">
    <form className="content" onSubmit={handleRegister}>
      <label className="loginLabel">Username:</label>
      <input className="loginInput" type="text" value={username} onChange={(e)=>{setUsername(e.target.value)}}/>
      <label className="loginLabel">Email:</label>
      <input className="loginInput" type="email" value={email} onChange={(e)=>{setEmail(e.target.value)}}/>
      <label className="loginLabel">Password:</label>
      <input className="loginInput" type="password" value={password} onChange={(e)=>{setPassword(e.target.value)}}/>
      <label className="loginLabel">Name:</label>
      <input className="loginInput" type="text" value={name} onChange={(e)=>{setName(e.target.value)}}/>
      <label className="loginLabel">Photo URL:</label>
      <input className="loginInput" type="text" value={photoURL} onChange={(e)=>{setPhotoURL(e.target.value)}}/>
      <button type="submit">Register</button>

    </form>
    </div>
    </div>

  )
}