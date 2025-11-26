import React, { useState } from 'react';
import { MapPin, List, X, Award, Users, FileCheck, Maximize2, Minimize2, ChevronDown, ChevronUp } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ProjectPartnerDashboard = () => {
  const [compactTable, setCompactTable] = useState(true);
  const [expandedMetrics, setExpandedMetrics] = useState({});

  const toggleMetric = (metricId) => {
    setExpandedMetrics(prev => ({
      ...prev,
      [metricId]: !prev[metricId]
    }));
  };

  // CSV data parsed into objects
  const partnersData = [
    {
      id: 1,
      participationStatus: "CURRENT",
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
      agreementStatus: "Signed",
      devicesAssigned: "1",
      deviceSerial1: "K8N6986DMRFD",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      projStartYear: "YEAR 1",
      lat: 42.9849,
      lng: -81.2453
    },
    {
      id: 2,
      participationStatus: "CURRENT",
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
      agreementStatus: "Signed",
      devicesAssigned: "1",
      deviceSerial1: "RNSR8R6DMWFD",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      projStartYear: "YEAR 1",
      lat: 42.9835,
      lng: -81.2497
    },
    {
      id: 3,
      participationStatus: "CURRENT",
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
      agreementStatus: "Signed",
      devicesAssigned: "1",
      deviceSerial1: "J6N29H27GMFE",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      projStartYear: "YEAR 1",
      lat: 45.4215,
      lng: -75.6972
    },
    {
      id: 4,
      participationStatus: "CURRENT",
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
      agreementStatus: "Signed",
      devicesAssigned: "1",
      deviceSerial1: "WG5TSW6DJ8FD",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      projStartYear: "YEAR 1",
      lat: 45.4235,
      lng: -75.6919
    },
    {
      id: 5,
      participationStatus: "CURRENT",
      nameOrganization: "Lower Mainland Purpose Society",
      address: "40 Begbie Street",
      city: "New Westminister",
      prov: "BC",
      primaryContact: "Lynda Fletcher-Gordon",
      email1: "lyndafg@purposesociety.org",
      phone1: "604-526-2522",
      additionalContact: "Jasmine Kaur",
      email2: "jasmine.kaur@purposesociety.org",
      phone2: "236-883-5584",
      agreementStatus: "Signed",
      devicesAssigned: "1",
      deviceSerial1: "NN619S6174FD",
      exemptionType1: "Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      projStartYear: "YEAR 1",
      lat: 49.2057,
      lng: -122.9110
    },
    {
      id: 6,
      participationStatus: "CURRENT",
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
      agreementStatus: "Signed",
      devicesAssigned: "1",
      deviceSerial1: "WBGVJXPMPGFE",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "Mobile",
      projStartYear: "YEAR 1",
      lat: 44.5667,
      lng: -80.9333
    },
    {
      id: 7,
      participationStatus: "CURRENT",
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
      agreementStatus: "Signed",
      devicesAssigned: "1",
      deviceSerial1: "77MTFY4YFGFD",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      projStartYear: "YEAR 1",
      lat: 43.5448,
      lng: -80.2482
    },
    {
      id: 8,
      participationStatus: "CURRENT",
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
      agreementStatus: "Signed",
      devicesAssigned: "1",
      deviceSerial1: "MZ9Z78P25MFD",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "Mobile",
      projStartYear: "YEAR 1",
      lat: 43.4516,
      lng: -80.4925
    },
    {
      id: 9,
      participationStatus: "CURRENT",
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
      agreementStatus: "Signed",
      devicesAssigned: "1",
      deviceSerial1: "GWAPGCKM2GFE",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      projStartYear: "YEAR 1",
      lat: 43.7315,
      lng: -79.7624
    },
    {
      id: 10,
      participationStatus: "CURRENT",
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
      agreementStatus: "Signed",
      devicesAssigned: "1",
      deviceSerial1: "M2XWE5PD6RFP",
      exemptionType1: "Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      projStartYear: "YEAR 1",
      lat: 43.2557,
      lng: -79.8711
    },
    {
      id: 11,
      participationStatus: "CURRENT",
      nameOrganization: "Positive Living Niagara",
      address: "120 Queenston St",
      city: "St. Catherines",
      prov: "ON",
      primaryContact: "Talia Storm",
      email1: "tstorm@positivelivingniagra.com",
      phone1: "905-984-8684 Ext128",
      additionalContact: "Myrtle Stage",
      email2: "mstage@positivelivingniagra.com",
      phone2: "905-984-8684 Ext312",
      agreementStatus: "Signed",
      devicesAssigned: "2",
      deviceSerial1: "WCFY6P4Y4GFD",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "T9BHV6NGWWFF",
      exemptionType2: "Mobile",
      projStartYear: "YEAR 1",
      lat: 43.1594,
      lng: -79.2469
    },
    {
      id: 12,
      participationStatus: "CURRENT",
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
      agreementStatus: "Signed",
      devicesAssigned: "2",
      deviceSerial1: "P9E4A2059MFG",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "GWPFIRNGX8FF",
      exemptionType2: "Mobile",
      projStartYear: "YEAR 2",
      lat: 46.0878,
      lng: -64.7782
    },
    {
      id: 13,
      participationStatus: "CURRENT",
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
      agreementStatus: "Signed",
      devicesAssigned: "1",
      deviceSerial1: "C2Q1MR2JT8FG",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      projStartYear: "YEAR 2",
      lat: 52.1332,
      lng: -106.6700
    },
    {
      id: 14,
      participationStatus: "CURRENT",
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
      agreementStatus: "Signed",
      devicesAssigned: "1",
      deviceSerial1: "56KBC7GT14FG",
      exemptionType1: "Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      projStartYear: "YEAR 2",
      lat: 48.4758,
      lng: -81.3304
    },
    {
      id: 15,
      participationStatus: "CURRENT",
      nameOrganization: "Renfrew Paramedic Services",
      address: "450 O'Brien Rd",
      city: "Renfrew",
      prov: "ON",
      primaryContact: "Stephanie Rose",
      email1: "SRose@countyofrenfrew.on.ca",
      phone1: "613-818-9813",
      additionalContact: "Required",
      email2: "Required",
      phone2: "Required",
      agreementStatus: "Signed",
      devicesAssigned: "1",
      deviceSerial1: "7CQDZFGT2GFG",
      exemptionType1: "Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      projStartYear: "YEAR 2",
      lat: 45.4729,
      lng: -76.6867
    },
    {
      id: 16,
      participationStatus: "CURRENT",
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
      agreementStatus: "Signed",
      devicesAssigned: "1",
      deviceSerial1: "F4FDTFNGWRFF",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      projStartYear: "YEAR 2",
      lat: 44.3091,
      lng: -78.3197
    },
    {
      id: 17,
      participationStatus: "CURRENT",
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
      agreementStatus: "Signed",
      devicesAssigned: "1",
      deviceSerial1: "ATPBJ8JJT8FG",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      projStartYear: "YEAR 2",
      lat: 48.4284,
      lng: -71.0649
    },
    {
      id: 18,
      participationStatus: "CURRENT",
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
      agreementStatus: "Signed",
      devicesAssigned: "1",
      deviceSerial1: "W54DM9GT2GFG",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      projStartYear: "YEAR 2",
      lat: 45.3669,
      lng: -63.2755
    },
    {
      id: 19,
      participationStatus: "CURRENT",
      nameOrganization: "Breakaway",
      address: "21 Strickland Ave",
      city: "Toronto",
      prov: "ON",
      primaryContact: "Ruben Tarajano",
      email1: "Rubent@breakawaycs.ca",
      phone1: "647-883-1135",
      additionalContact: "Required",
      email2: "Required",
      phone2: "Required",
      agreementStatus: "Signed",
      devicesAssigned: "1",
      deviceSerial1: "88X7YQ625MFP",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      projStartYear: "YEAR 2",
      lat: 43.6532,
      lng: -79.3832
    },
    {
      id: 20,
      participationStatus: "CURRENT",
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
      agreementStatus: "Signed",
      devicesAssigned: "1",
      deviceSerial1: "8JF8TA2JT8FG",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      projStartYear: "YEAR 2",
      lat: 45.9636,
      lng: -66.6431
    },
    {
      id: 21,
      participationStatus: "CURRENT",
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
      agreementStatus: "Signed",
      devicesAssigned: "1",
      deviceSerial1: "65Q11N2JT8FG",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "Mobile",
      projStartYear: "YEAR 2",
      lat: 45.2733,
      lng: -66.0633
    },
    {
      id: 22,
      participationStatus: "CURRENT",
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
      agreementStatus: "Signed",
      devicesAssigned: "1",
      deviceSerial1: "TBD",
      exemptionType1: "Non-Mobile",
      deviceSerial2: "NA",
      exemptionType2: "NA",
      projStartYear: "YEAR 2",
      lat: 53.5461,
      lng: -113.4938
    }
  ];

  const getStatistics = () => {
    const provinces = [...new Set(partnersData.map(s => s.prov))];
    const totalDevices = partnersData.reduce((sum, s) => sum + parseInt(s.devicesAssigned), 0);
    const year1Sites = partnersData.filter(s => s.projStartYear === "YEAR 1").length;
    const year2Sites = partnersData.filter(s => s.projStartYear === "YEAR 2").length;

    const exemptionType1Counts = {
      Mobile: partnersData.filter(s => s.exemptionType1 === "Mobile").length,
      NonMobile: partnersData.filter(s => s.exemptionType1 === "Non-Mobile").length
    };

    return {
      totalPartners: partnersData.length,
      provinces,
      totalDevices,
      year1Sites,
      year2Sites,
      exemptionType1Counts
    };
  };

  const stats = getStatistics();

  const SiteDetails = ({ site, onClose }) => {
    return (
      <div className="bg-white p-4 rounded-xl shadow-2xl max-w-md border-2 border-purple-200">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-purple-900">{site.nameOrganization}</h3>
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-purple-700 transition-colors">
              <X size={20} />
            </button>
          )}
        </div>
        <div className="space-y-2 text-sm max-h-80 overflow-y-auto">
          <div><span className="font-semibold text-purple-800">Participation Status:</span> {site.participationStatus}</div>
          <div><span className="font-semibold text-purple-800">Address:</span> {site.address}, {site.city}, {site.prov}</div>
          <div><span className="font-semibold text-purple-800">Primary Contact:</span> {site.primaryContact}</div>
          <div><span className="font-semibold text-purple-800">Email:</span> {site.email1}</div>
          <div><span className="font-semibold text-purple-800">Phone:</span> {site.phone1}</div>
          <div><span className="font-semibold text-purple-800">Additional Contact:</span> {site.additionalContact}</div>
          <div><span className="font-semibold text-purple-800">Email:</span> {site.email2}</div>
          <div><span className="font-semibold text-purple-800">Phone:</span> {site.phone2}</div>
          <div><span className="font-semibold text-purple-800">Agreement Status:</span> {site.agreementStatus}</div>
          <div><span className="font-semibold text-purple-800">Devices Assigned:</span> {site.devicesAssigned}</div>
          <div><span className="font-semibold text-purple-800">Device Serial #1:</span> {site.deviceSerial1}</div>
          <div><span className="font-semibold text-purple-800">Exemption Type #1:</span> {site.exemptionType1}</div>
          <div><span className="font-semibold text-purple-800">Device Serial #2:</span> {site.deviceSerial2}</div>
          <div><span className="font-semibold text-purple-800">Exemption Type #2:</span> {site.exemptionType2}</div>
          <div><span className="font-semibold text-purple-800">Project Start Year:</span> {site.projStartYear}</div>
        </div>
      </div>
    );
  };

  const MapView = () => {
    return (
      <div className="h-[600px] rounded-xl overflow-hidden shadow-2xl border-4 border-purple-200">
        <MapContainer center={[52.0, -95.0]} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {partnersData.map((site) => (
            <Marker key={site.id} position={[site.lat, site.lng]}>
              <Popup maxWidth={400}>
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
            Each of the final two years will have <span className="font-semibold text-purple-900">2 vacancies</span> each for additional sites and/or device allocations. 
            Therefore there are <span className="font-semibold text-purple-900">4 total project partner vacancies and/or device allocations</span> remaining until project end.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setCompactTable(!compactTable)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
          >
            {compactTable ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            {compactTable ? 'Expand View' : 'Compact View (Fit All Columns)'}
          </button>
        </div>
        <div className="overflow-x-auto rounded-xl shadow-2xl border-4 border-purple-200">
          <table className={`w-full border-collapse ${compactTable ? '' : 'text-sm'}`} style={compactTable ? { fontSize: '0.65rem' } : {}}>
            <thead>
              <tr className="bg-gradient-to-r from-purple-700 to-purple-900 text-white">
                <th className={`border border-purple-300 ${compactTable ? 'p-0.5' : 'p-2'} text-left`}>Participation Status</th>
                <th className={`border border-purple-300 ${compactTable ? 'p-0.5' : 'p-2'} text-left`}>Name/Organization</th>
                <th className={`border border-purple-300 ${compactTable ? 'p-0.5' : 'p-2'} text-left`}>Address (Device)</th>
                <th className={`border border-purple-300 ${compactTable ? 'p-0.5' : 'p-2'} text-left`}>City</th>
                <th className={`border border-purple-300 ${compactTable ? 'p-0.5' : 'p-2'} text-left`}>Prov</th>
                <th className={`border border-purple-300 ${compactTable ? 'p-0.5' : 'p-2'} text-left`}>Primary Contact</th>
                <th className={`border border-purple-300 ${compactTable ? 'p-0.5' : 'p-2'} text-left`}>Email</th>
                <th className={`border border-purple-300 ${compactTable ? 'p-0.5' : 'p-2'} text-left`}>Phone Number</th>
                <th className={`border border-purple-300 ${compactTable ? 'p-0.5' : 'p-2'} text-left`}>Additional Contact</th>
                <th className={`border border-purple-300 ${compactTable ? 'p-0.5' : 'p-2'} text-left`}>Email</th>
                <th className={`border border-purple-300 ${compactTable ? 'p-0.5' : 'p-2'} text-left`}>Phone Number</th>
                <th className={`border border-purple-300 ${compactTable ? 'p-0.5' : 'p-2'} text-left`}>Collaborative Site Agreement Status</th>
                <th className={`border border-purple-300 ${compactTable ? 'p-0.5' : 'p-2'} text-left`}>Devices Assign'd</th>
                <th className={`border border-purple-300 ${compactTable ? 'p-0.5' : 'p-2'} text-left`}>Device Serial #1</th>
                <th className={`border border-purple-300 ${compactTable ? 'p-0.5' : 'p-2'} text-left`}>Exemption Type #1</th>
                <th className={`border border-purple-300 ${compactTable ? 'p-0.5' : 'p-2'} text-left`}>Device Serial #2</th>
                <th className={`border border-purple-300 ${compactTable ? 'p-0.5' : 'p-2'} text-left`}>Exemption Type #2</th>
                <th className={`border border-purple-300 ${compactTable ? 'p-0.5' : 'p-2'} text-left`}>Proj Start YEAR</th>
              </tr>
            </thead>
            <tbody>
              {partnersData.map((site, idx) => (
                <tr key={site.id} className={idx % 2 === 0 ? 'bg-purple-50 hover:bg-purple-100' : 'bg-white hover:bg-purple-50'}>
                  <td className={`border border-purple-200 ${compactTable ? 'p-0.5' : 'p-2'}`}>{site.participationStatus}</td>
                  <td className={`border border-purple-200 ${compactTable ? 'p-0.5' : 'p-2'} font-semibold text-purple-900`}>{site.nameOrganization}</td>
                  <td className={`border border-purple-200 ${compactTable ? 'p-0.5' : 'p-2'}`}>{site.address}</td>
                  <td className={`border border-purple-200 ${compactTable ? 'p-0.5' : 'p-2'}`}>{site.city}</td>
                  <td className={`border border-purple-200 ${compactTable ? 'p-0.5' : 'p-2'}`}>{site.prov}</td>
                  <td className={`border border-purple-200 ${compactTable ? 'p-0.5' : 'p-2'}`}>{site.primaryContact}</td>
                  <td className={`border border-purple-200 ${compactTable ? 'p-0.5' : 'p-2'}`}>{site.email1}</td>
                  <td className={`border border-purple-200 ${compactTable ? 'p-0.5' : 'p-2'}`}>{site.phone1}</td>
                  <td className={`border border-purple-200 ${compactTable ? 'p-0.5' : 'p-2'}`}>{site.additionalContact}</td>
                  <td className={`border border-purple-200 ${compactTable ? 'p-0.5' : 'p-2'}`}>{site.email2}</td>
                  <td className={`border border-purple-200 ${compactTable ? 'p-0.5' : 'p-2'}`}>{site.phone2}</td>
                  <td className={`border border-purple-200 ${compactTable ? 'p-0.5' : 'p-2'}`}>{site.agreementStatus}</td>
                  <td className={`border border-purple-200 ${compactTable ? 'p-0.5' : 'p-2'}`}>{site.devicesAssigned}</td>
                  <td className={`border border-purple-200 ${compactTable ? 'p-0.5' : 'p-2'}`}>{site.deviceSerial1}</td>
                  <td className={`border border-purple-200 ${compactTable ? 'p-0.5' : 'p-2'}`}>{site.exemptionType1}</td>
                  <td className={`border border-purple-200 ${compactTable ? 'p-0.5' : 'p-2'}`}>{site.deviceSerial2}</td>
                  <td className={`border border-purple-200 ${compactTable ? 'p-0.5' : 'p-2'}`}>{site.exemptionType2}</td>
                  <td className={`border border-purple-200 ${compactTable ? 'p-0.5' : 'p-2'}`}>{site.projStartYear}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-800 text-white p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <Award className="mt-1 flex-shrink-0" size={40} />
          <div>
            <h1 className="text-2xl font-bold mb-2">The University of Western Ontario - A Novel Two Phase Drug-Checking Initiative: Contribution Agreement Funding Provided by Health Canada's Substance Use and Addictions Program</h1>
            <p className="text-lg mb-1 flex items-center gap-2">
              <Users size={20} />
              In partnership with Scatr Inc
            </p>
            <p className="text-sm flex items-center gap-2">
              <FileCheck size={18} />
              Interactive Project Partner Dashboard
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4">
            <h2 className="flex items-center gap-2 font-bold text-2xl">
              <MapPin size={28} />
              Map View
            </h2>
          </div>
          <div className="p-6 bg-gradient-to-br from-white to-purple-50">
            <MapView />
          </div>
        </div>

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

        <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <Award className="text-purple-700" size={32} />
            <h2 className="font-bold text-2xl text-purple-900">Summary Metrics</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            <div className="bg-gradient-to-br from-purple-200 to-purple-300 p-5 rounded-xl shadow-lg border-2 border-purple-400 hover:shadow-2xl transition-shadow">
              <div className="text-3xl font-bold text-purple-900">{stats.totalDevices}</div>
              <div className="text-sm text-purple-700 font-medium mt-1">Total Devices Assigned</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-5 rounded-xl shadow-lg border-2 border-indigo-300 hover:shadow-2xl transition-shadow">
              <div className="text-3xl font-bold text-indigo-900">{stats.provinces.length}</div>
              <div className="text-sm text-indigo-700 font-medium mt-1">Provinces/Territories</div>
              <div className="text-xs text-indigo-600 mt-2">{stats.provinces.join(', ')}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-300 to-purple-400 p-5 rounded-xl shadow-lg border-2 border-purple-500 hover:shadow-2xl transition-shadow">
              <div className="text-3xl font-bold text-purple-900">{stats.totalPartners}</div>
              <div className="text-sm text-purple-700 font-medium mt-1">Signed Agreements</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-teal-100 to-teal-200 p-5 rounded-xl shadow-lg border-2 border-teal-300 hover:shadow-2xl transition-shadow">
              <div className="text-2xl font-bold text-teal-900">{stats.exemptionType1Counts.Mobile}</div>
              <div className="text-sm text-teal-700 font-medium mt-1">Mobile Exemptions</div>
            </div>
            <div className="bg-gradient-to-br from-sky-100 to-sky-200 p-5 rounded-xl shadow-lg border-2 border-sky-300 hover:shadow-2xl transition-shadow">
              <div className="text-2xl font-bold text-sky-900">{stats.exemptionType1Counts.NonMobile}</div>
              <div className="text-sm text-sky-700 font-medium mt-1">Non-Mobile Exemptions</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-violet-100 to-violet-200 p-5 rounded-xl shadow-lg border-2 border-violet-300 hover:shadow-2xl transition-shadow cursor-pointer"
                 onClick={() => toggleMetric('year1')}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-violet-900">{stats.year1Sites} <span className="text-lg">(12 Devices)</span></div>
                  <div className="text-sm text-violet-700 font-medium mt-1">Year 1 Sites</div>
                </div>
                {expandedMetrics.year1 ? <ChevronUp className="text-violet-700" /> : <ChevronDown className="text-violet-700" />}
              </div>
              {expandedMetrics.year1 && (
                <div className="mt-3 pt-3 border-t border-violet-300 text-xs text-violet-800 space-y-1">
                  {partnersData.filter(site => site.projStartYear === "YEAR 1").map(site => (
                    <div key={site.id}>• {site.nameOrganization}</div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-gradient-to-br from-pink-100 to-pink-200 p-5 rounded-xl shadow-lg border-2 border-pink-300 hover:shadow-2xl transition-shadow cursor-pointer"
                 onClick={() => toggleMetric('year2')}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-pink-900">{stats.year2Sites} <span className="text-lg">(12 Devices)</span></div>
                  <div className="text-sm text-pink-700 font-medium mt-1">Year 2 Sites</div>
                </div>
                {expandedMetrics.year2 ? <ChevronUp className="text-pink-700" /> : <ChevronDown className="text-pink-700" />}
              </div>
              {expandedMetrics.year2 && (
                <div className="mt-3 pt-3 border-t border-pink-300 text-xs text-pink-800 space-y-1">
                  {partnersData.filter(site => site.projStartYear === "YEAR 2").map(site => (
                    <div key={site.id}>• {site.nameOrganization}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPartnerDashboard;
