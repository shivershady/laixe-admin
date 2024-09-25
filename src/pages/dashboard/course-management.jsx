import {
  PencilIcon,
  PlusIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Option,
  Select,
  Typography
} from "@material-tailwind/react";
import { useEffect, useState } from 'react';

import Pagination from "@/components/Pagination";
import { courseServices } from "@/services/courseServices";

const courseTypes = [
  { value: 1, label: "Ô tô" },
  { value: 2, label: "Xe máy" },
];

export function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const fetchCourses = async () => {
    try {
      const response = await courseServices.getCourses({
        PageIndex: currentPage,
        PageSize: itemsPerPage,
      });
      setCourses(response.data.map(item => ({
        ...item,
        id: item.courseId,
        name: item.courseName
      })));
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [currentPage]);

  const handleAddCourse = async (newCourse) => {
    try {
      await courseServices.postCourse({
        courseName: newCourse.name,
        type: newCourse.type
      });
      await fetchCourses();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const handleEditCourse = async (updatedCourse) => {
    try {
      await courseServices.editCourse(updatedCourse.id, {
        courseName: updatedCourse.name,
        type: updatedCourse.type
      });
      await fetchCourses();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error editing course:', error);
    }
  };

  const handleDeleteCourse = async (id) => {
    try {
      await courseServices.deleteCourse(id);
      await fetchCourses();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  return (
    <Card className="container mx-auto p-4 mt-8">
      <CardHeader>
        <Typography variant="h3" className="font-bold p-4">Quản lý khóa học</Typography>
      </CardHeader>
      <CardBody>
        <div className="mb-6">
          <Button
            className="flex items-center gap-2"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PlusIcon className="h-5 w-5" /> Thêm khóa học
          </Button>
        </div>
        <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Tên khóa học", "Loại", "Thao tác"].map((el) => (
                  <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                    <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                const className = `py-3 px-5 ${course.id === courses.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                return (
                  <tr key={course.id}>
                    <td className={className}>{course.name}</td>
                    <td className={className}>{courseTypes.find(type => type.value === course.type)?.label}</td>
                    <td className={className}>
                      <div className="flex space-x-2">
                        <Button
                          variant="outlined"
                          size="sm"
                          onClick={() => {
                            setSelectedCourse(course);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outlined"
                          size="sm"
                          color="red"
                          onClick={() => {
                            setSelectedCourse(course);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </CardBody>
      <Dialog open={isAddDialogOpen} handler={() => setIsAddDialogOpen(!isAddDialogOpen)}>
        <DialogHeader>Thêm khóa học mới</DialogHeader>
        <DialogBody>
          <CourseForm onSubmit={handleAddCourse} />
        </DialogBody>
      </Dialog>
      <Dialog open={isEditDialogOpen} handler={() => setIsEditDialogOpen(!isEditDialogOpen)}>
        <DialogHeader>Chỉnh sửa khóa học</DialogHeader>
        <DialogBody>
          {selectedCourse && (
            <CourseForm onSubmit={handleEditCourse} initialData={selectedCourse} />
          )}
        </DialogBody>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} handler={() => setIsDeleteDialogOpen(!isDeleteDialogOpen)}>
        <DialogHeader>Xác nhận xóa</DialogHeader>
        <DialogBody>
          Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác.
        </DialogBody>
        <DialogFooter>
          <Button variant="text" onClick={() => setIsDeleteDialogOpen(false)}>
            Hủy
          </Button>
          <Button color="red" onClick={() => handleDeleteCourse(selectedCourse.id)}>
            Xóa
          </Button>
        </DialogFooter>
      </Dialog>
    </Card>
  );
}

function CourseForm({ onSubmit, initialData }) {
  const [formData, setFormData] = useState(
    initialData ? {
      id: initialData.id,
      name: initialData.name,
      type: initialData.type,
    } : {
      name: "",
      type: "",
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Typography variant="h6">Tên khóa học</Typography>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div>
        <Typography variant="h6">Loại khóa học</Typography>
        <Select
          label="Chọn loại khóa học"
          name="type"
          value={formData.type}
          onChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
        >
          {courseTypes.map(type => (
            <Option key={type.value} value={type.value}>
              {type.label}
            </Option>
          ))}
        </Select>
      </div>
      <Button className="flex justify-center mx-auto" type="submit">
        {initialData ? "Cập nhật" : "Thêm"}
      </Button>
    </form>
  );
}