import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../slices/UserSlice.jsx';

export default function Register(){
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {status, error} = useSelector((state) => state.user);

    const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser({username, email, phone, password})).unwrap()
    .then(() => {
        navigate('/login');
    })
    .catch(() => {});
    };

    return (
        <section className="auth-card">
            <div className="auth-card-header">
                <h2>Create Account</h2>
                <p>Register with your details to start using the platform.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="input-group">
                    <label htmlFor="register-username">Username</label>
                    <input
                        id="register-username"
                        required
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Your username"
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="register-email">Email</label>
                    <input
                        id="register-email"
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="register-phone">Mobile Number</label>
                    <input
                        id="register-phone"
                        required
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="register-password">Password</label>
                    <input
                        id="register-password"
                        required
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Choose a strong password"
                    />
                </div>

                {error && status === 'failed' && <p className="auth-error">{error}</p>}

                <button type="submit" disabled={status === 'loading'} className="primary-btn">
                    {status === 'loading' ? 'Registering...' : 'Register'}
                </button>
            </form>

            <p className="auth-switch">
                Already have an account? <Link to="/login">Sign in</Link>
            </p>
        </section>
    );
}