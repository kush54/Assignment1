import React from 'react';
import './App.css';
import { createBrowserRouter, Link, RouterProvider } from 'react-router-dom';
import Game from './features/game/Game';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Game/>
    ),
  },
 
]);

function App() {
  return (
    <div className="App">
            <RouterProvider router={router} />
    </div>
  );
}

export default App;
