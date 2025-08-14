import axios from 'axios';
import { useEffect, useState } from 'react';
import CreateAssignmentForm from './CreateAssignment';
import EditAssignmentForm from './EditAssignment';
import LogoutButton from './LogoutButton';

const AdminDashboard = ({user, onLogout}) =>{
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
    const [sections,setSections] = useState([]);
    const [selectedSection,setSelectedSection] = useState('');


    useEffect(()=>{
        axios.get(`${process.env.REACT_APP_API_URL}/assignments`).then(res=>setAssignments(res.data));
        axios.get(`${process.env.REACT_APP_API_URL}/submissions`).then(res=> setSubmissions(res.data));
        axios.get(`${process.env.REACT_APP_API_URL}/sections`).then(res=>setSections(res.data));
    },[]);

    const filteredSubs = submissions.filter(
        sub=>{
            if(!selectedAssignmentId) return false;
            if(!selectedSection){
                return sub.assignmentId === Number(selectedAssignmentId); 
            }else{
                return sub.assignmentId === Number(selectedAssignmentId) && sub.user?.sectionId === Number(selectedSection);
            }
        } 
    );

    const selectedAssignmentObj = assignments.find(
        ass=>ass.id === Number(selectedAssignmentId)
    );

    return(
        <div>
            <h2> Welcome ADMIN, {user.name}</h2>
            <LogoutButton onLogout={onLogout}/>
            
            {/* SELECT ASSIGNMENT AND SUBMISSIONS SECTION - MOVED TO TOP */}
            <div style={{
                maxWidth: '600px',
                margin: '20px auto',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
            }}>
                <h3 style={{ textAlign: 'center', marginTop: 0 }}>Select Assignment</h3>
                
                {/* DROP DOWN MENU FOR ASSIGNMENTS */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '5px', 
                        fontWeight: 'bold' 
                    }}>
                        Assignment:
                    </label>
                    <select
                        value={selectedAssignmentId}
                        onChange={e => setSelectedAssignmentId(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '8px', 
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    >
                        <option value="">Select an Assignment</option>
                        {assignments.map(ass => (
                            <option key={ass.id} value={ass.id}> 
                                {ass.title}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* DROP DOWN MENU FOR SECTION */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '5px', 
                        fontWeight: 'bold' 
                    }}>
                        Section:
                    </label>
                    <select
                        value={selectedSection}
                        onChange={e => setSelectedSection(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '8px', 
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    >
                        <option value="">All Sections</option>
                        {sections.map(sec => (
                            <option key={sec.id} value={sec.id}>
                                {sec.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* JUPITER EXPORT BUTTON */}
                <button 
                    disabled={!selectedAssignmentId || filteredSubs.length===0 || !selectedSection}
                    onClick={async()=>{
                        window.location.href = `${process.env.REACT_APP_API_URL}/admin/exportAssignment?assignmentId=${selectedAssignmentId}${selectedSection? `&sectionId=${selectedSection}`:''}`;       
                    }}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px'
                    }}
                > 
                    JUPITER EXPORT 
                </button>
            </div>
            {/* DISPLAY SELECTED ASSIGNMENT (DUE DATE, TITLE, TYPE ) */}
                {selectedAssignmentObj && (
                    <div style={{
                        maxWidth: '600px',
                        margin: '20px auto',
                        padding: '20px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        backgroundColor: '#f9f9f9'
                    }}>
                        <h3 style={{ textAlign: 'center', marginTop: 0 }}>Assignment Details</h3>
                        
                        <div style={{ marginBottom: '10px' }}>
                            <strong>Title:</strong> {selectedAssignmentObj.title}
                        </div>
                        
                        <div style={{ marginBottom: '10px' }}>
                            <strong>Due Date:</strong> {new Date(selectedAssignmentObj.dueDate).toLocaleDateString()}
                        </div>
                        
                        <div style={{ marginBottom: '10px' }}>
                            <strong>Submission Type:</strong> {selectedAssignmentObj.type || selectedAssignmentObj.submissionType}
                        </div>
                    </div>
            )}

            {/* SUBMISSION LIST */}
            <div style={{
                maxWidth: '600px',
                margin: '20px auto',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
            }}>
                <h3 style={{ textAlign: 'center', marginTop: 0 }}>
                    Submissions for Assignment: {selectedAssignmentObj? selectedAssignmentObj.title : ''}
                </h3>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid #ccc', padding: '4px' }}>Section ID/Name</th>
                            <th style={{ border: '1px solid #ccc', padding: '4px' }}>User ID</th>
                            <th style={{ border: '1px solid #ccc', padding: '4px' }}>User Name</th>
                            <th style={{ border: '1px solid #ccc', padding: '4px' }}>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubs.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ color: 'red', textAlign: 'center', padding: '8px' }}>
                                    No Submissions
                                </td>
                            </tr>
                        ) : (
                            filteredSubs.map(sub => (
                                <tr key={sub.id}>
                                    <td style={{ border: '1px solid #ccc', padding: '4px' }}>{sub.user.sectionId} {sub.user?.section?.name || ''}</td>
                                    <td style={{ border: '1px solid #ccc', padding: '4px' }}>{sub.userId}</td>
                                    <td style={{ border: '1px solid #ccc', padding: '4px' }}>{sub.user?.name ? sub.user.name : 'no user'}</td>
                                    <td style={{ border: '1px solid #ccc', padding: '4px' }}>{sub.score}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>


            <EditAssignmentForm assignment={selectedAssignmentObj} updateAssignments={
                updatedAssignment => { //function passed in child component
                    setAssignments(
                        oldAssignments=>
                            oldAssignments.map(
                                assignment=> assignment.id === updatedAssignment.id? updatedAssignment : assignment
                            )
                    )
                }
            } />

            {/* CREATE AND EDIT ASSIGNMENT FORMS - MOVED TO BOTTOM */}
            <CreateAssignmentForm updateAssignments={ 
                childData=>setAssignments(oldAssignments=>[...oldAssignments,childData])
            }/>
            
            
            
            <h3>Assignments</h3>
        </div>
    );
}

export default AdminDashboard;