import {
  InformationCircleIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
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
} from "@material-tailwind/react";
import { useEffect, useState } from 'react';

import Pagination from "@/components/Pagination";
import { courseServices } from "@/services/courseServices";
import { examServices } from "@/services/examServices";
import { questionService } from "@/services/questionService";
import { toast } from 'react-toastify';

const examTypes = [
  { label: "Lý thuyết", value: 1 },
  { label: "Mô phỏng", value: 2 },
];

export function ExamManagement() {
  const [groupedExams, setGroupedExams] = useState([]);
  const [courses, setCourses] = useState([])
  const [selectedExam, setSelectedExam] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  const [examDetails, setExamDetails] = useState(null)


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const fetchExams = async () => {
    try {
      const response = await examServices.getAllExams({
        PageIndex: currentPage,
        PageSize: itemsPerPage,
      });

      // Group exams by courseId
      const grouped = response.data.reduce((acc, exam) => {
        if (!acc[exam.courseId]) {
          acc[exam.courseId] = {
            courseId: exam.courseId,
            courseName: exam.courseName,
            exams: []
          };
        }
        acc[exam.courseId].exams.push(exam);
        return acc;
      }, {});

      setGroupedExams(Object.values(grouped));
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [currentPage]);

  const fetchCourses = async () => {
    try {
      const response = await courseServices.getAllCourses();
      setCourses(response.data.map(item => ({
        id: item.courseId,
        name: item.courseName
      })));
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  useEffect(() => {
    fetchCourses()
  }, [])


  const handleAddExam = async (newExam) => {
    try {
      await examServices.postExam(newExam);
      await fetchExams();
      setIsAddDialogOpen(false);
      toast.success("Thêm bài kiểm tra thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm bài kiểm tra.");
    }
  };

  const handleEditExam = async (updatedExam) => {
    try {
      await examServices.editExam(updatedExam.examId, updatedExam);
      await fetchExams();
      setIsEditDialogOpen(false);
      toast.success("Cập nhật bài kiểm tra thành công!");
    } catch (error) {
      console.error('Error editing exam:', error);
      toast.error("Có lỗi xảy ra khi cập nhật bài kiểm tra.");
    }
  };

  const handleDeleteExam = async (id) => {
    try {
      await examServices.deleteExam(id);
      await fetchExams();
      setIsDeleteDialogOpen(false);
      toast.success("Xóa bài kiểm tra thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa bài kiểm tra.");
    }
  };

  useEffect(() => {
    const fetchExamDetails = async () => {
      if (isDetailDialogOpen && selectedExam) {
        try {
          const details = await examServices.getDetail(selectedExam.examId)
          setExamDetails({
            ...details.data,
            questions: details.data.questions.map(item => ({
              ...item,
              text: item.content,
            }))
          })
          setAttendanceList([])
        } catch (error) {
          console.error('Error fetching class details:', error)
        }
      }
    }

    fetchExamDetails()
  }, [isDetailDialogOpen, selectedExam])

  const addQuestion = () => {
    setExamDetails(prevDetails => ({
      ...prevDetails,
      questions: [
        ...prevDetails.questions,
        { text: '', file: null, answers: [{ content: '', type: false }] }
      ]
    }));
  };

  const updateQuestion = (questionIndex, field, value) => {
    setExamDetails(prevDetails => {
      const updatedQuestions = [...prevDetails.questions];
      updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], [field]: value };
      return { ...prevDetails, questions: updatedQuestions };
    });
  };

  const addAnswer = (questionIndex) => {
    setExamDetails(prevDetails => {
      const updatedQuestions = [...prevDetails.questions];
      updatedQuestions[questionIndex].answers.push({ content: '', type: false });
      return { ...prevDetails, questions: updatedQuestions };
    });
  };

  const updateAnswer = (questionIndex, answerIndex, field, value) => {
    setExamDetails(prevDetails => {
      const updatedQuestions = [...prevDetails.questions];
      updatedQuestions[questionIndex].answers[answerIndex] = {
        ...updatedQuestions[questionIndex].answers[answerIndex],
        [field]: value
      };
      return { ...prevDetails, questions: updatedQuestions };
    });
  };

  const removeAnswer = (questionIndex, answerIndex) => {
    setExamDetails(prevDetails => {
      const updatedQuestions = [...prevDetails.questions];
      updatedQuestions[questionIndex].answers.splice(answerIndex, 1);
      return { ...prevDetails, questions: updatedQuestions };
    });
  };

  const removeQuestion = (index) => {
    setExamDetails(prevDetails => ({
      ...prevDetails,
      questions: prevDetails.questions.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateExam = async (updatedExam) => {
    const questions = updatedExam.questions
    if (questions.length > 0 && updatedExam.type == 1) {
      const formData = new FormData()
      updatedExam.questions.forEach((question, questionIndex) => {
        formData.append(`questions[${questionIndex}].questionId`, question.questionId ? question.questionId : 0);
        formData.append(`questions[${questionIndex}].Content`, question.text);
        if (question.file && typeof question.file !== 'string') {
          formData.append(`questions[${questionIndex}].File`, question.file);
        }
        question.answers.forEach((answer, answerIndex) => {
          formData.append(`questions[${questionIndex}].Answers[${answerIndex}].Content`, answer.content);
          formData.append(`questions[${questionIndex}].Answers[${answerIndex}].Type`, answer.type.toString());
        });
      });
      try {
        await questionService.postQuestion(updatedExam.examId, formData);
        await fetchExams();
        setIsDetailDialogOpen(false);
        toast.success("Cập nhật bài kiểm tra thành công!");
      } catch (error) {
        console.error('Error updating exam:', error);
        toast.error("Có lỗi xảy ra khi cập nhật bài kiểm tra.");
      }
    }
    if (questions.length > 0 && updatedExam.type == 2) {

      console.log(updatedExam);
      const payload = updatedExam.questions.map(item => ({
        content: item.content || item.text,
        questionId: item.questionId || 0,
        startTime: item.startTime,
        endTime: item.endTime
      }))
      try {
        await questionService.postPractice(updatedExam.examId, payload);
        await fetchExams();
        setIsDetailDialogOpen(false);
        toast.success("Cập nhật bài kiểm tra thành công!");
      } catch (error) {
        console.error('Error updating exam:', error);
        toast.error("Có lỗi xảy ra khi cập nhật bài kiểm tra.");
      }
    }
  };


  return (
    <Card className="container p-4 mx-auto mt-8">
      <CardHeader>
        <Typography variant="h3" className="p-4 font-bold">Quản lý bài kiểm tra</Typography>
      </CardHeader>
      <CardBody>
        <div className="mb-6">
          <Button
            className="flex gap-2 items-center"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PlusIcon className="w-5 h-5" /> Thêm bài kiểm tra
          </Button>
        </div>
        <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Khóa", "Tên", "Giá", "Loại", "Thời gian", "Thao tác"].map((el) => (
                  <th key={el} className="px-5 py-3 text-left border-b border-blue-gray-50">
                    <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groupedExams.map((group) => (
                group.exams.map((exam, index) => (
                  <tr key={exam.examId}>
                    {index === 0 && (
                      <td rowSpan={group.exams.length} className="px-5 py-3 border-b border-blue-gray-50">
                        {group.courseName}
                      </td>
                    )}
                    <td className="px-5 py-3 border-b border-blue-gray-50">{exam.examName}</td>
                    <td className="px-5 py-3 border-b border-blue-gray-50">{exam.price}</td>
                    <td className="px-5 py-3 border-b border-blue-gray-50">
                      {examTypes.find(type => type.value === exam.type)?.label}
                    </td>
                    <td className="px-5 py-3 border-b border-blue-gray-50">{exam.time} phút</td>
                    <td className="px-5 py-3 border-b border-blue-gray-50">
                      <div className="flex space-x-2">
                        <Button
                          variant="outlined"
                          size="sm"
                          onClick={() => {
                            setSelectedExam(exam);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outlined"
                          size="sm"
                          onClick={() => {
                            setSelectedExam(exam);
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          <InformationCircleIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outlined"
                          size="sm"
                          color="red"
                          onClick={() => {
                            setSelectedExam(exam);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ))}
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
        <DialogHeader>Thêm bài kiểm tra mới</DialogHeader>
        <DialogBody>
          <ExamForm onSubmit={handleAddExam} courses={courses} />
        </DialogBody>
      </Dialog>
      <Dialog open={isEditDialogOpen} handler={() => setIsEditDialogOpen(!isEditDialogOpen)} >
        <DialogHeader>Chỉnh sửa bài kiểm tra</DialogHeader>
        <DialogBody>
          {selectedExam && (
            <ExamForm onSubmit={handleEditExam} initialData={selectedExam} courses={courses} />
          )}
        </DialogBody>
      </Dialog>
      <Dialog open={isDetailDialogOpen} handler={() => setIsDetailDialogOpen(!isDetailDialogOpen)} size="xl">
        <DialogHeader>Chi tiết bài kiểm tra</DialogHeader>
        <DialogBody divider className="h-[40rem] overflow-y-auto">
          {examDetails && (
            <div className="space-y-4">
              <Typography><strong>Khóa:</strong> {examDetails?.courseName}</Typography>
              <Typography><strong>Tên:</strong> {examDetails?.examName}</Typography>
              <Typography><strong>Giá:</strong> {examDetails?.price}</Typography>
              <Typography><strong>Loại:</strong> {examTypes.find(type => type.value === examDetails?.type)?.label}</Typography>
              <Typography><strong>Thời gian:</strong> {examDetails?.time} phút</Typography>
            </div>
          )}

          <div className="mt-6">
            <h3 className="mb-2 text-lg font-semibold">{examDetails?.type == 1 ? "Câu hỏi" : "Video"}</h3>
            {examDetails && examDetails?.questions && examDetails?.questions.map((question, questionIndex) => (
              <div key={questionIndex}>
                <h3 className="mb-2 text-xs font-semibold">{examDetails?.type == 1 ? "câu hỏi" : "video"} {questionIndex + 1}</h3>
                <div className="p-4 mb-4 space-y-4 rounded-md border">
                  {examDetails?.type == 2 && (
                    <div>
                      <Typography variant="h6">Thời gian đúng</Typography>
                      <div className="flex space-x-4">
                        <Input
                          label="Thời gian bắt đầu (HH:MM:SS)"
                          type="text"
                          value={question.startTime || "00:00:00"}
                          onChange={(e) => updateQuestion(questionIndex, 'startTime', e.target.value)}
                          className="flex-grow mb-2"
                        />
                        <Input
                          label="Thời gian kết thúc (HH:MM:SS)"
                          type="text"
                          value={question.endTime || "00:00:00"}
                          onChange={(e) => updateQuestion(questionIndex, 'endTime', e.target.value)}
                          className="flex-grow mb-2"
                        />
                      </div>
                    </div>
                  )}
                  <Input
                    label={examDetails?.type == 1 ? "câu hỏi" : "video"}
                    value={question.text}
                    onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                    className="mb-2"
                  />
                  {question.file && typeof question.file === 'string' && examDetails?.type == 1 ? (
                    <div className="mb-2">
                      <Typography variant="small" className="mb-1">File hiện tại:</Typography>
                      <a href={question.file} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                        {question.file.split('/').pop()}
                      </a>
                    </div>
                  ) : null}
                  {examDetails?.type == 1 &&
                    <>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => updateQuestion(questionIndex, 'file', e.target.files?.[0] || null)}
                        className="mb-2"
                      />
                      <h4 className="mt-4 mb-2 font-semibold">Câu trả lời:</h4>
                      {question.answers.map((answer, answerIndex) => (
                        <div key={answerIndex} className="flex items-center mb-2 space-x-2">
                          <Input
                            value={answer.content}
                            onChange={(e) => updateAnswer(questionIndex, answerIndex, 'content', e.target.value)}
                            className="flex-grow"
                          />
                          <Checkbox
                            checked={answer.type}
                            onChange={(e) => updateAnswer(questionIndex, answerIndex, 'type', e.target.checked)}
                            label="Đúng"
                          />
                          <Button
                            color="red"
                            variant="text"
                            className="p-2"
                            onClick={() => removeAnswer(questionIndex, answerIndex)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outlined"
                        size="sm"
                        className="mt-2"
                        onClick={() => addAnswer(questionIndex)}
                      >
                        Thêm câu trả lời
                      </Button>
                    </>
                  }
                  <Button
                    color="red"
                    variant="text"
                    className="flex items-center mt-4"
                    onClick={() => removeQuestion(questionIndex)}
                  >
                    <TrashIcon className="mr-2 w-4 h-4" /> Xóa {examDetails?.type == 1 ? "câu hỏi" : "video"}
                  </Button>
                </div>
              </div>
            ))}
            <Button
              className="flex items-center"
              onClick={addQuestion}
            >
              <PlusIcon className="mr-2 w-4 h-4" /> Thêm {examDetails?.type == 1 ? "câu hỏi" : "video"}
            </Button>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setIsDetailDialogOpen(false)} className="mr-1">
            <span>Hủy</span>
          </Button>
          <Button variant="gradient" color="green" onClick={() => handleUpdateExam(examDetails)}>
            <span>Xác nhận</span>
          </Button>
        </DialogFooter>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} handler={() => setIsDeleteDialogOpen(!isDeleteDialogOpen)}>
        <DialogHeader>Xác nhận xóa</DialogHeader>
        <DialogBody>
          Bạn có chắc chắn muốn xóa bài kiểm tra này? Hành động này không thể hoàn tác.
        </DialogBody>
        <DialogFooter>
          <Button variant="text" onClick={() => setIsDeleteDialogOpen(false)}>
            Hủy
          </Button>
          <Button color="red" onClick={() => {
            handleDeleteExam(selectedExam.examId);
            setIsDeleteDialogOpen(false);
          }}>
            Xóa
          </Button>
        </DialogFooter>
      </Dialog>
    </Card>
  );
}

function ExamForm({ onSubmit, initialData, courses }) {
  const [formData, setFormData] = useState(
    initialData ? {
      examId: initialData.examId,
      courseId: initialData.courseId,
      examName: initialData.examName,
      price: initialData.price,
      type: initialData.type,
      time: initialData.time,
    } : {
      courseId: "",
      examName: "",
      price: "",
      type: "",
      time: "",
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
        <Typography variant="h6">Khóa</Typography>
        <Select
          label="Chọn khóa"
          name="courseId"
          value={formData.courseId}
          onChange={(value) => setFormData(prev => ({ ...prev, courseId: value }))}
        >
          {courses.map(course => (
            <Option key={course.id} value={course.id}>
              {course.name}
            </Option>
          ))}
        </Select>
      </div>
      <div>
        <Typography variant="h6">Tên bài kiểm tra</Typography>
        <Input id="examName" name="examName" value={formData.examName} onChange={handleChange} required />
      </div>
      <div>
        <Typography variant="h6">Giá</Typography>
        <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
      </div>
      <div>
        <Typography variant="h6">Loại</Typography>
        <Select
          id="type"
          name="type"
          value={formData.type}
          onChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
          required
        >
          {examTypes.map(type => (
            <Option key={type.value} value={type.value}>
              {type.label}
            </Option>
          ))}
        </Select>
      </div>
      <div>
        <Typography variant="h6">Thời gian (phút)</Typography>
        <Input id="time" name="time" type="number" value={formData.time} onChange={handleChange} required />
      </div>
      <Button className="flex justify-center mx-auto" type="submit">
        {initialData ? "Cập nhật" : "Thêm"}
      </Button>
    </form>
  );
}