// import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
// import RegisterPage from "./pages/RegisterPage";
// import LoginPage from "./pages/LoginPage";


// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Navigate to="/notes" replace />} />
//         <Route path="/register" element={<RegisterPage />} />
//         <Route path="/login" element={<LoginPage />} />             
//       </Routes>
//     </BrowserRouter>
//   );
// }



// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { Layout } from './components/Layout';
// import './components/Layout.css';

// function App() {
//   return (
//     <Router>
//       <Layout>
//         <Routes>
//           <Route path="/" element={<h1>Главная страница интернет-магазина</h1>} />
//           {/* Другие ваши роуты */}
//         </Routes>
//       </Layout>
//     </Router>
//   );
// }

// export default App;



// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { Layout } from './components/Layout';
// import { Home } from './pages/Home'; // <--- Импортируем компонент
// import './components/Layout.css';

// function App() {
//   return (
//     <Router>
//       <Layout>
//         <Routes>
//           <Route path="/" element={<Home />} /> {/* <--- Подключаем главную */}
//           <Route path="/steps" element={<h1>Страница с 7 шагами легализации</h1>} />
//         </Routes>
//       </Layout>
//     </Router>
//   );
// }

// export default App;

// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { Layout } from './components/Layout';
// import { Home } from './pages/Home';
// import { StepsList } from './pages/StepsList'; // <--- Импорт

// function App() {
//   return (
//     <Router>
//       <Layout>
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/steps" element={<StepsList />} /> {/* <--- Подключили */}
//           <Route path="/steps/:id" element={<h1>Детальная страница шага</h1>} />
//         </Routes>
//       </Layout>
//     </Router>
//   );
// }

// export default App;


// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { Layout } from './components/Layout';
// import { Home } from './pages/Home';
// import { StepsList } from './pages/StepList/StepsList';
// import { StepDetail } from './pages/StepDetail/StepDetail'; // <--- Импортируем компонент

// function App() {
//   return (
//     <Router>
//       <Layout>
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/steps" element={<StepsList />} />
//           <Route path="/steps/:id" element={<StepDetail />} /> {/* <--- Заменили заглушку на компонент */}
//         </Routes>
//       </Layout>
//     </Router>
//   );
// }

// export default App;

// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { Layout } from './components/Layout';
// import { Home } from './pages/Home';
// import { StepsList } from './pages/StepsList';
// import { StepDetail } from './pages/StepDetail';
// // ИМПОРТИРУЕМ НАШИ ЗАГЛУШКИ
// import { CalculatorPage, FAQPage, LegalPage, RegisterPage } from './pages/Stubs'; 

// function App() {
//   return (
//     <Router>
//       <Layout>
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/steps" element={<StepsList />} />
//           <Route path="/steps/:id" element={<StepDetail />} />
          
//           {/* ПОДКЛЮЧАЕМ МАРШРУТЫ ЗАГЛУШЕК */}
//           <Route path="/calculator" element={<CalculatorPage />} />
//           <Route path="/faq" element={<FAQPage />} />
//           <Route path="/laws" element={<LegalPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//         </Routes>
//       </Layout>
//     </Router>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home/Home';
import { StepsList } from './pages/StepsList/StepsList';
import { StepDetail } from './pages/StepDetail/StepDetail';
import { CalculatorPage, FAQPage, LegalPage, RegisterPage } from './pages/Stubs/Stubs';
import './components/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/steps" element={<StepsList />} />
          <Route path="/steps/:id" element={<StepDetail />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/laws" element={<LegalPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Страница логина (временно заглушка) */}
          <Route path="/auth/login" element={<h1>Страница входа скоро появится</h1>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;


