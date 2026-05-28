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

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const { data } = await api.get('/documents');
      setDocuments([...data]);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  // Improved Upload: Redirects to the document immediately after upload!
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const { data } = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Navigate to the newly uploaded document!
      router.push(`/document/${data._id}`);
    } catch (error) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  // NEW: Delete Function
  const handleDelete = async (e, id) => {
    e.preventDefault(); // Stop the Link from navigating when we click delete
    if (!window.confirm("Are you sure you want to delete this PDF?")) return;

    try {
      await api.delete(`/documents/${id}`);
      fetchDocuments(); // Refresh the grid
    } catch (error) {
      alert("Failed to delete document.");
    }
  };

  if (loading || !user) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>IntelliNotes</div>
        <div className={styles.userInfo}>
          <span>Hello, {user.name.split(' ')[0]} 👋</span>
          <button onClick={logout} className={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      <main>
        <div className={styles.uploadSection}>
          <div>
            <h2>Your Study Materials</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Upload a new PDF to generate summaries and quizzes.</p>
          </div>
          
          <label className={styles.uploadLabel}>
            <input type="file" accept=".pdf" className={styles.fileInput} onChange={handleFileUpload} disabled={uploading} />
            <div className="btn-primary" style={{ pointerEvents: 'none' }}>
              {uploading ? 'Uploading & Analyzing...' : '+ Upload PDF'}
            </div>
          </label>
        </div>

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
                
                {/* NEW: Card Actions with Delete Button */}
                <div className={styles.cardActions}>
                  <div className={styles.docDate}>
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </div>
                  <button className={styles.deleteBtn} onClick={(e) => handleDelete(e, doc._id)}>
                    Delete
                  </button>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
