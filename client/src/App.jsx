import React from 'react'
import { Navigate, Route,Routes } from 'react-router-dom'
import Homepage from './pages/Homepage.jsx'
import Profilepage from './pages/Profilepage.jsx'
import Loginpage from './pages/Loginpage.jsx'
import {Toaster} from 'react-hot-toast'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const App = () => {
  const {authuser}=useContext(AuthContext);
  return (
    <div className="bg-[url('/bgImage.svg')] bg-contain">
      <Toaster/>
      <Routes>
        <Route path='/' element={authuser ? <Homepage/> : <Navigate to="/login "/>}/>
        <Route path='/login' element={!authuser ? <Loginpage/>:<Navigate to="/"/>}/>
        <Route path='/profile' element={authuser ? <Profilepage/>:<Navigate to="/login"/>}/>
      </Routes>
    </div>
  )
}

export default App