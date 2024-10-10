/* TODO - add your code to create a functional React component that renders a navigation bar for the different views in your single page application. You may consider conditionally rendering some options - for example 'Login' should be available if someone has not logged in yet. */
import { Link } from "react-router-dom";
import myProfileLogo from '../assets/MyProfileLogo.svg';
import findCourtsLogo from '../assets/FindCourtsLogo.svg';


export default function Navigations () {

  return (
    <div className="navbar">
    <Link  className="nav-item" to={`/Courts`}>
    <img className="findCourtsLogo" src={findCourtsLogo} alt="Logo" />
        Find Courts</Link>
    <Link className="nav-item"  to={`/account`}>
    <img className="myProfileLogo" src={myProfileLogo} alt="Logo" />
        My Profile</Link>
    <Link className="nav-item" to={`/login`}>
        Login</Link>
    <Link className="nav-item"  to={`/register`}>
    
        Register</Link>
        </div>  
  )

}