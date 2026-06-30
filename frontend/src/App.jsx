import "./App.css";
import Navbar from "./components/navbar/navbar";
import Footer from "./components/footer/footer";
import LoginCard from "./components/login/LoginCard";

function App() {
  return (
    <div className="app">
      <>
        <Navbar />
        <LoginCard />
        <Footer />
      </>
    </div>
  );
}

export default App;
