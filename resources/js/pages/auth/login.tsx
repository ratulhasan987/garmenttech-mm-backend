import { Head, Link, useForm } from '@inertiajs/react';

import AuthLayout from '@/layouts/auth-layout';
import { useState } from 'react';
import { Eye, EyeOff } from 'react-feather';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout>
            <Head title="Login" />

            <form className="theme-form" onSubmit={submit}>
                <h4>Sign in to account</h4>

                <p>Enter your email & password to login</p>

                <div className="form-group">
                    <label className="col-form-label" htmlFor="email">
                        Email Address
                    </label>

                    <input
                        id="email"
                        className={`form-control ${
                            errors.email ? 'is-invalid' : ''
                        }`}
                        type="email"
                        value={data.email}
                        onChange={(event) =>
                            setData('email', event.target.value)
                        }
                        autoComplete="email"
                        autoFocus
                        placeholder="user@gmail.com"
                    />

                    {errors.email && (
                        <div className="invalid-feedback">{errors.email}</div>
                    )}
                </div>

                <div className="form-group">
                    <label className="col-form-label" htmlFor="password">
                        Password
                    </label>

                    <div className="position-relative">
                        <input
                            id="password"
                            className={`form-control pe-5 ${
                                errors.password ? 'is-invalid' : ''
                            }`}
                            type={showPassword ? 'text' : 'password'}
                            value={data.password}
                            onChange={(event) =>
                                setData('password', event.target.value)
                            }
                            autoComplete="current-password"
                            placeholder="**********"
                        />

                        <button
                            type="button"
                            className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent p-0 me-3 text-muted"
                            onClick={() =>
                                setShowPassword((current) => !current)
                            }
                            aria-label={
                                showPassword ? 'Hide password' : 'Show password'
                            }
                        >
                            {showPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    </div>

                    {errors.password && (
                        <div className="invalid-feedback">
                            {errors.password}
                        </div>
                    )}
                </div>

                <div className="form-group mb-0">
                    <div className="checkbox p-0">
                        <input
                            id="remember"
                            type="checkbox"
                            checked={data.remember}
                            onChange={(event) =>
                                setData('remember', event.target.checked)
                            }
                        />

                        <label className="text-muted" htmlFor="remember">
                            Remember me
                        </label>
                    </div>

                    <Link className="link" href="/forgot-password">
                        Forgot password?
                    </Link>

                    <div className="text-end mt-3">
                        <button
                            className="btn btn-primary btn-block w-100"
                            type="submit"
                            disabled={processing}
                        >
                            {processing ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}
