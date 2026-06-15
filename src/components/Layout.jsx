import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="d-flex">
      <Sidebar />
      <main className="flex-grow-1 bg-light vh-100 overflow-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
