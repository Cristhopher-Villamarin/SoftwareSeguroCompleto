import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Principal from "./components/Principal";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Registro";




function App() {
  return (
  
    <Router>
      <Routes>
        <Route path="/" element={<Principal />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/registro" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
