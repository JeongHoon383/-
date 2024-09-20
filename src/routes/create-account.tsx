import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { SubmitHandler, useForm } from "react-hook-form";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import {
  Error,
  Form,
  Input,
  Switcher,
  Title,
  Wrapper,
} from "../components/auth-components";
import GithubButton from "../components/github-btn";
import { styled } from "styled-components";
import { useState } from "react";

interface FormData {
  name: string;
  email: string;
  password: string;
}

export default function CreateAccount() {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [findPasswordEmail, setFindPasswordEmail] = useState("");
  const [formError, setFormError] = useState("");

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setFormError("");
    if (isLoading) return;

    try {
      setLoading(true);
      const credentials = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      await updateProfile(credentials.user, {
        displayName: data.name,
      });
      navigate("/");
    } catch (e) {
      if (e instanceof FirebaseError) {
        setFormError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const onClickResetPassword = async () => {
    if (!findPasswordEmail) return;
    try {
      await sendPasswordResetEmail(auth, findPasswordEmail);
      alert("입력하신 이메일로 비밀번호 재설정 요청 드렸습니다.");
    } catch (error) {
      console.error("오류 발생", error);
    }
  };

  return (
    <Wrapper>
      <Title>Join 𝕏</Title>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register("name", { required: "이름은 필수입니다." })}
          placeholder="Name"
          type="text"
        />
        {errors.name && <Error>{errors.name.message}</Error>}

        <Input
          {...register("email", { required: "이메일은 필수입니다." })}
          placeholder="Email"
          type="email"
          autoComplete="email"
        />
        {errors.email && <Error>{errors.email.message}</Error>}

        <Input
          {...register("password", { required: "비밀번호는 필수입니다." })}
          placeholder="Password"
          type="password"
          autoComplete="current-password"
        />
        {errors.password && <Error>{errors.password.message}</Error>}

        <Input
          type="submit"
          value={isLoading ? "Loading..." : "Create Account"}
        />
      </Form>
      {formError && <Error>{formError}</Error>}
      <Switcher>
        Already have an account! <Link to="/login">Log in &rarr;</Link>
      </Switcher>
      <ResetPassword>
        <Input
          placeholder="Reset Password Email"
          onChange={(e) => setFindPasswordEmail(e.target.value)}
        />
        <Button onClick={onClickResetPassword}>Reset Password!!</Button>
      </ResetPassword>
      <GithubButton />
    </Wrapper>
  );
}

const ResetPassword = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  height: 30px;
  width: 100%;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 230px;
  cursor: pointer;
`;
