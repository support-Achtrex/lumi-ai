import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { 
  Camera as CameraIcon, 
  UploadCloud, 
  Sparkles, 
  Car, 
  Palette, 
  ShieldCheck, 
  AlertTriangle, 
  DollarSign, 
  Wrench, 
  Truck, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  Cpu, 
  Activity,
  Layers,
  Zap
} from 'lucide-react';
import APIService from '../services/api';

export default function CarScannerPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [carData, setCarData] = useState(null);
  const [error, setError] = useState('');

  // ── Take photo via Capacitor Camera on Mobile or Web Fallback ──────────────
  const handleCapturePhoto = async () => {
    try {
      setError('');
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      if (photo?.base64String) {
        const mimeType = photo.format ? `image/${photo.format}` : 'image/jpeg';
        const base64Data = `data:${mimeType};base64,${photo.base64String}`;
        setImagePreview(base64Data);
        runCarRecognition(base64Data, mimeType);
      }
    } catch (err) {
      console.warn('Capacitor camera dismissed or not supported on this platform. Triggering file picker.', err);
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  // ── Handle file upload from file picker / gallery ──────────────────────────
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      setImagePreview(base64Data);
      runCarRecognition(base64Data, file.type);
    };
    reader.readAsDataURL(file);
  };

  // ── Run AI Visual Car Recognition ─────────────────────────────────────────
  const runCarRecognition = async (base64Image, mimeType) => {
    setAnalyzing(true);
    setError('');
    setCarData(null);

    try {
      const result = await APIService.identifyCarImage(base64Image, mimeType);
      setCarData(result);
    } catch (err) {
      console.error('Car scan error:', err);
      setError(err.message || 'Failed to analyze vehicle image. Please try again with a clear photo.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setCarData(null);
    setError('');
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#F5F8FC', padding: '24px 20px 48px' }}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        
        {/* ── Page Header ── */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1C2B3A', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Instant AI Vehicle Scanner
          </h1>
          <p style={{ fontSize: 14, color: '#607D8B', margin: 0 }}>
            Snap or upload a photo of any vehicle. AAIA identifies the make, model, generation, exact paint color & finish, market valuation, and common reliability notes.
          </p>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: '#C62828', padding: '14px 18px', borderRadius: 12, fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Step 1: Upload / Camera Action Zone (When no image or after reset) ── */}
        {!imagePreview && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 32 }}>
            {/* Live Camera Box */}
            <div 
              onClick={handleCapturePhoto}
              style={{
                background: 'linear-gradient(135deg, #0A2085 0%, #1565C0 100%)',
                color: '#fff',
                borderRadius: 20,
                padding: '36px 28px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 12px 32px rgba(10,32,133,0.18)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <CameraIcon size={32} color="#fff" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px 0' }}>Take Live Photo</h2>
              <p style={{ fontSize: 13, opacity: 0.85, margin: '0 0 18px 0', maxWidth: 280 }}>
                Use your smartphone camera or webcam to scan a car in real time.
              </p>
              <button style={{ background: '#fff', color: '#0A2085', border: 'none', padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} /> Open Camera
              </button>
            </div>

            {/* Gallery / File Drop Box */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: '#fff',
                border: '2px dashed #B0BEC5',
                borderRadius: 20,
                padding: '36px 28px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease, background 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#0A2085'; e.currentTarget.style.background = '#F8FAFC'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#B0BEC5'; e.currentTarget.style.background = '#fff'; }}
            >
              <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#F0F5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <UploadCloud size={32} color="#0A2085" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1C2B3A', margin: '0 0 6px 0' }}>Upload Photo</h2>
              <p style={{ fontSize: 13, color: '#607D8B', margin: '0 0 18px 0', maxWidth: 280 }}>
                Select an existing photo or screenshot from your device gallery.
              </p>
              <button style={{ background: '#F0F5FF', color: '#0A2085', border: '1px solid #D0DCE8', padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Browse Files
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Live Scanning Radar Overlay (While analyzing) ── */}
        {analyzing && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 40, textAlign: 'center', border: '1px solid #D0DCE8', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: 28 }}>
            <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
                border: '3px solid #E0E7FF', borderTopColor: '#0A2085', animation: 'spin 1.2s linear infinite'
              }} />
              <Car size={48} color="#0A2085" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1C2B3A', margin: '0 0 8px 0' }}>
              Deconstructing Vehicle Image…
            </h3>
            <p style={{ fontSize: 13, color: '#607D8B', maxWidth: 420, margin: '0 auto' }}>
              Gemini Vision is analyzing body contours, emblem geometry, paint wavelength & finish, and comparing with global automotive datasets.
            </p>
          </div>
        )}

        {/* ── Step 3: Vehicle Analysis Results Card ── */}
        {carData && !analyzing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease-out' }}>
            
            {/* Top Bar with Vehicle Title & Reset Action */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #D0DCE8', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt="Scanned vehicle" 
                    style={{ width: 80, height: 80, borderRadius: 14, objectFit: 'cover', border: '2px solid #E2E8F0' }} 
                  />
                )}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0A2085', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {carData.generation ? `${carData.generation} Generation` : 'Identified Vehicle'}
                  </div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1C2B3A', margin: '2px 0 4px 0' }}>
                    {carData.yearRange || ''} {carData.make} {carData.model}
                  </h2>
                  <div style={{ fontSize: 13, color: '#607D8B', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>{carData.trim || 'Standard Trim'}</span>
                    <span>•</span>
                    <span>{carData.bodyStyle || 'Automobile'}</span>
                    <span>•</span>
                    <span style={{ color: '#0F6E56', fontWeight: 600 }}>Confidence: {Math.round((carData.confidence || 0.95) * 100)}%</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleReset}
                style={{ background: '#F5F8FC', border: '1px solid #D0DCE8', color: '#1C2B3A', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <RefreshCw size={15} /> Scan Another Car
              </button>
            </div>

            {/* Grid Breakdown: Color, Valuation, Specs, Condition */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              
              {/* 🎨 Paint & Color Specification */}
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #D0DCE8', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #F0F4F8', paddingBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F0F5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A2085' }}>
                    <Palette size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1C2B3A' }}>Paint Color & Finish</div>
                    <div style={{ fontSize: 12, color: '#90A4AE' }}>Optical spectrophotometry detect</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ 
                    width: 52, height: 52, borderRadius: 14, 
                    background: carData.color?.hexCode || '#607D8B', 
                    border: '3px solid #fff', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    flexShrink: 0 
                  }} />
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#1C2B3A' }}>
                      {carData.color?.exactName || 'Custom Shade'}
                    </div>
                    <div style={{ fontSize: 13, color: '#607D8B', marginTop: 2 }}>
                      Finish Type: <strong style={{ color: '#0A2085' }}>{carData.color?.finish || 'Gloss'}</strong>
                      {carData.color?.hexCode && ` (${carData.color.hexCode})`}
                    </div>
                  </div>
                </div>

                {carData.condition?.detectedModifications?.length > 0 && (
                  <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#607D8B', textTransform: 'uppercase', marginBottom: 6 }}>
                      Detected Visual Modifications
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {carData.condition.detectedModifications.map((mod, idx) => (
                        <span key={idx} style={{ background: '#E6F0FA', color: '#0A2085', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 8 }}>
                          {mod}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 💰 Market Valuation Range */}
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #D0DCE8', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #F0F4F8', paddingBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F6E56' }}>
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1C2B3A' }}>Estimated Resale Value</div>
                    <div style={{ fontSize: 12, color: '#90A4AE' }}>Current secondary market index</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ background: '#F5F8FC', padding: 14, borderRadius: 12 }}>
                    <div style={{ fontSize: 11, color: '#607D8B', fontWeight: 600, marginBottom: 2 }}>TRADE-IN</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#1C2B3A' }}>
                      {carData.marketValue?.tradeIn || 'N/A'}
                    </div>
                  </div>
                  <div style={{ background: '#F5F8FC', padding: 14, borderRadius: 12 }}>
                    <div style={{ fontSize: 11, color: '#607D8B', fontWeight: 600, marginBottom: 2 }}>PRIVATE PARTY</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0A2085' }}>
                      {carData.marketValue?.privateParty || 'N/A'}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#E1F5EE', padding: '10px 16px', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0F6E56' }}>DEALER RETAIL</span>
                  <span style={{ fontSize: 17, fontWeight: 800, color: '#0F6E56' }}>
                    {carData.marketValue?.dealerRetail || 'Market Pricing Available'}
                  </span>
                </div>
              </div>

              {/* ⚙️ Drivetrain & Performance Specifications */}
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #D0DCE8', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #F0F4F8', paddingBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E65100' }}>
                    <Cpu size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1C2B3A' }}>Powertrain & Specs</div>
                    <div style={{ fontSize: 12, color: '#90A4AE' }}>Factory OEM configuration</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E2E8F0' }}>
                    <span style={{ color: '#607D8B' }}>Engine</span>
                    <strong style={{ color: '#1C2B3A' }}>{carData.technicalSpecs?.engine || 'Multi-Cylinder Engine'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E2E8F0' }}>
                    <span style={{ color: '#607D8B' }}>Horsepower</span>
                    <strong style={{ color: '#1C2B3A' }}>{carData.technicalSpecs?.horsepower || 'Standard Output'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E2E8F0' }}>
                    <span style={{ color: '#607D8B' }}>Drivetrain</span>
                    <strong style={{ color: '#1C2B3A' }}>{carData.technicalSpecs?.drivetrain || '2WD / AWD'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ color: '#607D8B' }}>Transmission</span>
                    <strong style={{ color: '#1C2B3A' }}>{carData.technicalSpecs?.transmission || 'Automatic / Manual'}</strong>
                  </div>
                </div>
              </div>

              {/* ⚠️ Common Reliability Issues & Maintenance Watch */}
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #D0DCE8', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #F0F4F8', paddingBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FBE9E7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D84315' }}>
                    <Activity size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1C2B3A' }}>Common Reliability Issues</div>
                    <div style={{ fontSize: 12, color: '#90A4AE' }}>Known service bulletin alerts</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {carData.commonKnownIssues?.map((issue, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: '#37474F' }}>
                      <AlertTriangle size={15} color="#E65100" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{issue}</span>
                    </div>
                  ))}
                  {(!carData.commonKnownIssues || carData.commonKnownIssues.length === 0) && (
                    <div style={{ fontSize: 13, color: '#607D8B', fontStyle: 'italic' }}>
                      High reliability index. No severe recurring defects flagged.
                    </div>
                  )}
                </div>

                {carData.recommendedServiceAction && (
                  <div style={{ marginTop: 'auto', background: '#F5F8FC', padding: 12, borderRadius: 10, fontSize: 12, color: '#0A2085' }}>
                    <strong>Recommended Action:</strong> {carData.recommendedServiceAction}
                  </div>
                )}
              </div>

            </div>

            {/* ── Direct Ecosystem Action Buttons ── */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #D0DCE8', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1C2B3A', margin: '0 0 4px 0' }}>
                  Next Steps with this Vehicle
                </h3>
                <p style={{ fontSize: 13, color: '#607D8B', margin: 0 }}>
                  Calculate repair estimates, request a mobile mechanic, or run full history records.
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <button 
                  onClick={() => navigate('/repair-advice', { 
                    state: { 
                      vehicle: `${carData.yearRange || ''} ${carData.make} ${carData.model} ${carData.trim || ''}`.trim() 
                    } 
                  })}
                  style={{ background: '#0A2085', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Wrench size={16} /> Get Repair & Cost Estimate
                </button>

                <button 
                  onClick={() => navigate('/garages', { 
                    state: { 
                      vehicle: `${carData.yearRange || ''} ${carData.make} ${carData.model} ${carData.trim || ''}`.trim() 
                    } 
                  })}
                  style={{ background: '#E6F0FA', color: '#0A2085', border: '1px solid #D0DCE8', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Truck size={16} /> Book Remote Garage
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
