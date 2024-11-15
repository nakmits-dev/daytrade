import React, { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { saveUserProfile } from '../lib/db';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const verifiedEmailParam = params.get('email');
    
    if (mode === 'verifyEmail' && verifiedEmailParam) {
      setVerifiedEmail(verifiedEmailParam);
      setEmail(verifiedEmailParam);
      setIsSignUp(false);
      setMessage('メール認証が完了しました。ログインしてください。');
      // Clear URL parameters
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(user);
        await saveUserProfile(user.uid, {
          name,
          bio,
          email,
          emailVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setVerificationSent(true);
        setMessage('確認メールを送信しました。メールを確認して認証を完了してください。');
        await auth.signOut();
      } else {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        if (!user.emailVerified) {
          await sendEmailVerification(user);
          setError('メールアドレスが未認証です。確認メールを再送信しました。');
          await auth.signOut();
        }
      }
    } catch (error: any) {
      const errorMessages: { [key: string]: string } = {
        'auth/email-already-in-use': 'このメールアドレスは既に登録されています',
        'auth/invalid-email': 'メールアドレスの形式が正しくありません',
        'auth/operation-not-allowed': '現在この認証方法は無効になっています',
        'auth/weak-password': 'パスワードは6文字以上である必要があります',
        'auth/user-disabled': 'このアカウントは無効になっています',
        'auth/user-not-found': 'メールアドレスまたはパスワードが間違っています',
        'auth/wrong-password': 'メールアドレスまたはパスワードが間違っています'
      };

      setError(errorMessages[error.code] || 'エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('パスワードリセットにはメールアドレスが必要です');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('パスワードリセットメールを送信しました');
      setError(null);
    } catch (error: any) {
      setError('パスワードリセットメールの送信に失敗しました');
      setMessage(null);
    }
  };

  const handleResendVerification = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await sendEmailVerification(currentUser);
        setMessage('確認メールを再送信しました');
        setError(null);
      }
    } catch (error) {
      setError('確認メールの再送信に失敗しました');
      setMessage(null);
    }
  };

  const handleBackToLogin = () => {
    setVerificationSent(false);
    setIsSignUp(false);
    setMessage(null);
    setError(null);
    if (verifiedEmail) {
      setEmail(verifiedEmail);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">デイトレード日記</h2>
        
        {verificationSent ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">メール認証が必要です</h3>
              <p className="text-sm text-blue-800 mb-4">
                {email} 宛に確認メールを送信しました。
                メール内のリンクをクリックして認証を完了してください。
              </p>
              <button
                onClick={handleResendVerification}
                className="text-sm text-blue-700 hover:text-blue-900"
              >
                確認メールを再送信
              </button>
            </div>
            <button
              onClick={handleBackToLogin}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ログイン画面に戻る
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}
            
            {message && (
              <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg">
                {message}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                required
              />
            </div>

            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    名前
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    自己紹介
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    rows={3}
                  />
                </div>
              </>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '処理中...' : (isSignUp ? '新規登録' : 'ログイン')}
            </button>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setMessage(null);
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                {isSignUp ? 'アカウントをお持ちの方' : '新規登録はこちら'}
              </button>

              {!isSignUp && (
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  パスワードを忘れた方
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}