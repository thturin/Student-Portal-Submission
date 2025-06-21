import React, {useEffect, useState} from 'react';
import axios from 'axios';


const AdminDashboard = ({user}) =>{
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState('');

    useEffect(()=>{
        axios.get('http://localhost:5000/api/assignments').then(res=> {
            setAssignments(res.data);
            console.log(assignments);
        });
        axios.get('http://localhost:5000/api/submit').then(res=> setSubmissions(res.data));

    },[]);

    const filteredSubs = submissions.filter(
        sub=> sub.assignmentId === Number(selectedAssignment)
    )

    return(
        <div>
            <h2> Welcome ADMIN, {user.name}</h2>
            <h3>Assignments</h3>
             <select
                value={selectedAssignment}
                onChange={e => setSelectedAssignment(e.target.value)}
                style={{ marginBottom: '16px', padding: '4px 8px' }}
            >
                <option value="">Select an Assignment</option>
                {assignments.map(ass => (
                    <option key={ass.id} value={ass.id}>
                        {ass.title}
                    </option>
                ))}
            </select>

            <h3>Submissions for Assignment{selectedAssignment.id}</h3>
            <ul>
                {filteredSubs.map(sub=>(
                    <li key={sub.id} style={{paddingLeft: '16px', listStylePosition: 'inside' }}>
                    User #{sub.userId} {sub.user?.name ? sub.user.name: 'no user'} submitted to 
                    Assignment {sub.assignmentId} - Score: {sub.score}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AdminDashboard;