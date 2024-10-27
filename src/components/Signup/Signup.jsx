import React, { useRef, useState } from "react";
import "./signup.css";
import { TbLogin2 as LoginIcon } from "react-icons/tb";
import { BsChatRightDotsFill as ChatAppIcon } from "react-icons/bs";

const Signup = () => {
  const [loginInputs, setLoginInputs] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [formValidity, setFormValidity] = useState(true);
  const [loading, setLoading] = useState(false);
  const infoRef = useRef(null);

  const onInputValueChange = (e) => {
    const { name, value } = e.target;
    setLoginInputs((e) => ({ ...e, [name]: value }));
    console.log(loginInputs);
  };

  const checkInputsValidity = () => {
    if (loginInputs.name.trim() === "") {
      console.log("fill name");
      return false;
    } else if (loginInputs.email.trim() === "") {
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
      infoRef.current.textContent = "Fill all the info";
      setFormValidity(false);
      return;
    }
    try {
      infoRef.current.value = "";
      setLoading(true);
      const response = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginInputs),
      });

      const data = await response.json();
      setLoading(false);
      if (data.success === false) {
        infoRef.current.textContent = "Email is already in use";
        return;
      }

      infoRef.current.textContent = "Email sent for verification";
    } catch (err) {
      console.log(`Error while signing up:\n ${err}`);
    }
  };

  return (
    <div className="signup-container">
      <div className="form-container">
        <form>
          <div className="input">
            <label htmlFor="user-name">User Name</label>
            <input
              name="name"
              onChange={onInputValueChange}
              id="user-name"
              type="text"
              placeholder={!formValidity ? "Invalid" : ""}
            />
          </div>
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
          <button onClick={onSubmitHandler} type="submit">
            Submit
          </button>
        </form>
        <div className="signup-form">
          <div className="chatIcon">
            <h2>Chat App</h2>
            <ChatAppIcon />
          </div>
          <div className="info">
            <h2 ref={infoRef}>welcome</h2>
          </div>
          <div className="loginIcon">
            <h2>Already have an account Login</h2>
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

export default Signup;
