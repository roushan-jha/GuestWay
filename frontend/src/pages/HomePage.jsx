import React from "react";
import { Link } from "react-router-dom";
import HeroImage from "../assets/guestway.png";

const HomePage = () => {
  return (
    <div className="flex-1 bg-secondary-dark flex items-center text-white overflow-hidden px-12">
      <main className="h-full flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex-1 flex items-center justify-center text-center md:text-left">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
              Explore the World with{" "}
              <span className="text-green-400">GuestWay</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-xl mb-8">
              A smart tourism management app to discover, plan, and manage your
              travel effortlessly.
            </p>
            <Link
              to="/tours"
              className="bg-green-500 text-black px-6 py-3 rounded-full font-semibold hover:bg-green-400 transition"
            >
              View Tours
            </Link>
          </div>
        </div>
        <div className="flex-1 hidden md:flex items-center justify-center">
          <img
            src={HeroImage}
            alt="Travel Illustration"
            className="max-h-[80%] max-w-full object-contain rounded-lg shadow-lg"
          />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
