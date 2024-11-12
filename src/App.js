import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Signup from "./components/Signup/Signup";
import Signin from "./components/signin/Signin";
import Home from "./components/home/Home";
import Messages from "./components/messages/Messages";
import GroupSettings from "./components/GroupSettings/GroupSettings";
import { FetchContextProvider } from "./contexts/FetchContext";
import { SocketContextProvider } from "./contexts/SocketContext";
import { VerifyContextProvider } from "./contexts/verify";

function App() {
  return (
    <SocketContextProvider>
      <FetchContextProvider>
        <Router>
          <VerifyContextProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/signin" element={<Signin />} />
              <Route
                path="/GroupSettings/:groupId"
                element={<GroupSettings />}
              />
              <Route path="/msg" element={<Messages />} />
            </Routes>
          </VerifyContextProvider>
        </Router>
      </FetchContextProvider>
    </SocketContextProvider>
  );
}

export default App;
