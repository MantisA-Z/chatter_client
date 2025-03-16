import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Signup from "./components/Signup/Signup";
import Signin from "./components/signin/Signin";
import Home from "./components/home/Home";
import Messages from "./components/messages/Messages";
import GroupSettings from "./components/GroupSettings/GroupSettings";
import InCall from "./components/InCall/InCall";
import { FetchContextProvider } from "./contexts/FetchContext";
import { SocketContextProvider } from "./contexts/SocketContext";
import { VerifyContextProvider } from "./contexts/verify";
import { ConnectionIdContextProvider } from "./contexts/ConnectionId";

function App() {
  return (
    <SocketContextProvider>
      <ConnectionIdContextProvider>
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
                <Route
                  path="/call/:groupId/:connectionId"
                  element={<InCall />}
                />
              </Routes>
            </VerifyContextProvider>
          </Router>
        </FetchContextProvider>
      </ConnectionIdContextProvider>
    </SocketContextProvider>
  );
}

export default App;
