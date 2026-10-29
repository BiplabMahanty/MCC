import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuth from '../auth/useAuth.jsx';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ email, password }) => {
    setServerError('');
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err.message === 'Only admin accounts can access this portal.'
          ? err.message
          : err.response?.data?.message || 'Invalid email or password.';
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-sm p-8">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand mb-3">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary">Admin Portal</h1>
          <p className="text-sm text-text-muted mt-1">Coaching Management System</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="admin@example.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
            })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />

          {serverError && (
            <p className="text-sm text-error bg-error-surface border border-error/20 rounded-lg px-3 py-2">
              {serverError}
            </p>
          )}

          <Button type="submit" loading={isSubmitting} className="w-full mt-2">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
