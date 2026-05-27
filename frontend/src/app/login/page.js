'use client';

import { useState, useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '../../context/AuthContext';
import styles from '../auth.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`glass-panel ${styles.authCard}`}>
        <h1 className={styles.title}>IntelliNotes</h1>
        <p className={styles.subtitle}>Welcome back! Let's get to studying.</p>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form className={styles.form} onSubmit={handleSubmit}>
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
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
            Sign In
          </button>
        </form>
        
        <p className={styles.linkText}>
          Don't have an account? <Link href="/register" className={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
