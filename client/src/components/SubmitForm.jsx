import React, {useState, useEffect} from 'react';
import axios from 'axios'; //<-- how frontend will communicate with app.js server

const apiUrl = process.env.REACT_APP_API_URL;

const SubmitForm = ()=>{
    const [repoUrl, setRepoUrl] = useState('');
    const [assignmentId,setAssignmentId] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [score, setScore] = useState(null);
    const [error, setError] = useState('');

    //fetch the assignments first
    useEffect(()=>{ //useEffect() code to run after the component renders
        //useEffect let your perform actions (side effects) in your componenet, such as fetching api data
        async function fetchAssignments(){
            try{
                const res = await axios.get(apiUrl.replace('/submit','/assignments'));
                setAssignments(res.data);
            }catch(err){
                setError('Failed to load assignments');
            }
        }
        fetchAssignments();

    },[]); // [] are the dependencies which means the function will run only when those dependencies change


    const handleSubmit = async (e)=>{
        e.preventDefault();
        setScore(null);
        setError('');
        try{
            //send the repoUrl from the state
            const res = await axios.post(apiUrl,{repoUrl,assignmentId}); 
            //receive score from 
            setScore(res.data.score);
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