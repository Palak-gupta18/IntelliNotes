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
          {activeTab === 'quiz' && (
            <div>
              <h2>Knowledge Check</h2>
              {loadingFeature ? <p>Generating questions...</p> : (
                <div style={{ marginTop: '20px' }}>
                  {quiz?.map((q, i) => (
                    <div key={i} style={{ marginBottom: '30px' }}>
                      <p className={styles.quizQuestion}>{i + 1}. {q.question}</p>
                      {q.options.map((opt, j) => (
                        <button key={j} className={styles.quizOption}>{opt}</button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FLASHCARDS TAB */}
          {activeTab === 'flashcards' && (
            <div>
              <h2>Flashcards (Hover to view back)</h2>
              {loadingFeature ? <p>Generating flashcards...</p> : (
                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {flashcards?.map((card, i) => (
                    <div key={i} className={styles.flashcard}>
                      <span className="front">Q: {card.front}</span>
                      {/* You can implement CSS flip animations later, for now we just show the front! */}
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
