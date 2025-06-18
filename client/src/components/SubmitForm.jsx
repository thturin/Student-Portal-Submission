import React, {useState} from 'react';
import axios from 'axios'; //<-- how frontend will communicate with app.js server

const apiUrl = process.env.REACT_APP_API_URL;

const SubmitForm = ()=>{
    const [repoUrl, setRepoUrl] = useState('');
    const [score, setScore] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e)=>{
        e.preventDefault();
        setScore(null);
        setError('');
        console.log('hello',apiUrl);
        try{
            const res = await axios.post(apiUrl,{repoUrl }); //send the repoUrl from the state
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
            <h2>Your github repo</h2>
            <form onSubmit ={handleSubmit}>
                <input 
                    type="url"
                    placeholder="https://github.com/username/repo"
                    value={repoUrl}
                    onChange={(e)=>{
                        setRepoUrl(e.target.value);
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