import { ClassManagement, CourseManagement, ExamManagement, Home } from "@/pages/dashboard";
import {
  AcademicCapIcon,
  HomeIcon,
  InformationCircleIcon,
  ServerStackIcon,
} from "@heroicons/react/24/solid";

import { SignIn } from "@/pages/auth";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "Doanh thu",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Quản lý lớp học",
        path: "/class",
        element: <ClassManagement />,
      },
      {
        icon: <AcademicCapIcon {...icon} />,
        name: "Quản lý khóa học",
        path: "/course",
        element: <CourseManagement />,
      },
      {
        icon: <AcademicCapIcon {...icon} />,
        name: "Quản lý bài thi",
        path: "/exam",
        element: <ExamManagement />,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
    ],
  },
];

export default routes;
