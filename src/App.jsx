import React, { useState } from 'react';
import { MapPin, List, X, Award, Users, ChevronDown, ChevronUp, Clock, Trophy, ExternalLink, RotateCcw, Presentation, Maximize2, Minimize2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Headshot image paths (place images in public folder)
const professorHeadshot = '/professor.jpeg';
const cameronHeadshot = '/cameron.jpeg';

// Maple Leaf SVG Component for Health Canada
const MapleLeaf = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className="inline-block ml-1" style={{ verticalAlign: 'middle' }}>
    <path fill="#FF0000" d="M16 2L18.5 9H17L21 13L20 14L23 17L21 18L22 21H20L19 24L21 26V27H19L18 31H14L13 27H11V26L13 24L12 21H10L8 18L11 17L10 14L9 13L13 9H11.5L16 2Z"/>
  </svg>
);

// Map Reset Button Component
const ResetMapButton = () => {
  const map = useMap();
  const handleReset = () => {
    map.setView([52.0, -95.0], 4);
  };
  return (
    <button 
      onClick={handleReset}
      className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-lg shadow-lg border-2 border-purple-300 hover:bg-purple-50 transition-colors flex items-center gap-2"
      title="Reset Map View"
    >
      <RotateCcw size={18} className="text-purple-700" />
      <span className="text-sm font-medium text-purple-700">Reset View</span>
    </button>
  );
};

// PowerPoint Viewer Component
const PowerPointViewer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // The PPTX file should be placed in the public folder
  // When deployed to GitHub Pages, it will be accessible at this URL
  const pptxFileName = 'project-presentation.pptx';
  const siteUrl = 'hhttps://partners.uwo-drugchecking.ca/'; // Update this to your actual deployed URL
  const pptxUrl = `${siteUrl}/${pptxFileName}`;
  const embedUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(pptxUrl)}`;
  
  return (
    <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden mb-8">
      <div 
        className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4 cursor-pointer flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="flex items-center gap-2 font-bold text-2xl">
          <Presentation size={28} />
          Project Overview Presentation
        </h2>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(!isFullscreen);
              }}
              className="p-2 hover:bg-purple-600 rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          )}
          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className={`bg-gradient-to-br from-white to-purple-50 ${isFullscreen ? 'fixed inset-0 z-50 p-4' : 'p-6'}`}>
          {isFullscreen && (
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-purple-900">Project Overview Presentation</h2>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
              >
                <Minimize2 size={20} className="text-purple-700" />
              </button>
            </div>
          )}
          <div className={`${isFullscreen ? 'h-[calc(100%-60px)]' : 'h-[600px]'} w-full rounded-lg overflow-hidden border-2 border-purple-200 shadow-lg`}>
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              title="Project Presentation"
              className="bg-white"
            />
          </div>
          <p className="text-sm text-purple-600 mt-3 text-center">
            Click through the slides above to view the full project presentation. 
            <a href={pptxUrl} download className="ml-2 underline hover:text-purple-800">
              Download PowerPoint
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

const ProjectPartnerDashboard = () => {
  const [expandedMetrics, setExpandedMetrics] = useState({});

  const toggleMetric = (metricId) => {
    setExpandedMetrics(prev => ({
      ...prev,
      [metricId]: !prev[metricId]
    }));
  };

  // Partner data (participationStatus removed)
  const partnersData = [
    {
      id: 1,
      nameOrganization: "Western University",
      address: "1151 Richmond Street",
      city: "London",
      prov: "ON",
      primaryContact: "Francois Lagugne-Labarthet, Primary Investigator",
      email1: "flagugne@uwo.ca",
      phone1: "519-661-2111 x81006",
      additionalContact: "Cameron Brown, Project Manager",
      email2: "cbrown58@uwo.ca",
      phone2: "226-238-9970",
      devicesAssigned: "1",
      deviceSerial1: "K8N6986DMRFD",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      lat: 42.9849,
      lng: -81.2453,
      isLead: true
    },
    {
      id: 2,
      nameOrganization: "Regional HIV/AIDS Connection (RHAC)",
      address: "446 York Street",
      city: "London",
      prov: "ON",
      primaryContact: "Megan Van Boheemen",
      email1: "mvanboheemen@hivaidsconnection.ca",
      phone1: "226-377-8721",
      additionalContact: "Donovan Wiebe",
      email2: "DWiebe@hivaidsconnection.ca",
      phone2: "519-434-1601",
      devicesAssigned: "1",
      deviceSerial1: "RNSR8R6DMWFD",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      lat: 42.9835,
      lng: -81.2497
    },
    {
      id: 3,
      nameOrganization: "Sandy Hill Community Health Centre",
      address: "221 Nelson Street",
      city: "Ottawa",
      prov: "ON",
      primaryContact: "Dean Dewar",
      email1: "ddewar@sandyhillchc.on.ca",
      phone1: "613-795-8985",
      additionalContact: "Fiona Miller",
      email2: "fmiller@sandyhillchc.on.ca",
      phone2: "613-277-8932",
      devicesAssigned: "1",
      deviceSerial1: "J6N29H27GMFE",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      lat: 45.4215,
      lng: -75.6972
    },
    {
      id: 4,
      nameOrganization: "Ottawa Inner City Health",
      address: "5 Myrand Ave",
      city: "Ottawa",
      prov: "ON",
      primaryContact: "Louise Beaudoin",
      email1: "lbeaudoin@oich.ca",
      phone1: "613-797-7514",
      additionalContact: "Chad Bouthillier",
      email2: "cbouthillier@oich.ca",
      phone2: "613-709-9656",
      devicesAssigned: "1",
      deviceSerial1: "WG5TSW6DJ8FD",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      lat: 45.4235,
      lng: -75.6919
    },
    {
      id: 5,
      nameOrganization: "Lower Mainland Purpose Society",
      address: "40 Begbie Street",
      city: "New Westminster",
      prov: "BC",
      primaryContact: "Lynda Fletcher-Gordon",
      email1: "lyndafg@purposesociety.org",
      phone1: "604-526-2522",
      additionalContact: "Jasmine Kaur",
      email2: "jasmine.kaur@purposesociety.org",
      phone2: "236-883-5584",
      devicesAssigned: "1",
      deviceSerial1: "NN619S6174FD",
      exemptionType1: "Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      lat: 49.2057,
      lng: -122.9110
    },
    {
      id: 6,
      nameOrganization: "County of Grey",
      address: "595 9th Avenue East",
      city: "Owen Sound",
      prov: "ON",
      primaryContact: "Kevin McNab",
      email1: "kevin.mcnab@grey.ca",
      phone1: "519-379-0279",
      additionalContact: "Teresa Tibbo",
      email2: "Teresa.Tibbo@grey.ca",
      phone2: "519-379-8743",
      devicesAssigned: "1",
      deviceSerial1: "WBGVJXPMPGFE",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "Mobile",
      lat: 44.5667,
      lng: -80.9333
    },
    {
      id: 7,
      nameOrganization: "Guelph Community Health Centre",
      address: "176 Wyndham Street North",
      city: "Guelph",
      prov: "ON",
      primaryContact: "Lindsey Sodtke",
      email1: "lsodtke@guephchc.ca",
      phone1: "519-821-6638 Ext302",
      additionalContact: "Cristiane Kraft",
      email2: "ckraft@guelphchc.ca",
      phone2: "519-821-6638 Ext341",
      devicesAssigned: "1",
      deviceSerial1: "77MTFY4YFGFD",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      lat: 43.5448,
      lng: -80.2482
    },
    {
      id: 8,
      nameOrganization: "Sanguen Health Centre",
      address: "150 Duke Street West",
      city: "Kitchener",
      prov: "ON",
      primaryContact: "Leigh Wardlaw",
      email1: "l.wardlaw@sanguen.com",
      phone1: "226-789-5250",
      additionalContact: "Violet Umanetz",
      email2: "v.umanetz@sanguen.com",
      phone2: "519-547-7222",
      devicesAssigned: "1",
      deviceSerial1: "MZ9Z78P25MFD",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "Mobile",
      lat: 43.4516,
      lng: -80.4925
    },
    {
      id: 9,
      nameOrganization: "Moyo Health",
      address: "7700 Hurontario St. #601",
      city: "Brampton",
      prov: "ON",
      primaryContact: "Jillian Watkins",
      email1: "jillianw@moyohcs.ca",
      phone1: "905-361-0523 x215",
      additionalContact: "Adam Chalcraft",
      email2: "adamc@moyohcs.ca",
      phone2: "905-781-0223",
      devicesAssigned: "1",
      deviceSerial1: "GWAPGCKM2GFE",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      lat: 43.7315,
      lng: -79.7624
    },
    {
      id: 10,
      nameOrganization: "Hamilton Urban Core Community Health Centre",
      address: "70 St. James Street South",
      city: "Hamilton",
      prov: "ON",
      primaryContact: "Sandy Ezepue",
      email1: "ezepues@hucchc.com",
      phone1: "905-522-3233 Ext246",
      additionalContact: "Tiffany Toplin",
      email2: "ttoplin@hucchc.com",
      phone2: "905-522-3233 Ext238",
      devicesAssigned: "1",
      deviceSerial1: "M2XWE5PD6RFP",
      exemptionType1: "Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      lat: 43.2557,
      lng: -79.8711
    },
    {
      id: 11,
      nameOrganization: "Positive Living Niagara",
      address: "120 Queenston St",
      city: "St. Catharines",
      prov: "ON",
      primaryContact: "Talia Storm",
      email1: "tstorm@positivelivingniagra.com",
      phone1: "905-984-8684 Ext128",
      additionalContact: "Myrtle Stage",
      email2: "mstage@positivelivingniagra.com",
      phone2: "905-984-8684 Ext312",
      devicesAssigned: "2",
      deviceSerial1: "WCFY6P4Y4GFD",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "T9BHV6NGWWFF",
      exemptionType2: "Mobile",
      lat: 43.1594,
      lng: -79.2469,
      hasBothExemptions: true
    },
    {
      id: 12,
      nameOrganization: "Ensemble Moncton",
      address: "80 Weldon Street",
      city: "Moncton",
      prov: "NB",
      primaryContact: "Scott Phipps",
      email1: "sphipps@ensemblegm.ca",
      phone1: "506-859-9616",
      additionalContact: "Josue Goguen",
      email2: "jgoguen@ensemblegm.ca",
      phone2: "506-227-6416",
      devicesAssigned: "2",
      deviceSerial1: "P9E4A2059MFG",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "GWPFIRNGX8FF",
      exemptionType2: "Mobile",
      lat: 46.0878,
      lng: -64.7782,
      hasBothExemptions: true
    },
    {
      id: 13,
      nameOrganization: "Prairie Harm Reduction",
      address: "1516 20th St W",
      city: "Saskatoon",
      prov: "SK",
      primaryContact: "Kayla DeMong",
      email1: "admin@prairiehr.ca",
      phone1: "306-242-5005 Ext 4",
      additionalContact: "Julene Rawson",
      email2: "operations@prairiehr.ca",
      phone2: "306-242-5005 Ext4",
      devicesAssigned: "1",
      deviceSerial1: "C2Q1MR2JT8FG",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      lat: 52.1332,
      lng: -106.6700
    },
    {
      id: 14,
      nameOrganization: "Cochrane District Paramedic Service",
      address: "500 Algonquin Blvd East",
      city: "Timmins",
      prov: "ON",
      primaryContact: "Seamus Murphy",
      email1: "seamus.murphy@cdsb.care",
      phone1: "705-268-772 x296",
      additionalContact: "Chantal Riva",
      email2: "Chantal.riva@cdsb.care",
      phone2: "705-268-722 x150",
      devicesAssigned: "1",
      deviceSerial1: "56KBC7GT14FG",
      exemptionType1: "Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      lat: 48.4758,
      lng: -81.3304
    },
    {
      id: 15,
      nameOrganization: "Renfrew Paramedic Services",
      address: "450 O'Brien Rd",
      city: "Renfrew",
      prov: "ON",
      primaryContact: "Stephanie Rose",
      email1: "SRose@countyofrenfrew.on.ca",
      phone1: "613-818-9813",
      additionalContact: "TBD",
      email2: "TBD",
      phone2: "TBD",
      devicesAssigned: "1",
      deviceSerial1: "7CQDZFGT2GFG",
      exemptionType1: "Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      lat: 45.4729,
      lng: -76.6867
    },
    {
      id: 16,
      nameOrganization: "Peterborough AIDS Resource Network",
      address: "60 Hunter St E 2nd Floor",
      city: "Peterborough",
      prov: "ON",
      primaryContact: "Dane Record",
      email1: "executivedirector@parn.ca",
      phone1: "705-559-0656",
      additionalContact: "Aizha Polluck",
      email2: "aizha@parn.ca",
      phone2: "705-749-9110 Ext206",
      devicesAssigned: "1",
      deviceSerial1: "F4FDTFNGWRFF",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      lat: 44.3091,
      lng: -78.3197
    },
    {
      id: 17,
      nameOrganization: "Travailderue",
      address: "221 Rue Tessier",
      city: "Chicoutimi",
      prov: "QC",
      primaryContact: "Stephanie Bouchard",
      email1: "stephanie.bouchard@strchic.com",
      phone1: "418-545-0999",
      additionalContact: "Janick Meunier",
      email2: "janick.meunier@strchic.com",
      phone2: "418-545-0999",
      devicesAssigned: "1",
      deviceSerial1: "ATPBJ8JJT8FG",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      lat: 48.4284,
      lng: -71.0649
    },
    {
      id: 18,
      nameOrganization: "NHC Society",
      address: "76 Esplanade",
      city: "Truro",
      prov: "NS",
      primaryContact: "Alana Weatherbee",
      email1: "support@nhcsociety.ca",
      phone1: "902-895-0931",
      additionalContact: "Albert McNutt",
      email2: "super@nhcsociety.ca",
      phone2: "902-895-0931",
      devicesAssigned: "1",
      deviceSerial1: "W54DM9GT2GFG",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      lat: 45.3669,
      lng: -63.2755
    },
    {
      id: 19,
      nameOrganization: "Breakaway",
      address: "21 Strickland Ave",
      city: "Toronto",
      prov: "ON",
      primaryContact: "Ruben Tarajano",
      email1: "Rubent@breakawaycs.ca",
      phone1: "647-883-1135",
      additionalContact: "Angie Porter",
      email2: "AngieP@breakawaycs.ca",
      phone2: "416-537-9346 Ext235",
      devicesAssigned: "1",
      deviceSerial1: "88X7YQ625MFP",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      lat: 43.6532,
      lng: -79.3832
    },
    {
      id: 20,
      nameOrganization: "AIDS New Brunswick",
      address: "354 King St",
      city: "Fredericton",
      prov: "NB",
      primaryContact: "Linda Thompson-Brown",
      email1: "linda@aidsnb.com",
      phone1: "506-455-2625",
      additionalContact: "Jess Gionet",
      email2: "Jess.gionet@aidsnb.com",
      phone2: "506-478-4765",
      devicesAssigned: "1",
      deviceSerial1: "8JF8TA2JT8FG",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      lat: 45.9636,
      lng: -66.6431
    },
    {
      id: 21,
      nameOrganization: "Avenue B Harm Reduction Inc.",
      address: "62 Waterloo St",
      city: "Saint John",
      prov: "NB",
      primaryContact: "Laura MacNeill",
      email1: "laura.macneill@avenueb.ca",
      phone1: "506-652-2437",
      additionalContact: "Allie Myles",
      email2: "allie.myles@avenueb.ca",
      phone2: "506-652-2437",
      devicesAssigned: "1",
      deviceSerial1: "65Q11N2JT8FG",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "Mobile",
      lat: 45.2733,
      lng: -66.0633
    },
    {
      id: 22,
      nameOrganization: "Boyle Street Service Society",
      address: "#201, 14065 Victoria Trail",
      city: "Edmonton",
      prov: "AB",
      primaryContact: "Sindi Addorisio",
      email1: "saddorisio@boylestreet.org",
      phone1: "587-340-2985",
      additionalContact: "Marliss Taylor",
      email2: "MTaylor@boylestreet.org",
      phone2: "708-915-2209",
      devicesAssigned: "1",
      deviceSerial1: "TBD",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      lat: 53.5461,
      lng: -113.4938
    }
  ];

  // Get sites by province
  const getSitesByProvince = () => {
    const byProvince = {};
    partnersData.forEach(site => {
      if (!byProvince[site.prov]) byProvince[site.prov] = [];
      byProvince[site.prov].push(site.nameOrganization);
    });
    return byProvince;
  };

  const sitesByProvince = getSitesByProvince();

  // Get mobile exemption sites (including those with both)
  const getMobileSites = () => {
    return partnersData.filter(site => 
      site.exemptionType1 === "Mobile" || site.exemptionType2 === "Mobile"
    );
  };

  // Get non-mobile exemption sites (including those with both)
  const getNonMobileSites = () => {
    return partnersData.filter(site => 
      site.exemptionType1 === "Non-Mobile" || site.exemptionType2 === "Non-Mobile"
    );
  };

  const getStatistics = () => {
    const provinces = [...new Set(partnersData.map(s => s.prov))];
    const totalDevices = partnersData.reduce((sum, s) => sum + parseInt(s.devicesAssigned), 0);

    return {
      totalPartners: partnersData.length,
      provinces,
      totalDevices,
      mobileSites: getMobileSites(),
      nonMobileSites: getNonMobileSites()
    };
  };

  const stats = getStatistics();

  const ProjectTimeline = () => {
    const today = new Date();
    const projectStart = new Date('2024-04-01');
    const projectEnd = new Date('2028-03-31');
    const hcStart = new Date('2022-01-01');
    const hcEnd = new Date('2028-03-31');
    
    const totalDays = (projectEnd - projectStart) / (1000 * 60 * 60 * 24);
    const daysPassed = (today - projectStart) / (1000 * 60 * 60 * 24);
    const progressPercent = Math.min(Math.max((daysPassed / totalDays) * 100, 0), 100);
    
    // For HC timeline
    const hcTotalDays = (hcEnd - hcStart) / (1000 * 60 * 60 * 24);
    const hcDaysPassed = (today - hcStart) / (1000 * 60 * 60 * 24);
    const hcProgressPercent = Math.min(Math.max((hcDaysPassed / hcTotalDays) * 100, 0), 100);
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    return (
      <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4">
          <h2 className="flex items-center gap-2 font-bold text-2xl">
            <Clock size={28} />
            Project Background & Timeline
          </h2>
        </div>
        <div className="p-6 bg-gradient-to-br from-white to-purple-50">
          <div className="relative">
            {/* Part 1: Drug Checking Technology Challenge */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                Drug Checking Technology Challenge (2018-2021)
                <a href="https://impact.canada.ca/en/challenges/drug-checking-challenge" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800">
                  <ExternalLink size={18} />
                </a>
              </h3>
              <div className="relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-purple-600 to-purple-800 transform -translate-y-1/2"></div>
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-purple-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                
                <div className="relative flex justify-between items-center py-8">
                  {/* 2018 */}
                  <div className="flex flex-col items-center">
                    <div className="bg-purple-600 text-white font-bold text-lg px-4 py-2 rounded-full shadow-lg mb-2">2018</div>
                    <div className="w-4 h-4 bg-purple-600 rounded-full border-4 border-white shadow-lg"></div>
                    <div className="mt-4 bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl shadow-lg border-2 border-purple-300 max-w-[180px] text-center">
                      <div className="font-bold text-purple-900 text-sm">Challenge Launched</div>
                      <div className="text-xs text-purple-700 mt-1">October 2018</div>
                      <div className="text-xs text-purple-600 mt-1">Impact Canada Initiative</div>
                      <div className="text-xs text-purple-600">Health Canada<MapleLeaf /></div>
                    </div>
                  </div>

                  {/* 2019 */}
                  <div className="flex flex-col items-center">
                    <div className="mb-4 bg-gradient-to-br from-gray-100 to-gray-200 p-3 rounded-xl shadow-lg border-2 border-gray-300 max-w-[150px] text-center">
                      <div className="font-bold text-gray-800 text-sm">Application Deadline</div>
                    </div>
                    <div className="w-4 h-4 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div>
                    <div className="bg-purple-500 text-white font-bold text-lg px-4 py-2 rounded-full shadow-lg mt-2">2019</div>
                  </div>

                  {/* 2020 */}
                  <div className="flex flex-col items-center">
                    <div className="bg-purple-500 text-white font-bold text-lg px-4 py-2 rounded-full shadow-lg mb-2">2020</div>
                    <div className="w-4 h-4 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div>
                    <div className="mt-4 bg-gradient-to-br from-gray-100 to-gray-200 p-3 rounded-xl shadow-lg border-2 border-gray-300 max-w-[150px] text-center">
                      <div className="font-bold text-gray-800 text-sm">Pilot-Phase</div>
                    </div>
                  </div>

                  {/* 2021 - Winner */}
                  <div className="flex flex-col items-center">
                    <div className="mb-4 bg-gradient-to-br from-yellow-100 to-yellow-200 p-3 rounded-xl shadow-lg border-2 border-yellow-400 max-w-[220px] text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Trophy className="text-yellow-600" size={16} />
                        <span className="font-bold text-yellow-800 text-sm">Scatr Wins!</span>
                        <a href="https://www.canada.ca/en/health-canada/news/2021/07/government-of-canada-announces-the-grand-prize-winner-of-the-drug-checking-technology-challenge.html" target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:text-yellow-800">
                          <ExternalLink size={14} />
                        </a>
                      </div>
                      <div className="text-xs text-yellow-700">Government of Canada announces Scatr as the grand prize winner</div>
                      <div className="text-xs font-bold text-yellow-800 mt-1">$1,000,000 Prize</div>
                    </div>
                    <div className="w-6 h-6 bg-yellow-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                      <Trophy className="text-white" size={12} />
                    </div>
                    <div className="bg-purple-700 text-white font-bold text-lg px-4 py-2 rounded-full shadow-lg mt-2">2021</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Part 2: Health Canada Contribution Agreements with We Are Here */}
            <div className="mt-8 mb-8">
              <h3 className="text-xl font-bold text-purple-900 mb-4">Health Canada<MapleLeaf size={16} /> Contribution Agreements (2022-2028)</h3>
              <div className="relative pt-12">
                {/* We Are Here marker for HC timeline */}
                <div 
                  className="absolute top-0 flex flex-col items-center z-10"
                  style={{ left: `${hcProgressPercent}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-2 py-1 rounded-lg shadow-lg text-xs font-bold whitespace-nowrap">
                    We Are Here
                  </div>
                  <div className="text-xs text-green-700 font-medium whitespace-nowrap">
                    {formatDate(today)}
                  </div>
                  <div className="w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-green-500"></div>
                  <div className="w-0.5 h-4 bg-green-500"></div>
                </div>

                <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-purple-600 to-purple-800"></div>
                <div className="absolute right-0 top-12 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-purple-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                
                <div className="relative flex justify-between items-start pt-8" style={{ marginTop: '8px' }}>
                  {/* 2022 */}
                  <div className="flex flex-col items-center">
                    <div className="bg-purple-600 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg mb-2">2022</div>
                    <div className="w-4 h-4 bg-purple-600 rounded-full border-4 border-white shadow-lg"></div>
                    <div className="mt-4 bg-gradient-to-br from-purple-100 to-purple-200 p-2 rounded-xl shadow-lg border-2 border-purple-300 max-w-[140px] text-center">
                      <div className="font-bold text-purple-900 text-xs">Phase #1</div>
                      <div className="text-xs text-purple-700 mt-1 font-medium">Contribution Agreement</div>
                      <div className="text-xs text-purple-600 mt-1">Drug Checking Network Using ML Spectrometers</div>
                      <div className="flex items-center justify-center mt-1">
                        <span className="text-xs bg-red-100 text-red-700 px-1 py-0.5 rounded">Health Canada<MapleLeaf size={10} /></span>
                      </div>
                    </div>
                  </div>

                  {/* 2023 */}
                  <div className="flex flex-col items-center">
                    <div className="bg-purple-500 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg mb-2">2023</div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div>
                  </div>

                  {/* 2024 */}
                  <div className="flex flex-col items-center">
                    <div className="mb-2 bg-gradient-to-br from-purple-200 to-purple-300 p-2 rounded-xl shadow-lg border-2 border-purple-400 max-w-[140px] text-center">
                      <div className="font-bold text-purple-900 text-xs">Phase #2</div>
                      <div className="text-xs text-purple-700 mt-1 font-medium">Contribution & Amending</div>
                      <div className="text-xs text-purple-600 mt-1">PWLLE at Forefront of Drug Checking</div>
                      <div className="flex items-center justify-center mt-1">
                        <span className="text-xs bg-red-100 text-red-700 px-1 py-0.5 rounded">Health Canada<MapleLeaf size={10} /></span>
                      </div>
                    </div>
                    <div className="w-4 h-4 bg-purple-600 rounded-full border-4 border-white shadow-lg"></div>
                    <div className="bg-purple-600 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg mt-2">2024</div>
                    <div className="mt-2 bg-gray-50 p-1 rounded border border-gray-200 max-w-[130px] text-center opacity-60">
                      <div className="text-gray-500 text-xs">The Community Care and Recovery Act, 2024 (the "CCRA") received Royal Assent on December 4, 2024.</div>
                    </div>
                  </div>

                  {/* 2025 */}
                  <div className="flex flex-col items-center">
                    <div className="bg-purple-500 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg mb-2">2025</div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div>
                  </div>

                  {/* 2026 */}
                  <div className="flex flex-col items-center">
                    <div className="bg-purple-500 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg mb-2">2026</div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div>
                  </div>

                  {/* 2027 */}
                  <div className="flex flex-col items-center">
                    <div className="bg-purple-500 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg mb-2">2027</div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div>
                  </div>

                  {/* 2028 */}
                  <div className="flex flex-col items-center">
                    <div className="bg-purple-800 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg mb-2">2028</div>
                    <div className="w-4 h-4 bg-purple-800 rounded-full border-4 border-white shadow-lg"></div>
                    <div className="mt-4 bg-gradient-to-br from-purple-100 to-purple-200 p-2 rounded-xl shadow-lg border-2 border-purple-300 max-w-[100px] text-center">
                      <div className="font-bold text-purple-900 text-xs">Project End</div>
                      <div className="text-xs text-purple-600">Mar 31, 2028</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Part 3: Fiscal Year Timeline */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-purple-900 mb-4">Project Fiscal Years (April 1, 2024 - March 31, 2028)</h3>
              <div className="relative pt-16 pb-8">
                <div 
                  className="absolute top-0 flex flex-col items-center z-10"
                  style={{ left: `${progressPercent}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-bold whitespace-nowrap">
                    We Are Here
                  </div>
                  <div className="text-xs text-green-700 font-medium mt-1 whitespace-nowrap">
                    {formatDate(today)}
                  </div>
                  <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-green-500 mt-1"></div>
                  <div className="w-1 h-8 bg-green-500"></div>
                </div>

                <div className="relative h-16 bg-gray-200 rounded-full overflow-hidden shadow-inner mt-8">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-l-full"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                  
                  <div className="absolute inset-0 flex">
                    <div className="flex-1 border-r-2 border-white flex items-center justify-center">
                      <div className="text-center">
                        <div className="font-bold text-purple-900 text-sm">Fiscal Year 1</div>
                        <div className="text-xs text-purple-700">Apr 1, 2024 - Mar 31, 2025</div>
                      </div>
                    </div>
                    <div className="flex-1 border-r-2 border-white flex items-center justify-center">
                      <div className="text-center">
                        <div className="font-bold text-purple-900 text-sm">Fiscal Year 2</div>
                        <div className="text-xs text-purple-700">Apr 1, 2025 - Mar 31, 2026</div>
                      </div>
                    </div>
                    <div className="flex-1 border-r-2 border-white flex items-center justify-center">
                      <div className="text-center">
                        <div className="font-bold text-purple-900 text-sm">Fiscal Year 3</div>
                        <div className="text-xs text-purple-700">Apr 1, 2026 - Mar 31, 2027</div>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="font-bold text-purple-900 text-sm">Fiscal Year 4</div>
                        <div className="text-xs text-purple-700">Apr 1, 2027 - Mar 31, 2028</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-2">
                  <div className="text-center">
                    <div className="font-bold text-purple-800 text-sm">Project Start</div>
                    <div className="text-xs text-purple-600">April 1, 2024</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-purple-800 text-sm">Project End</div>
                    <div className="text-xs text-purple-600">March 31, 2028</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SiteDetails = ({ site }) => {
    return (
      <div className="text-sm space-y-1">
        <div className="font-bold text-purple-900 text-base mb-2">{site.nameOrganization}</div>
        <div><span className="font-semibold">Address:</span> {site.address}, {site.city}, {site.prov}</div>
        <div><span className="font-semibold">Primary Contact:</span> {site.primaryContact}</div>
        <div><span className="font-semibold">Email:</span> {site.email1}</div>
        <div><span className="font-semibold">Phone:</span> {site.phone1}</div>
        <div><span className="font-semibold">Additional Contact:</span> {site.additionalContact}</div>
        <div><span className="font-semibold">Email:</span> {site.email2}</div>
        <div><span className="font-semibold">Phone:</span> {site.phone2}</div>
        <div><span className="font-semibold">Devices Assigned:</span> {site.devicesAssigned}</div>
        <div><span className="font-semibold">Device Serial #1:</span> {site.deviceSerial1}</div>
        <div><span className="font-semibold">Exemption Type #1:</span> {site.exemptionType1}</div>
        {site.deviceSerial2 !== "NA" && (
          <>
            <div><span className="font-semibold">Device Serial #2:</span> {site.deviceSerial2}</div>
            <div><span className="font-semibold">Exemption Type #2:</span> {site.exemptionType2}</div>
          </>
        )}
      </div>
    );
  };

  const MapView = () => {
    return (
      <div className="h-[600px] rounded-xl overflow-hidden shadow-2xl border-4 border-purple-200 relative">
        <MapContainer center={[52.0, -95.0]} zoom={4} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ResetMapButton />
          {partnersData.map((site) => (
            <Marker key={site.id} position={[site.lat, site.lng]}>
              <Tooltip permanent direction="top" offset={[0, -10]} className="font-semibold text-xs">
                {site.nameOrganization.length > 25 ? site.nameOrganization.substring(0, 22) + '...' : site.nameOrganization}
              </Tooltip>
              <Popup maxWidth={350}>
                <SiteDetails site={site} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    );
  };

  const TableView = () => {
    return (
      <div className="space-y-4">
        <div className="p-5 bg-gradient-to-r from-purple-100 to-purple-50 rounded-xl shadow-inner border-2 border-purple-200">
          <p className="text-sm text-gray-800 leading-relaxed">
            These {stats.totalPartners} sites represent the culmination of the project's <span className="font-semibold text-purple-900">Fiscal Year 2</span> (April 1st, 2025 to March 31st, 2026). 
            There are 2 remaining fiscal years: <span className="font-semibold text-purple-900">Fiscal Year 3</span> (April 1st, 2026 to March 31st, 2027) and <span className="font-semibold text-purple-900">Fiscal Year 4</span> (April 1st, 2027 to March 31st, 2028). 
            Each of which will have <span className="font-semibold text-purple-900">2 vacancies</span> for additional sites and/or device allocations. 
            Therefore there are <span className="font-semibold text-purple-900">4 total project partner vacancies and/or device allocations</span> remaining from <span className="font-semibold text-purple-900">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span> until project end, <span className="font-semibold text-purple-900">March 31st, 2028</span>.
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl shadow-2xl border-4 border-purple-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-purple-700 to-purple-900 text-white">
                <th className="border border-purple-300 p-2 text-left font-bold">Name/Organization</th>
                <th className="border border-purple-300 p-2 text-left font-bold">Address</th>
                <th className="border border-purple-300 p-2 text-left font-bold">City</th>
                <th className="border border-purple-300 p-2 text-left font-bold">Prov</th>
                <th className="border border-purple-300 p-2 text-left font-bold">Primary Contact</th>
                <th className="border border-purple-300 p-2 text-left font-bold">Email</th>
                <th className="border border-purple-300 p-2 text-left font-bold">Phone</th>
                <th className="border border-purple-300 p-2 text-left font-bold">Additional Contact</th>
                <th className="border border-purple-300 p-2 text-left font-bold">Email</th>
                <th className="border border-purple-300 p-2 text-left font-bold">Phone</th>
                <th className="border border-purple-300 p-2 text-left font-bold">Devices</th>
                <th className="border border-purple-300 p-2 text-left font-bold">Serial #1</th>
                <th className="border border-purple-300 p-2 text-left font-bold">Type #1</th>
                <th className="border border-purple-300 p-2 text-left font-bold">Serial #2</th>
                <th className="border border-purple-300 p-2 text-left font-bold">Type #2</th>
              </tr>
            </thead>
            <tbody>
              {partnersData.map((site, idx) => (
                <tr 
                  key={site.id} 
                  className={`${site.isLead ? 'bg-purple-200 border-4 border-purple-600' : idx % 2 === 0 ? 'bg-purple-50 hover:bg-purple-100' : 'bg-white hover:bg-purple-50'}`}
                >
                  <td className={`border border-purple-200 p-2 font-bold text-purple-900 ${site.isLead ? 'text-base' : ''}`}>{site.nameOrganization}</td>
                  <td className="border border-purple-200 p-2 font-medium">{site.address}</td>
                  <td className="border border-purple-200 p-2 font-medium">{site.city}</td>
                  <td className="border border-purple-200 p-2 font-medium">{site.prov}</td>
                  <td className="border border-purple-200 p-2 font-medium">{site.primaryContact}</td>
                  <td className="border border-purple-200 p-2 font-medium text-blue-700">{site.email1}</td>
                  <td className="border border-purple-200 p-2 font-medium">{site.phone1}</td>
                  <td className="border border-purple-200 p-2 font-medium">{site.additionalContact}</td>
                  <td className="border border-purple-200 p-2 font-medium text-blue-700">{site.email2}</td>
                  <td className="border border-purple-200 p-2 font-medium">{site.phone2}</td>
                  <td className="border border-purple-200 p-2 font-bold text-center">{site.devicesAssigned}</td>
                  <td className="border border-purple-200 p-2 font-mono text-xs">{site.deviceSerial1}</td>
                  <td className="border border-purple-200 p-2 font-medium">{site.exemptionType1}</td>
                  <td className="border border-purple-200 p-2 font-mono text-xs">{site.deviceSerial2}</td>
                  <td className="border border-purple-200 p-2 font-medium">{site.exemptionType2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const RelatedLinks = () => (
    <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-purple-100">
      <div className="flex items-center gap-3 mb-6">
        <ExternalLink className="text-purple-700" size={32} />
        <h2 className="font-bold text-2xl text-purple-900">Related Links & Resources</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border-2 border-purple-200">
          <a href="https://news.westernu.ca/2023/04/health-canada-grant-funds-innovative-drug-checking-technology/" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-2 mb-2">
            Western News: Health Canada<MapleLeaf /> Grant Announcement
            <ExternalLink size={16} />
          </a>
          <p className="text-sm text-gray-700">Chemistry professor Francois Lagugné-Labarthet teams up with startup SCATR Inc. to pilot drug-checking technology at safe consumption sites across Canada. The SUAP-funded initiative deploys Raman spectroscopy devices that can analyze street drugs in under fifteen minutes, helping users make informed decisions about their substance use.</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border-2 border-purple-200">
          <a href="https://scatr.ca/auth" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-2 mb-2">
            Scatr Portal (Partner Login)
            <ExternalLink size={16} />
          </a>
          <p className="text-sm text-gray-700">Secure login portal for project partners to access the Scatr drug-checking data management system. Partners can view scan results, access real-time data analytics, and manage their device information.</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border-2 border-purple-200">
          <a href="https://scatr.live/" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-2 mb-2">
            Scatr Live Dashboard
            <ExternalLink size={16} />
          </a>
          <p className="text-sm text-gray-700">Public-facing dashboard providing real-time insights into drug-checking results across the network. View aggregated data on substance composition trends and alerts across participating harm reduction sites.</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border-2 border-purple-200">
          <a href="https://impact.canada.ca/en/challenges/drug-checking-challenge" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-2 mb-2">
            Impact Canada - Drug Checking Challenge
            <ExternalLink size={16} />
          </a>
          <p className="text-sm text-gray-700">Official Government of Canada page for the Drug Checking Technology Challenge that launched the Scatr initiative. Learn about the challenge's origins, objectives, and how it aimed to develop innovative solutions to address the toxic drug supply crisis.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-800 text-white p-6 shadow-2xl">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-2">
            <Award size={40} />
            <h1 className="text-2xl font-bold">The University of Western Ontario - A Novel Two Phase Drug-Checking Initiative: Contribution Agreement Funding Provided by Health Canada's<MapleLeaf size={16} /> Substance Use and Addictions Program</h1>
          </div>
          <p className="text-lg flex items-center justify-center gap-2">
            <Users size={20} />
            In partnership with <span className="text-sky-300 font-bold">Scatr Inc</span>
          </p>
        </div>
      </div>

      {/* Dashboard Title */}
      <div className="text-center py-6 bg-gradient-to-r from-purple-50 to-white">
        <h2 className="text-3xl font-bold text-purple-900">
          Interactive Project Partner Dashboard
        </h2>
      </div>

      {/* Introduction Paragraph */}
      <div className="px-6 pb-4">
        <div className="bg-gradient-to-br from-purple-100 to-white p-6 rounded-2xl shadow-lg border-2 border-purple-200">
          <p className="text-gray-800 leading-relaxed">
            Welcome to the Project Partner Dashboard — a centralized platform designed to provide all project partners with comprehensive visibility into the network's infrastructure, facilitate communication and collaboration across sites, and serve as a resource hub for project-related information. 
          </p>
          <p className="text-gray-800 leading-relaxed mt-3">
            As of September 2025, Western University's <em>"Leading the Way: PWLLE at the Forefront of Drug-Checking Initiatives"</em> project, funded through Health Canada's<MapleLeaf /> Substance Use and Addictions Program (SUAP), has successfully deployed <strong>23 spectrometers</strong> to <strong>22 harm reduction sites</strong> across Canada, with 1 additional device scheduled for delivery within the next 30 days. Looking ahead, the project aims to deploy 4 more spectrometers by March 2028 (2 in FY3 and 2 in FY4), bringing the total network capacity to <strong>28 devices</strong>. To date, <strong>24 of 28 total planned devices</strong> have been assigned.
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Project Timeline */}
        <ProjectTimeline />

        {/* Project Presentation */}
        <PowerPointViewer />

        {/* Map View */}
        <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4">
            <h2 className="flex items-center gap-2 font-bold text-2xl">
              <MapPin size={28} />
              Interactive Map View of Project Partner Sites (Click on Site Location for Information)
            </h2>
          </div>
          <div className="p-6 bg-gradient-to-br from-white to-purple-50">
            <MapView />
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4">
            <h2 className="flex items-center gap-2 font-bold text-2xl">
              <List size={28} />
              Table View
            </h2>
          </div>
          <div className="p-6 bg-gradient-to-br from-white to-purple-50">
            <TableView />
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <Award className="text-purple-700" size={32} />
            <h2 className="font-bold text-2xl text-purple-900">Summary Metrics</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total Partners */}
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-5 rounded-xl shadow-lg border-2 border-purple-300 hover:shadow-2xl transition-shadow cursor-pointer"
                 onClick={() => toggleMetric('total')}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-900">{stats.totalPartners}</div>
                  <div className="text-sm text-purple-700 font-medium mt-1">Total Partner Sites</div>
                </div>
                {expandedMetrics.total ? <ChevronUp className="text-purple-700" /> : <ChevronDown className="text-purple-700" />}
              </div>
              {expandedMetrics.total && (
                <div className="mt-3 pt-3 border-t border-purple-300 text-xs text-purple-800 space-y-1">
                  {partnersData.map(site => (
                    <div key={site.id}>• {site.nameOrganization}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Total Devices */}
            <div className="bg-gradient-to-br from-purple-200 to-purple-300 p-5 rounded-xl shadow-lg border-2 border-purple-400 hover:shadow-2xl transition-shadow">
              <div className="text-3xl font-bold text-purple-900">{stats.totalDevices} <span className="text-lg font-normal">(of 28 total)</span></div>
              <div className="text-sm text-purple-700 font-medium mt-1">Devices Assigned</div>
            </div>

            {/* Provinces */}
            <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-5 rounded-xl shadow-lg border-2 border-indigo-300 hover:shadow-2xl transition-shadow cursor-pointer"
                 onClick={() => toggleMetric('provinces')}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-indigo-900">{stats.provinces.length}</div>
                  <div className="text-sm text-indigo-700 font-medium mt-1">Provinces/Territories</div>
                </div>
                {expandedMetrics.provinces ? <ChevronUp className="text-indigo-700" /> : <ChevronDown className="text-indigo-700" />}
              </div>
              {expandedMetrics.provinces && (
                <div className="mt-3 pt-3 border-t border-indigo-300 text-xs text-indigo-800 space-y-2">
                  {Object.entries(sitesByProvince).map(([prov, sites]) => (
                    <div key={prov}>
                      <div className="font-bold">{prov} ({sites.length}):</div>
                      {sites.map((name, i) => (
                        <div key={i} className="ml-2">• {name}</div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mobile Exemptions */}
            <div className="bg-gradient-to-br from-teal-100 to-teal-200 p-5 rounded-xl shadow-lg border-2 border-teal-300 hover:shadow-2xl transition-shadow cursor-pointer"
                 onClick={() => toggleMetric('mobile')}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-teal-900">{stats.mobileSites.length}</div>
                  <div className="text-sm text-teal-700 font-medium mt-1">Mobile Exemptions</div>
                </div>
                {expandedMetrics.mobile ? <ChevronUp className="text-teal-700" /> : <ChevronDown className="text-teal-700" />}
              </div>
              {expandedMetrics.mobile && (
                <div className="mt-3 pt-3 border-t border-teal-300 text-xs text-teal-800 space-y-1">
                  {stats.mobileSites.map(site => (
                    <div key={site.id}>
                      • {site.nameOrganization}{site.hasBothExemptions ? '*' : ''}
                    </div>
                  ))}
                  <div className="mt-2 text-xs italic text-teal-600">* Site has both Mobile and Non-Mobile exemptions (2 devices, 2 exemption approvals)</div>
                </div>
              )}
            </div>

            {/* Non-Mobile Exemptions */}
            <div className="bg-gradient-to-br from-sky-100 to-sky-200 p-5 rounded-xl shadow-lg border-2 border-sky-300 hover:shadow-2xl transition-shadow cursor-pointer"
                 onClick={() => toggleMetric('nonMobile')}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-sky-900">{stats.nonMobileSites.length}</div>
                  <div className="text-sm text-sky-700 font-medium mt-1">Non-Mobile Exemptions</div>
                </div>
                {expandedMetrics.nonMobile ? <ChevronUp className="text-sky-700" /> : <ChevronDown className="text-sky-700" />}
              </div>
              {expandedMetrics.nonMobile && (
                <div className="mt-3 pt-3 border-t border-sky-300 text-xs text-sky-800 space-y-1">
                  {stats.nonMobileSites.map(site => (
                    <div key={site.id}>
                      • {site.nameOrganization}{site.hasBothExemptions ? '*' : ''}
                    </div>
                  ))}
                  <div className="mt-2 text-xs italic text-sky-600">* Site has both Mobile and Non-Mobile exemptions (2 devices, 2 exemption approvals)</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Links */}
        <RelatedLinks />
      </div>
    </div>
  );
};

export default ProjectPartnerDashboard;