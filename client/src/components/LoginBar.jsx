import React, {useEffect, useState} from 'react';
import axios from 'axios';


const apiUrl = process.env.REACT_APP_API_URL+'/login';



const LoginBar = ({onLogin}) =>{
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    //the states below are needed to track the logged in user and render it in the parent component via onLogin
    const [success, setSuccess] = useState(false);
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    //WHEN THE USER LOGS OUT, YOU SHOULD NOT PERFORM THE GET METHOD BELOW `
    useEffect(()=>{
        axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {withCredentials:true})
        .then(res=>{
            setUserName(res.data.name);
            setSuccess(true);
            if(onLogin) onLogin(res.data); //send user data to parent
            }).catch(()=>{
                //this happens the user logs out and the user is now null, it will try to GET /auth/me but the session has expired
                setSuccess(false);
                setUserName('');
                //setPassword('');
            });
    },[onLogin]);

    //handle github authorization login. After the user clicks login and we know the email exists in the database
    const handleGithubLogin= async (e)=>{
        e.preventDefault(); //I think this was the problem of http://localhost:5000/api/auth/me not authorizing???
        setError('');
        if(!email){
            setError('Please enter your email');
            return;
        }

        if(!password){
            setError('Please enter your password');
            return;
        }else{
            ///check password
            try{
                const res = await axios.post(process.env.REACT_APP_API_URL+'/login', {email, password});
                if(res.data && res.data.user){
                    //if login is successful... there exists a response and a user found in db
                    //PASS THE EMAIL AS A STATE PARAM VIA URL TO PASSPORT STRATEGY        
                    const url = `${process.env.REACT_APP_API_URL}/auth/github?state=${encodeURIComponent(email)}`;
                    window.location.href = url;
                }else{
                    setError('Password incorrect');
                    return;
                }

            }catch(err){
                setError('Wrong username or password');
            }

        }


    };

    return (
        //center the login text box with below
       <form onSubmit={handleGithubLogin} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                    type="email"
                    placeholder="yourname@nycstudents.net"
                    value={email}
                    onChange={e => setEmail(e.target.value.trim())} //change useState of email
                    required
                    style={{ padding: '8px', width: '250px' }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ padding: '8px', width: '150px' }}
                />
                {/* <button type="submit" style={{ padding: '8px 16px' }}>Login</button> */}
                <button type="submit" style={{ padding: '8px 16px' }}>
                    Login with GitHub
                </button>
                {error && <span style={{ color: 'red', marginLeft: '10px' }}>{error}</span>}
            </div>

        {success && (
            <p style={{ marginTop: '20px' }}>
                Successful Login. Welcome <strong>{userName}</strong>
            </p>
        )}

    </form>
    );
};

export default LoginBar;



//OLD LOGIN
    // const handleLogin = async (e)=>{
    //     e.preventDefault();
    //     setError('');
    //     try{
            
    //         const res = await axios.post(apiUrl, {email});
    //         //console.log(res.data);
    //         if(res.data && res.data.user){ //if the data exists and there exists a user with that email
    //             //function prop which passes the user object 
    //             //{ id: 1, name: "Alice", email: "alice@school.com" }to the handleLog function
                
    //             //console.log('onLogin called with:', res.data.user.name);
       

    //             onLogin(res.data.user); //PASS USER DATA TO APP.JS (PARENT COMPONENT)
    //             setUserName(res.data.user.name);
    //             setSuccess(true);
    //         }else{
    //             setError('User not found');
    //         }
    //     }catch(err){
    //             setError(err.response?.data?.error || 'Login failed');
    //     }
    // };
