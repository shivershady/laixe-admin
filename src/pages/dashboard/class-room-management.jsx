import {
  InformationCircleIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UserGroupIcon,
  UserPlusIcon
} from "@heroicons/react/24/outline"
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Option,
  Select,
  Typography
} from "@material-tailwind/react"
import { useEffect, useState } from "react"

import Pagination from "@/components/Pagination"
import { classServices } from "@/services/classServices"
import { userService } from "@/services/userService"
import { format } from "date-fns"

const daysOfWeek = [
  { label: "Thứ 2", value: 2 },
  { label: "Thứ 3", value: 3 },
  { label: "Thứ 4", value: 4 },
  { label: "Thứ 5", value: 5 },
  { label: "Thứ 6", value: 6 },
  { label: "Thứ 7", value: 7 },
  { label: "Chủ nhật", value: 1 }
]

export function ClassManagement() {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [newStudentName, setNewStudentName] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [totalPages, setTotalPages] = useState(1); // Khai báo state cho totalPages
  const [teachers, setTeachers] = useState([]); // Khai báo state cho danh sách giáo viên
  const [students, setStudents] = useState([]); // Khai báo state cho danh sách giáo viên

  const [classDetails, setClassDetails] = useState(null)
  const [attendanceList, setAttendanceList] = useState([])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const fetchClasses = async () => {
    try {
      const response = await classServices.getAllClass({
        PageIndex: currentPage,
        PageSize: itemsPerPage,
      });
      const formattedClasses = response.classes.map((cls) => ({
        id: cls.id,
        name: cls.name,
        meetLink: cls.linkGoogleMeet,
        startDate: cls.startDate,
        endDate: cls.endDate,
        schedule: [cls.day1, cls.day2].filter((day) => day !== 0),
        teacherId: cls.teacherId,
        teacherName: cls.teacherName, // Lưu tên giáo viên
        students: cls.students.map((student) => ({
          id: student.studentId,
          name: student.studentName,
          attendanceHistory: [],
        })),
      }));

      setClasses(formattedClasses);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };
  useEffect(() => {
    fetchClasses();
  }, [currentPage]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await userService.getAllUser(); // Giả sử có API lấy danh sách giáo viên
        const teachers = response.filter(user => user.roles.includes("Teacher"))
          .map(teacher => ({
            id: teacher.id,
            name: `${teacher.userName.split('@')[0]}`, // Assuming username before "@" is name
          }));
        const students = response.filter(user => user.roles.includes("Student"))
          .map(teacher => ({
            id: teacher.id,
            name: `${teacher.userName.split('@')[0]}`, // Assuming username before "@" is name
          }));
        setTeachers(teachers);
        setStudents(students)
      } catch (error) {
        console.error('Error fetching teachers:', error);
      }
    };

    fetchTeachers(); // Gọi hàm fetchTeachers khi component được mount
  }, []); // Chỉ gọi một lần khi component được mount

  const handleAddClass = async (newClass) => {
    // Tạo payload cho API
    const payload = {
      name: newClass.name,
      teacherId: newClass.teacherId, // Sử dụng teacherId từ newClass
      linkGoogleMeet: newClass.meetLink,
      day1: newClass.schedule[0] || 0,
      day2: newClass.schedule[1] || 0,
      startDate: newClass.startDate,
      endDate: newClass.endDate,
    };

    try {
      await classServices.postClass(payload); // Gọi API
      await fetchClasses()
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Error adding class:', error);
    }
  }

  const handleEditClass = async (updatedClass) => {
    const payload = {
      name: updatedClass.name,
      teacherId: updatedClass.teacherId, // Sử dụng teacherId từ updatedClass
      linkGoogleMeet: updatedClass.meetLink,
      day1: updatedClass.schedule[0] || 0,
      day2: updatedClass.schedule[1] || 0,
      startDate: updatedClass.startDate,
      endDate: updatedClass.endDate,
    };
    try {
      await classServices.editClass({ id: updatedClass.id, payload }); // Gọi API
      await fetchClasses()
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error adding class:', error);
    }
  }

  const handleDeleteClass = async (id) => {
    try {
      await classServices.deleteClass(id); // Gọi API
      await fetchClasses()
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error adding class:', error);
    }
  }

  useEffect(() => {
    const fetchClassDetails = async () => {
      if (isDetailDialogOpen && selectedClass) {
        try {
          const details = await classServices.getClassDetails(selectedClass.id)
          setClassDetails(details)
          setAttendanceList([])
        } catch (error) {
          console.error('Error fetching class details:', error)
        }
      }
    }

    fetchClassDetails()
  }, [isDetailDialogOpen, selectedClass])

  const handleAddStudent = async (studentId) => {
    try {
      await classServices.addStudentToClass(selectedClass.id, studentId)
      const updatedDetails = await classServices.getClassDetails(selectedClass.id)
      setClassDetails(updatedDetails)
      setNewStudentName("")
    } catch (error) {
      console.error('Error adding student to class:', error)
    }
  }
  const handleDelStudent = async (studentId) => {
    try {
      await classServices.removeStudentToClass(selectedClass.id, studentId)
      const updatedDetails = await classServices.getClassDetails(selectedClass.id)
      setClassDetails(updatedDetails)
      setNewStudentName("")
    } catch (error) {
      console.error('Error adding student to class:', error)
    }
  }

  const handleAttendanceChange = (studentId) => {
    setAttendanceList(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSubmitAttendance = async () => {
    try {
      await classServices.submitAttendance(selectedClass.id, attendanceList)
      alert("Attendance submitted successfully")
      setAttendanceList([])
    } catch (error) {
      console.error('Error submitting attendance:', error)
    }
  }


  return (
    <Card className="container mx-auto p-4 mt-8">
      <CardHeader>
        <Typography variant="h3" className="font-bold p-4">Quản lý lớp học</Typography>
      </CardHeader>
      <CardBody>
        <div className="mb-6">
          <Button
            className="flex items-center gap-2"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PlusIcon className="h-5 w-5" /> Thêm lớp học
          </Button>
        </div>
        <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Tên lớp", "Giáo viên", "Link Google Meet", "Ngày bắt đầu", "Ngày kết thúc", "Lịch học", "Số học sinh", "Thao tác"].map((el) => (
                  <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                    <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => {
                const className = `py-3 px-5 ${cls.id === classes.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                return (
                  <tr key={cls.id}>
                    <td className={className}>{cls.name}</td>
                    <td className={className}>{cls.teacherName}</td>
                    <td className={className}>
                      <a href={cls.meetLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Link Meet
                      </a>
                    </td>
                    <td className={className}>{format(new Date(cls.startDate), 'dd/MM/yyyy')}</td>
                    <td className={className}>{format(new Date(cls.endDate), 'dd/MM/yyyy')}</td>
                    <td className={className}>{cls.schedule.map(day => daysOfWeek.find(d => d.value === day)?.label).join(", ")}</td>
                    <td className={className}>
                      <div className="flex items-center">
                        <UserGroupIcon className="mr-2 h-4 w-4" />
                        {cls.students.length}
                      </div>
                    </td>
                    <td className={className}>
                      <div className="flex space-x-2">

                        <Button
                          variant="outlined"
                          size="sm"
                          onClick={() => {
                            setSelectedClass(cls)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outlined"
                          size="sm"
                          onClick={() => {
                            setSelectedClass(cls)
                            setIsDetailDialogOpen(true)
                          }}
                        >
                          <InformationCircleIcon className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outlined"
                          size="sm"
                          color="red"
                          onClick={() => {
                            setSelectedClass(cls)
                            setIsDeleteDialogOpen(true)
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
      <Dialog open={isAddDialogOpen} handler={() => setIsAddDialogOpen(!isAddDialogOpen)} >
        <DialogHeader>Thêm lớp học mới</DialogHeader>
        <DialogBody>
          <ClassForm onSubmit={handleAddClass} teachers={teachers} />
        </DialogBody>
      </Dialog>
      <Dialog open={isEditDialogOpen} handler={() => setIsEditDialogOpen(!isEditDialogOpen)} >
        <DialogHeader>Chỉnh sửa lớp học</DialogHeader>
        <DialogBody>
          {selectedClass && (
            <ClassForm onSubmit={handleEditClass} initialData={selectedClass} teachers={teachers} />
          )}
        </DialogBody>
      </Dialog>
      <Dialog open={isDetailDialogOpen} handler={() => setIsDetailDialogOpen(!isDetailDialogOpen)} >
        <DialogHeader>Chi tiết lớp học</DialogHeader>
        <DialogBody className="overflow-auto max-h-[60vh]">
          {classDetails && (
            <div className="mt-4 space-y-10">
              <Card>
                <CardHeader>
                  <Typography className="p-4" variant="h5">Thông tin lớp học</Typography>
                </CardHeader>
                <CardBody>
                  <Typography><strong>Tên lớp:</strong> {selectedClass.name}</Typography>
                  <Typography><strong>Giáo viên:</strong> {selectedClass.teacherName}</Typography>
                  <Typography><strong>Link Google Meet:</strong> <a href={selectedClass.meetLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedClass.meetLink}</a></Typography>
                  <Typography><strong>Ngày bắt đầu:</strong> {format(new Date(selectedClass.startDate), 'dd/MM/yyyy')}</Typography>
                  <Typography><strong>Ngày kết thúc:</strong> {format(new Date(selectedClass.endDate), 'dd/MM/yyyy')}</Typography>
                  <Typography><strong>Lịch học:</strong> {selectedClass.schedule.join(", ")}</Typography>
                </CardBody>
              </Card>
              <Card>
                <CardHeader>
                  <Typography variant="h5" className="flex items-center justify-between p-4">
                    <span>Danh sách học sinh</span>
                    <UserPlusIcon className="h-5 w-5 text-blue-gray-500" />
                  </Typography>
                </CardHeader>
                <CardBody>
                  <div className="flex items-center space-x-2 mb-4">
                    <Select
                      label="Chọn học sinh"
                      value={newStudentName}
                      onChange={(value) => setNewStudentName(value)}
                    >
                      {students.map(student => (
                        <Option key={student.id} value={student.id}>
                          {student.name}
                        </Option>
                      ))}
                    </Select>
                    <Button onClick={() => {
                      handleAddStudent(newStudentName);
                      setNewStudentName("");
                    }}>
                      Thêm
                    </Button>
                  </div>
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="border-b border-studentsblue-gray-50 py-3 px-5 text-left">Tên học sinh</th>
                        <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classDetails.students.map((student) => (
                        <tr key={student.studentId}>
                          <td className="py-3 px-5 border-b border-blue-gray-50">{student.studentName}</td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Button
                              variant="outlined"
                              size="sm"
                              color="red"
                              onClick={() => handleDelStudent(student.studentId)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Typography className="p-4" variant="h5">Điểm danh</Typography>
                </CardHeader>
                <CardBody>
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Tên học sinh</th>
                        <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Điểm danh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classDetails.students.map((student) => (
                        <tr key={student.studentId}>
                          <td className="py-3 px-5 border-b border-blue-gray-50">{student.studentName}</td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Checkbox
                              checked={attendanceList.includes(student.studentId)}
                              onChange={() => handleAttendanceChange(student.studentId)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Button className="mt-4 flex justify-center mx-auto" onClick={handleSubmitAttendance}>
                    Ghi nhận điểm danh
                  </Button>
                </CardBody>
              </Card>
            </div>
          )}
        </DialogBody>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} handler={() => setIsDeleteDialogOpen(!isDeleteDialogOpen)}>
        <DialogHeader>Xác nhận xóa</DialogHeader>
        <DialogBody>
          Bạn có chắc chắn muốn xóa lớp học này? Hành động này không thể hoàn tác.
        </DialogBody>
        <DialogFooter>
          <Button variant="text" onClick={() => setIsDeleteDialogOpen(false)}>
            Hủy
          </Button>
          <Button color="red" onClick={() => {
            handleDeleteClass(selectedClass.id)
            setIsDeleteDialogOpen(false)
          }}>
            Xóa
          </Button>
        </DialogFooter>
      </Dialog>
    </Card>
  )
}

export function ClassForm({ onSubmit, initialData, teachers }) {
  const [formData, setFormData] = useState(
    initialData ? {
      id: initialData.id,
      name: initialData.name,
      meetLink: initialData.meetLink,
      startDate: format(new Date(initialData.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(initialData.endDate), 'yyyy-MM-dd'),
      schedule: initialData.schedule,
      teacherId: initialData.teacherId || "", // Thêm trường teacherId
    } : {
      name: "",
      meetLink: "",
      startDate: "",
      endDate: "",
      schedule: [],
      teacherId: "", // Thêm trường teacherId
    }
  );
  console.log(formData);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleScheduleChange = (day) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.includes(day)
        ? prev.schedule.filter(d => d !== day)
        : [...prev.schedule, day].slice(0, 2)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.teacherId) {
      return alert('Giáo viên là trường bắt buộc')
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Typography variant="h6">Tên lớp</Typography>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div>
        <Typography variant="h6">Giáo viên</Typography>
        <Select
          label="Chọn giáo viên"
          name="teacherId"
          value={formData.teacherId}
          onChange={(value) => setFormData(prev => ({ ...prev, teacherId: value }))}
        >
          {teachers.map(teacher => (
            <Option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </Option>
          ))}
        </Select>
      </div>
      <div>
        <Typography variant="h6">Link Google Meet</Typography>
        <Input id="meetLink" name="meetLink" value={formData.meetLink} onChange={handleChange} required />
      </div>
      <div>
        <Typography variant="h6">Ngày bắt đầu</Typography>
        <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
      </div>
      <div>
        <Typography variant="h6">Ngày kết thúc</Typography>
        <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
      </div>
      <div>
        <Typography variant="h6">Lịch học (chọn 2 ngày)</Typography>
        <div className="flex flex-wrap gap-2 mt-2">
          {daysOfWeek.map((day) => (
            <div key={day.value} className="flex items-center space-x-2">
              <Checkbox
                id={day.label}
                checked={formData.schedule.includes(day.value)}
                onChange={() => handleScheduleChange(day.value)}
                disabled={formData.schedule.length === 2 && !formData.schedule.includes(day.value)}
              />
              <Typography htmlFor={day.label} className="text-sm font-medium">
                {day.label}
              </Typography>
            </div>
          ))}
        </div>
      </div>

      <Button className="flex justify-center mx-auto" type="submit">{initialData ? "Cập nhật" : "Thêm"}</Button>
    </form>
  )
}