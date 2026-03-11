import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="h-full bg-background overflow-hidden">
      <Outlet />
    </div>
  );
}
