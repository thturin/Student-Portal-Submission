import React, {useState} from 'react';
import axios from 'axios';

const CreateAssignmentForm=({updateAssignments})=>{
    const apiUrl = process.env.REACT_APP_API_URL;
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setError('');
        setSuccess('');
        try{
            //make a request to post data to assignments api
            const res = await axios.post(`${apiUrl}/assignments`,{
                title,
                dueDate
            });
            setSuccess('Assignment Created');
            setTitle('');//clear the title and due date after POST
            setDueDate('');
            if(updateAssignments) updateAssignments(res.data);
        }catch(err){
            setError(err.response?.data?.error || 'Failed to create assignment');
        }
    };

    return(
        <form onSubmit={handleSubmit} style={{ margin: '20px 0' }}>
            <h3>Create Assignment</h3>
            <div>
                <input 
                    type="text"
                    placeholder="Assignment Title"
                    value={title}
                    onChange={e=>setTitle(e.target.value)}
                    required
                    style={{ marginRight: '10px', padding: '6px' }}
                />
                <input 
                    type="datetime-local"
                    value={dueDate}
                    onChange={e=>setDueDate(e.target.value)}
                    required
                    style={{ marginRight: '10px', padding: '6px' }}
                />
                <button type="submit">Create</button>
            </div>
            {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
            {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}

        </form>
    );
};

export default CreateAssignmentForm;