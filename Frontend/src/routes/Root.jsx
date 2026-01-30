import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import AuthorModal from '../components/AuthorModal';
const Root = () => {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-auto">
          <Outlet />
          <AuthorModal />
        </main>
      </div>
    </div>
  );
};

export default Root;