import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginShared.css';
import { supabase } from '../supabaseClient';
import { useDialog } from '../components/DialogProvider';

const CompanyLogin = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showAlert } = useDialog();

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // ── Validation ─────────────────────────────────────
        if (!validateEmail(email)) {
            await showAlert('Please enter a valid email address.', { variant: 'warning', title: 'Invalid Email' });
            setLoading(false);
            return;
        }

        if (!isLogin) {
            if (!validatePassword(password)) {
                await showAlert('Password must be at least 6 characters long.', { variant: 'warning', title: 'Weak Password' });
                setLoading(false);
                return;
            }
            if (password !== confirmPassword) {
                await showAlert('Passwords do not match.', { variant: 'warning', title: 'Password Mismatch' });
                setLoading(false);
                return;
            }
        }

        try {
            if (isLogin) {
                // ── LOGIN ──────────────────────────────────────
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                // Role check
                const role = data.user?.user_metadata?.role;
                if (role !== 'company') {
                    await supabase.auth.signOut();
                    await showAlert('Access Denied: You are not authorized as a Company.', { variant: 'error', title: 'Access Denied' });
                    setLoading(false);
                    return;
                }

                // ── Ban check (banned companies cannot access at all) ──
                const { data: profileData, error: profileError } = await supabase
                    .from('company_profiles')
                    .select('is_approved, is_banned')
                    .eq('id', data.user.id)
                    .single();

                if (profileError && profileError.code !== 'PGRST116') {
                    console.warn("Profile fetch error:", profileError);
                }

                if (profileData?.is_banned) {
                    await supabase.auth.signOut();
                    await showAlert(
                        '⛔ Your company account has been removed by the admin. You can no longer access this platform.',
                        { variant: 'error', title: 'Account Banned' }
                    );
                    setLoading(false);
                    return;
                }

                // Pending companies can log in — they'll see a banner on the dashboard
                await showAlert('Logged in successfully as Company!', { variant: 'success', title: 'Welcome Back!' });
                window.open('/company-dashboard', '_blank');

            } else {
                // ── SIGN UP ────────────────────────────────────
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { role: 'company' },
                    },
                });

                if (error) throw error;

                // Create a placeholder profile row with is_approved = false
                if (data.user) {
                    const { error: insertError } = await supabase
                        .from('company_profiles')
                        .upsert({
                            id: data.user.id,
                            is_approved: false,
                            is_banned: false,
                            updated_at: new Date().toISOString(),
                        }, { onConflict: 'id' });

                    if (insertError) {
                        console.warn("Could not create initial profile:", insertError.message);
                    }
                }

                await showAlert(
                    '🎉 Account created! Your registration is now pending admin approval. You will be able to log in once an admin approves your account.',
                    { variant: 'info', title: 'Registration Submitted' }
                );
            }
        } catch (error) {
            if (error.message.includes("User already registered")) {
                await showAlert('This email is already registered. Please login or use a different email.', { variant: 'warning', title: 'Already Registered' });
            } else {
                await showAlert(error.message, { variant: 'error', title: 'Error' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-card">
                <h2 className="login-title">{isLogin ? 'Company Login' : 'Company Sign Up'}</h2>
                <p className="login-subtitle">
                    {isLogin
                        ? 'Welcome back! Please login to continue.'
                        : 'Register your company — approval required.'}
                </p>

                {!isLogin && (
                    <div style={{
                        background: 'rgba(255, 217, 102, 0.08)',
                        border: '1px solid rgba(255, 217, 102, 0.3)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        marginBottom: '16px',
                        fontSize: '0.85rem',
                        color: '#ffd966',
                        lineHeight: '1.4'
                    }}>
                        ⚠️ After signing up, your account must be approved by an admin before you can log in.
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            className="form-input"
                            type="email"
                            placeholder="Company Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            className="form-input"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <input
                                className="form-input"
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            {confirmPassword && (
                                <p className={`password-match-text ${password === confirmPassword ? 'match-success' : 'match-error'}`}>
                                    {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                                </p>
                            )}
                        </div>
                    )}

                    <button className="submit-btn" type="submit" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                    </button>
                </form>

                <p className="toggle-text">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                        className="toggle-link"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setConfirmPassword('');
                            setEmail('');
                            setPassword('');
                        }}
                        type="button"
                    >
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default CompanyLogin;
