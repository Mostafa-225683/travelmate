import { useState, useEffect, useRef } from "react";
import { MapPin, Calendar, Users, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

type DateRange = { startDate: Date | null; endDate: Date | null };
type GuestInfo = { adults: number; children: number; rooms: number };
type NullableDate = Date | null;

const SLOGANS = [
  {
    title: "Discover Your Perfect Destination",
    subtitle: "Explore the world's most breathtaking destinations and find your next adventure",
  },
  {
    title: "Find Your Next Adventure",
    subtitle: "Discover amazing places around the world",
  },
  {
    title: "Your Journey Begins Here",
    subtitle: "Unforgettable experiences await at every destination",
  },
];

const SearchInput = ({ value, onChange, error }: { value: string; onChange: (value: string) => void; error?: boolean }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="relative flex-1 px-2 md:px-4">
      <div 
        className={`flex items-center gap-2 md:gap-3 px-3 py-2 rounded-md border 
          ${error ? 'border-red-500 bg-red-50' : isFocused ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-300'} 
          hover:border-blue-600 transition-all duration-200`}
      >
        <MapPin className={`w-5 h-5 ${error ? 'text-red-500' : isFocused ? 'text-blue-600' : 'text-gray-400'} transition-colors duration-200`} />
        <input
          type="text"
          placeholder="Where would you like to go?"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full text-sm outline-none placeholder-gray-400 ${error ? 'text-red-500' : ''}`}
        />
      </div>
      {error && (
        <p className="absolute -bottom-6 left-2 text-red-500 text-xs">Please enter a destination</p>
      )}
    </div>
  );
};

const DatePicker = ({ dateRange, setDateRange }: { dateRange: DateRange; setDateRange: (range: DateRange) => void }) => {
  const [pickerMonth, setPickerMonth] = useState(new Date());
  const [showDatepicker, setShowDatepicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatepicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateRange = () => {
    const format = (date: NullableDate) =>
      date?.toLocaleDateString("en-US", { month: "short", day: "numeric" }) || "";
    return dateRange.startDate
      ? `${format(dateRange.startDate)} - ${format(dateRange.endDate) || "Check Out"}`
      : "Check In - Check Out";
  };

  const selectDate = (day: number) => {
    const selected = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), day);
    selected.setHours(0, 0, 0, 0);
    if (selected < today) return;

    if (!dateRange.startDate || dateRange.endDate) {
      setDateRange({ startDate: selected, endDate: null });
    } else {
      setDateRange(
        selected < dateRange.startDate
          ? { startDate: selected, endDate: dateRange.startDate }
          : { startDate: dateRange.startDate, endDate: selected }
      );
      setTimeout(() => setShowDatepicker(false), 200);
    }
  };

  const isSelected = (day: number) => {
    const date = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), day);
    if (!dateRange.startDate) return false;
    if (!dateRange.endDate) return date.toDateString() === dateRange.startDate.toDateString();
    return date >= dateRange.startDate && date <= dateRange.endDate;
  };

  const { daysInMonth, firstDay } = {
    daysInMonth: new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 0).getDate(),
    firstDay: new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), 1).getDay(),
  };

  return (
    <div ref={datePickerRef} className="relative flex-1 px-2 md:px-4">
      <div
        onClick={() => setShowDatepicker(!showDatepicker)}
        className={`flex items-center gap-2 md:gap-3 px-3 py-2 rounded-md border
          ${showDatepicker ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-300'}
          hover:border-blue-600 transition-all duration-200 cursor-pointer`}
      >
        <Calendar className={`w-5 h-5 ${showDatepicker ? 'text-blue-600' : 'text-gray-400'}`} />
        <span className="text-sm truncate max-w-[140px] sm:max-w-none">{formatDateRange()}</span>
      </div>
      {showDatepicker && (
        <div className="absolute top-full left-0 w-full mt-2 z-50">
          <div className="bg-white border rounded-lg shadow-lg p-4 w-full datepicker-container z-50 max-w-sm mx-auto animate-fade-in-down">
            <div className="flex justify-between items-center mb-3">
              <button
                onClick={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1))}
                disabled={pickerMonth.getFullYear() === today.getFullYear() && pickerMonth.getMonth() <= today.getMonth()}
                className="disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5 cursor-pointer" />
              </button>
              <span className="font-medium">
                {pickerMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <button onClick={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1))}>
                <ChevronRight className="w-5 h-5 cursor-pointer" />
              </button>
            </div>
            <div className="grid grid-cols-7 text-xs text-center text-gray-500 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const date = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), day);
                date.setHours(0, 0, 0, 0);
                const isPast = date < today;
                return (
                  <button
                    key={day}
                    onClick={() => !isPast && selectDate(day)}
                    disabled={isPast}
                    className={`h-8 w-8 rounded-full text-sm ${isSelected(day) ? "bg-blue-600 text-white" : ""} ${isPast ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-300"}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GuestSelector = ({ guestInfo, onChange }: { guestInfo: GuestInfo; onChange: (info: GuestInfo) => void }) => {
  const [showGuests, setShowGuests] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  const { adults, children, rooms } = guestInfo;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setShowGuests(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { label: "Adults", value: adults, min: 1 },
    { label: "Children", value: children, min: 0 },
    { label: "Rooms", value: rooms, min: 1 },
  ];

  const handleChange = (key: keyof GuestInfo, value: number) => {
    onChange({ ...guestInfo, [key]: Math.max(options.find(opt => opt.label.toLowerCase() === key)?.min || 0, value) });
  };

  return (
    <div ref={selectorRef} className="relative flex-1 px-2 md:px-4 guests-container">
      <div
        onClick={() => setShowGuests(!showGuests)}
        className={`flex items-center gap-2 md:gap-3 px-3 py-2 rounded-md border
          ${showGuests ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-300'}
          hover:border-blue-600 transition-all duration-200 cursor-pointer`}
      >
        <Users className={`w-5 h-5 ${showGuests ? 'text-blue-600' : 'text-gray-400'}`} />
        <span className="text-sm truncate max-w-[160px] sm:max-w-none">
          {adults + children} traveler{adults + children > 1 ? "s" : ""}, {rooms} room{rooms > 1 ? "s" : ""}
        </span>
      </div>
      {showGuests && (
        <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg p-4 w-full z-50 space-y-3 animate-fade-in-down">
          {options.map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="font-medium">{label}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleChange(label.toLowerCase() as keyof GuestInfo, value - 1); }}
                  className="w-8 h-8 border rounded-full flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={value <= (label === 'Adults' ? 1 : 0)}
                >-</button>
                <span className="w-6 text-center font-medium">{value}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleChange(label.toLowerCase() as keyof GuestInfo, value + 1); }}
                  className="w-8 h-8 border rounded-full flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 cursor-pointer"
                >+</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Hero = () => {
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({ adults: 2, children: 0, rooms: 1 });
  const [location, setLocation] = useState("");
  const [currentSloganIndex, setCurrentSloganIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [formErrors, setFormErrors] = useState({ location: false, dates: false });
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSloganIndex((prev) => (prev + 1) % SLOGANS.length);
        setIsTransitioning(false);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    const newErrors = {
      location: !location.trim(),
      dates: !dateRange.startDate || !dateRange.endDate
    };
    setFormErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) return;

    const queryParams = new URLSearchParams({
      city: location.trim(),
      guests: (guestInfo.adults + guestInfo.children).toString(),
      rooms: guestInfo.rooms.toString(),
      checkIn: dateRange.startDate?.toISOString().split("T")[0] || "",
      checkOut: dateRange.endDate?.toISOString().split("T")[0] || "",
    });
    navigate(`/search?${queryParams.toString()}`);
  };

  return (
    <div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e')] bg-cover bg-center bg-no-repeat" />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      <div className="relative z-10 min-h-[calc(100vh-72px)] flex flex-col items-center justify-center px-4 py-20 sm:px-6 md:py-28 lg:py-32">
        <div className={`text-center mb-10 max-w-3xl mx-auto transition-all duration-500 transform ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
            {SLOGANS[currentSloganIndex].title}
          </h1>
          <p className="text-base md:text-lg lg:text-2xl text-white/90 px-2 sm:px-0 drop-shadow">
            {SLOGANS[currentSloganIndex].subtitle}
          </p>
        </div>

        <div className="w-full max-w-6xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 md:p-6 transform transition-all duration-300 hover:shadow-3xl">
          <div className="flex flex-col md:flex-row md:items-center md:divide-x divide-gray-200 gap-4 md:gap-0">
            <SearchInput 
              value={location} 
              onChange={setLocation}
              error={formErrors.location}
            />
            <DatePicker 
              dateRange={dateRange} 
              setDateRange={setDateRange} 
            />
            <GuestSelector 
              guestInfo={guestInfo} 
              onChange={setGuestInfo} 
            />

            <div className="flex px-2 md:px-4 justify-center md:justify-end">
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 font-semibold cursor-pointer w-full md:w-auto"
                aria-label="Search hotels"
              >
                <div className="flex items-center gap-2 justify-center">
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;