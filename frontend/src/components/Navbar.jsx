import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";

const Navbar = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  return (
    <nav className="flex items-center justify-between px-12 py-4 bg-secondary-dark">
      <Link
        to="/tours"
        className="text-white text-lg hover:text-primary-green transition"
      >
        ALL TOURS
      </Link>
      <Link to="/" className="flex items-center space-x-2">
        <img
          src={Logo}
          alt="GuestWay Logo"
          className="h-12 w-12 rounded-full"
        />
      </Link>
      <ul className="flex items-center space-x-6 text-sm">
        {!isSignedIn ? (
          <>
            <li>
              <Link
                to="/signin"
                className="text-white text-lg hover:text-primary-green transition"
              >
                LOGIN
              </Link>
            </li>
            <li>
              <Link
                to="/signup"
                className="text-white text-lg hover:text-primary-green transition border-1 px-3 py-2 rounded-xl"
              >
                SIGN UP
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/profile">
                <img
                  src="https://i.pravatar.cc/30"
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              </Link>
            </li>
            <li>
              <button
                onClick={() => setIsSignedIn(false)}
                className="text-sm bg-black px-3 py-1 rounded hover:bg-white hover:text-black transition"
              >
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
