'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import styles from './page.module.css';

export default function Dashboard() {
  const { user, loading, logout } = useContext(AuthContext);
  const router = useRouter();
  
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 1. Protect the route: if not logged in, go to login page
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 2. Fetch the user's documents when the page loads
  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const { data } = await api.get('/documents');
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  // 3. Handle PDF Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Must use FormData to send files via HTTP
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      // POST to our backend upload endpoint
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Refresh the list after upload
      fetchDocuments();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Show a blank/loading screen while checking auth state
  if (loading || !user) return null;

  return (
    <div className={styles.container}>
      {/* Top Navigation */}
      <header className={styles.header}>
        <div className={styles.logo}>IntelliNotes</div>
        <div className={styles.userInfo}>
          <span>Hello, {user.name.split(' ')[0]} 👋</span>
          <button onClick={logout} className={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className={styles.uploadSection}>
          <div>
            <h2>Your Study Materials</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
              Upload a new PDF to generate summaries and quizzes.
            </p>
          </div>
          
          <label className={styles.uploadLabel}>
            <input 
              type="file" 
              accept=".pdf" 
              className={styles.fileInput} 
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <div className="btn-primary" style={{ pointerEvents: 'none' }}>
              {uploading ? 'Uploading...' : '+ Upload PDF'}
            </div>
          </label>
        </div>

        {/* Document Grid */}
        <div className={styles.grid}>
          {documents.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No documents yet</h3>
              <p>Upload your first PDF to get started!</p>
            </div>
          ) : (
            documents.map((doc) => (
              <Link href={`/document/${doc._id}`} key={doc._id} className={`glass-panel ${styles.docCard}`}>
                <div className={styles.docIcon}>📄</div>
                <h3 className={styles.docTitle}>{doc.title}</h3>
                <div className={styles.docDate}>
                  Uploaded on {new Date(doc.createdAt).toLocaleDateString()}
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
