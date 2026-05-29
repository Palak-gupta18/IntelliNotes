'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../../utils/api';
import styles from './document.module.css';

export default function DocumentStudyView() {
  const params = useParams();
  const documentId = params.id;
  
  const [activeTab, setActiveTab] = useState('chat'); // chat, summary, quiz, flashcards
  const [docDetails, setDocDetails] = useState(null);
  
  // States for features
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([{ role: 'ai', text: 'Hello! I have analyzed this document. What would you like to know?' }]);
  const [summary, setSummary] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [flashcards, setFlashcards] = useState(null);
  
  const [loadingFeature, setLoadingFeature] = useState(false);

  // Fetch document details on load
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const { data } = await api.get(`/documents/${documentId}`);
        setDocDetails(data);
      } catch (error) {
        console.error("Failed to load document", error);
      }
    };
    if (documentId) fetchDoc();
  }, [documentId]);

  // Tab change handler
  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    
    // Automatically generate the feature if we haven't already
    if (tab === 'summary' && !summary) {
      setLoadingFeature(true);
      try {
        const { data } = await api.post('/ai/summary', { documentId });
        setSummary(data.summary);
      } catch (err) { console.error(err); }
      setLoadingFeature(false);
    }
    
    if (tab === 'quiz' && !quiz) {
      setLoadingFeature(true);
      try {
        const { data } = await api.post('/ai/quiz', { documentId });
        setQuiz(data.quiz);
      } catch (err) { console.error(err); }
      setLoadingFeature(false);
    }
    
    if (tab === 'flashcards' && !flashcards) {
      setLoadingFeature(true);
      try {
        const { data } = await api.post('/ai/flashcards', { documentId });
        setFlashcards(data.flashcards);
      } catch (err) { console.error(err); }
      setLoadingFeature(false);
    }
  };

  // Handle Chat Submit
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message to UI immediately
    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');

    try {
      const { data } = await api.post('/chat', { documentId, message: userMsg });
      setChatHistory(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error searching the document.' }]);
    }
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar Navigation */}
      <div className={styles.sidebar}>
        <Link href="/" className={styles.backBtn}>← Back to Dashboard</Link>
        
        <h3 style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>Study Tools</h3>
        
        <button className={`${styles.tabBtn} ${activeTab === 'chat' ? styles.activeTab : ''}`} onClick={() => handleTabChange('chat')}>
          💬 Chat with PDF
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'summary' ? styles.activeTab : ''}`} onClick={() => handleTabChange('summary')}>
          📝 Summary
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'quiz' ? styles.activeTab : ''}`} onClick={() => handleTabChange('quiz')}>
          ❓ Generate Quiz
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'flashcards' ? styles.activeTab : ''}`} onClick={() => handleTabChange('flashcards')}>
          🃏 Flashcards
        </button>
      </div>

      {/* Main Feature Content */}
      <div className={styles.mainContent}>
        <h1 className={styles.title}>{docDetails ? docDetails.title : 'Loading Document...'}</h1>
        
        <div className={styles.featureContainer}>
          
          {/* CHAT TAB */}
          {activeTab === 'chat' && (
            <>
              <div className={styles.chatHistory}>
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`${styles.message} ${msg.role === 'user' ? styles.userMsg : styles.aiMsg}`}>
                    <strong>{msg.role === 'user' ? 'You' : 'AI Assistant'}:</strong>
                    <p style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                  </div>
                ))}
              </div>
              <form className={styles.chatInputBox} onSubmit={handleChatSubmit}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ask a question about this PDF..." 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" className="btn-primary">Send</button>
              </form>
            </>
          )}

          {/* SUMMARY TAB */}
          {activeTab === 'summary' && (
            <div>
              <h2>Document Summary</h2>
              {loadingFeature ? <p>Analyzing document...</p> : <p style={{ whiteSpace: 'pre-wrap', marginTop: '20px', lineHeight: '1.6' }}>{summary}</p>}
            </div>
          )}

          {/* QUIZ TAB */}
             {/* QUIZ TAB */}
          {activeTab === 'quiz' && (
            <div>
              <h2>Knowledge Check</h2>
              {loadingFeature ? <p>Generating questions...</p> : (
                <div style={{ marginTop: '20px' }}>
                  {quiz?.map((q, i) => {
                    const answered = selectedAnswers[i];
                    return (
                      <div key={i} style={{ marginBottom: '30px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '1.1rem' }}>{i + 1}. {q.question}</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {q.options.map((opt, j) => {
                            // Dynamic styling for correct/incorrect answers
                            let btnStyle = { 
                              padding: '12px', textAlign: 'left', borderRadius: '8px', 
                              cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)', 
                              background: 'transparent', color: 'var(--text-color)', transition: '0.3s'
                            };
                            
                            if (answered) {
                              if (opt === q.answer) {
                                btnStyle.background = 'rgba(46, 204, 113, 0.2)'; // Green
                                btnStyle.border = '1px solid #2ecc71';
                              } else if (opt === answered.selected && !answered.isCorrect) {
                                btnStyle.background = 'rgba(231, 76, 60, 0.2)'; // Red
                                btnStyle.border = '1px solid #e74c3c';
                              }
                              btnStyle.cursor = 'default';
                            }

                            return (
                              <button 
                                key={j} 
                                style={btnStyle}
                                onMouseOver={(e) => { if (!answered) e.target.style.background = 'rgba(255,255,255,0.1)' }}
                                onMouseOut={(e) => { if (!answered) e.target.style.background = 'transparent' }}
                                onClick={() => {
                                  // Lock answer once clicked
                                  if (!answered) {
                                    setSelectedAnswers(prev => ({
                                      ...prev,
                                      [i]: { selected: opt, isCorrect: opt === q.answer }
                                    }));
                                  }
                                }}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {/* Show feedback message */}
                        {answered && (
                          <p style={{ marginTop: '12px', fontWeight: 'bold', color: answered.isCorrect ? '#2ecc71' : '#e74c3c' }}>
                            {answered.isCorrect ? '✅ Correct!' : `❌ Incorrect. The correct answer is: ${q.answer}`}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {/* Show Final Score if all questions are answered */}
                  {quiz && Object.keys(selectedAnswers).length === quiz.length && quiz.length > 0 && (
                    <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid #2ecc71', borderRadius: '10px', textAlign: 'center' }}>
                      <h3 style={{ color: '#2ecc71' }}>Quiz Completed!</h3>
                      <p style={{ fontSize: '1.2rem', margin: '10px 0' }}>
                        Your Score: <strong>{Object.values(selectedAnswers).filter(a => a.isCorrect).length} / {quiz.length}</strong>
                      </p>
                      <button 
                        onClick={() => setSelectedAnswers({})} 
                        className="btn-primary" 
                        style={{ marginTop: '10px' }}
                      >
                        Retake Quiz
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}


          {/* FLASHCARDS TAB */}
                   {/* FLASHCARDS TAB */}
          {activeTab === 'flashcards' && (
            <div>
              <h2>Flashcards (Hover to reveal answer)</h2>
              {loadingFeature ? <p>Generating flashcards...</p> : (
                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {flashcards?.map((card, i) => (
                    <div key={i} className={styles.flashcardWrapper}>
                      <div className={styles.flashcardInner}>
                        <div className={styles.flashcardFront}>
                          <strong>Q:</strong> {card.front}
                        </div>
                        <div className={styles.flashcardBack}>
                          <strong>A:</strong> {card.back}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


        </div>
      </div>
    </div>
  );
}
