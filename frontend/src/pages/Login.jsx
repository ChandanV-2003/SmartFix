import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../slices/UserSlice.jsx';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status, error, token, user } = useSelector((state) => state.user);

    useEffect(() => {
        if (token && user?.role) {
            const routes = {
                admin: '/admin/dashboard',
                manager: '/manager/dashboard',
                user: '/user/dashboard',
                technician: '/technician/dashboard'
            };
            const targetRoute = routes[user.role] || '/user/dashboard';
            navigate(targetRoute, { replace: true });
        }
    }, [token, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const result = await dispatch(loginUser({ email, password })).unwrap();
            setPassword('');
            
            const routes = {
                admin: '/admin/dashboard',
                manager: '/manager/dashboard',
                user: '/user/dashboard',
                technician: '/technician/dashboard'
            };
            const targetRoute = routes[result?.user?.role] || '/user/dashboard';
            navigate(targetRoute, { replace: true });
        } catch {
            // Errors are managed in Redux state.
        }
    };

    return (
        <section className="auth-card">
            <div className="auth-card-header">
                <h2>Login to SmartFix</h2>
                <p>Welcome back! Securely manage your requests.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="input-group">
                    <label htmlFor="login-email">Email</label>
                    <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="login-password">Password</label>
                    <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </div>

                {error && status === 'failed' && <p className="auth-error">{error}</p>}

                <button type="submit" className="primary-btn" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            <p className="auth-switch">
                New user? <Link to="/register">Create an account</Link>
            </p>
        </section>
    );
}