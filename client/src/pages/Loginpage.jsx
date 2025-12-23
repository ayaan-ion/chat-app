import React, { useContext } from 'react'
import assets from '../assets/assets'
import { useState } from 'react'
import { AuthContext } from '../../context/AuthContext'

const Loginpage = () => {
  const [currstate,setcurrstate]=useState("sign up")
  const [FullName,setFullName]=useState("")
  const [email,setemail]=useState("")
  const [password,setpassword]=useState("")
  const [bio,setbio]=useState("")
  const [isdatasubmitted,setisdatasubmitted]=useState(false)

  const {login}=useContext(AuthContext);


  const onSubmitHandler=(e)=>{
    e.preventDefault();
    if(currstate==="sign up" && !isdatasubmitted){
      setisdatasubmitted(true);
      return;
    }

    login(currstate==="sign up" ? 'signup' : 'login', {fullName:FullName,email,password,bio});
  }
  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col'>
      {/* left */}
      <img src={assets.logo} alt="" className="w-[min(30vw,250px)] bg-transparent mix-blend-normal" />
      {/* right */}
      <form onSubmit={onSubmitHandler} className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg '>
        <h2 className='font-medium text-2xl flex justify-between items-center'>{currstate} {isdatasubmitted &&  <img onClick={()=>setisdatasubmitted(false)} src={assets.arrow_icon} alt="" className='w-5 cursor-pointer' />}</h2>
        {currstate==="sign up" && !isdatasubmitted && (
          <input onChange={(e)=>setFullName(e.target.value)} value={FullName} type="text" className='p-2 border border-gray-500 rounded-md focus:outline-none' placeholder='Full Name' required />

        )}
        {!isdatasubmitted && (
          <>
          <input onChange={(e)=>setemail(e.target.value)} value={email} type="email" placeholder='enter the email' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ' />
          <input onChange={(e)=>setpassword(e.target.value)} value={password} type="password" placeholder='enter the password' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ' />
          </>
        )}

        {currstate==="sign up" && isdatasubmitted &&(
          <textarea onChange={(e)=>setbio(e.target.value)} value={bio} rows={4} className='p-2 border border-gray-500 rounded-md focus:ring-2 focus:ring-indigo-500' placeholder='provide a short bio....' required></textarea>
        ) 

        }
        <button type='submit' className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
          {currstate==="sign up" ? "create account" : "login"}
        </button>
        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy</p>
        </div>

        <div className='flex flex-col gap-2'>
          {currstate==="sign up" ? (
            <p className='text-sm text-gray-600'>Already have an account? <span onClick={()=>{setcurrstate("login");setisdatasubmitted(false)}} className='font-medium text-violet-500 cursor-pointer'>Login here</span></p>
          ):(
            <p className='text-sm text-gray-600'>Create an Account <span onClick={()=>setcurrstate("sign up")} className='font-medium text-violet-500 cursor-pointer'>Click here</span></p>
          ) }

        </div>
        

      </form>
       

        
    </div>
  )
}

export default Loginpage