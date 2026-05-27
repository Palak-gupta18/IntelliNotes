'use client';

import { useState, useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '../../context/AuthContext';
import styles from '../auth.module.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { register } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await register(name, email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`glass-panel ${styles.authCard}`}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Join IntelliNotes and study smarter.</p>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
          />
          <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
            Sign Up
          </button>
        </form>
        
        <p className={styles.linkText}>
          Already have an account? <Link href="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
