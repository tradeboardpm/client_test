import * as React from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

// Country data with names and calling codes
const countries = [
  { code: 'AD', name: 'Andorra', callingCode: '376' },
  { code: 'AE', name: 'United Arab Emirates', callingCode: '971' },
  { code: 'AF', name: 'Afghanistan', callingCode: '93' },
  { code: 'AG', name: 'Antigua and Barbuda', callingCode: '1268' },
  { code: 'AI', name: 'Anguilla', callingCode: '1264' },
  { code: 'AL', name: 'Albania', callingCode: '355' },
  { code: 'AM', name: 'Armenia', callingCode: '374' },
  { code: 'AO', name: 'Angola', callingCode: '244' },
  { code: 'AQ', name: 'Antarctica', callingCode: '672' },
  { code: 'AR', name: 'Argentina', callingCode: '54' },
  { code: 'AS', name: 'American Samoa', callingCode: '1684' },
  { code: 'AT', name: 'Austria', callingCode: '43' },
  { code: 'AU', name: 'Australia', callingCode: '61' },
  { code: 'AW', name: 'Aruba', callingCode: '297' },
  { code: 'AX', name: 'Åland Islands', callingCode: '358' },
  { code: 'AZ', name: 'Azerbaijan', callingCode: '994' },
  { code: 'BA', name: 'Bosnia and Herzegovina', callingCode: '387' },
  { code: 'BB', name: 'Barbados', callingCode: '1246' },
  { code: 'BD', name: 'Bangladesh', callingCode: '880' },
  { code: 'BE', name: 'Belgium', callingCode: '32' },
  { code: 'BF', name: 'Burkina Faso', callingCode: '226' },
  { code: 'BG', name: 'Bulgaria', callingCode: '359' },
  { code: 'BH', name: 'Bahrain', callingCode: '973' },
  { code: 'BI', name: 'Burundi', callingCode: '257' },
  { code: 'BJ', name: 'Benin', callingCode: '229' },
  { code: 'BL', name: 'Saint Barthélemy', callingCode: '590' },
  { code: 'BM', name: 'Bermuda', callingCode: '1441' },
  { code: 'BN', name: 'Brunei Darussalam', callingCode: '673' },
  { code: 'BO', name: 'Bolivia', callingCode: '591' },
  { code: 'BQ', name: 'Bonaire, Sint Eustatius and Saba', callingCode: '599' },
  { code: 'BR', name: 'Brazil', callingCode: '55' },
  { code: 'BS', name: 'Bahamas', callingCode: '1242' },
  { code: 'BT', name: 'Bhutan', callingCode: '975' },
  { code: 'BV', name: 'Bouvet Island', callingCode: '47' },
  { code: 'BW', name: 'Botswana', callingCode: '267' },
  { code: 'BY', name: 'Belarus', callingCode: '375' },
  { code: 'BZ', name: 'Belize', callingCode: '501' },
  { code: 'CA', name: 'Canada', callingCode: '1' },
  { code: 'CC', name: 'Cocos (Keeling) Islands', callingCode: '61' },
  { code: 'CD', name: 'Congo, Democratic Republic of the', callingCode: '243' },
  { code: 'CF', name: 'Central African Republic', callingCode: '236' },
  { code: 'CG', name: 'Congo', callingCode: '242' },
  { code: 'CH', name: 'Switzerland', callingCode: '41' },
  { code: 'CI', name: 'Côte d\'Ivoire', callingCode: '225' },
  { code: 'CK', name: 'Cook Islands', callingCode: '682' },
  { code: 'CL', name: 'Chile', callingCode: '56' },
  { code: 'CM', name: 'Cameroon', callingCode: '237' },
  { code: 'CN', name: 'China', callingCode: '86' },
  { code: 'CO', name: 'Colombia', callingCode: '57' },
  { code: 'CR', name: 'Costa Rica', callingCode: '506' },
  { code: 'CU', name: 'Cuba', callingCode: '53' },
  { code: 'CV', name: 'Cabo Verde', callingCode: '238' },
  { code: 'CW', name: 'Curaçao', callingCode: '599' },
  { code: 'CX', name: 'Christmas Island', callingCode: '61' },
  { code: 'CY', name: 'Cyprus', callingCode: '357' },
  { code: 'CZ', name: 'Czech Republic', callingCode: '420' },
  { code: 'DE', name: 'Germany', callingCode: '49' },
  { code: 'DJ', name: 'Djibouti', callingCode: '253' },
  { code: 'DK', name: 'Denmark', callingCode: '45' },
  { code: 'DM', name: 'Dominica', callingCode: '1767' },
  { code: 'DO', name: 'Dominican Republic', callingCode: '1809' },
  { code: 'DZ', name: 'Algeria', callingCode: '213' },
  { code: 'EC', name: 'Ecuador', callingCode: '593' },
  { code: 'EE', name: 'Estonia', callingCode: '372' },
  { code: 'EG', name: 'Egypt', callingCode: '20' },
  { code: 'EH', name: 'Western Sahara', callingCode: '212' },
  { code: 'ER', name: 'Eritrea', callingCode: '291' },
  { code: 'ES', name: 'Spain', callingCode: '34' },
  { code: 'ET', name: 'Ethiopia', callingCode: '251' },
  { code: 'FI', name: 'Finland', callingCode: '358' },
  { code: 'FJ', name: 'Fiji', callingCode: '679' },
  { code: 'FK', name: 'Falkland Islands (Malvinas)', callingCode: '500' },
  { code: 'FM', name: 'Micronesia, Federated States of', callingCode: '691' },
  { code: 'FO', name: 'Faroe Islands', callingCode: '298' },
  { code: 'FR', name: 'France', callingCode: '33' },
  { code: 'GA', name: 'Gabon', callingCode: '241' },
  { code: 'GB', name: 'United Kingdom', callingCode: '44' },
  { code: 'GD', name: 'Grenada', callingCode: '1473' },
  { code: 'GE', name: 'Georgia', callingCode: '995' },
  { code: 'GF', name: 'French Guiana', callingCode: '594' },
  { code: 'GG', name: 'Guernsey', callingCode: '44' },
  { code: 'GH', name: 'Ghana', callingCode: '233' },
  { code: 'GI', name: 'Gibraltar', callingCode: '350' },
  { code: 'GL', name: 'Greenland', callingCode: '299' },
  { code: 'GM', name: 'Gambia', callingCode: '220' },
  { code: 'GN', name: 'Guinea', callingCode: '224' },
  { code: 'GP', name: 'Guadeloupe', callingCode: '590' },
  { code: 'GQ', name: 'Equatorial Guinea', callingCode: '240' },
  { code: 'GR', name: 'Greece', callingCode: '30' },
  { code: 'GS', name: 'South Georgia and the South Sandwich Islands', callingCode: '500' },
  { code: 'GT', name: 'Guatemala', callingCode: '502' },
  { code: 'GU', name: 'Guam', callingCode: '1671' },
  { code: 'GW', name: 'Guinea-Bissau', callingCode: '245' },
  { code: 'GY', name: 'Guyana', callingCode: '592' },
  { code: 'HK', name: 'Hong Kong', callingCode: '852' },
  { code: 'HM', name: 'Heard Island and McDonald Islands', callingCode: '672' },
  { code: 'HN', name: 'Honduras', callingCode: '504' },
  { code: 'HR', name: 'Croatia', callingCode: '385' },
  { code: 'HT', name: 'Haiti', callingCode: '509' },
  { code: 'HU', name: 'Hungary', callingCode: '36' },
  { code: 'ID', name: 'Indonesia', callingCode: '62' },
  { code: 'IE', name: 'Ireland', callingCode: '353' },
  { code: 'IL', name: 'Israel', callingCode: '972' },
  { code: 'IM', name: 'Isle of Man', callingCode: '44' },
  { code: 'IN', name: 'India', callingCode: '91' },
  { code: 'IO', name: 'British Indian Ocean Territory', callingCode: '246' },
  { code: 'IQ', name: 'Iraq', callingCode: '964' },
  { code: 'IR', name: 'Iran, Islamic Republic of', callingCode: '98' },
  { code: 'IS', name: 'Iceland', callingCode: '354' },
  { code: 'IT', name: 'Italy', callingCode: '39' },
  { code: 'JE', name: 'Jersey', callingCode: '44' },
  { code: 'JM', name: 'Jamaica', callingCode: '1876' },
  { code: 'JO', name: 'Jordan', callingCode: '962' },
  { code: 'JP', name: 'Japan', callingCode: '81' },
  { code: 'KE', name: 'Kenya', callingCode: '254' },
  { code: 'KG', name: 'Kyrgyzstan', callingCode: '996' },
  { code: 'KH', name: 'Cambodia', callingCode: '855' },
  { code: 'KI', name: 'Kiribati', callingCode: '686' },
  { code: 'KM', name: 'Comoros', callingCode: '269' },
  { code: 'KN', name: 'Saint Kitts and Nevis', callingCode: '1869' },
  { code: 'KP', name: 'Korea, Democratic People\'s Republic of', callingCode: '850' },
  { code: 'KR', name: 'Korea, Republic of', callingCode: '82' },
  { code: 'KW', name: 'Kuwait', callingCode: '965' },
  { code: 'KY', name: 'Cayman Islands', callingCode: '1345' },
  { code: 'KZ', name: 'Kazakhstan', callingCode: '7' },
  { code: 'LA', name: 'Lao People\'s Democratic Republic', callingCode: '856' },
  { code: 'LB', name: 'Lebanon', callingCode: '961' },
  { code: 'LC', name: 'Saint Lucia', callingCode: '1758' },
  { code: 'LI', name: 'Liechtenstein', callingCode: '423' },
  { code: 'LK', name: 'Sri Lanka', callingCode: '94' },
  { code: 'LR', name: 'Liberia', callingCode: '231' },
  { code: 'LS', name: 'Lesotho', callingCode: '266' },
  { code: 'LT', name: 'Lithuania', callingCode: '370' },
  { code: 'LU', name: 'Luxembourg', callingCode: '352' },
  { code: 'LV', name: 'Latvia', callingCode: '371' },
  { code: 'LY', name: 'Libya', callingCode: '218' },
  { code: 'MA', name: 'Morocco', callingCode: '212' },
  { code: 'MC', name: 'Monaco', callingCode: '377' },
  { code: 'MD', name: 'Moldova, Republic of', callingCode: '373' },
  { code: 'ME', name: 'Montenegro', callingCode: '382' },
  { code: 'MF', name: 'Saint Martin (French part)', callingCode: '590' },
  { code: 'MG', name: 'Madagascar', callingCode: '261' },
  { code: 'MH', name: 'Marshall Islands', callingCode: '692' },
  { code: 'MK', name: 'North Macedonia', callingCode: '389' },
  { code: 'ML', name: 'Mali', callingCode: '223' },
  { code: 'MM', name: 'Myanmar', callingCode: '95' },
  { code: 'MN', name: 'Mongolia', callingCode: '976' },
  { code: 'MO', name: 'Macao', callingCode: '853' },
  { code: 'MP', name: 'Northern Mariana Islands', callingCode: '1670' },
  { code: 'MQ', name: 'Martinique', callingCode: '596' },
  { code: 'MR', name: 'Mauritania', callingCode: '222' },
  { code: 'MS', name: 'Montserrat', callingCode: '1664' },
  { code: 'MT', name: 'Malta', callingCode: '356' },
  { code: 'MU', name: 'Mauritius', callingCode: '230' },
  { code: 'MV', name: 'Maldives', callingCode: '960' },
  { code: 'MW', name: 'Malawi', callingCode: '265' },
  { code: 'MX', name: 'Mexico', callingCode: '52' },
  { code: 'MY', name: 'Malaysia', callingCode: '60' },
  { code: 'MZ', name: 'Mozambique', callingCode: '258' },
  { code: 'NA', name: 'Namibia', callingCode: '264' },
  { code: 'NC', name: 'New Caledonia', callingCode: '687' },
  { code: 'NE', name: 'Niger', callingCode: '227' },
  { code: 'NF', name: 'Norfolk Island', callingCode: '672' },
  { code: 'NG', name: 'Nigeria', callingCode: '234' },
  { code: 'NI', name: 'Nicaragua', callingCode: '505' },
  { code: 'NL', name: 'Netherlands', callingCode: '31' },
  { code: 'NO', name: 'Norway', callingCode: '47' },
  { code: 'NP', name: 'Nepal', callingCode: '977' },
  { code: 'NR', name: 'Nauru', callingCode: '674' },
  { code: 'NU', name: 'Niue', callingCode: '683' },
  { code: 'NZ', name: 'New Zealand', callingCode: '64' },
  { code: 'OM', name: 'Oman', callingCode: '968' },
  { code: 'PA', name: 'Panama', callingCode: '507' },
  { code: 'PE', name: 'Peru', callingCode: '51' },
  { code: 'PF', name: 'French Polynesia', callingCode: '689' },
  { code: 'PG', name: 'Papua New Guinea', callingCode: '675' },
  { code: 'PH', name: 'Philippines', callingCode: '63' },
  { code: 'PK', name: 'Pakistan', callingCode: '92' },
  { code: 'PL', name: 'Poland', callingCode: '48' },
  { code: 'PM', name: 'Saint Pierre and Miquelon', callingCode: '508' },
  { code: 'PN', name: 'Pitcairn', callingCode: '64' },
  { code: 'PR', name: 'Puerto Rico', callingCode: '1787' },
  { code: 'PS', name: 'Palestine, State of', callingCode: '970' },
  { code: 'PT', name: 'Portugal', callingCode: '351' },
  { code: 'PW', name: 'Palau', callingCode: '680' },
  { code: 'PY', name: 'Paraguay', callingCode: '595' },
  { code: 'QA', name: 'Qatar', callingCode: '974' },
  { code: 'RE', name: 'Réunion', callingCode: '262' },
  { code: 'RO', name: 'Romania', callingCode: '40' },
  { code: 'RS', name: 'Serbia', callingCode: '381' },
  { code: 'RU', name: 'Russian Federation', callingCode: '7' },
  { code: 'RW', name: 'Rwanda', callingCode: '250' },
  { code: 'SA', name: 'Saudi Arabia', callingCode: '966' },
  { code: 'SB', name: 'Solomon Islands', callingCode: '677' },
  { code: 'SC', name: 'Seychelles', callingCode: '248' },
  { code: 'SD', name: 'Sudan', callingCode: '249' },
  { code: 'SE', name: 'Sweden', callingCode: '46' },
  { code: 'SG', name: 'Singapore', callingCode: '65' },
  { code: 'SH', name: 'Saint Helena, Ascension and Tristan da Cunha', callingCode: '290' },
  { code: 'SI', name: 'Slovenia', callingCode: '386' },
  { code: 'SJ', name: 'Svalbard and Jan Mayen', callingCode: '47' },
  { code: 'SK', name: 'Slovakia', callingCode: '421' },
  { code: 'SL', name: 'Sierra Leone', callingCode: '232' },
  { code: 'SM', name: 'San Marino', callingCode: '378' },
  { code: 'SN', name: 'Senegal', callingCode: '221' },
  { code: 'SO', name: 'Somalia', callingCode: '252' },
  { code: 'SR', name: 'Suriname', callingCode: '597' },
  { code: 'SS', name: 'South Sudan', callingCode: '211' },
  { code: 'ST', name: 'Sao Tome and Principe', callingCode: '239' },
  { code: 'SV', name: 'El Salvador', callingCode: '503' },
  { code: 'SX', name: 'Sint Maarten (Dutch part)', callingCode: '1721' },
  { code: 'SY', name: 'Syrian Arab Republic', callingCode: '963' },
  { code: 'SZ', name: 'Eswatini', callingCode: '268' },
  { code: 'TC', name: 'Turks and Caicos Islands', callingCode: '1649' },
  { code: 'TD', name: 'Chad', callingCode: '235' },
  { code: 'TF', name: 'French Southern Territories', callingCode: '262' },
  { code: 'TG', name: 'Togo', callingCode: '228' },
  { code: 'TH', name: 'Thailand', callingCode: '66' },
  { code: 'TJ', name: 'Tajikistan', callingCode: '992' },
  { code: 'TK', name: 'Tokelau', callingCode: '690' },
  { code: 'TL', name: 'Timor-Leste', callingCode: '670' },
  { code: 'TM', name: 'Turkmenistan', callingCode: '993' },
  { code: 'TN', name: 'Tunisia', callingCode: '216' },
  { code: 'TO', name: 'Tonga', callingCode: '676' },
  { code: 'TR', name: 'Turkey', callingCode: '90' },
  { code: 'TT', name: 'Trinidad and Tobago', callingCode: '1868' },
  { code: 'TV', name: 'Tuvalu', callingCode: '688' },
  { code: 'TW', name: 'Taiwan, Province of China', callingCode: '886' },
  { code: 'TZ', name: 'Tanzania, United Republic of', callingCode: '255' },
  { code: 'UA', name: 'Ukraine', callingCode: '380' },
  { code: 'UG', name: 'Uganda', callingCode: '256' },
  { code: 'UM', name: 'United States Minor Outlying Islands', callingCode: '1' },
  { code: 'US', name: 'United States of America', callingCode: '1' },
  { code: 'UY', name: 'Uruguay', callingCode: '598' },
  { code: 'UZ', name: 'Uzbekistan', callingCode: '998' },
  { code: 'VA', name: 'Holy See', callingCode: '39' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', callingCode: '1784' },
  { code: 'VE', name: 'Venezuela, Bolivarian Republic of', callingCode: '58' },
  { code: 'VG', name: 'Virgin Islands, British', callingCode: '1284' },
  { code: 'VI', name: 'Virgin Islands, U.S.', callingCode: '1340' },
  { code: 'VN', name: 'Viet Nam', callingCode: '84' },
  { code: 'VU', name: 'Vanuatu', callingCode: '678' },
  { code: 'WF', name: 'Wallis and Futuna', callingCode: '681' },
  { code: 'WS', name: 'Samoa', callingCode: '685' },
  { code: 'YE', name: 'Yemen', callingCode: '967' },
  { code: 'YT', name: 'Mayotte', callingCode: '262' },
  { code: 'ZA', name: 'South Africa', callingCode: '27' },
  { code: 'ZM', name: 'Zambia', callingCode: '260' },
  { code: 'ZW', name: 'Zimbabwe', callingCode: '263' }
];

// Flag component
const FlagComponent = ({ country, countryName }) => {
  const Flag = country ? flags[country] : null;
  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm">
      {Flag && <Flag title={countryName} className="h-full w-full object-cover" />}
    </span>
  );
};

// Custom dropdown component
const CountrySelect = ({ value: selectedCountry, onChange, disabled }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const dropdownRef = React.useRef(null);
  const searchInputRef = React.useRef(null);

  // Filter countries based on search term
  const filteredCountries = React.useMemo(() => {
    if (!searchTerm.trim()) return countries;
    
    const term = searchTerm.toLowerCase();
    return countries.filter(country => 
      country.name.toLowerCase().includes(term) ||
      country.code.toLowerCase().includes(term) ||
      country.callingCode.includes(term)
    );
  }, [searchTerm]);

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  const selectedCountryData = countries.find(c => c.code === selectedCountry) || countries.find(c => c.code === 'IN');

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 border h-12 
          rounded-l-md border-r-0 min-w-[80px]
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <FlagComponent country={selectedCountryData.code} countryName={selectedCountryData.name} />
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 w-80 border rounded-md shadow-lg mt-1">
          {/* Search input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Country list */}
          <div className="max-h-60 overflow-y-auto bg-card">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onChange(country.code);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent
                    ${selectedCountry === country.code ? 'bg-accent text-accent-foreground' : ''}
                  `}
                >
                  <FlagComponent country={country.code} countryName={country.name} />
                  <span className="flex-1 truncate">{country.name}</span>
                  <span className="text-muted-foreground">+{country.callingCode}</span>
                  {selectedCountry === country.code && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-center">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main phone input component
const PhoneInput = React.forwardRef(({ className, onChange, value, disabled, placeholder, ...props }, ref) => {
  const [selectedCountry, setSelectedCountry] = React.useState('IN');
  const [phoneNumber, setPhoneNumber] = React.useState('');

  // Handle phone number change
  const handlePhoneChange = (e) => {
    const newValue = e.target.value;
    setPhoneNumber(newValue);
    
    // Create full phone number with country code
    const countryData = countries.find(c => c.code === selectedCountry);
    const fullNumber = `+${countryData?.callingCode}${newValue}`;
    
    onChange?.(fullNumber);
  };

  // Handle country change
  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    
    // Update full phone number with new country code
    const countryData = countries.find(c => c.code === countryCode);
    const fullNumber = `+${countryData?.callingCode}${phoneNumber}`;
    
    onChange?.(fullNumber);
  };

  // Update internal state when external value changes
  React.useEffect(() => {
    if (value && value.startsWith('+')) {
      // Parse the country code from the value
      const numberWithoutPlus = value.slice(1);
      let matchedCountry = null;
      let phoneWithoutCountryCode = '';

      // Find matching country by calling code
      for (const country of countries) {
        if (numberWithoutPlus.startsWith(country.callingCode)) {
          matchedCountry = country;
          phoneWithoutCountryCode = numberWithoutPlus.slice(country.callingCode.length);
          break;
        }
      }

      if (matchedCountry && matchedCountry.code !== selectedCountry) {
        setSelectedCountry(matchedCountry.code);
      }
      
      if (phoneWithoutCountryCode !== phoneNumber) {
        setPhoneNumber(phoneWithoutCountryCode);
      }
    } else if (!value) {
      setPhoneNumber('');
    }
  }, [value, selectedCountry, phoneNumber]);

  return (
    <div className={`flex ${className || ''}`}>
      <CountrySelect
        value={selectedCountry}
        onChange={handleCountryChange}
        disabled={disabled}
      />
      <input
        ref={ref}
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneChange}
        disabled={disabled}
        placeholder={placeholder || "Enter phone number"}
        className="flex-1 px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        {...props}
      />
    </div>
  );
});

PhoneInput.displayName = "PhoneInput";

// Custom hook for phone input functionality
const usePhoneInput = (initialCountry = 'IN') => {
  const [phone, setPhone] = React.useState('');
  const [country, setCountry] = React.useState(initialCountry);

  const handlePhoneChange = (value) => {
    setPhone(value || '');
    
    // Auto-detect country from phone number if it starts with +
    if (value && value.startsWith('+')) {
      const numberWithoutPlus = value.slice(1);
      
      for (const countryData of countries) {
        if (numberWithoutPlus.startsWith(countryData.callingCode)) {
          if (countryData.code !== country) {
            setCountry(countryData.code);
          }
          break;
        }
      }
    }
  };

  const getFormattedNumber = () => {
    try {
      return phone ? RPNInput.formatPhoneNumber(phone) : '';
    } catch {
      return phone;
    }
  };

  const isValid = () => {
    try {
      return phone ? RPNInput.isValidPhoneNumber(phone) : false;
    } catch {
      return false;
    }
  };

  const getCountryData = () => {
    return countries.find(c => c.code === country) || countries.find(c => c.code === 'IN');
  };

  return {
    phone,
    country,
    setPhone,
    setCountry,
    handleChange: handlePhoneChange,
    formatted: getFormattedNumber(),
    isValid: isValid(),
    countryData: getCountryData()
  };
};

// Example usage component
const PhoneInputExample = () => {
  const { phone, handleChange, formatted, isValid } = usePhoneInput();

  return (
    <div className="max-w-md mx-auto p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">
        Phone Number Input
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Phone Number
          </label>
          <PhoneInput
            value={phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />
        </div>
        
        {phone && (
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Raw Value:</strong> {phone}
            </p>
            <p className="text-sm">
              <strong>Formatted:</strong> {formatted}
            </p>
            <p className={`text-sm font-medium ${isValid ? 'text-green-600' : 'text-red-600'}`}>
              <strong>Valid:</strong> {isValid ? 'Yes' : 'No'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export { PhoneInput, usePhoneInput, PhoneInputExample };