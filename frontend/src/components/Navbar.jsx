import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-gray-800">
            Order System
          </Link>
          <div className="space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-800">
              New Order
            </Link>
            <Link to="/orders" className="text-gray-600 hover:text-gray-800">
              Order History
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 