import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';
import LogoutButton from './LogoutButton';
import SubmitForm from './SubmitForm.jsx';


const UserDashboard = ({user, onLogout})=>{
    const apiUrl = process.env.REACT_APP_API_URL;
    const[submissions,setSubmissions] = useState([]);
    const [assignments, setAssignments] = useState([]);
    useEffect(()=>{
        axios.get(`${apiUrl}/submissions`).then(res =>{
                //filter submissions by userId
                const userSubs = res.data.filter(sub => sub.userId===user.id);
                setSubmissions(userSubs); //set the current subs as userSubs
        });

        //get assignments to list names 
        axios.get(`${apiUrl}/assignments`).then(res=>{
            setAssignments(res.data);  
        });

        // if you leave it [] it will only update on the mount
    },[user.id]);//[user.id] is the dependency array -> 
    //it tells react to run the effect
    //once when the component mounts 
    //again whenever user.id changes
    
    const formatDate = (dateString) =>{
        const date = parseISO(dateString);
        return format(date, 'MMM dd, yyyy \'at\' h:mm a');
    };

    const isPastDue = (submissionDateString, assDueDateString) =>{
        const submissionDate = parseISO(submissionDateString);
        const assDueDate = parseISO(assDueDateString);
        return submissionDate>assDueDate; //false if late 
    }

    const calcDiffDays = (submissionDateString, assDueDateString)=>{
        const submissionDate = parseISO(submissionDateString);
        const dueDate = parseISO(assDueDateString);
        const diffTime = submissionDate-dueDate;
        const diffDays = Math.ceil(diffTime/(1000*60*60*24)); 
        return diffDays;
    }



    return(
        <div>
            <h2> Welcome, {user.name}</h2>
            {/* sending onLogout property up to parent */}
            <LogoutButton onLogout={onLogout}/> 
            <SubmitForm 
                    onNewSubmission={ //childData res.data from child component 
                        childData=>setSubmissions(//oldSubmissions is previous array
                            oldSubmissions=>[...oldSubmissions.filter( //remove duplicatres.. this happens when user updates a submission
                                                        sub=>String(sub.assignmentId) !==String(childData.assignmentId))    
                                ,childData] //childData is the updated or new submission 
                        )
                    } 
                    user={user}
                    submissions={submissions || []}
            />
            <h3>Your Submissions</h3>
            <ul>
    {submissions.length === 0 ? (
        <li>No Submissions</li>
    ) : (
        submissions.map(sub => {
            const assignment = assignments.find(
                ass => String(ass.id) === String(sub.assignmentId)
            );
            
            // Debug individual submission
            if (!assignment) {
                console.warn('⚠️ No assignment found for submission:', sub);
            }
            
            return (
                <li key={sub.id} style={{
                    padding: '10px',
                    margin: '5px 0',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                }}>
                    <div>
                        <strong>{assignment?.title || `Unknown Assignment (ID: ${sub.assignmentId})`}</strong>
                    </div>
                    <div>Score: {sub.score}%</div>
                    <div>Submitted: {formatDate(sub.submittedAt)}</div>
                    <div>
                        Status: {assignment ? (
                            isPastDue(sub.submittedAt, assignment.dueDate) ? 
                                <span style={{color: 'red', fontWeight: 'bold'}}>LATE [{calcDiffDays(sub.submittedAt,assignment.dueDate)} DAYS]</span> : 
                                <span style={{color: 'green', fontWeight: 'bold'}}>ON TIME</span>
                        ) : (
                            <span style={{color: 'orange'}}>UNKNOWN</span>
                        )}
                    </div>
                    {assignment && (
                        <div style={{fontSize: '0.8em', color: '#666'}}>
                            Due: {formatDate(assignment.dueDate)}
                        </div>
                    )}
                </li>
            );
        })
    )}
</ul>
        </div>
    )
};

export default UserDashboard;