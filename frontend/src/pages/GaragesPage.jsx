import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Truck, 
  Store, 
  Wrench, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Filter, 
  Search, 
  X,
  Send,
  Car
} from 'lucide-react';
import APIService from '../services/api';

export default function GaragesPage() {
  const location = useLocation();

  // Prefilled from previous pages if any
  const prefilledVehicle = location.state?.vehicle || '';
  const prefilledService = location.state?.service || '';
  const prefilledCost = location.state?.estimatedCost || '';

  const [activeTab, setActiveTab] = useState('directory'); // 'directory' or 'bookings'
  const [garages, setGarages] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'mobile_mechanic', 'garage', 'parts_shop'
  const [isMobileOnly, setIsMobileOnly] = useState(false);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [bookingMode, setBookingMode] = useState('remote_mobile'); // 'remote_mobile' or 'dropoff'
  const [vehicleName, setVehicleName] = useState(prefilledVehicle || '2022 Toyota Camry SE');
  const [serviceType, setServiceType] = useState(prefilledService || 'On-Site Brake Replacement & Inspection');
  const [serviceAddress, setServiceAddress] = useState('');
  const [scheduledDate, setScheduledDate] = useState('2026-09-22');
  const [scheduledTime, setScheduledTime] = useState('10:00 AM');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState('');

  // Onboarding Modal State
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [onboardData, setOnboardData] = useState({
    name: '',
    tagline: '',
    type: 'mobile_mechanic',
    isMobileCapable: true,
    phone: '',
    email: '',
    address: '',
    city: '',
    serviceRadiusMiles: 30,
    hourlyRate: 110,
    servicesOffered: 'Mobile Diagnostics, Brake Replacement, Oil & Fluids, Battery & Starter',
    bio: ''
  });
  const [onboardSubmitting, setOnboardSubmitting] = useState(false);
  const [onboardSuccessMsg, setOnboardSuccessMsg] = useState('');

  useEffect(() => {
    loadGarages();
    loadBookings();
    if (prefilledService || prefilledVehicle) {
      // Auto open booking modal if passed from repair advice
      // User can choose garage
    }
  }, []);

  const loadGarages = async () => {
    try {
      setLoading(true);
      const data = await APIService.getGarages({
        type: selectedType,
        search: searchQuery,
        isMobileOnly: isMobileOnly ? 'true' : 'false'
      });
      setGarages(data || []);
    } catch (err) {
      console.error('Failed to load garages:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const data = await APIService.getUserBookings();
      setUserBookings(data || []);
    } catch (err) {
      console.error('Failed to load user bookings:', err);
    }
  };

  const handleOpenBooking = (garage) => {
    setSelectedGarage(garage);
    setBookingMode(garage.isMobileCapable ? 'remote_mobile' : 'dropoff');
    setBookingSuccessMsg('');
    setBookingModalOpen(true);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setBookingSubmitting(true);
    try {
      const payload = {
        garageId: selectedGarage?.id,
        garageName: selectedGarage?.name,
        garagePhone: selectedGarage?.phone,
        serviceType,
        bookingMode,
        vehicleDetails: { make: vehicleName },
        serviceAddress: bookingMode === 'remote_mobile' ? serviceAddress : (selectedGarage?.address || 'Shop Facility'),
        scheduledDate,
        scheduledTime,
        contactName,
        contactPhone,
        estimatedCost: prefilledCost || `${selectedGarage?.hourlyRate ? `$${selectedGarage.hourlyRate * 2}` : 'Quote upon arrival'}`,
        notes
      };

      const res = await APIService.createBooking(payload);
      setBookingSuccessMsg(res.message || 'Booking confirmed!');
      loadBookings();
      setTimeout(() => {
        setBookingModalOpen(false);
        setActiveTab('bookings');
      }, 1400);
    } catch (err) {
      alert(err.message || 'Failed to submit booking');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleSubmitOnboard = async (e) => {
    e.preventDefault();
    setOnboardSubmitting(true);
    try {
      const res = await APIService.onboardGarage(onboardData);
      setOnboardSuccessMsg(res.message || 'Partner Registered Successfully!');
      loadGarages();
      setTimeout(() => {
        setOnboardModalOpen(false);
        setOnboardSuccessMsg('');
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to register garage.');
    } finally {
      setOnboardSubmitting(false);
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#F5F8FC', padding: '24px 20px 48px' }}>
      <div style={{ maxWidth: 1150, margin: '0 auto' }}>
        
        {/* ── Page Header ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E6F0FA', color: '#0A2085', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
              <Truck size={14} /> Certified Service Centers & Remote Mobile Mechanics
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1C2B3A', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
              Garages & Remote Mobile Service
            </h1>
            <p style={{ fontSize: 14, color: '#607D8B', margin: 0 }}>
              Book certified drive-in service centers or dispatch a <strong>Remote Mobile Garage van</strong> to repair your vehicle anywhere (home, office, or roadside).
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button 
              onClick={() => setOnboardModalOpen(true)}
              style={{ background: '#fff', border: '1px solid #0A2085', color: '#0A2085', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Plus size={16} /> Partner With Us / Register Shop
            </button>
          </div>
        </div>

        {/* ── Top Navigation Tabs ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid #D0DCE8', paddingBottom: 12 }}>
          <button 
            onClick={() => setActiveTab('directory')}
            style={{
              background: activeTab === 'directory' ? '#0A2085' : 'transparent',
              color: activeTab === 'directory' ? '#fff' : '#607D8B',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <Store size={16} /> Partner Network & Remote Vans
          </button>

          <button 
            onClick={() => setActiveTab('bookings')}
            style={{
              background: activeTab === 'bookings' ? '#0A2085' : 'transparent',
              color: activeTab === 'bookings' ? '#fff' : '#607D8B',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <Calendar size={16} /> My Service Bookings ({userBookings.length})
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            TAB 1: PARTNER DIRECTORY & REMOTE MOBILE SHOPS
        ───────────────────────────────────────────────────────────────── */}
        {activeTab === 'directory' && (
          <div>
            {/* Filter Bar */}
            <div style={{ background: '#fff', borderRadius: 18, padding: '16px 20px', border: '1px solid #D0DCE8', marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
              
              {/* Category Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { id: 'all', label: 'All Partners', icon: Store },
                  { id: 'mobile_mechanic', label: '🚐 Remote Mobile Garage', icon: Truck },
                  { id: 'garage', label: '🏢 Drive-in Service Centers', icon: Wrench },
                  { id: 'parts_shop', label: '📦 Parts Stores', icon: Store }
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedType(c.id); setTimeout(loadGarages, 10); }}
                    style={{
                      background: selectedType === c.id ? '#F0F5FF' : '#F8FAFC',
                      color: selectedType === c.id ? '#0A2085' : '#607D8B',
                      border: '1px solid',
                      borderColor: selectedType === c.id ? '#0A2085' : '#E2E8F0',
                      padding: '8px 14px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <c.icon size={15} />
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div style={{ display: 'flex', alignItems: 'center', background: '#F5F8FC', border: '1px solid #D0DCE8', borderRadius: 10, padding: '0 12px', minWidth: 260 }}>
                <Search size={16} color="#90A4AE" style={{ marginRight: 6 }} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadGarages()}
                  placeholder="Search by city, repair, name..."
                  style={{ border: 'none', background: 'transparent', outline: 'none', padding: '10px 0', fontSize: 13, width: '100%' }}
                />
              </div>
            </div>

            {/* Garages Grid */}
            {loading ? (
              <div style={{ background: '#fff', borderRadius: 20, padding: 48, textAlign: 'center', border: '1px solid #D0DCE8' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #E0E7FF', borderTopColor: '#0A2085', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                <div style={{ fontSize: 14, color: '#607D8B' }}>Loading certified partners & mobile units…</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                {garages.map(g => (
                  <div key={g.id} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #D0DCE8', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s ease', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    
                    {/* Image & Badges */}
                    <div style={{ height: 160, position: 'relative', background: '#E2E8F0' }}>
                      <img src={g.image} alt={g.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {g.badges?.map((badge, bi) => (
                          <span key={bi} style={{ background: 'rgba(10,32,133,0.85)', color: '#fff', backdropFilter: 'blur(6px)', fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
                            {badge}
                          </span>
                        ))}
                      </div>
                      <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(255,255,255,0.95)', padding: '4px 10px', borderRadius: 10, fontSize: 12, fontWeight: 800, color: '#1C2B3A', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={14} color="#F59E0B" fill="#F59E0B" />
                        <span>{g.rating}</span>
                        <span style={{ fontSize: 10, color: '#607D8B' }}>({g.reviewCount})</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: 22, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1C2B3A', margin: '0 0 4px 0' }}>{g.name}</h3>
                      <div style={{ fontSize: 12, color: '#0A2085', fontWeight: 600, marginBottom: 10 }}>{g.tagline}</div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#607D8B', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MapPin size={14} color="#90A4AE" />
                          <span>{g.city} {g.serviceRadiusMiles ? `(Within ${g.serviceRadiusMiles} mi radius)` : ''}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={14} color="#90A4AE" />
                          <span>{g.operatingHours}</span>
                        </div>
                        {g.hourlyRate > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0F6E56', fontWeight: 700 }}>
                            <span>Labor Rate: ${g.hourlyRate}/hr</span>
                          </div>
                        )}
                      </div>

                      {/* Services Pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 18 }}>
                        {g.servicesOffered?.slice(0, 4).map((s, si) => (
                          <span key={si} style={{ background: '#F5F8FC', color: '#37474F', fontSize: 11, padding: '3px 8px', borderRadius: 6, border: '1px solid #E2E8F0' }}>
                            {s}
                          </span>
                        ))}
                        {g.servicesOffered?.length > 4 && (
                          <span style={{ fontSize: 11, color: '#90A4AE', padding: '3px 4px' }}>
                            +{g.servicesOffered.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* CTA */}
                      <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid #F0F4F8' }}>
                        <button 
                          onClick={() => handleOpenBooking(g)}
                          style={{ width: '100%', background: '#0A2085', color: '#fff', border: 'none', padding: '12px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                          {g.isMobileCapable ? <><Truck size={16} /> Dispatch Remote Van</> : <><Calendar size={16} /> Book Facility Service</>}
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            TAB 2: USER'S ACTIVE & PAST SERVICE BOOKINGS
        ───────────────────────────────────────────────────────────────── */}
        {activeTab === 'bookings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {userBookings.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 20, padding: 48, textAlign: 'center', border: '1px solid #D0DCE8' }}>
                <Calendar size={48} color="#90A4AE" style={{ marginBottom: 12 }} />
                <h3 style={{ fontSize: 18, color: '#1C2B3A', margin: '0 0 6px 0' }}>No Active Bookings</h3>
                <p style={{ fontSize: 13, color: '#607D8B', margin: '0 0 16px 0' }}>You haven't scheduled any drive-in or mobile garage appointments yet.</p>
                <button 
                  onClick={() => setActiveTab('directory')}
                  style={{ background: '#0A2085', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Browse Service Providers
                </button>
              </div>
            ) : (
              userBookings.map(b => (
                <div key={b.id} style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #D0DCE8', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 50, height: 50, borderRadius: 14, background: b.bookingMode === 'remote_mobile' ? '#E6F0FA' : '#F5F8FC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A2085' }}>
                      {b.bookingMode === 'remote_mobile' ? <Truck size={24} /> : <Wrench size={24} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#0A2085', textTransform: 'uppercase' }}>#{b.id}</span>
                        <span style={{ background: b.status === 'confirmed' ? '#E1F5EE' : '#FFF3E0', color: b.status === 'confirmed' ? '#0F6E56' : '#E65100', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, textTransform: 'capitalize' }}>
                          ● {b.status}
                        </span>
                        <span style={{ fontSize: 11, background: '#F0F4F8', color: '#607D8B', padding: '2px 8px', borderRadius: 6 }}>
                          {b.bookingMode === 'remote_mobile' ? '🚐 Remote Mobile Van' : '🏢 Drive-in Facility'}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1C2B3A', margin: '4px 0 2px 0' }}>{b.serviceType}</h3>
                      <div style={{ fontSize: 13, color: '#607D8B' }}>
                        Provider: <strong>{b.garageName}</strong> ({b.garagePhone})
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, fontSize: 13 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#90A4AE', textTransform: 'uppercase', fontWeight: 700 }}>Vehicle</div>
                      <strong style={{ color: '#1C2B3A' }}>{b.vehicleDetails?.make} {b.vehicleDetails?.model || ''}</strong>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#90A4AE', textTransform: 'uppercase', fontWeight: 700 }}>Date & Time</div>
                      <strong style={{ color: '#1C2B3A' }}>{b.scheduledDate} at {b.scheduledTime}</strong>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#90A4AE', textTransform: 'uppercase', fontWeight: 700 }}>Location</div>
                      <strong style={{ color: '#1C2B3A' }}>{b.serviceAddress}</strong>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#90A4AE', textTransform: 'uppercase', fontWeight: 700 }}>Est. Cost</div>
                      <strong style={{ color: '#0F6E56' }}>{b.estimatedCost}</strong>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            BOOKING SERVICE MODAL
        ───────────────────────────────────────────────────────────────── */}
        {bookingModalOpen && selectedGarage && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 650, maxHeight: '90vh', overflowY: 'auto', padding: 32, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #F0F4F8', paddingBottom: 14 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1C2B3A', margin: 0 }}>Book Service with {selectedGarage.name}</h2>
                  <div style={{ fontSize: 12, color: '#607D8B', marginTop: 2 }}>{selectedGarage.city} • Rate: ${selectedGarage.hourlyRate}/hr</div>
                </div>
                <button onClick={() => setBookingModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#90A4AE' }}>
                  <X size={20} />
                </button>
              </div>

              {bookingSuccessMsg ? (
                <div style={{ background: '#E1F5EE', color: '#0F6E56', padding: 24, borderRadius: 16, textAlign: 'center' }}>
                  <CheckCircle2 size={48} style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px 0' }}>Booking Request Confirmed!</h3>
                  <p style={{ fontSize: 13, margin: 0 }}>{bookingSuccessMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitBooking} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  
                  {/* Service Mode Selector */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C2B3A', marginBottom: 8, textTransform: 'uppercase' }}>
                      Choose Service Delivery
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div 
                        onClick={() => setBookingMode('remote_mobile')}
                        style={{
                          background: bookingMode === 'remote_mobile' ? '#F0F5FF' : '#F8FAFC',
                          border: '2px solid',
                          borderColor: bookingMode === 'remote_mobile' ? '#0A2085' : '#E2E8F0',
                          borderRadius: 14,
                          padding: 14,
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <Truck size={22} color={bookingMode === 'remote_mobile' ? '#0A2085' : '#607D8B'} style={{ margin: '0 auto 6px' }} />
                        <strong style={{ display: 'block', fontSize: 13, color: '#1C2B3A' }}>Remote Mobile Garage</strong>
                        <span style={{ fontSize: 11, color: '#607D8B' }}>Van comes to your location</span>
                      </div>

                      <div 
                        onClick={() => setBookingMode('dropoff')}
                        style={{
                          background: bookingMode === 'dropoff' ? '#F0F5FF' : '#F8FAFC',
                          border: '2px solid',
                          borderColor: bookingMode === 'dropoff' ? '#0A2085' : '#E2E8F0',
                          borderRadius: 14,
                          padding: 14,
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <Store size={22} color={bookingMode === 'dropoff' ? '#0A2085' : '#607D8B'} style={{ margin: '0 auto 6px' }} />
                        <strong style={{ display: 'block', fontSize: 13, color: '#1C2B3A' }}>Drive-in Facility</strong>
                        <span style={{ fontSize: 11, color: '#607D8B' }}>Drop off at shop</span>
                      </div>
                    </div>
                  </div>

                  {/* Service details */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>SERVICE REQUESTED</label>
                    <input 
                      type="text" 
                      value={serviceType} 
                      onChange={e => setServiceType(e.target.value)} 
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #D0DCE8', fontSize: 14 }}
                      required 
                    />
                  </div>

                  {/* Vehicle */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>VEHICLE (YEAR / MAKE / MODEL / COLOR)</label>
                    <input 
                      type="text" 
                      value={vehicleName} 
                      onChange={e => setVehicleName(e.target.value)} 
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #D0DCE8', fontSize: 14 }}
                      required 
                    />
                  </div>

                  {/* Address if Remote Mobile */}
                  {bookingMode === 'remote_mobile' && (
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A2085', marginBottom: 4 }}>
                        📍 SERVICE ADDRESS / DISPATCH LOCATION (Home, Office, Roadside)
                      </label>
                      <input 
                        type="text" 
                        value={serviceAddress} 
                        onChange={e => setServiceAddress(e.target.value)} 
                        placeholder="e.g. 1428 Elm Street, Apt 4B (Driveway)"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #0A2085', background: '#F0F5FF', fontSize: 14 }}
                        required 
                      />
                    </div>
                  )}

                  {/* Date & Time */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>DATE</label>
                      <input 
                        type="date" 
                        value={scheduledDate} 
                        onChange={e => setScheduledDate(e.target.value)} 
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #D0DCE8', fontSize: 14 }}
                        required 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>TIME</label>
                      <input 
                        type="text" 
                        value={scheduledTime} 
                        onChange={e => setScheduledTime(e.target.value)} 
                        placeholder="e.g. 10:30 AM"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #D0DCE8', fontSize: 14 }}
                        required 
                      />
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>YOUR NAME</label>
                      <input 
                        type="text" 
                        value={contactName} 
                        onChange={e => setContactName(e.target.value)} 
                        placeholder="Full Name"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #D0DCE8', fontSize: 14 }}
                        required 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>CONTACT PHONE</label>
                      <input 
                        type="tel" 
                        value={contactPhone} 
                        onChange={e => setContactPhone(e.target.value)} 
                        placeholder="+1 (555) 000-0000"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #D0DCE8', fontSize: 14 }}
                        required 
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>SPECIAL INSTRUCTIONS / GATE CODE</label>
                    <textarea 
                      value={notes} 
                      onChange={e => setNotes(e.target.value)} 
                      placeholder="e.g. Key is in lockbox, vehicle parked on west side..."
                      rows={2}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #D0DCE8', fontSize: 14, resize: 'none' }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={bookingSubmitting}
                    style={{ background: '#0A2085', color: '#fff', border: 'none', padding: '16px', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 }}
                  >
                    {bookingSubmitting ? <span className="loading-dot" /> : <><Send size={16} /> Confirm Service Appointment</>}
                  </button>
                </form>
              )}

            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            PARTNER ONBOARDING MODAL
        ───────────────────────────────────────────────────────────────── */}
        {onboardModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 650, maxHeight: '90vh', overflowY: 'auto', padding: 32, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #F0F4F8', paddingBottom: 14 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1C2B3A', margin: 0 }}>Register Your Garage or Mobile Service</h2>
                  <div style={{ fontSize: 12, color: '#607D8B', marginTop: 2 }}>Join AAIA's certified automotive service provider network</div>
                </div>
                <button onClick={() => setOnboardModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#90A4AE' }}>
                  <X size={20} />
                </button>
              </div>

              {onboardSuccessMsg ? (
                <div style={{ background: '#E1F5EE', color: '#0F6E56', padding: 24, borderRadius: 16, textAlign: 'center' }}>
                  <CheckCircle2 size={48} style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px 0' }}>Welcome to the AAIA Network!</h3>
                  <p style={{ fontSize: 13, margin: 0 }}>{onboardSuccessMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitOnboard} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>BUSINESS / MECHANIC NAME</label>
                    <input 
                      type="text" 
                      value={onboardData.name} 
                      onChange={e => setOnboardData({ ...onboardData, name: e.target.value })} 
                      placeholder="e.g. Apex Mobile Auto Clinic"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #D0DCE8', fontSize: 14 }}
                      required 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>PHONE</label>
                      <input 
                        type="tel" 
                        value={onboardData.phone} 
                        onChange={e => setOnboardData({ ...onboardData, phone: e.target.value })} 
                        placeholder="+1 (800) 555-0199"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #D0DCE8', fontSize: 14 }}
                        required 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>EMAIL</label>
                      <input 
                        type="email" 
                        value={onboardData.email} 
                        onChange={e => setOnboardData({ ...onboardData, email: e.target.value })} 
                        placeholder="contact@shop.com"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #D0DCE8', fontSize: 14 }}
                        required 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>CITY / METRO REGION</label>
                      <input 
                        type="text" 
                        value={onboardData.city} 
                        onChange={e => setOnboardData({ ...onboardData, city: e.target.value })} 
                        placeholder="e.g. Houston Metro"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #D0DCE8', fontSize: 14 }}
                        required 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>HOURLY LABOR RATE ($)</label>
                      <input 
                        type="number" 
                        value={onboardData.hourlyRate} 
                        onChange={e => setOnboardData({ ...onboardData, hourlyRate: e.target.value })} 
                        placeholder="110"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #D0DCE8', fontSize: 14 }}
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#0A2085', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={onboardData.isMobileCapable} 
                        onChange={e => setOnboardData({ ...onboardData, isMobileCapable: e.target.checked, type: e.target.checked ? 'mobile_mechanic' : 'garage' })} 
                      />
                      🚐 We provide Remote Mobile Garage service (Service vans dispatched to customer locations)
                    </label>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>SERVICES OFFERED (COMMA-SEPARATED)</label>
                    <input 
                      type="text" 
                      value={onboardData.servicesOffered} 
                      onChange={e => setOnboardData({ ...onboardData, servicesOffered: e.target.value })} 
                      placeholder="Diagnostics, Brakes, Battery, Oil Change..."
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #D0DCE8', fontSize: 14 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>BIO / QUALIFICATIONS</label>
                    <textarea 
                      value={onboardData.bio} 
                      onChange={e => setOnboardData({ ...onboardData, bio: e.target.value })} 
                      placeholder="Briefly describe your certifications, master tech experience, and tooling..."
                      rows={2}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #D0DCE8', fontSize: 14, resize: 'none' }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={onboardSubmitting}
                    style={{ background: '#0A2085', color: '#fff', border: 'none', padding: '14px', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 }}
                  >
                    {onboardSubmitting ? <span className="loading-dot" /> : <><ShieldCheck size={16} /> Complete Partner Registration</>}
                  </button>
                </form>
              )}

            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
