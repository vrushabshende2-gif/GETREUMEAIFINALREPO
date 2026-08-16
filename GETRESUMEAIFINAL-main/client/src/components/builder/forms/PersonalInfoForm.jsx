import React, { useState, useEffect } from 'react';
import PhoneInputPkg from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
const PhoneInput = PhoneInputPkg.default || PhoneInputPkg;
import useResumeStore from '../../../store/useResumeStore';
import Input from '../../common/Input';
import AutocompleteInput, { LOCATION_SUGGESTIONS } from '../../common/AutocompleteInput';
import { Lock, Mail, AlertTriangle, UserCheck, AlertCircle, MapPin } from 'lucide-react';

// ── Validators ────────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = {
  fullName: (v) => {
    if (!v || v.trim().length < 2) return 'Name must be at least 2 characters.';
    if (!/^[\p{L}\s'-]+$/u.test(v.trim())) return 'Name should only contain letters, spaces, hyphens or apostrophes.';
    return '';
  },
  email: (v) => {
    if (!v || !v.trim()) return 'Email is required.';
    if (!EMAIL_RE.test(v.trim())) return 'Enter a valid email address (e.g. john@example.com).';
    return '';
  },
  linkedin: (v) => {
    if (!v || !v.trim()) return ''; // optional
    const normalized = v.trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    if (!normalized.toLowerCase().startsWith('linkedin.com/in/')) {
      return 'Must be a LinkedIn profile URL (e.g. linkedin.com/in/yourname).';
    }
    return '';
  },
  location: (v) => {
    if (!v || !v.trim()) return ''; // optional
    return '';
  },
};

// ── Inline error helper ───────────────────────────────────────────────────────
const FieldError = ({ msg }) =>
  msg ? (
    <p className="flex items-center gap-1 text-xs font-semibold text-red-500 mt-1 ml-1">
      <AlertCircle size={12} />
      {msg}
    </p>
  ) : null;

// ── Component ─────────────────────────────────────────────────────────────────
const PersonalInfoForm = () => {
  const { currentResumeData, updateResumeData } = useResumeStore();
  const personalInfo = currentResumeData?.personalInfo || {};

  // Local draft states for fields that have validation
  const [proposedEmail, setProposedEmail] = useState(personalInfo.email || '');
  const [lastConfirmedEmail, setLastConfirmedEmail] = useState(personalInfo.email || '');
  const [proposedName, setProposedName] = useState(personalInfo.fullName || '');

  // Modal visibility
  const [showConfirm1, setShowConfirm1] = useState(false);
  const [showConfirm2, setShowConfirm2] = useState(false);
  const [showNameConfirm, setShowNameConfirm] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    linkedin: '',
  });

  // Sync if store updates externally
  useEffect(() => {
    setProposedEmail(personalInfo.email || '');
    setLastConfirmedEmail(personalInfo.email || '');
    if (personalInfo.fullName && !proposedName) {
      setProposedName(personalInfo.fullName);
    }
  }, [personalInfo.email, personalInfo.fullName]);

  // ── Generic field change ──────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setProposedEmail(value);
      setErrors((prev) => ({ ...prev, email: '' }));
    } else if (name === 'fullName') {
      setProposedName(value);
      setErrors((prev) => ({ ...prev, fullName: '' }));
    } else {
      updateResumeData('personalInfo', name, value);
      if (name === 'linkedin') {
        setErrors((prev) => ({ ...prev, linkedin: validate.linkedin(value) }));
      }
    }
  };

  // ── Phone input change ────────────────────────────────────────────────────
  const handlePhoneChange = (value) => {
    // react-phone-input-2 gives the full number with country code e.g. "919876543210"
    // We store it with a leading + so it's internationally formatted
    updateResumeData('personalInfo', 'phone', value ? `+${value}` : '');
  };

  // ── Email flow ────────────────────────────────────────────────────────────
  const handleEmailBlur = () => {
    const err = validate.email(proposedEmail);
    setErrors((prev) => ({ ...prev, email: err }));
    if (err) return;
    if (proposedEmail.trim() !== lastConfirmedEmail.trim()) {
      setShowConfirm1(true);
    }
  };

  const cancelEmailChange = () => {
    setProposedEmail(lastConfirmedEmail);
    setErrors((prev) => ({ ...prev, email: '' }));
    setShowConfirm1(false);
    setShowConfirm2(false);
  };

  const proceedToStep2 = () => {
    setShowConfirm1(false);
    setShowConfirm2(true);
  };

  const confirmEmailFinal = () => {
    updateResumeData('personalInfo', 'email', proposedEmail.trim());
    setLastConfirmedEmail(proposedEmail.trim());
    setShowConfirm2(false);
  };

  // ── Name flow ─────────────────────────────────────────────────────────────
  const handleNameBlur = () => {
    if (personalInfo.nameLocked) return;
    const err = validate.fullName(proposedName);
    setErrors((prev) => ({ ...prev, fullName: err }));
    if (err) return;
    if (proposedName.trim().length > 0) {
      setShowNameConfirm(true);
    }
  };

  const cancelNameChange = () => {
    setProposedName(personalInfo.fullName || '');
    setErrors((prev) => ({ ...prev, fullName: '' }));
    setShowNameConfirm(false);
  };

  const confirmNameFinal = () => {
    updateResumeData('personalInfo', 'fullName', proposedName.trim());
    updateResumeData('personalInfo', 'nameLocked', true);
    setShowNameConfirm(false);
  };

  const isNameLocked = !!personalInfo.nameLocked;

  // Strip leading + for the phone input (it expects raw digits)
  const phoneRawValue = (personalInfo.phone || '').replace(/^\+/, '');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* ── Row 1: Name + Email ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <div className="relative">
            <Input
              label="Full Name"
              name="fullName"
              placeholder="John Doe"
              value={proposedName}
              onChange={handleChange}
              onBlur={handleNameBlur}
              disabled={isNameLocked}
              className={isNameLocked ? 'opacity-75 focus-within:ring-0' : ''}
            />
            {isNameLocked && (
              <div className="absolute right-3 top-[38px] text-stone-400 flex items-center gap-1.5 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200 pointer-events-none">
                <Lock size={12} className="text-orange-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Locked</span>
              </div>
            )}
          </div>
          <FieldError msg={errors.fullName} />
        </div>

        {/* Email */}
        <div>
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="john@example.com"
            value={proposedEmail}
            onChange={handleChange}
            onBlur={handleEmailBlur}
          />
          <FieldError msg={errors.email} />
        </div>
      </div>

      {/* ── Row 2: Phone + LinkedIn ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Phone with country code */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-stone-700 ml-1">Phone Number</label>
          <PhoneInput
            country="in"
            value={phoneRawValue}
            onChange={handlePhoneChange}
            enableSearch
            searchPlaceholder="Search country..."
            inputProps={{ name: 'phone', id: 'phone-input' }}
            containerStyle={{ width: '100%' }}
            inputStyle={{
              width: '100%',
              height: '52px',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '24px',
              paddingLeft: '52px',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'inherit',
              backgroundColor: '#ffffff',
              color: '#1c1917',
              outline: 'none',
            }}
            buttonStyle={{
              border: 'none',
              borderRadius: '24px 0 0 24px',
              backgroundColor: 'transparent',
              paddingLeft: '12px',
            }}
            dropdownStyle={{
              borderRadius: '16px',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              fontSize: '13px',
              fontFamily: 'inherit',
              zIndex: 999,
            }}
            searchStyle={{
              borderRadius: '12px',
              border: '1px solid rgba(0,0,0,0.1)',
              fontSize: '13px',
              fontFamily: 'inherit',
              width: 'calc(100% - 16px)',
            }}
          />
          <p className="text-[11px] font-medium text-stone-400 ml-1">Select country flag to change dial code</p>
        </div>

        {/* LinkedIn */}
        <div>
          <Input
            label="LinkedIn Profile"
            name="linkedin"
            placeholder="linkedin.com/in/yourname"
            value={personalInfo.linkedin || ''}
            onChange={handleChange}
            onBlur={() =>
              setErrors((prev) => ({ ...prev, linkedin: validate.linkedin(personalInfo.linkedin || '') }))
            }
          />
          <FieldError msg={errors.linkedin} />
        </div>
      </div>

      {/* ── Location ─────────────────────────────────────────────────────────── */}
      <AutocompleteInput
        label="Location"
        name="location"
        placeholder="e.g. Mumbai, India or New York, NY, USA"
        value={personalInfo.location || ''}
        onChange={handleChange}
        suggestions={LOCATION_SUGGESTIONS}
        icon={MapPin}
      />

      {/* ── Professional Summary ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-stone-700 ml-1">Professional Summary</label>
        <textarea
          name="summary"
          className="w-full rounded-[24px] border border-black/10 bg-white p-5 text-sm font-medium focus:border-orange-500 focus:outline-none transition-all min-h-[120px]"
          placeholder="Briefly describe your professional background and key achievements..."
          value={personalInfo.summary || ''}
          onChange={handleChange}
        />
      </div>

      {/* ── NAME CONFIRMATION MODAL ──────────────────────────────────────────── */}
      {showNameConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-black/5 animate-in scale-in duration-300">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mb-6">
              <UserCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Confirm Your Name</h3>
            <p className="text-stone-500 text-sm font-medium leading-relaxed mb-6">
              Is <strong className="text-black font-semibold">{proposedName}</strong> your exact legal name?{' '}
              <br />
              <br />
              To prevent multi-identity issues, <strong>once confirmed, your name cannot be changed across any resume module.</strong>
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelNameChange}
                className="px-5 py-3 rounded-xl border border-stone-200 hover:bg-stone-50 font-bold text-stone-500 text-sm transition-all"
              >
                Let me edit
              </button>
              <button
                onClick={confirmNameFinal}
                className="px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/10"
              >
                Yes, Lock Name
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STAGE 1 EMAIL CONFIRMATION MODAL ─────────────────────────────────── */}
      {showConfirm1 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-black/5 animate-in scale-in duration-300">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mb-6">
              <Mail size={24} />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Verify Email Change</h3>
            <p className="text-stone-500 text-sm font-medium leading-relaxed mb-6">
              Are you sure you want to update your email to{' '}
              <strong className="text-black font-semibold">{proposedEmail}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelEmailChange}
                className="px-5 py-3 rounded-xl border border-stone-200 hover:bg-stone-50 font-bold text-stone-500 text-sm transition-all"
              >
                No, Cancel
              </button>
              <button
                onClick={proceedToStep2}
                className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-md shadow-orange-500/10"
              >
                Yes, It's Correct
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STAGE 2 EMAIL CONFIRMATION MODAL ─────────────────────────────────── */}
      {showConfirm2 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-stone-200 animate-in scale-in duration-300">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-6">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Final Name Binding Warning</h3>
            <p className="text-stone-500 text-sm font-medium leading-relaxed mb-6">
              Please confirm: The email{' '}
              <strong className="text-black font-semibold">{proposedEmail}</strong> will permanently bind to{' '}
              <strong className="text-black font-semibold">{personalInfo.fullName || 'your Name'}</strong>.{' '}
              <br />
              <br />
              Once locked, you will not be able to use different names with this email. Proceed?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelEmailChange}
                className="px-5 py-3 rounded-xl border border-stone-200 hover:bg-stone-50 font-bold text-stone-500 text-sm transition-all"
              >
                Cancel Changes
              </button>
              <button
                onClick={confirmEmailFinal}
                className="px-5 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-md shadow-red-500/10"
              >
                Confirm and Lock Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Phone Input Style Overrides (scoped, non-conflicting) ─────────────── */}
      <style>{`
        .react-tel-input .flag-dropdown {
          background: transparent !important;
          border: none !important;
        }
        .react-tel-input .flag-dropdown.open {
          background: transparent !important;
          border-radius: 24px 0 0 24px !important;
        }
        .react-tel-input .selected-flag {
          background: transparent !important;
          border-radius: 24px 0 0 24px !important;
        }
        .react-tel-input .selected-flag:hover,
        .react-tel-input .selected-flag:focus {
          background: rgba(0,0,0,0.04) !important;
          border-radius: 24px 0 0 24px !important;
        }
        .react-tel-input .form-control:focus {
          border-color: #f97316 !important;
          box-shadow: none !important;
        }
        .react-tel-input .country-list .country.highlight,
        .react-tel-input .country-list .country:hover {
          background-color: #fff7ed !important;
          color: #ea580c !important;
        }
        .react-tel-input .country-list .country.highlight .country-name,
        .react-tel-input .country-list .country:hover .country-name {
          color: #ea580c !important;
        }
        .react-tel-input .search-box {
          margin: 8px !important;
        }
      `}</style>
    </div>
  );
};

export default PersonalInfoForm;
