import React, {useEffect, useState} from 'react';
import axios from 'axios';
import LogoutButton from './LogoutButton';
import CreateAssignmentForm from './CreateAssignment';


const AdminDashboard = ({user, onLogout}) =>{
    const apiUrl = process.env.REACT_APP_API_URL;
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const selectedAssignmentObj = assignments.find(
        ass=>ass.id == Number(selectedAssignment)
    );

    useEffect(()=>{
        axios.get(`${apiUrl}/assignments`).then(res=> {
            setAssignments(res.data);
        });
        //to retrieve the 
        axios.get(`${apiUrl}/submissions`).then(res=> setSubmissions(res.data));

    },[]);

    const filteredSubs = submissions.filter(
        sub=> sub.assignmentId === Number(selectedAssignment)
    );


    return(
        <div>
            <h2> Welcome ADMIN, {user.name}</h2>
                <LogoutButton onLogout={onLogout}/>
                {/* when you use the functional form of a state setter (setASsignments) , oldAssignments always 
                represents the previous (current) state value */}
                <CreateAssignmentForm updateAssignments={newAssignment=>setAssignments(oldAssignments=>[...oldAssignments,newAssignment])}/>

            <h3>Assignments</h3>
            <select
                value={selectedAssignment}
                onChange={e => setSelectedAssignment(e.target.value)}
                style={{ marginBottom: '16px', padding: '4px 8px' }}
                >
                <option value="">Select an Assignment</option>
                {assignments.map(ass => (
                    <option key={ass.id} value={ass.id}> 
                    {/* selectedAssignment ==> the id number  */}
                        {ass.title}
                    </option>
                ))}
            </select>

            <h3>Submissions for Assignment {selectedAssignmentObj}</h3>
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