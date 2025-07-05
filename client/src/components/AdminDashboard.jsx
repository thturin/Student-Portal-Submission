import React, {useEffect, useState} from 'react';
import axios from 'axios';
import LogoutButton from './LogoutButton';
import CreateAssignmentForm from './CreateAssignment';


//user-> data, passed down for display/use
//onLogout-> function, passed down so child can trigger an action up in the parent
const AdminDashboard = ({user, onLogout}) =>{
    const apiUrl = process.env.REACT_APP_API_URL;
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [sections,setSections] = useState([]);
    const [selectedSection,setSelectedSection] = useState('');
    const [exportSuccess, setExportSuccess] = useState(null);



    useEffect(()=>{//on mount, retrieve the assignments 
        axios.get(`${apiUrl}/assignments`).then(res=>setAssignments(res.data));
        //to retrieve the 
        axios.get(`${apiUrl}/submissions`).then(res=> setSubmissions(res.data));
        axios.get(`${apiUrl}/sections`).then(res=>setSections(res.data));

    },[]);

    const filteredSubs = submissions.filter( //filter submissions based on the assignment id selected
        sub=>{
            if(!selectedAssignment) return false; //if there is no selected assignment, there's not submissions in the list
            if(!selectedSection){//if there is no section selected, return a list of the selected assignment and all of the submissions
                return sub.assignmentId === Number(selectedAssignment); 
            }else{
                return sub.assignmentId === Number(selectedAssignment) && sub.user?.sectionId === Number(selectedSection);
            }
        } 
     
    );

    const selectedAssignmentObj = assignments.find(
        ass=>ass.id === Number(selectedAssignment)
    );
    
    const handleExport = async()=>{
        setExportSuccess(false);
        
    }


    return(
        <div>
            <h2> Welcome ADMIN, {user.name}</h2>
                <LogoutButton onLogout={onLogout}/>
                {/* when you use the functional form of a state setter (setASsignments) , oldAssignments always 
                represents the previous (current) state value */}
                {/* //the updateAssignments property is passed to parent so setAssignments can be updated (setAssignments contains the assignments listed to admin) */}
                {/* if a user create an assignment, the current assignments needs to be updated  */}
                <CreateAssignmentForm updateAssignments={ 
                    //res.data from updateAssignments in CreateAssignmentForm component is the newAssignment (newAssignment = res.data)
                    childData=>setAssignments(oldAssignments=>[...oldAssignments,childData])
                    }/>
            <h3>Assignments</h3>

            {/* DROP DOWN MENU FOR ASSIGNMENTS ---------- */}
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
            {/* DROP DOWN MENU FOR SECTION ------------------------------------*/}
            <select
                value={selectedSection}
                onChange={e => setSelectedSection(e.target.value)}
                style={{ padding: '4px 8px' }}
            >
                <option value="">All Sections</option>
                {sections.map(sec => (
                    <option key={sec.id} value={sec.id}>
                        {sec.name}
                    </option>
                ))}
            </select>

            {/* JUPITER EXPORT BUTTON ------------------------------------*/}
            <button 
                disabled={!selectedAssignment || filteredSubs.length===0}
                onClick={async()=>{
                    if(!selectedAssignment) return;
                    console.log( `${apiUrl}/admin/exportAssignment`);
                    window.location.href = `${apiUrl}/admin/exportAssignment`;
                }}
                style={{ padding: '4px 12px' }}
            > JUPITER EXPORT 
            </button>

            {/* SUBMISSION LIST --------------------------------- */}
            <h3>Submissions for Assignment: {selectedAssignmentObj? selectedAssignmentObj.title : ''}</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
    <thead>
        <tr>
            <th style={{ border: '1px solid #ccc', padding: '4px' }}>Section ID/Name</th>
            <th style={{ border: '1px solid #ccc', padding: '4px' }}>User ID</th>
            <th style={{ border: '1px solid #ccc', padding: '4px' }}>User Name</th>
            {/* <th style={{ border: '1px solid #ccc', padding: '4px' }}>Assignment ID</th> */}
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
                    <td style={{ border: '1px solid #ccc', padding: '4px' }}>{sub.user.sectionId} {sub.user.section.name}</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px' }}>{sub.userId}</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px' }}>{sub.user?.name ? sub.user.name : 'no user'}</td>
                    {/* <td style={{ border: '1px solid #ccc', padding: '4px' }}>{sub.assignmentId}</td> */}
                    <td style={{ border: '1px solid #ccc', padding: '4px' }}>{sub.score}</td>
                </tr>
            ))
        )}
    </tbody>
</table>
        </div>
    );
}

export default AdminDashboard;