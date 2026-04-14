import React from 'react'
import Header from './common/Header/Header'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'

const App = () => {
  return (
    <div className='min-h-screen bg-[#fdfcff]'>
      <Header/>
      <Routes>
        <Route path='/' element={<Home/>} />
      </Routes>
    </div>
  )
}

export default App