import axios from 'axios'; //<-- how frontend will communicate with app.js server
import { useEffect, useState } from 'react';

const apiUrl = process.env.REACT_APP_API_URL;

const SubmitForm = ({onNewSubmission, user, submissions})=>{

    const [url, setUrl] = useState('');
    const [assignmentId,setAssignmentId] = useState(''); //the current assignment
    const [assignments, setAssignments] = useState([]); //assignment list 
    const [score, setScore] = useState(null); 
    const [error, setError] = useState('');
    const [submissionExists, setSubmissionExists] = useState(false);
    const [gradleOutput, setGradleOutput] = useState(''); //gradle test output
    const [submissionType, setSubmissionType] = useState(''); //github or googledoc
    const [docFeedback, setDocFeedback] = useState(''); //show googledoc feedback


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
  
    },[apiUrl]); //happens on the mount [] are the dependencies which means the function will run only when those dependencies change

    //When assignment is selected, determine the assignment type
    useEffect(()=>{
        if(assignmentId){
            const assignment = assignments.find(a=>String(a.id)===String(assignmentId));
            if(assignment){
                setSubmissionType(assignment.type || 'error');
                setUrl(''); //just in case
            }
        }
    },[assignmentId, assignments]); // call when current assignment changes or assignments list gets updated


    const handleSubmit = async (e)=>{
        setSubmissionExists(false);
        e.preventDefault();
        setScore(null);
        setError('');
        setGradleOutput('');
        setDocFeedback('');
        try{
            console.log('-----Handle Submission--------');
            //IF SUBMISSION ALREADY EXISTS, 
            const existingSubmission = submissions.find(
                sub=> String(sub.assignmentId) === String(assignmentId)
            );
     
            //---------UPDATE SUBMISSION------------
            if(existingSubmission){ //go to the ssubmission and update it
                setSubmissionExists(true);
                //USE PUT TO UPDATE THE SUBMISSION
                const res = await axios.put(`${apiUrl}/submissions/${existingSubmission.id}`,{
                    url,
                    assignmentId,
                    userId: user.id,
                    submissionType
                });
                setScore(res.data.score); //score is added to database and evaluated on backend
                setGradleOutput(res.data.output);
                if(onNewSubmission) onNewSubmission(res.data);
            }else{
                //-=-----CREATE NEW SUBMISSION-------
                const data = { //send to the backend
                                url,
                                assignmentId,
                                userId:user.id,
                                submissionType //need this for scoreSubmission method in controller
                            };
                            const res = await axios.post(`${apiUrl}/submit`,data); 
                            //receive score from 
                            //console.log('look here->', res.data);
                            setScore(res.data.score);
                            setGradleOutput(res.data.output);
                            //if property was passed in by component call in parent component, send the res.data as the value of pproperty
                            if(onNewSubmission) onNewSubmission(res.data);
            }
        }catch(err){
            console.error(err);
            //if err.response exists -> if error.response.data exists, check the .error message
            setError(err.response?.data?.error || 'Submission Failed');
            setGradleOutput(err.response?.data?.output || '');
        }   
    };

    ///PLACEHOLDER FOR URL LINK 
    let placeholder = 'Select an assignment first';
    if(submissionType === 'github'){
        placeholder = 'https://github.com/username/repository';
    }else if (submissionType === 'googledoc'){
        placeholder = 'https://docs.google.com/document/d/your-document-id/edit';
    }

    return (
        <div className = "submit-form">
            <h3>Submit An Assignment</h3>
            <form onSubmit ={handleSubmit}>

                {/* ASSIGNMENT OPTION  */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Select Assignment:
                    </label>
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
                </div>
                
                {/*  LINK BOX */}
                <label>
                    {submissionType === 'github' ? 'GitHub Repository URL:' : 'Google Docs URL:'}
                </label>

                {/* Show instructions for Google Docs */}
                {submissionType === 'googledoc' && (
                    <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                        📋 Make sure your Google Doc is shared with "Anyone with the link can view"
                    </div>
                )}

                <input 
                    type="url"
                    placeholder={placeholder}
                    value={url}
                    onChange={(e)=>{
                        setUrl(e.target.value.trim());
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
{/* }
            OUTPUT SCORE AFTER SUBMISSION */}
            {score !== null && (
                <p style={{ marginTop: '20px' }}>✅ Submission graded! Score: <strong>{score}</strong></p>
            )}

            {/* SHOW GRADLE TEST OUTPUT */}
            {gradleOutput && (
                <div style={{ marginTop: '20px' }}>
                    <h4>Test Output:</h4>
                    <pre style={{
                        backgroundColor: '#f5f5f5',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '15px',
                        whiteSpace: 'pre-wrap',
                        overflow: 'auto',
                        maxHeight: '400px',
                        fontSize: '12px',
                        fontFamily: 'Courier New, monospace'
                    }}>
                        {gradleOutput}
                    </pre>
                </div>
            )}

            {/* //if there was an error */}
            {error &&(
                <p style={{ marginTop: '20px', color: 'red' }}>❌ {error}</p>
            )}
        </div>
    );
};

export default SubmitForm;