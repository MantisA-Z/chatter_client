import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Signup from "./components/Signup/Signup";
import Signin from "./components/signin/Signin";
import { FetchContextProvider } from "./contexts/FetchContext";
import { SocketContextProvider } from "./contexts/SocketContext";
import Home from "./components/home/Home";

function App() {
  return (
    <SocketContextProvider>
      <FetchContextProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />}></Route>
          </Routes>
        </Router>
      </FetchContextProvider>
    </SocketContextProvider>
  );
}

export default App;
