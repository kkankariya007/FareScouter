import React from "react";
import NotifyForm from "./components/NotifyForm";

const App = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <nav className="bg-customBlue text-white py-2 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">FareScouter | Never Miss a Deal</h1>
          <img src="logo.png" alt="Logo" className="h-12" />
        </div>
      </nav>
      <div className="flex justify-center items-center bg-cover bg-center" style={{ backgroundImage: 'url("/airplane.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>

      <div className="container mx-auto px-6 py-6 max-w-3xl">
        <NotifyForm />
      </div>
      </div>
      <footer className="bg- text-center py-4w-full shadow-inner">
        <p className="text-sm text-black-600">&copy; 2024 Amadeus. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default App;
