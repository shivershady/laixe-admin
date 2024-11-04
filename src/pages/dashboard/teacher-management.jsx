import {
  PencilIcon,
  PlusIcon,
  TrashIcon
} from "@heroicons/react/24/outline"
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
  Typography,
} from "@material-tailwind/react"
import { useEffect, useState } from "react"

import { userService } from "@/services/userService"

export function TeacherManagement() {
  const [teachers, setTeachers] = useState([])
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [newTeacher, setNewTeacher] = useState({
    userName: "",
    age: "",
    phoneNumber: "",
    email: "",
    address: "",
    password: "",
  })
  const [teacherRoleId, setTeacherRoleId] = useState("")

  const fetchTeachers = async () => {
    try {
      const response = await userService.getAllUser()
      const teachersList = response.filter(user => user.roles.includes("Teacher"))
        .map(teacher => ({
          id: teacher.id,
          userName: teacher.userName.split('@')[0],
          email: teacher.email,
          age: teacher.age || 'N/A',
          phoneNumber: teacher.phoneNumber || 'N/A',
          address: teacher.address || 'N/A',
        }))
      setTeachers(teachersList)
    } catch (error) {
      console.error('Error fetching teachers:', error)
    }
  }
  const fetchRoleTeacher = async () => {
    try {
      const response = await userService.getRoleUser()
      setTeacherRoleId(response.filter(role => role.name === "Teacher")[0].id)
    } catch (error) {
      console.error('Error fetching teachers:', error)
    }
  }

  useEffect(() => {
    fetchTeachers()
    fetchRoleTeacher()
  }, [])

  const handleAddTeacher = async () => {
    // Validate form fields
    if (!newTeacher.userName || !newTeacher.email || !newTeacher.age || !newTeacher.phoneNumber || !newTeacher.address || !newTeacher.password) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const payload = {
        ...newTeacher,
        roleIds: [teacherRoleId]
      }
      await userService.createUser(payload)
      setIsAddDialogOpen(false)
      fetchTeachers() // Refresh the list
    } catch (error) {
      console.error('Error creating teacher:', error)
    }
  }

  const handleEditTeacher = async () => {
    // Validate form fields
    if (!selectedTeacher.userName || !selectedTeacher.email || !selectedTeacher.age || !selectedTeacher.phoneNumber || !selectedTeacher.address) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const payload = {
        ...selectedTeacher,
        roleIds: [teacherRoleId]
      }
      await userService.updateUser(selectedTeacher.id, payload)
      setIsEditDialogOpen(false)
      fetchTeachers() // Refresh the list
    } catch (error) {
      console.error('Error updating teacher:', error)
    }
  }

  const handleDeleteTeacher = async () => {
    try {
      await userService.deleteUser(selectedTeacher.id)
      setIsDeleteDialogOpen(false)
      fetchTeachers() // Refresh the list
    } catch (error) {
      console.error('Error deleting teacher:', error)
    }
  }

  return (
    <>
      <Card className="container mx-auto p-4 mt-8">
        <CardHeader>
          <Typography variant="h3" className="font-bold p-4">Quản lý giáo viên</Typography>
        </CardHeader>
        <CardBody>
          <div className="mb-6">
            <Button
              className="flex items-center gap-2"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <PlusIcon className="h-5 w-5" /> Thêm giáo viên
            </Button>
          </div>
          <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Họ tên", "Email", "Tuổi", "Số điện thoại", "Địa chỉ", "Thao tác"].map((el) => (
                    <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                      <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className="py-3 px-5 border-b">{teacher.userName}</td>
                    <td className="py-3 px-5 border-b">{teacher.email}</td>
                    <td className="py-3 px-5 border-b">{teacher.age}</td>
                    <td className="py-3 px-5 border-b">{teacher.phoneNumber}</td>
                    <td className="py-3 px-5 border-b">{teacher.address}</td>
                    <td className="py-3 px-5 border-b">
                      <div className="flex space-x-2">
                        <Button
                          variant="outlined"
                          size="sm"
                          onClick={() => {
                            setSelectedTeacher(teacher)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outlined"
                          size="sm"
                          color="red"
                          onClick={() => {
                            setSelectedTeacher(teacher)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </CardBody>
      </Card>

      <Dialog open={isAddDialogOpen} handler={() => setIsAddDialogOpen(false)}>
        <DialogHeader>Thêm giáo viên mới</DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-4">
            <Input
              label="Tên giáo viên"
              value={newTeacher.userName}
              onChange={(e) => setNewTeacher({ ...newTeacher, userName: e.target.value })}
            />
            <Input
              label="Tuổi"
              type="number"
              value={newTeacher.age}
              onChange={(e) => setNewTeacher({ ...newTeacher, age: parseInt(e.target.value) })}
            />
            <Input
              label="Số điện thoại"
              value={newTeacher.phoneNumber}
              onChange={(e) => setNewTeacher({ ...newTeacher, phoneNumber: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={newTeacher.email}
              onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
            />
            <Input
              label="Địa chỉ"
              value={newTeacher.address}
              onChange={(e) => setNewTeacher({ ...newTeacher, address: e.target.value })}
            />
            <Input
              label="Mật khẩu"
              value={newTeacher.password}
              onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
            />

          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" onClick={() => setIsAddDialogOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleAddTeacher}>
            Xác nhận
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={isEditDialogOpen} handler={() => setIsEditDialogOpen(false)}>
        <DialogHeader>Sửa thông tin giáo viên</DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-4">
            <Input
              label="Tên giáo viên"
              value={selectedTeacher?.userName}
              onChange={(e) => setSelectedTeacher({ ...selectedTeacher, userName: e.target.value })}
            />
            <Input
              label="Tuổi"
              type="number"
              value={selectedTeacher?.age}
              onChange={(e) => setSelectedTeacher({ ...selectedTeacher, age: parseInt(e.target.value) })}
            />
            <Input
              label="Số điện thoại"
              value={selectedTeacher?.phoneNumber}
              onChange={(e) => setSelectedTeacher({ ...selectedTeacher, phoneNumber: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={selectedTeacher?.email}
              onChange={(e) => setSelectedTeacher({ ...selectedTeacher, email: e.target.value })}
            />
            <Input
              label="Địa chỉ"
              value={selectedTeacher?.address}
              onChange={(e) => setSelectedTeacher({ ...selectedTeacher, address: e.target.value })}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" onClick={() => setIsEditDialogOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleEditTeacher}>
            Xác nhận
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} handler={() => setIsDeleteDialogOpen(false)}>
        <DialogHeader>Xóa giáo viên</DialogHeader>
        <DialogBody>
          <Typography>Bạn có chắc chắn muốn xóa giáo viên này?</Typography>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" onClick={() => setIsDeleteDialogOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleDeleteTeacher} color="red">
            Xóa
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}