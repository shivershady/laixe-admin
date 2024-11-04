import {
  AcademicCapIcon,
  HomeIcon,
  InformationCircleIcon,
  ServerStackIcon,
} from "@heroicons/react/24/solid";
import { ClassManagement, CourseManagement, ExamManagement, Home, TeacherManagement } from "@/pages/dashboard";

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
        permission: "Admin",
      },
      {
        icon: <HomeIcon {...icon} />,
        name: "Quản lý giáo viên",
        path: "/teacher",
        element: <TeacherManagement />,
        permission: "Admin",
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Quản lý lớp học",
        path: "/class",
        element: <ClassManagement />,
        permission: "Teacher",
      },
      {
        icon: <AcademicCapIcon {...icon} />,
        name: "Quản lý khóa học",
        path: "/course",
        element: <CourseManagement />,
        permission: "Teacher",
      },
      {
        icon: <AcademicCapIcon {...icon} />,
        name: "Quản lý bài thi",
        path: "/exam",
        element: <ExamManagement />,
        permission: "Teacher",
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
