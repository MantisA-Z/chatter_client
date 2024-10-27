import React, { useContext, useState } from "react";
import "./Signin.css";
import { TbLogin2 as LoginIcon } from "react-icons/tb";
import { BsChatRightDotsFill as ChatAppIcon } from "react-icons/bs";
import { useFetchContext } from "../../contexts/FetchContext";

const Signin = () => {
  const [loginInputs, setLoginInputs] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [formValidity, setFormValidity] = useState(true);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("Welcome");
  const sendReq = useFetchContext();

  const onInputValueChange = (e) => {
    const { name, value } = e.target;
    setLoginInputs((e) => ({ ...e, [name]: value }));
    console.log(loginInputs);
  };

  const checkInputsValidity = () => {
    if (loginInputs.email.trim() === "") {
      console.log("fill email");
      return false;
    } else if (loginInputs.password.trim() === "") {
      console.log("fill password");
      return false;
    }
    return true;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!checkInputsValidity()) {
      setInfo("Fill all the info");
      setFormValidity(false);
      return;
    }
    try {
      setInfo("welcome");
      setLoading(true);
      try {
        const { data, status } = await sendReq(
          "http://localhost:8000/signin",
          {},
          JSON.stringify(loginInputs)
        );
        setLoading(false);
        if (status === 401) {
          setInfo("Pass the email and password correctly");
          return;
        } else if (status === 403) {
          setInfo("Email sent for verification");
          return;
        }

        localStorage.setItem("token", data.JWT_TOKEN);
        console.log(data);
      } catch (err) {
        setLoading(false);
        setInfo("Internal server error");
        console.log(`Error while signin up:\n ${err}`);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="form-container">
        <form>
          <div className="input">
            <label htmlFor="email">Email</label>
            <input
              name="email"
              onChange={onInputValueChange}
              id="email"
              type="text"
              placeholder={!formValidity ? "Invalid" : ""}
            />
          </div>
          <div className="input">
            <label htmlFor="password">Password</label>
            <input
              name="password"
              onChange={onInputValueChange}
              id="password"
              type="text"
              placeholder={!formValidity ? "Invalid" : ""}
            />
          </div>
          <div className="info">
            <h2>{info}</h2>
          </div>
          <button onClick={onSubmitHandler} type="submit">
            Submit
          </button>
        </form>
        <div className="signup-form">
          <div className="chatIcon">
            <h2>Chat App</h2>
            <ChatAppIcon />
          </div>
          <div className="loginIcon">
            <h2>Don't have an account signup</h2>
            <LoginIcon />
          </div>
        </div>
      </div>
      <div
        className={
          loading ? "loader-container show" : "loader-container hidden"
        }
      >
        <div className="loader"></div>
      </div>
      <img src="../../../loginBackground.jpg" alt="" className="background" />
    </div>
  );
};

export default Signin;
