import { Link } from "react-router-dom";
import myProfileLogo from '../assets/MyProfileLogo.svg';
import findCourtsLogo from '../assets/FindCourtsLogo.svg';

export default function Navigations({ isLoggedIn, setIsLoggedIn }) {
  const handleLogout = () => {
    localStorage.removeItem("token");  // Remove token from localStorage on logout
    setIsLoggedIn(false);  // Set logged-out state
  };

  return (
    <div className="navbar">
      <Link className="nav-item" to={`/Courts`}>
        <img className="findCourtsLogo" src={findCourtsLogo} alt="Find Courts Logo" />
        Find Courts
      </Link>

      {isLoggedIn ? (
        <>
          <Link className="nav-item" to={`/account`}>
            <img className="myProfileLogo" src={myProfileLogo} alt="My Profile Logo" />
            My Profile
          </Link>
          <Link className="nav-item" to="#" onClick={handleLogout}>
            Log out
          </Link>
        </>
      ) : (
        <>
          <Link className="nav-item" to={`/login`}>
            Login
          </Link>
          <Link className="nav-item" to={`/register`}>
            Register
          </Link>
        </>
      )}
    </div>
  );
}