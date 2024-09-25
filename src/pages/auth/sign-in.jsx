import {
  Button,
  Input,
  Typography
} from "@material-tailwind/react";

import { authServices } from "@/services/authServices";
import { useState } from "react"; // Thêm import useState
import { useNavigate } from "react-router-dom";

export function SignIn() {
  const [email, setEmail] = useState(""); // Trạng thái cho email
  const [password, setPassword] = useState(""); // Trạng thái cho password
  const [error, setError] = useState(""); // Trạng thái cho lỗi

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email và mật khẩu không được để trống."); // Kiểm tra trường nhập liệu
      return;
    }
    setError(""); // Xóa lỗi nếu hợp lệ
    // Xử lý đăng nhập ở đây
    try {
      const response = await authServices.signIn({
        username: email,
        password
      });
      if (response.token) {
        localStorage.setItem('token', response.token);
        navigate('/dashboard/home')
      }
    } catch (error) {
      console.log("Lỗi:", error)
    }
  };

  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Đăng Nhập</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">Nhập email và mật khẩu của bạn để đăng nhập.</Typography>
        </div>
        <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" onSubmit={handleSubmit}>
          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              User Name
            </Typography>
            <Input
              size="lg"
              placeholder="name@mail.com"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Mật khẩu
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <Typography variant="small" color="red" className="mt-2">{error}</Typography>}
          <Button className="mt-6" fullWidth type="submit">
            Đăng Nhập
          </Button>
        </form>
      </div>
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl"
        />
      </div>
    </section>
  );
}

export default SignIn;
