import React, {useEffect, useState} from 'react';
import SubmitForm from './SubmitForm.jsx';
import axios from 'axios';


const UserDashboard = ({user})=>{
    const[submissions,setSubmissions] = useState([]);

    useEffect(()=>{
        axios.get('http://localhost:5000/api/submit').then(ress =>{
            const userSubs = ress.data.filter(sub => sub.userId===user.id);
            setSubmissions(userSubs);
        });

    },[user.id]);
    //[user.id] is the dependency array -> 
    // if you leave it [] it will only update on the mount
    //it tells react to run the effect
    //once when the component mounts 
    //again whenever user.id changes


    return(
        <div>
            <h2> Welcome, {user.name}</h2>
            <SubmitForm />
            <h3>Your Submissions</h3>
            <ul>
                {submissions.length === 0 ? 
                <i>No Submissions</i>:(
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