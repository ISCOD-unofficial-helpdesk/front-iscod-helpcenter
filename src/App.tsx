// App.tsx
import React from 'react';
import './App.css';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Assist from './Components/Pages/Assist';
import User from './Components/Pages/User';

function App() {
  const router = createBrowserRouter([
    {
      path: "/assist",
      element: <Assist/>,
    },
    {
      path: "/user",
      element: <User/>,
    },
  ]);

  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export default App
