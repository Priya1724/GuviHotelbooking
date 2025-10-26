import { Hotel, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type NavbarProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
};

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { user, profile, signOut, isAdmin } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      onNavigate('home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <Hotel className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">StayBook</span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                {isAdmin && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === 'admin'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin
                  </button>
                )}
                <button
                  onClick={() => onNavigate('bookings')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === 'bookings'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  My Bookings
                </button>
                <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{profile?.full_name}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
