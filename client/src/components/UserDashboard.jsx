import React, {useEffect, useState} from 'react';
import SubmitForm from './SubmitForm.jsx';
import axios from 'axios';
import LogoutButton from './LogoutButton';


const UserDashboard = ({user, onLogout})=>{
    const apiUrl = process.env.REACT_APP_API_URL;
    const[submissions,setSubmissions] = useState([]);

    useEffect(()=>{
        axios.get(`${apiUrl}/submit`).then(res =>{
                //filter submissions by userId
                const userSubs = res.data.filter(sub => sub.userId===user.id);
                setSubmissions(userSubs); //set the current subs as userSubs
        });
        // if you leave it [] it will only update on the mount
    },[user.id]);//[user.id] is the dependency array -> 
    //it tells react to run the effect
    //once when the component mounts 
    //again whenever user.id changes
    return(
        <div>
            <h2> Welcome, {user.name}</h2>
            {/* sending onLogout property up to parent */}
            <LogoutButton onLogout={onLogout}/> 
            <SubmitForm />
            <h3>Your Submissions</h3>
            <ul>
                {submissions.length === 0 ? 
                <i>No Submissions</i>:( //if submissions exist, print them out
                    submissions.map( 
                        sub=> (
                            <li key={sub.id}>
                                Assignment #{sub.assignmentId} - Score: {sub.score}
                            </li>
                    ))
                )}
            </ul>
        </div>
    )
};

export default UserDashboard;