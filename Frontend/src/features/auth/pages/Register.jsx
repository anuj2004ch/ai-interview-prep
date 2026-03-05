// import React,{useState} from 'react'
// import { useNavigate, Link } from 'react-router'
// import { useAuth } from '../hooks/useAuth'

// const Register = () => {

//     const navigate = useNavigate()
//     const [ username, setUsername ] = useState("")
//     const [ email, setEmail ] = useState("")
//     const [ password, setPassword ] = useState("")

//     const {loading,handleRegister} = useAuth()
    
//     const handleSubmit = async (e) => {
//         e.preventDefault()
//         await handleRegister({username,email,password})
//         navigate("/")
//     }

//     if(loading){
//         return (<main><h1>Loading.......</h1></main>)
//     }

//     return (
//         <main>
//             <div className="form-container">
//                 <h1>Register</h1>

//                 <form onSubmit={handleSubmit}>

//                     <div className="input-group">
//                         <label htmlFor="username">Username</label>
//                         <input
//                             onChange={(e) => { setUsername(e.target.value) }}
//                             type="text" id="username" name='username' placeholder='Enter username' />
//                     </div>
//                     <div className="input-group">
//                         <label htmlFor="email">Email</label>
//                         <input
//                             onChange={(e) => { setEmail(e.target.value) }}
//                             type="email" id="email" name='email' placeholder='Enter email address' />
//                     </div>
//                     <div className="input-group">
//                         <label htmlFor="password">Password</label>
//                         <input
//                             onChange={(e) => { setPassword(e.target.value) }}
//                             type="password" id="password" name='password' placeholder='Enter password' />
//                     </div>

//                     <button className='button primary-button' >Register</button>

//                 </form>

//                 <p>Already have an account? <Link to={"/login"} >Login</Link> </p>
//             </div>
//         </main>
//     )
// }

// export default Register
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router'; // Note: Ensure this is react-router-dom
import "../auth.form.scss"; // Make sure your SCSS is imported
import { useAuth } from '../hooks/useAuth';

const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { loading, handleRegister } = useAuth();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleRegister({ username, email, password });
        navigate("/");
    };

    if (loading) {
        return (
            <main className="auth-main">
                <div className="loading-spinner">Loading...</div>
            </main>
        );
    }

    return (
        <main className="auth-main">
            <div className="form-container">
                <div className="form-header">
                    <h1>Create <span>Account</span></h1>
                    <p>Join us to build your winning interview strategy.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            onChange={(e) => setUsername(e.target.value)}
                            value={username}
                            type="text" 
                            id="username" 
                            name='username' 
                            placeholder='Choose a username' 
                            required 
                        />
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            type="email" 
                            id="email" 
                            name='email' 
                            placeholder='e.g. user@example.com' 
                            required 
                        />
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            type="password" 
                            id="password" 
                            name='password' 
                            placeholder='Create a secure password' 
                            required 
                        />
                    </div>

                    <button className='button primary-button' type="submit">
                        Register Account
                    </button>
                </form>

                <div className="form-footer">
                    <p>Already have an account? <Link to={"/login"}>Login</Link></p>
                </div>
            </div>
        </main>
    );
}

export default Register;