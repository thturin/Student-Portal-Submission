import axios from 'axios'; //<-- how frontend will communicate with app.js server
import { useEffect, useState } from 'react';

const apiUrl = process.env.REACT_APP_API_URL;

const SubmitForm = ({onNewSubmission, user, submissions})=>{

    const [repoUrl, setRepoUrl] = useState('');
    const [assignmentId,setAssignmentId] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [score, setScore] = useState(null); 
    const [error, setError] = useState('');
    const [submissionExists, setSubmissionExists] = useState(false);

    //FETCH ASSIGNMENTES
    useEffect(()=>{ //useEffect() code to run after the component renders
        //useEffect let your perform actions (side effects) in your componenet, such as fetching api data
        async function fetchAssignments(){
            console.log('-------FETCHING ASSIGNMENTS----------');
            try{
                //console.log(`LOOK HERE -->${apiUrl}/assignments`);
                const res = await axios.get(`${apiUrl}/assignments`);
                setAssignments(res.data);
            }catch(err){
                setError('Failed to load assignments');
            }
        }
        fetchAssignments();
  
    },[]); //happens on the mount [] are the dependencies which means the function will run only when those dependencies change


    const handleSubmit = async (e)=>{
        setSubmissionExists(false);
        e.preventDefault();
        setScore(null);
        setError('');
        try{
            console.log('-----Handle Submission--------');
            //IF SUBMISSION ALREADY EXISTS, 
            const existingSubmission = submissions.find(
                sub=> String(sub.assignmentId) === String(assignmentId)
            );
     
            if(existingSubmission){ //go to the ssubmission and update it
                setSubmissionExists(true);
                const res = await axios.put(`${apiUrl}/submissions/${existingSubmission.id}`,{
                    repoUrl,
                    assignmentId,
                    userId: user.id
                });
                setScore(res.data.score); //score is added to database and evaluated on backend
                if(onNewSubmission) onNewSubmission(res.data);
            }else{
                const data = {
                                repoUrl,
                                assignmentId,
                                userId:user.id
                            };
                            const res = await axios.post(`${apiUrl}/submit`,data); 
                            //receive score from 
                            setScore(res.data.score);
                            //if property was passed in by component call in parent component, send the res.data as the value of pproperty
                            if(onNewSubmission) onNewSubmission(res.data);
            }
        }catch(err){
            console.error(err);
            //if err.response exists -> if error.response.data exists, check the .error message
            setError(err.response?.data?.error || 'Submission Failed');
        }   
    };

    return (
        <div className = "submit-form">
            <h3>Submit An Assignment</h3>
            <form onSubmit ={handleSubmit}>

                {/* ASSIGNMENT OPTION  */}
                <select 
                    value={assignmentId}
                    //prevents the number casting to turn Number("") not 0 but empty
                    onChange={e=> setAssignmentId(e.target.value === "" ? "" :Number(e.target.value))}
                    required 
                    style = {{ width: '250px', padding: '8px', marginRight: '10px' }}
                >
                    <option value=""> Select Assignment</option>
                    {assignments.map(ass=>( //print out each assignment that exists as option
                        <option key={ass.id} value={ass.id}>
                            {ass.title}
                        </option>
                    ))}
                </select>
                
                {/* GITHUB LINK BOX */}
                <input 
                    type="url"
                    placeholder="https://github.com/username/repo"
                    value={repoUrl}
                    onChange={(e)=>{
                        setRepoUrl(e.target.value.trim());
                        //console.log(`LOOK HERE ->> ${e.target.value}`);    
                    }}
                    required style={{ width: '400px', padding: '8px' }}
                />
                <button type="submit" style={{ marginLeft: '10px' }}>Submit</button>
                <span  style={{ color: 'green', marginLeft: '12px', verticalAlign: 'middle' }}>
                    {submissionExists ? "Resubmitted"
                    : (!error && "")
                    }
                </span>
            </form>


                {score !== null && (
                    <p style={{ marginTop: '20px' }}>✅ Submission graded! Score: <strong>{score}</strong></p>
                )}

                {error &&(
                    <p style={{ marginTop: '20px', color: 'red' }}>❌ {error}</p>
                )}
        </div>
    );
};

export default SubmitForm;