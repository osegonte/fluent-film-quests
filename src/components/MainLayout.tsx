
import { Outlet } from "react-router-dom";
import { NavigationTabs } from "./NavigationTabs";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <NavigationTabs />
    </div>
  );
};

export default MainLayout;
