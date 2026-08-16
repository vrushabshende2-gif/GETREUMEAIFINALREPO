import React, { useState, useEffect, useRef } from 'react';
import { MapPin, GraduationCap, ChevronDown } from 'lucide-react';

// Comprehensive Location Suggestions (India & Worldwide Tech/Metropolitan Cities)
export const LOCATION_SUGGESTIONS = [
  'Mumbai, India',
  'Bengaluru, India',
  'Delhi NCR, India',
  'Hyderabad, India',
  'Pune, India',
  'Chennai, India',
  'Kolkata, India',
  'Ahmedabad, India',
  'Noida, India',
  'Gurugram, India',
  'Chandigarh, India',
  'Kochi, India',
  'Indore, India',
  'Jaipur, India',
  'Lucknow, India',
  'Surat, India',
  'Nagpur, India',
  'Vadodara, India',
  'Coimbatore, India',
  'Thiruvananthapuram, India',
  'Bhubaneswar, India',
  'Dehradun, India',
  'Patna, India',
  'Ranchi, India',
  'Guwahati, India',
  'New York, NY, USA',
  'San Francisco, CA, USA',
  'San Jose, CA, USA',
  'Seattle, WA, USA',
  'Austin, TX, USA',
  'Boston, MA, USA',
  'Chicago, IL, USA',
  'Los Angeles, CA, USA',
  'London, UK',
  'Manchester, UK',
  'Toronto, Canada',
  'Vancouver, Canada',
  'Berlin, Germany',
  'Munich, Germany',
  'Amsterdam, Netherlands',
  'Paris, France',
  'Zurich, Switzerland',
  'Singapore',
  'Tokyo, Japan',
  'Sydney, Australia',
  'Melbourne, Australia',
  'Dubai, UAE',
  'Dublin, Ireland',
  'Stockholm, Sweden'
];

// Comprehensive University Suggestions (Top Indian & Global Universities)
export const UNIVERSITY_SUGGESTIONS = [
  'IIT Bombay',
  'IIT Delhi',
  'IIT Madras',
  'IIT Kanpur',
  'IIT Kharagpur',
  'IIT Roorkee',
  'IIT Guwahati',
  'IIT Hyderabad',
  'IIT BHU Varanasi',
  'BITS Pilani',
  'BITS Goa',
  'BITS Hyderabad',
  'IISc Bangalore',
  'NIT Trichy',
  'NIT Surathkal',
  'NIT Warangal',
  'NIT Rourkela',
  'NIT Calicut',
  'IIIT Hyderabad',
  'IIIT Bangalore',
  'IIIT Delhi',
  'IIIT Allahabad',
  'University of Delhi',
  'Jawaharlal Nehru University (JNU)',
  'Banaras Hindu University (BHU)',
  'University of Mumbai',
  'Anna University, Chennai',
  'Savitribai Phule Pune University',
  'VTU Belgaum',
  'SRM Institute of Science and Technology',
  'VIT Vellore',
  'Manipal Institute of Technology',
  'Amity University',
  'Thapar University',
  'Lovely Professional University (LPU)',
  'NMIMS Mumbai',
  'Symbiosis International University',
  'Harvard University',
  'Stanford University',
  'Massachusetts Institute of Technology (MIT)',
  'University of California, Berkeley',
  'Carnegie Mellon University',
  'Princeton University',
  'Yale University',
  'Columbia University',
  'Cornell University',
  'University of Pennsylvania',
  'New York University (NYU)',
  'University of California, Los Angeles (UCLA)',
  'University of Washington',
  'University of Texas at Austin',
  'Georgia Institute of Technology',
  'University of Oxford',
  'University of Cambridge',
  'Imperial College London',
  'University College London (UCL)',
  'ETH Zurich',
  'University of Toronto',
  'University of Waterloo',
  'National University of Singapore (NUS)',
  'Nanyang Technological University (NTU)',
  'University of Melbourne',
  'University of Sydney'
];

const AutocompleteInput = ({
  label,
  name,
  value = '',
  onChange,
  onBlur,
  placeholder = '',
  suggestions = [],
  disabled = false,
  className = '',
  icon: Icon = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);

  useEffect(() => {
    if (value && value.trim().length > 0) {
      const query = value.toLowerCase().trim();
      const matches = suggestions.filter((s) =>
        s.toLowerCase().includes(query)
      );
      setFilteredSuggestions(matches.slice(0, 7));
    } else {
      setFilteredSuggestions(suggestions.slice(0, 7));
    }
  }, [value, suggestions]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    onChange(e);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleSelectSuggestion = (item) => {
    const syntheticEvent = {
      target: {
        name,
        value: item,
      },
    };
    onChange(syntheticEvent);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || filteredSuggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(filteredSuggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      {label && <label className="text-sm font-bold text-stone-700 ml-1">{label}</label>}
      <div className="relative">
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="w-full rounded-[24px] border border-black/10 bg-white px-5 py-3.5 pr-10 text-sm font-medium text-black focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none flex items-center gap-1">
          {Icon ? <Icon size={16} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* Suggestion Dropdown */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[999] max-h-56 overflow-y-auto rounded-2xl border border-black/10 bg-white p-2 shadow-2xl backdrop-blur-md animate-in fade-in duration-150">
          <div className="px-3 py-1.5 text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-black/5 mb-1">
            Suggestions
          </div>
          {filteredSuggestions.map((item, index) => (
            <button
              key={item}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelectSuggestion(item)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                index === selectedIndex
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-stone-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              {Icon && <Icon size={14} className={index === selectedIndex ? 'text-white' : 'text-stone-400'} />}
              <span>{item}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
