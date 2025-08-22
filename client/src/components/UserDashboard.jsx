import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';
import LogoutButton from './LogoutButton';
import SubmitForm from './SubmitForm.jsx';

const UserDashboard = ({user, onLogout}) => {
    const [submissions, setSubmissions] = useState([]);
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/submissions`).then(res => {
            const userSubs = res.data.filter(sub => sub.userId === user.id);
            setSubmissions(userSubs);
        });

        axios.get(`${process.env.REACT_APP_API_URL}/assignments`).then(res => {
            setAssignments(res.data);  
        });
    }, [user.id]);

    // ✨ Enhanced Late Policy Component
    const LatePolicyInfo = () => (
        <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            padding: '24px',
            color: 'white',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)'
        }}>
            <h4 style={{ 
                color: 'white', 
                marginTop: 0, 
                marginBottom: '20px',
                fontSize: '18px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                📋 Late Submission Policy
            </h4>
            
            <div style={{ color: 'rgba(255,255,255,0.9)' }}>
                {[
                    { time: 'On Time', penalty: 'Full credit', score: '100%', color: '#4ade80' },
                    { time: '1 Day Late', penalty: '10% penalty', score: '90% max', color: '#fbbf24' },
                    { time: '2-3 Days Late', penalty: '15% penalty', score: '85% max', color: '#fb923c' },
                    { time: '4-5 Days Late', penalty: '20% penalty', score: '80% max', color: '#f87171' },
                    { time: '6+ Days Late', penalty: '25% penalty', score: '75% max', color: '#ef4444' }
                ].map((item, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        marginBottom: '8px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <div style={{ fontWeight: '500' }}>{item.time}</div>
                        <div style={{ 
                            fontSize: '14px',
                            color: item.color,
                            fontWeight: '600'
                        }}>
                            {item.score}
                        </div>
                    </div>
                ))}
            </div>
            
            <div style={{ 
                fontSize: '13px', 
                color: 'rgba(255,255,255,0.7)',
                fontStyle: 'italic',
                marginTop: '16px',
                textAlign: 'center'
            }}>
                ⚡ Penalties are automatically calculated
            </div>
        </div>
    );

    // ✨ Enhanced Status Badge
    const StatusBadge = ({ isLate, daysLate }) => {
        const badgeStyle = {
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        };

        if (!isLate) {
            return (
                <span style={{
                    ...badgeStyle,
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    border: '1px solid #bbf7d0'
                }}>
                    ✅ On Time
                </span>
            );
        }

        return (
            <span style={{
                ...badgeStyle,
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca'
            }}>
                ⏰ Late {daysLate} Day{daysLate > 1 ? 's' : ''}
            </span>
        );
    };

    // ✨ Enhanced Score Display
    const ScoreDisplay = ({ score }) => {
        const getScoreColor = (score) => {
            if (score >= 90) return '#059669';
            if (score >= 80) return '#d97706';
            if (score >= 70) return '#dc2626';
            return '#7c2d12';
        };

        return (
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
            }}>
                <span style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: getScoreColor(score)
                }}>
                    {score}%
                </span>
            </div>
        );
    };

    const formatDate = (dateString) => {
        const date = parseISO(dateString);
        return format(date, 'MMM dd, yyyy \'at\' h:mm a');
    };

    const isPastDue = (submissionDateString, assDueDateString) => {
        const submissionDate = parseISO(submissionDateString);
        const assDueDate = parseISO(assDueDateString);
        return submissionDate > assDueDate;
    };

    const calcDiffDays = (submissionDateString, assDueDateString) => {
        const submissionDate = parseISO(submissionDateString);
        const dueDate = parseISO(assDueDateString);
        const diffTime = submissionDate - dueDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays;
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            padding: '24px'
        }}>
            {/* ✨ Header Section */}
            <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                borderRadius: '16px',
                padding: '32px',
                marginBottom: '32px',
                color: 'white',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h1 style={{
                            margin: 0,
                            fontSize: '32px',
                            fontWeight: '700',
                            marginBottom: '8px'
                        }}>
                            Welcome back, {user.name}! 👋
                        </h1>
                        <p style={{
                            margin: 0,
                            fontSize: '16px',
                            opacity: 0.8
                        }}>
                            Ready to submit your assignments?
                        </p>
                    </div>
                    <LogoutButton onLogout={onLogout} />
                </div>
            </div>

            {/* ✨ Main Content Layout */}
            <div style={{
                display: 'flex',
                gap: '32px',
                alignItems: 'flex-start'
            }}>
                {/* ✨ Left Sidebar - Late Policy */}
                <div style={{
                    flex: '0 0 320px',
                    minWidth: '280px'
                }}>
                    <LatePolicyInfo />
                </div>
                
                {/* ✨ Right Content - Form & Submissions */}
                <div style={{
                    flex: '1',
                    minWidth: '400px'
                }}>
                    {/* ✨ Submit Form Card */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        marginBottom: '32px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <SubmitForm 
                            onNewSubmission={childData => setSubmissions(
                                oldSubmissions => [...oldSubmissions.filter( 
                                    sub => String(sub.assignmentId) !== String(childData.assignmentId))    
                                , childData] 
                            )} 
                            user={user}
                            submissions={submissions || []}
                        />
                    </div>
                    
                    {/* ✨ Submissions Section */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{
                            margin: '0 0 24px 0',
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#1e293b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            📚 Your Submissions
                        </h3>
                        
                        {submissions.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '48px',
                                color: '#64748b'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                                <h4 style={{ margin: '0 0 8px 0', color: '#475569' }}>No submissions yet</h4>
                                <p style={{ margin: 0 }}>Submit your first assignment to get started!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {submissions.map(sub => {
                                    const assignment = assignments.find(
                                        ass => String(ass.id) === String(sub.assignmentId)
                                    );
                                    
                                    if (!assignment) {
                                        console.warn('⚠️ No assignment found for submission:', sub);
                                    }
                                    
                                    const isLate = assignment ? isPastDue(sub.submittedAt, assignment.dueDate) : false;
                                    const daysLate = assignment ? calcDiffDays(sub.submittedAt, assignment.dueDate) : 0;
                                    
                                    return (
                                        <div key={sub.id} style={{
                                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            padding: '24px',
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={e => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                                        }}
                                        onMouseLeave={e => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = 'none';
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                marginBottom: '16px'
                                            }}>
                                                <h4 style={{
                                                    margin: 0,
                                                    fontSize: '18px',
                                                    fontWeight: '600',
                                                    color: '#1e293b'
                                                }}>
                                                    {assignment?.title || `Unknown Assignment (ID: ${sub.assignmentId})`}
                                                </h4>
                                                <ScoreDisplay score={sub.score} />
                                            </div>
                                            
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                gap: '16px',
                                                marginBottom: '16px'
                                            }}>
                                                <div>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: '#64748b',
                                                        textTransform: 'uppercase',
                                                        fontWeight: '600',
                                                        letterSpacing: '0.5px',
                                                        marginBottom: '4px'
                                                    }}>
                                                        Submitted
                                                    </div>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        color: '#374151'
                                                    }}>
                                                        {formatDate(sub.submittedAt)}
                                                    </div>
                                                </div>
                                                
                                                {assignment && (
                                                    <div>
                                                        <div style={{
                                                            fontSize: '12px',
                                                            color: '#64748b',
                                                            textTransform: 'uppercase',
                                                            fontWeight: '600',
                                                            letterSpacing: '0.5px',
                                                            marginBottom: '4px'
                                                        }}>
                                                            Due Date
                                                        </div>
                                                        <div style={{
                                                            fontSize: '14px',
                                                            color: '#374151'
                                                        }}>
                                                            {formatDate(assignment.dueDate)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <StatusBadge 
                                                    isLate={isLate} 
                                                    daysLate={daysLate}
                                                />
                                                
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: '#64748b'
                                                }}>
                                                    ID: {sub.id}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;