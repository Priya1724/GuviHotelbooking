import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { HotelDetailsPage } from './pages/HotelDetailsPage';
import { BookingPage } from './pages/BookingPage';
import { BookingSuccessPage } from './pages/BookingSuccessPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminAddHotel } from './pages/AdminAddHotel';
import { AdminManageRooms } from './pages/AdminManageRooms';

type Page = 'home' | 'login' | 'signup' | 'hotel-details' | 'booking' | 'booking-success' | 'bookings' | 'admin' | 'admin-add-hotel' | 'admin-manage-rooms';

function AppContent() {
  const { loading, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [pageData, setPageData] = useState<any>(null);

  const navigate = (page: Page, data?: any) => {
    setCurrentPage(page);
    setPageData(data || null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'login') {
    return <LoginPage onNavigate={navigate} />;
  }

  if (currentPage === 'signup') {
    return <SignupPage onNavigate={navigate} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage={currentPage} onNavigate={navigate} />

      {currentPage === 'home' && <HomePage onNavigate={navigate} />}

      {currentPage === 'hotel-details' && pageData?.hotel && (
        <HotelDetailsPage
          hotel={pageData.hotel}
          checkIn={pageData.checkIn || ''}
          checkOut={pageData.checkOut || ''}
          onNavigate={navigate}
        />
      )}

      {currentPage === 'booking' && pageData?.hotel && pageData?.room && (
        <BookingPage
          hotel={pageData.hotel}
          room={pageData.room}
          checkIn={pageData.checkIn || ''}
          checkOut={pageData.checkOut || ''}
          onNavigate={navigate}
        />
      )}

      {currentPage === 'booking-success' && pageData?.booking && pageData?.payment && (
        <BookingSuccessPage
          booking={pageData.booking}
          payment={pageData.payment}
          onNavigate={navigate}
        />
      )}

      {currentPage === 'bookings' && <MyBookingsPage />}

      {currentPage === 'admin' && isAdmin && <AdminDashboard onNavigate={navigate} />}

      {currentPage === 'admin-add-hotel' && isAdmin && <AdminAddHotel onNavigate={navigate} />}

      {currentPage === 'admin-manage-rooms' && isAdmin && pageData?.hotel && (
        <AdminManageRooms hotel={pageData.hotel} onNavigate={navigate} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
