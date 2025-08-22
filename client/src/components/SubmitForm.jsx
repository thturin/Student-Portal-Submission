import axios from 'axios'; //<-- how frontend will communicate with app.js server
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';
import Spinner from './Spinner';

const apiUrl = process.env.REACT_APP_API_URL;
//set global axios defaults

//MAKE SURE AXIOS IS SEENDING SESSION COOKIES TO BACKEND
axios.defaults.withCredentials = true;

const SubmitForm = ({onNewSubmission, user, submissions})=>{

    const [url, setUrl] = useState('');
    const [assignmentId,setAssignmentId] = useState(''); //the current assignment
    const [assignment, setAssignment] = useState(null);
    const [assignments, setAssignments] = useState([]); //assignment list 
    const [score, setScore] = useState(null); 
    const [error, setError] = useState('');
    const [submissionExists, setSubmissionExists] = useState(false);
    const [gradleOutput, setGradleOutput] = useState(''); //gradle test output
    const [submissionType, setSubmissionType] = useState(''); //github or googledoc
    const [verificationFeedback, setVerificationFeedback] = useState(''); //show googledoc feedback
    const [isSubmitting,setIsSubmitting] = useState(false);

    useEffect(()=>{
        console.log('🔍 Axios Config Check:', {
            withCredentials: axios.defaults.withCredentials,
            baseURL: axios.defaults.baseURL,
            globalDefaults: axios.defaults
        });
    },[]);

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

    //When assignment is selected, determine the assignment type
    useEffect(()=>{
        if(assignmentId){
            const selectedAssignment =assignments.find(a=>String(a.id)===String(assignmentId));
            setAssignment(selectedAssignment);
            if(selectedAssignment){//if the assignment exists, set the submission type
                setSubmissionType(selectedAssignment.type || 'error');
                setUrl(''); //just in case
            }
                    //console.log(selectedAssignment.type);
        }

    },[assignmentId, assignments]); // call when current assignment changes or assignments list gets updated


    const handleSubmit = async (e)=>{
        setSubmissionExists(false);
        e.preventDefault();
        setScore(null);
        setError('');
        setGradleOutput('');
        setVerificationFeedback('');
        setIsSubmitting(true);

        try{
            console.log('-----Handle Submission--------');

            try{
                console.log('Validating Session....');
                await axios.get(`${apiUrl}/auth/me`);
                console.log('✅ Session valid');
            }catch(err){
                setError('Session Expired. Please login again');
                // setTimeout(() => { //send back to login page
                //     window.location.href = `${apiUrl}/auth/github`;
                // }, 2000);
                return;
            }
            
            //VERIFY USER OWNERSHIP FOR GOOGLE DOC 
            if(submissionType === 'googledoc'){
                //extract the document id from the url
                const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
                const documentId = match ? match[1] : null; 
                if(!documentId){
                    setError('invalid google doc url');
                    return;
                }

                const verifyRes = await  axios.post(`${apiUrl}/verify-doc-ownership`,{
                    documentId,
                    userEmail: user.email
                });
                setVerificationFeedback(verifyRes.data.output);
                //you don't need to send an error message 
                if(!verifyRes.data.success){
                    //do not update or create new submission, just return 
                    return;
                }
            }

            //VERIFY USER OWNERSHIP FOR GITHUB 
            if(submissionType=== 'github'){
                try{
                    const verifyRes = await axios.post(`${apiUrl}/verify-github-ownership`,{
                        url:url
                    });

                    if(!verifyRes.data.success){
                        setVerificationFeedback(verifyRes.data.output);
                        return;
                    }else{
                        setVerificationFeedback(verifyRes.data.output);
                    }
                }catch(err){
                    console.error('/verify-github-ownership failure', err);
                    setError('Failed to verify github user')
                    return;
                }
            }


            //CHECK FOR EXISTING SUBMISSION
            const existingSubmission = submissions.find(
                sub=> String(sub.assignmentId) === String(assignmentId)
            );
     
            //---------UPDATE SUBMISSION------------
            if(existingSubmission){ //go to the ssubmission and update it
                try{
                    setSubmissionExists(true);
                    const res = await axios.put(`${apiUrl}/submissions/${existingSubmission.id}`,{
                        url,
                        assignmentId,
                        userId: user.id,
                        submissionType,
                        assignmentTitle:assignment.title,
                        submission: existingSubmission,
                        assignment: assignment
                    });
                    setScore(res.data.score); //score is added to database and evaluated on backend
                    setGradleOutput(res.data.output);
                    if(onNewSubmission) onNewSubmission(res.data);
                }catch(err){
                    console.error('Error updating submissions',err);
                }
                
            }else{
                try{
                    //-=-----CREATE NEW SUBMISSION-------
                    const data = { //send to the backend
                        url,
                        assignmentId,
                        userId:user.id,
                        submissionType, //need this for scoreSubmission method in controller
                        assignmentTitle: assignment.title,
                        submission: existingSubmission,
                        assignment: assignment
                    };
                    const res = await axios.post(`${apiUrl}/submit`,data); 
                    setScore(res.data.score);
                    setGradleOutput(res.data.output);
                    //if property was passed in by component call in parent component, send the res.data as the value of pproperty
                    if(onNewSubmission) onNewSubmission(res.data);
                }catch(err){
                    console.error('Failed to create a new submission',err);
                }
        }}catch(err){
            console.error(err);
            //if err.response exists -> if error.response.data exists, check the .error message
            setError(err.response?.data?.error || 'Submission Failed');
            setGradleOutput(err.response?.data?.output || '');
        }finally{
            setIsSubmitting(false); //for spinner 
        }   
    };

    ///PLACEHOLDER FOR URL LINK 
    let placeholder = 'Select an assignment first';
    if(submissionType === 'github'){
        placeholder = 'https://github.com/username/repository';
    }else if (submissionType === 'googledoc'){
        placeholder = 'https://docs.google.com/document/d/your-document-id/edit';
    }
    const formatDate = (dateString, option) =>{
            const date = parseISO(dateString);

            if(option === 1) return format(date, 'MMM dd, yyyy \'at\' h:mm a');
            if(option === 2) return formatDistanceToNow(date, { addSuffix: true })
        };

    const isPastDue = (dueDateString) =>{
        const dueDate = parseISO(dueDateString);
        const now = new Date();
        return now>dueDate; //false if late 
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
                        style = {{ 
                            width: '250px', padding: '8px', marginRight: '10px'}}
                    >
                        <option value=""> Select Assignment</option>
                        {assignments.map(ass=>( //print out each assignment that exists as option
                            <option 
                                key={ass.id} 
                                value={ass.id}
                                style={{ color: isPastDue(ass.dueDate) ? 'red' : 'black' }}
                            >
                                {ass.title} - Due Date: {formatDate(ass.dueDate,1)} {formatDate(ass.dueDate,2)}
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

                {/* SUBMIT BUTTON */}
                <button type="submit"
                         style={{marginLeft: '10px',
                                opacity: isSubmitting ? 0.6 : 1,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer' }} 
                        disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Spinner /> Running Tests...
                        </>
                    ) : (
                        'Submit'
                    )}
                </button>

                <span  style={{ color: 'green', marginLeft: '12px', verticalAlign: 'middle' }}>
                    {submissionExists ? "Resubmitted"
                    : (!error && "")
                    }
                </span>
            </form>

              {/* Loading indicator for gradle tests */}
            {isSubmitting && submissionType === 'github' && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    backgroundColor: '#f0f8ff', 
                    border: '1px solid #b0d4f1', 
                    borderRadius: '4px',
                    textAlign: 'center'
                }}>
                    <Spinner /> 
                    <strong>Running Gradle Tests...</strong>
                    <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                        This may take 30-60 seconds. Please wait...
                    </div>
                </div>
            )}

            {/* SET VERIFICATION FEEDBACK */}
            {verificationFeedback && (
                <div style={{ marginTop: '15px', color: verificationFeedback.includes('not the owner') ? 'red' : 'green' }}>
                    {verificationFeedback}
                </div>
            )}
            {/*  OUTPUT SCORE AFTER SUBMISSION */}
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