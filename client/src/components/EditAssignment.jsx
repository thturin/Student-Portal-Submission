import axios from 'axios';
import { useState } from 'react';

const EditAssignmentForm = ({assignment, updateAssignments})=>{
    const apiUrl = process.env.REACT_APP_API_URL;
    const [title, setTitle] = useState(assignment.title);
    const [dueDate, setDueDate] = useState(assignment.dueDate);
    const [type, setType] = useState(assignment.type);
    const [success,setSuccess] = useState('');
    const [error, setError] = useState('');


    const handleSubmit = async(e)=>{
        e.preventDefault();
        setError('');
        setSuccess('');
        try{
            const res = await axios.put(`${apiUrl}/assignments/${assignment.id}`,{
                title,
                dueDate,
                type
            });
            setTitle(assignment.title);
            setDueDate(assignment.dueDate);
            setType(assignment.type);
            setSuccess('Assignment updated successfully!');
            if(updateAssignments) updateAssignments(res.data);
        }catch(err){
            setError(err.response?.data?.error || 'Failed to update Assignment');
        }
    };

    return (
        <div style={{
            maxWidth: '600px',
            margin: '20px auto',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
        }}>
            <h3 style={{ textAlign: 'center', marginTop: 0 }}>Edit Assignment {assignment.title}</h3>
            
            <form onSubmit={handleSubmit}>
                {/* ✅ Title field */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '5px', 
                        fontWeight: 'bold' 
                    }}>
                        Assignment Title:
                    </label>
                    <input
                        type="text"
                        name="title"
                        placeholder={assignment.title}
                        value={title}
                        onChange={e=>setTitle(e.target.value)}
                        required
                        style={{ 
                            width: '100%', 
                            padding: '8px', 
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                {/* ✅ Due date field */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '5px', 
                        fontWeight: 'bold' 
                    }}>
                        Due Date:
                    </label>
                    <input
                        type="datetime-local"
                        name="dueDate"
                        value={dueDate}
                        onChange={e=>setDueDate(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '8px', 
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                {/* ✅ Submission type field */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '5px', 
                        fontWeight: 'bold' 
                    }}>
                        Submission Type:
                    </label>
                    <select
                        name="type"
                        value={type}
                        onChange={e=>setType(e.target.value)}
                        required
                        style={{ 
                            width: '100%', 
                            padding: '8px', 
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    >
                        <option value="">Select type</option>
                        <option value="github">GitHub Repository</option>
                        <option value="googledoc">Google Document</option>
                    </select>
                </div>

                {/* ✅ Submit Button */}
                <button type="submit" style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px'
                }}>
                    Update
                </button> 
   
                {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
                {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
            </form>
        </div>
    );
};

export default EditAssignmentForm;