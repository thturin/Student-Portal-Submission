import logo from './logo.svg';
import './App.css';
import React, {useState, useEffect} from 'react';
import SubmitForm from './components/SubmitForm.jsx';
import LoginBar from './components/LoginBar.jsx';
function App() {
  //set the current user in Parent compontnet (this app.js)
  const [user, setUser] = useState(null);
  const handleLogin=(userData)=>{
    setUser(userData); 
  };

  useEffect(()=>{ //everytime the user changes, useEffect() is called
    console.log('current user is ',user.name);
  },[user]);



//when you call onLogin(res.data.user) in LoginBar, 
// the handleLogin function in App.js is executed, and userData is set to 
// res.data.user.
  
  return (
    <div className="App">
      <h1>🗳️SUBMISSION PORTAL🗳️</h1>
      <LoginBar onLogin={handleLogin} />
      <SubmitForm />
    </div>
  );
}

export default App;
