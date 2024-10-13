/* TODO - add your code to create a functional React component that renders a login form */
import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import logo from '../assets/ForwardLogo.svg';
import topLogo from '../assets/Foward_GotoHomapageLogo.svg';
import venicePhoto from '../assets/Venice.jpg';

export default function Login ({setIsLoggedIn}) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleLogin = async(e) => {

    e.preventDefault();

    try{
      const request = await fetch(`https://forward-capstone-project.onrender.com/api/auth/login`,{
        method:"POST",
        headers:{
          "Content-Type": "application/json",
        },body:JSON.stringify({username, password})
      });
      const response = await request.json();
      if(response.token) {localStorage.setItem("token", response.token);
      navigate("/courts");
      setIsLoggedIn(true);
      localStorage.setItem('id', response.id);
      // window.location.reload();
       }
      else {
        setError("Incorrect credentials!");
        setUsername("");
        setPassword("");
      };
    } catch (error) {console.error("Error logging in!", error );
    }

  }
  return (
    <div>
      <img onClick={() => {navigate(`/Courts`)}} className="topLogo" src={topLogo} alt="Logo" />
      <img className="bigCityImage" src={venicePhoto} alt="City Image" />
      <img className="leftLogo" src={logo} alt="Logo" />
    <div className="courtList">
      {error && <p>{error}</p>}
      <h1>Log In</h1>
    <form className="content" onSubmit={handleLogin}>
      <label className="loginLabel">Username:</label>
      <input className="loginInput" type="username" value={username} onChange={(e)=>{setUsername(e.target.value)}} />
      <label className="loginLabel">Password:</label>
      <input className="loginInput" type="password" value={password} onChange={(e)=>{setPassword(e.target.value)}} />
      <button className="loginButton" type="submit">Login</button>

    </form>
    </div>
    </div>
  )
}