import {
  DashboardNavbar,
  Footer,
  Sidenav
} from "@/widgets/layout";
import { Navigate, Route, Routes } from "react-router-dom";

import GroupChat from "@/components/GroupChat";
import routes from "@/routes";
import { useMaterialTailwindController } from "@/context";
import { useUser } from "@/hooks/UserContext";
import { userService } from "@/services/userService";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;
  const token = localStorage.getItem('token');
  const { user, updateUser } = useUser();

  const fetchUserInfo = async () => {
    try {
      const response = await userService.getUserInfo();
      localStorage.setItem('user', JSON.stringify(response));
      updateUser(response)
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };
  if (!token) {
    return <Navigate to="/auth/sign-in" replace />;
  } else {
    if (!user) {
      fetchUserInfo()
    }
    return (
      <div className="min-h-screen bg-blue-gray-50/50">
        <Sidenav
          routes={routes}
          brandImg={
            sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
          }
        />
        <div className="p-4 xl:ml-80">
          <DashboardNavbar />
          <Routes>
            {routes.map(
              ({ layout, pages }) =>
                layout === "dashboard" &&
                pages.map(({ path, element }, index) => (
                  <Route key={index} exact path={path} element={element} />
                ))
            )}
          </Routes>
          <div className="text-blue-gray-600">
            <Footer />
          </div>
        </div>
        <GroupChat />
      </div>
    )
  }

}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
