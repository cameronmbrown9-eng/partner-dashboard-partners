import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Award, MapPin, List, Users, FileCheck, Calendar, TrendingUp, Filter, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Real partner data from CSV
const partnersData = [
  {
    "name": "Western University",
    "city": "London",
    "province": "ON",
    "latitude": 42.9849,
    "longitude": -81.2453,
    "devices": 1,
    "device1Type": "Non-Mobile",
    "device2Type": null,
    "exemptionStatus1": "Approved",
    "exemptionType1": "Non-Mobile",
    "exemptionStatus2": null,
    "exemptionType2": null,
    "scatrTraining": "Complete",
    "pwlleTraining": "Pending"
  },
  {
    "name": "Regional HIV/AIDS Connection (RHAC)",
    "city": "London",
    "province": "ON",
    "latitude": 42.9849,
    "longitude": -81.2453,
    "devices": 1,
    "device1Type": "Non-Mobile",
    "device2Type": null,
    "exemptionStatus1": "Approved",
    "exemptionType1": "Non-Mobile",
    "exemptionStatus2": null,
    "exemptionType2": null,
    "scatrTraining": "Complete",
    "pwlleTraining": "Complete"
  },
  {
    "name": "Sandy Hill Community Healh Centre",
    "city": "Ottawa",
    "province": "ON",
    "latitude": 45.4215,
    "longitude": -75.6972,
    "devices": 1,
    "device1Type": "Non-Mobile",
    "device2Type": null,
    "exemptionStatus1": "Approved",
    "exemptionType1": "Non-Mobile",
    "exemptionStatus2": null,
    "exemptionType2": null,
    "scatrTraining": "Complete",
    "pwlleTraining": "Pending"
  },
  {
    "name": "Ottawa Inner City Health",
    "city": "Ottawa",
    "province": "ON",
    "latitude": 45.4215,
    "longitude": -75.6972,
    "devices": 1,
    "device1Type": "Non-Mobile",
    "device2Type": null,
    "exemptionStatus1": "Approved",
    "exemptionType1": "Non-Mobile",
    "exemptionStatus2": null,
    "exemptionType2": null,
    "scatrTraining": "Complete",
    "pwlleTraining": "Pending"
  },
  {
    "name": "Lower Mainland Purpose Society",
    "city": "New Westminister",
    "province": "BC",
    "latitude": 49.2069,
    "longitude": -122.911,
    "devices": 1,
    "device1Type": "Mobile",
    "device2Type": null,
    "exemptionStatus1": "Approved",
    "exemptionType1": "Mobile",
    "exemptionStatus2": null,
    "exemptionType2": null,
    "scatrTraining": "Complete",
    "pwlleTraining": "Pending"
  },
  {
    "name": "County of Grey",
    "city": "Owen Sound",
    "province": "ON",
    "latitude": 44.5675,
    "longitude": -80.9434,
    "devices": 1,
    "device1Type": "Non-Mobile",
    "device2Type": null,
    "exemptionStatus1": "Approved",
    "exemptionType1": "Non-Mobile",
    "exemptionStatus2": "Approved",
    "exemptionType2": "Mobile",
    "scatrTraining": "Complete",
    "pwlleTraining": "Complete"
  },
  {
    "name": "Guelph Community Health Centre",
    "city": "Guelph",
    "province": "ON",
    "latitude": 43.5448,
    "longitude": -80.2482,
    "devices": 1,
    "device1Type": "Non-Mobile",
    "device2Type": null,
    "exemptionStatus1": "Submitted",
    "exemptionType1": "Non-Mobile",
    "exemptionStatus2": null,
    "exemptionType2": null,
    "scatrTraining": "Complete",
    "pwlleTraining": "Pending"
  },
  {
    "name": "Sanguen Health Centre",
    "city": "Kitchener",
    "province": "ON",
    "latitude": 43.4516,
    "longitude": -80.4925,
    "devices": 1,
    "device1Type": "Non-Mobile",
    "device2Type": null,
    "exemptionStatus1": "Approved",
    "exemptionType1": "Non-Mobile",
    "exemptionStatus2": "Approved",
    "exemptionType2": "Mobile",
    "scatrTraining": "Complete",
    "pwlleTraining": "Complete"
  },
  {
    "name": "Moyo Health",
    "city": "Brampton",
    "province": "ON",
    "latitude": 43.7315,
    "longitude": -79.7624,
    "devices": 1,
    "device1Type": "Non-Mobile",
    "device2Type": null,
    "exemptionStatus1": "Submitted",
    "exemptionType1": "Non-Mobile",
    "exemptionStatus2": null,
    "exemptionType2": null,
    "scatrTraining": "Complete",
    "pwlleTraining": "Pending"
  },
  {
    "name": "Hamilton Urban Core Community Health Centre",
    "city": "Hamilton",
    "province": "ON",
    "latitude": 43.2557,
    "longitude": -79.8711,
    "devices": 1,
    "device1Type": "Mobile",
    "device2Type": null,
    "exemptionStatus1": "In Progress",
    "exemptionType1": "Mobile",
    "exemptionStatus2": null,
    "exemptionType2": null,
    "scatrTraining": "Complete",
    "pwlleTraining": "Pending"
  },
  {
    "name": "Positive Living Niagara",
    "city": "St. Catherines",
    "province": "ON",
    "latitude": 43.1594,
    "longitude": -79.2469,
    "devices": 2,
    "device1Type": "Non-Mobile",
    "device2Type": "Mobile",
    "exemptionStatus1": "Approved",
    "exemptionType1": "Non-Mobile",
    "exemptionStatus2": "Submitted",
    "exemptionType2": "Mobile",
    "scatrTraining": "Complete",
    "pwlleTraining": "Pending"
  },
  {
    "name": "Ensemble Moncton",
    "city": "Moncton",
    "province": "NB",
    "latitude": 46.0878,
    "longitude": -64.7782,
    "devices": 2,
    "device1Type": "Non-Mobile",
    "device2Type": "Mobile",
    "exemptionStatus1": "Approved",
    "exemptionType1": "Non-Mobile",
    "exemptionStatus2": "Submitted",
    "exemptionType2": "Mobile",
    "scatrTraining": "Complete",
    "pwlleTraining": "Pending"
  },
  {
    "name": "Prairie Harm Reduction",
    "city": "Saskatoon",
    "province": "SK",
    "latitude": 52.1332,
    "longitude": -106.67,
    "devices": 1,
    "device1Type": "Non-Mobile",
    "device2Type": null,
    "exemptionStatus1": "Approved",
    "exemptionType1": "Non-Mobile",
    "exemptionStatus2": null,
    "exemptionType2": null,
    "scatrTraining": "Complete",
    "pwlleTraining": "Pending"
  },
  {
    "name": "Cochrane District Paramedic Service",
    "city": "Timmins",
    "province": "ON",
    "latitude": 48.4758,
    "longitude": -81.3304,
    "devices": 1,
    "device1Type": "Mobile",
    "device2Type": null,
    "exemptionStatus1": "Submitted",
    "exemptionType1": "Mobile",
    "exemptionStatus2": null,
    "exemptionType2": null,
    "scatrTraining": "Complete",
    "pwlleTraining": "Pending"
  },
  {
    "name": "Renfrew Paramedic Services",
    "city": "Renfrew",
    "province": "ON",
    "latitude": 45.4729,
    "longitude": -76.683,
    "devices": 1,
    "device1Type": "Mobile",
    "device2Type": null,
    "exemptionStatus1": "Submitted",
    "exemptionType1": "Mobile",
    "exemptionStatus2": null,
    "exemptionType2": null,
    "scatrTraining": "Complete",
    "pwlleTraining": "Pending"
  },
  {
    "name": "Peterborough AIDS Resource Network",
    "city": "Peterborough",
    "province": "ON",
    "latitude": 44.3091,
    "longitude": -78.3197,
    "devices": 1,
    "device1Type": "Non-Mobile",
    "device2Type": null,
    "exemptionStatus1": "In Progress",
    "exemptionType1": "Non-Mobile",
    "exemptionStatus2": null,
    "exemptionType2": null,
    "scatrTraining": "Complete",
    "pwlleTraining": "Pending"
  },
  {
    "name": "Travailderue",
    "city": "Chicoutimi",
    "province": "QC",
    "latitude": 48.4284,
    "longitude": -71.0537,
    "devices": 1,
    "device1Type": "Non-Mobile",
    "device2Type": null,
    "exemptionStatus1": "Approved",
    "exemptionType1": "Non-Mobile",
    "exemptionStatus2": null,
    "exemptionType2": null,
    "scatrTraining": "Complete",
    "pwlleTraining": "Pending"
  },
  {
    "name": "NHC Society",
    "city": "Truro",
    "province": "NS",
    "latitude": 45.3676,
    "longitude": -63.2755,
    "devices": 1,
    "device1Type": "Non-Mobile",
    "device2Type": null,
    "exemptionStatus1": "Submitted",
    "exemptionType1": "Non-Mobile",
    "exemptionStatus2": null,
    "exemptionType2": null,
    "scatrTraining": "Complete",
    "pwlleTraining": "Pending"
  },
  {
    "name": "Breakaway",
    "city": "Toronto",
    "province": "ON",
    "latitude": 43.6532,
    "longitude": -79.3832,
    "devices": 1,
    "device1Type": "Non-Mobile",
    "device2Type": null,
    "exemptionStatus1": "Submitted",
    "exemptionType1": "Non-Mobile",
    "exemptionStatus2": null,
    "exemptionType2": null,
    "scatrTraining": "Complete",
    "pwlleTraining": "Pending"
  },
  {
    "name": "AIDS New Brunswick",
    "city": "Fredericton",
    "province": "NB",
    "latitude": 45.9636,
    "longitude": -66.6431,
    "devices": 1,
    "device1Type": "Non-Mobile",
    "device2Type": null,
    "exemptionStatus1": "Submitted",
    "exemptionType1": "Non-Mobile",
    "exemptionStatus2": null,
    "exemptionType2": null,
    "scatrTraining": "Complete",
    "pwlleTraining": "Pending"
  },
  {
    "name": "Avenue B Harm Reduction Inc.",
    "city": "Saint John",
    "province": "NB",
    "latitude": 45.2733,
    "longitude": -66.0633,
    "devices": 1,
    "device1Type": "Non-Mobile",
    "device2Type": null,
    "exemptionStatus1": "Approved",
    "exemptionType1": "Non-Mobile",
    "exemptionStatus2": "Submitted",
    "exemptionType2": "Mobile",
    "scatrTraining": "Complete",
    "pwlleTraining": "Pending"
  },
  {
    "name": "Boyle Street Service Society",
    "city": "Edmonton",
    "province": "AB",
    "latitude": 53.5461,
    "longitude": -113.4938,
    "devices": 1,
    "device1Type": "Non-Mobile",
    "device2Type": null,
    "exemptionStatus1": "In Progress",
    "exemptionType1": "Non-Mobile",
    "exemptionStatus2": null,
    "exemptionStatus2": null,
    "scatrTraining": "Pending",
    "pwlleTraining": "Pending"
  }
];

const ProjectPartnerDashboard = () => {
  const [filters, setFilters] = useState({
    deviceCount: 'all', // 'all', '1', '2'
    province: 'all',
    exemptionStatus: 'all' // 'all', 'active', 'pending', 'in-progress'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPartners = partnersData.length;
    const uniqueCities = new Set(partnersData.map(p => p.city)).size;
    const uniqueProvinces = new Set(partnersData.map(p => p.province)).size;
    const totalDevicesActive = partnersData.reduce((sum, p) => sum + (p.devices || 0), 0);
    const totalDevicesMax = 28;
    
    const sitesWith1Device = partnersData.filter(p => p.devices === 1).length;
    const sitesWith2Devices = partnersData.filter(p => p.devices === 2).length;
    
    // Exemption analysis
    const sitesWith2Exemptions = partnersData.filter(p => 
      p.exemptionStatus1 && p.exemptionStatus2
    ).length;
    
    const sitesWith1Mobile = partnersData.filter(p => 
      (p.exemptionStatus1 && p.exemptionType1 === "Mobile" && !p.exemptionStatus2) ||
      (p.exemptionStatus2 && p.exemptionType2 === "Mobile" && !p.exemptionStatus1)
    ).length;
    
    const sitesWith1NonMobile = partnersData.filter(p => 
      (p.exemptionStatus1 && p.exemptionType1 === "Non-Mobile" && !p.exemptionStatus2) ||
      (p.exemptionStatus2 && p.exemptionType2 === "Non-Mobile" && !p.exemptionStatus1)
    ).length;
    
    // Sites with active exemptions
    const sitesWithActiveExemptions = partnersData.filter(p =>
      p.exemptionStatus1 === "Approved" || p.exemptionStatus2 === "Approved"
    );
    
    const sitesWithoutActiveExemptions = partnersData.filter(p =>
      p.exemptionStatus1 !== "Approved" && p.exemptionStatus2 !== "Approved"
    );

    const exemptionStatus1Counts = {
      Approved: partnersData.filter(s => s.exemptionStatus1 === "Approved").length,
      Submitted: partnersData.filter(s => s.exemptionStatus1 === "Submitted").length,
      InProgress: partnersData.filter(s => s.exemptionStatus1 === "In Progress").length,
    };

    return {
      totalPartners,
      uniqueCities,
      uniqueProvinces,
      totalDevicesActive,
      totalDevicesMax,
      sitesWith1Device,
      sitesWith2Devices,
      sitesWith2Exemptions,
      sitesWith1Mobile,
      sitesWith1NonMobile,
      sitesWithActiveExemptions,
      sitesWithoutActiveExemptions,
      exemptionStatus1Counts
    };
  }, []);

  // Filter data
  const filteredData = useMemo(() => {
    return partnersData.filter(site => {
      // Device count filter
      if (filters.deviceCount !== 'all' && site.devices !== parseInt(filters.deviceCount)) {
        return false;
      }
      
      // Province filter
      if (filters.province !== 'all' && site.province !== filters.province) {
        return false;
      }
      
      // Exemption status filter
      if (filters.exemptionStatus !== 'all') {
        const hasApproved = site.exemptionStatus1 === "Approved" || site.exemptionStatus2 === "Approved";
        const hasPending = site.exemptionStatus1 === "Submitted" || site.exemptionStatus2 === "Submitted";
        const hasInProgress = site.exemptionStatus1 === "In Progress" || site.exemptionStatus2 === "In Progress";
        
        if (filters.exemptionStatus === 'active' && !hasApproved) return false;
        if (filters.exemptionStatus === 'pending' && !hasPending) return false;
        if (filters.exemptionStatus === 'in-progress' && !hasInProgress) return false;
      }
      
      return true;
    });
  }, [filters]);

  const provinces = useMemo(() => {
    return Array.from(new Set(partnersData.map(p => p.province))).sort();
  }, []);

  const resetFilters = () => {
    setFilters({
      deviceCount: 'all',
      province: 'all',
      exemptionStatus: 'all'
    });
  };

  // Calculate today's position on timeline (Phase 1 start to project end)
  const phase1Start = new Date('2022-04-01');
  const projectEnd = new Date('2028-03-31');
  const today = new Date();
  const totalDays = (projectEnd - phase1Start) / (1000 * 60 * 60 * 24);
  const daysElapsed = (today - phase1Start) / (1000 * 60 * 60 * 24);
  const timelineProgress = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-purple-800 to-purple-900 text-white shadow-2xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Award size={40} />
                Western University - PWLLE Leading the Way Drug-Checking Initiative
              </h1>
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
      </div>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Executive Summary */}
        <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-purple-700 to-purple-900 flex items-center gap-3">
            <FileCheck className="text-white" size={28} />
            <h2 className="font-bold text-2xl text-white">Executive Summary</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Leading the Way initiative represents Western University's commitment to expanding 
                drug-checking services across Canada through partnership with Scatr Inc. This dashboard 
                tracks the progress of our partner sites, device allocations, and regulatory exemption statuses.
              </p>
            </div>

            {/* Project Timeline */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border-2 border-purple-200">
              <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                <Calendar size={24} />
                Project Timeline
              </h3>
              
              <div className="space-y-6">
                {/* Phase Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
                    <h4 className="font-bold text-purple-900 mb-2">Phase 1 (April 2022 - March 2024)</h4>
                    <p className="text-sm text-gray-700">
                      "Creating A Drug Checking Network Using Machine Learning Enabled Spectrometers"
                      <br/>
                      <span className="font-semibold mt-1 block">13 sites identified and deployed</span>
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border-2 border-green-300">
                    <h4 className="font-bold text-green-900 mb-2">Phase 2 (June 2024 - March 2028)</h4>
                    <p className="text-sm text-gray-700">
                      "Leading the Way: PWLLE at the Forefront of Drug-Checking Initiatives"
                      <br/>
                      <span className="font-semibold mt-1 block">Continuing expansion with PWLLE integration</span>
                    </p>
                  </div>
                </div>

                {/* Timeline Graphic */}
                <div className="relative">
                  <div className="flex justify-between text-xs font-semibold text-gray-600 mb-2">
                    <span>Phase 1 Start<br/>April 1, 2022</span>
                    <span className="text-center">Phase 2<br/>June 2024 - Present</span>
                    <span className="text-right">Project End<br/>March 31, 2028</span>
                  </div>
                  
                  <div className="relative h-12 bg-gradient-to-r from-purple-200 via-green-200 to-purple-300 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-green-600 opacity-50"
                      style={{ width: `${timelineProgress}%` }}
                    ></div>
                    
                    {/* "We Are Here" marker */}
                    <div 
                      className="absolute top-0 transform -translate-x-1/2 -translate-y-8"
                      style={{ left: `${timelineProgress}%` }}
                    >
                      <div className="flex flex-col items-center">
                        <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-yellow-600 whitespace-nowrap">
                          ▼ WE ARE HERE
                        </div>
                        <div className="w-0.5 h-6 bg-yellow-600"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center text-sm text-gray-600">
                    <span className="font-semibold">Current Date:</span> {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Exemption Status Summary */}
              <div>
                <h3 className="text-xl font-bold text-purple-900 mb-3 mt-6">Exemption Status Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sites WITH Active Exemptions */}
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                    <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      Sites with Active Exemptions ({stats.sitesWithActiveExemptions.length})
                    </h4>
                    <div className="max-h-48 overflow-y-auto">
                      <ul className="text-sm space-y-1">
                        {stats.sitesWithActiveExemptions.map((site, idx) => (
                          <li key={idx} className="text-gray-700">
                            • {site.name} - {site.city}, {site.province}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Sites WITHOUT Active Exemptions (Need Follow-up) */}
                  <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                    <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      Sites Needing Follow-up ({stats.sitesWithoutActiveExemptions.length})
                    </h4>
                    <div className="max-h-48 overflow-y-auto">
                      <ul className="text-sm space-y-1">
                        {stats.sitesWithoutActiveExemptions.map((site, idx) => (
                          <li key={idx} className="text-gray-700">
                            • {site.name} - {site.city}, {site.province}
                            <span className="text-xs text-orange-600 ml-2">
                              ({site.exemptionStatus1 || 'Not Started'})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-purple-100">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-purple-700" size={32} />
            <h2 className="font-bold text-2xl text-purple-900">Project Statistics</h2>
          </div>
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-5 rounded-xl shadow-lg border-2 border-purple-300 hover:shadow-2xl transition-shadow">
              <div className="text-3xl font-bold text-purple-900">{stats.totalPartners}</div>
              <div className="text-sm text-purple-700 font-medium mt-1">Total Partner Sites</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-5 rounded-xl shadow-lg border-2 border-blue-300 hover:shadow-2xl transition-shadow">
              <div className="text-3xl font-bold text-blue-900">{stats.uniqueCities}</div>
              <div className="text-sm text-blue-700 font-medium mt-1">Unique Cities</div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-5 rounded-xl shadow-lg border-2 border-indigo-300 hover:shadow-2xl transition-shadow">
              <div className="text-3xl font-bold text-indigo-900">{stats.uniqueProvinces}</div>
              <div className="text-sm text-indigo-700 font-medium mt-1">Unique Provinces</div>
            </div>
            
            <div className="bg-gradient-to-br from-teal-100 to-teal-200 p-5 rounded-xl shadow-lg border-2 border-teal-300 hover:shadow-2xl transition-shadow">
              <div className="text-3xl font-bold text-teal-900">
                {stats.totalDevicesActive} of {stats.totalDevicesMax}
              </div>
              <div className="text-sm text-teal-700 font-medium mt-1">Total Devices Allocated</div>
            </div>
          </div>

          {/* Device Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-100 to-green-200 p-5 rounded-xl shadow-lg border-2 border-green-300">
              <div className="text-2xl font-bold text-green-900">{stats.sitesWith2Devices}</div>
              <div className="text-sm text-green-700 font-medium mt-1">Sites with 2 Devices</div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-5 rounded-xl shadow-lg border-2 border-yellow-300">
              <div className="text-2xl font-bold text-yellow-900">{stats.sitesWith1Device}</div>
              <div className="text-sm text-yellow-700 font-medium mt-1">Sites with 1 Device</div>
            </div>
          </div>

          {/* Exemption Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-violet-100 to-violet-200 p-5 rounded-xl shadow-lg border-2 border-violet-300">
              <div className="text-2xl font-bold text-violet-900">{stats.sitesWith2Exemptions}</div>
              <div className="text-sm text-violet-700 font-medium mt-1">Sites with 2 Exemptions (Mobile & Non-Mobile)</div>
            </div>
            
            <div className="bg-gradient-to-br from-pink-100 to-pink-200 p-5 rounded-xl shadow-lg border-2 border-pink-300">
              <div className="text-2xl font-bold text-pink-900">{stats.sitesWith1Mobile}</div>
              <div className="text-sm text-pink-700 font-medium mt-1">Sites with 1 Exemption (Mobile Only)</div>
            </div>
            
            <div className="bg-gradient-to-br from-rose-100 to-rose-200 p-5 rounded-xl shadow-lg border-2 border-rose-300">
              <div className="text-2xl font-bold text-rose-900">{stats.sitesWith1NonMobile}</div>
              <div className="text-sm text-rose-700 font-medium mt-1">Sites with 1 Exemption (Non-Mobile Only)</div>
            </div>
          </div>

          {/* Fiscal Year Note */}
          <div className="mt-6 p-5 bg-gradient-to-r from-purple-100 to-purple-50 rounded-xl shadow-inner border-2 border-purple-200">
            <p className="text-sm text-gray-800 leading-relaxed">
              These {stats.totalPartners} sites represent progress through <span className="font-semibold text-purple-900">Fiscal Year 2</span>. 
              With <span className="font-semibold text-purple-900">4 total project partner vacancies</span> remaining 
              (2 in FY3, 2 in FY4), the project can accommodate up to {stats.totalDevicesMax} total device allocations by March 31, 2028.
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-purple-700 to-purple-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="text-white" size={28} />
              <h2 className="font-bold text-2xl text-white">Filters</h2>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-white hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors"
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>
          
          {showFilters && (
            <div className="p-6 bg-gradient-to-br from-white to-purple-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Device Count Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Device Count
                  </label>
                  <select
                    value={filters.deviceCount}
                    onChange={(e) => setFilters({...filters, deviceCount: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Sites</option>
                    <option value="1">1 Device</option>
                    <option value="2">2 Devices</option>
                  </select>
                </div>

                {/* Province Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Province
                  </label>
                  <select
                    value={filters.province}
                    onChange={(e) => setFilters({...filters, province: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Provinces</option>
                    {provinces.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>

                {/* Exemption Status Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Exemption Status
                  </label>
                  <select
                    value={filters.exemptionStatus}
                    onChange={(e) => setFilters({...filters, exemptionStatus: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active (Approved)</option>
                    <option value="pending">Pending (Submitted)</option>
                    <option value="in-progress">In Progress</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {filteredData.length} of {partnersData.length} sites
                </div>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  <X size={18} />
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Map View */}
        <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-purple-700 to-purple-900 flex items-center gap-3">
            <MapPin className="text-white" size={28} />
            <h2 className="font-bold text-2xl text-white">Partner Site Map</h2>
          </div>
          <div className="p-6 bg-gradient-to-br from-white to-purple-50">
            <MapContainer
              center={[56.1304, -106.3468]}
              zoom={5}
              style={{ height: '600px', width: '100%', borderRadius: '12px' }}
              className="shadow-xl"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredData.map((site, index) => (
                <Marker key={index} position={[site.latitude, site.longitude]}>
                  <Popup maxWidth={400}>
                    <div className="font-sans">
                      <h3 className="font-bold text-lg text-purple-900 mb-3 border-b-2 border-purple-300 pb-2">
                        {site.name}
                      </h3>
                      <div className="space-y-1 text-sm">
                        {[
                          { label: 'City', value: site.city },
                          { label: 'Province', value: site.province },
                          { label: 'Devices', value: site.devices },
                          { label: 'Exemption 1', value: `${site.exemptionStatus1} (${site.exemptionType1})` },
                          { label: 'Exemption 2', value: site.exemptionStatus2 ? `${site.exemptionStatus2} (${site.exemptionType2})` : 'N/A' },
                          { label: 'SCATR Training', value: site.scatrTraining },
                          { label: 'PWLLE Training', value: site.pwlleTraining }
                        ].map((row, idx) => (
                          <div
                            key={idx}
                            className={`flex justify-between px-2 py-1.5 ${
                              idx % 2 === 0 ? 'bg-purple-50' : 'bg-white'
                            }`}
                          >
                            <span className="font-semibold text-gray-700">{row.label}:</span>
                            <span className="text-gray-600">{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-purple-700 to-purple-900 flex items-center gap-3">
            <List className="text-white" size={28} />
            <h2 className="font-bold text-2xl text-white">Partner Details Table</h2>
          </div>
          <div className="p-6 bg-gradient-to-br from-white to-purple-50">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-purple-900 text-white">
                    <th className="px-4 py-3 text-left border border-purple-700">Site Name</th>
                    <th className="px-4 py-3 text-left border border-purple-700">City</th>
                    <th className="px-4 py-3 text-left border border-purple-700">Province</th>
                    <th className="px-4 py-3 text-left border border-purple-700">Devices</th>
                    <th className="px-4 py-3 text-left border border-purple-700">Exemption 1</th>
                    <th className="px-4 py-3 text-left border border-purple-700">Type 1</th>
                    <th className="px-4 py-3 text-left border border-purple-700">Exemption 2</th>
                    <th className="px-4 py-3 text-left border border-purple-700">Type 2</th>
                    <th className="px-4 py-3 text-left border border-purple-700">SCATR</th>
                    <th className="px-4 py-3 text-left border border-purple-700">PWLLE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((site, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? 'bg-purple-50' : 'bg-white'
                      } hover:bg-purple-100 transition-colors`}
                    >
                      <td className="px-4 py-3 border border-gray-300 font-semibold text-purple-900">
                        {site.name}
                      </td>
                      <td className="px-4 py-3 border border-gray-300">{site.city}</td>
                      <td className="px-4 py-3 border border-gray-300">{site.province}</td>
                      <td className="px-4 py-3 border border-gray-300 text-center font-bold">
                        {site.devices}
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          site.exemptionStatus1 === 'Approved' ? 'bg-green-200 text-green-800' :
                          site.exemptionStatus1 === 'Submitted' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-orange-200 text-orange-800'
                        }`}>
                          {site.exemptionStatus1}
                        </span>
                      </td>
                      <td className="px-4 py-3 border border-gray-300">{site.exemptionType1}</td>
                      <td className="px-4 py-3 border border-gray-300">
                        {site.exemptionStatus2 && (
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            site.exemptionStatus2 === 'Approved' ? 'bg-green-200 text-green-800' :
                            site.exemptionStatus2 === 'Submitted' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-orange-200 text-orange-800'
                          }`}>
                            {site.exemptionStatus2}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 border border-gray-300">{site.exemptionType2 || 'N/A'}</td>
                      <td className="px-4 py-3 border border-gray-300">{site.scatrTraining}</td>
                      <td className="px-4 py-3 border border-gray-300">{site.pwlleTraining}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPartnerDashboard;
