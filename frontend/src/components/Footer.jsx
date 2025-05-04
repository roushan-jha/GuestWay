import React from "react";

const Footer = () => {
  return (
    <footer className="bg-secondary-dark text-white text-sm text-center py-4">
      © {new Date().getFullYear()} GuestWay. All rights reserved.
    </footer>
  );
};

export default Footer;
