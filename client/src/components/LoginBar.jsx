import React, {useState} from 'react';
import axios from 'axios';


const apiUrl = process.env.REACT_APP_API_URL.replace('/submit','/login');

const LoginBar = ({onLogin}) =>{
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    //the states below are needed to track the logged in user and render it in the parent component via onLogin
    const [success, setSuccess] = useState(false);
    const [userName, setUserName] = useState('');

    const handleLogin = async (e)=>{
        e.preventDefault();
        setError('');
        try{
            
            const res = await axios.post(apiUrl, {email});
            console.log(res.data);
            if(res.data && res.data.user){ //if the data exists and there exists a user with that email
                //function prop which passes the user object 
                //{ id: 1, name: "Alice", email: "alice@school.com" }to the handleLog function
                //in App
                console.log('onLogin called with:', res.data.user);
                onLogin(res.data.user); //PASS USER DATA TO APP.JS (PARENT COMPONENT)
                setUserName(res.data.user.name);
                setSuccess(true);
            }else{
                setError('User not found');
            }
        }catch(err){
                setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        //center the login text box with below
       <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                    type="email"
                    placeholder="whatever@whatever.com"
                    value={email}
                    onChange={e => setEmail(e.target.value.trim())} //change useState of email
                    required
                    style={{ padding: '8px', width: '250px' }}
                />
                <button type="submit" style={{ padding: '8px 16px' }}>Login</button>
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
