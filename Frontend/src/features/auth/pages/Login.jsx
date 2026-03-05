// import React,{useState} from 'react'
// import { useNavigate, Link } from 'react-router'
// import "../auth.form.scss"
// import { useAuth } from '../hooks/useAuth'

// const Login = () => {

//     const { loading, handleLogin } = useAuth()
//     const navigate = useNavigate()

//     const [ email, setEmail ] = useState("")
//     const [ password, setPassword ] = useState("")

//     const handleSubmit = async (e) => {
//         e.preventDefault()
//         await handleLogin({email,password})
//         navigate('/')
//     }

//     if(loading){
//         return (<main><h1>Loading.......</h1></main>)
//     }


//     return (
//         <main>
//             <div className="form-container">
//                 <h1>Login</h1>
//                 <form onSubmit={handleSubmit}>
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
//                     <button className='button primary-button' >Login</button>
//                 </form>
//                 <p>Don't have an account? <Link to={"/register"} >Register</Link> </p>
//             </div>
//         </main>
//     )
// }

// export default Login
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router'; // Note: Ensure this is react-router-dom
import "../auth.form.scss";
import { useAuth } from '../hooks/useAuth';

const Login = () => {
    const { loading, handleLogin } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleLogin({ email, password });
        navigate('/');
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
                    <h1>Welcome <span>Back</span></h1>
                    <p>Log in to access your customized interview plans.</p>
                </div>
                
                <form onSubmit={handleSubmit}>
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
                            placeholder='Enter your password' 
                            required
                        />
                    </div>
                    
                    <button className='button primary-button' type="submit">
                        Login to Account
                    </button>
                </form>
                
                <div className="form-footer">
                    <p>Don't have an account? <Link to={"/register"}>Register</Link></p>
                </div>
            </div>
        </main>
    );
}

export default Login;