import React, { useState, useEffect } from 'react';
import { MapPin, List, Users, ChevronDown, ChevronUp, Clock, Trophy, ExternalLink, RotateCcw, Presentation, Maximize2, Minimize2, Check, FileText, Mail, Phone, BookOpen, Download, MessageSquare, ArrowUp, AlertTriangle, Printer, HelpCircle, Newspaper, GraduationCap, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Discourse Forum Configuration - UPDATE THESE VALUES AFTER SETUP
const DISCOURSE_CONFIG = {
  forumUrl: 'https://forum.uwo-drugchecking.ca', // Your Discourse forum URL
  embedUrl: 'https://forum.uwo-drugchecking.ca/embed/comments', // Embed endpoint
  isConfigured: false // Set to true once Discourse is set up
};

// Announcement Banner Configuration - UPDATE MESSAGE AS NEEDED
const ANNOUNCEMENT_CONFIG = {
  isActive: false, // Set to false to hide the banner
  type: 'info', // 'info', 'warning', 'urgent'
  message: 'Welcome to the new Project Partner Dashboard! Explore the features and reach out if you have any questions.',
  link: null, // Optional: { text: 'Learn More', url: 'https://...' }
};

// News/Updates Feed Data - ADD NEW ITEMS AT THE TOP
const NEWS_UPDATES = [
  { date: '2025-12-12', title: 'Share Your Story: PWLLE Voices Needed', description: 'At the heart of this project is a simple belief: the best improvements to drug-checking services come directly from the people who use them. We want to hear from People with Lived or Living Experience (PWLLEs) who are willing to share their stories and perspectives. Your insights help shape how these services evolve. Interested in having a conversation? Contact Cameron at cbrown58@uwo.ca — no pressure, just a chance to be heard.' },
  { date: '2025-12-12', title: 'Exemption 56 Document Reminder', description: 'Please don\'t forget to send Cameron your site\'s updated Exemption 56 Approval Document(s) as soon as possible subsequent to their receipt.' },
  { date: '2025-12-11', title: 'Project Partner Dashboard Launched', description: 'The new interactive dashboard is now live, providing partners with centralized access to project information, documents, and contact details.' },
  { date: '2025-12-01', title: '22 Partner Sites Now Active', description: 'We have successfully onboarded 22 partner sites across 7 provinces, 20 cities, with 24 spectrometers deployed.' },
  { date: '2025-11-15', title: 'Drug-Checking Peer Training Program Begins', description: 'Virtual training sessions are now being scheduled for partner sites. Contact the Project Manager to arrange training for your team.' },
  { date: '2025-09-15', title: 'Manuscript Submitted to Harm Reduction Journal', description: 'Our peer-reviewed paper on street drug monitoring using Raman spectroscopy has been submitted for review.' },
];

// FAQ Data
const FAQ_DATA = [
  { question: 'How do I schedule Drug-Checking Peer (DCP) training for my PWLLE staff and/or community members?', answer: 'Contact the Project Manager at cbrown58@uwo.ca to schedule virtual training sessions. Training is delivered via Western Corporate Zoom and typically takes 2-3 hours.' },
  { question: 'What is an Exemption 56 and does my site need one?', answer: 'An Exemption under Section 56 of the Controlled Drugs and Substances Act allows your site to legally handle controlled substances for drug-checking purposes. All partner sites require an approved exemption before operating. Templates are available in the Research Documents section.' },
  { question: 'How do I update my site\'s contact information on the dashboard?', answer: 'Contact the Project Manager with your updated information and we will update the dashboard accordingly.' },
  { question: 'Can I share this dashboard with others at my organization?', answer: 'Yes, you may share access with colleagues directly involved in the drug-checking program at your site. However, please do not share access with individuals outside of the project network.' },
  { question: 'What is the difference between Mobile and Non-Mobile exemptions?', answer: 'A Non-Mobile exemption allows drug-checking at a fixed location only. A Mobile exemption allows you to conduct drug-checking at various locations within your approved geographic area, such as outreach services or pop-up sites.' },
];

// Training Completion Status - UPDATE AS SITES COMPLETE TRAINING
const TRAINING_STATUS = {
  1: { completed: true, date: '2025-06-15' }, // Western University
  2: { completed: true, date: '2025-07-20' }, // RHAC
  3: { completed: true, date: '2025-08-10' }, // Sandy Hill
  4: { completed: false, date: null }, // Ottawa Inner City Health
  5: { completed: true, date: '2025-09-05' }, // Lower Mainland Purpose Society
  6: { completed: false, date: null }, // County of Grey
  7: { completed: true, date: '2025-08-25' }, // Guelph CHC
  8: { completed: true, date: '2025-09-12' }, // Sanguen
  9: { completed: false, date: null }, // Moyo Health
  10: { completed: true, date: '2025-10-01' }, // Hamilton Urban Core
  11: { completed: false, date: null }, // Positive Living Niagara
  12: { completed: true, date: '2025-10-15' }, // Ensemble Moncton
  13: { completed: false, date: null }, // Prairie Harm Reduction
  14: { completed: false, date: null }, // Cochrane District Paramedic
  15: { completed: false, date: null }, // Renfrew Paramedic
  16: { completed: true, date: '2025-11-01' }, // PARN
  17: { completed: false, date: null }, // Travailderue
  18: { completed: false, date: null }, // NHC Society
  19: { completed: true, date: '2025-11-10' }, // Breakaway
  20: { completed: false, date: null }, // AIDS New Brunswick
  21: { completed: false, date: null }, // Avenue B
  22: { completed: false, date: null }, // Boyle Street
};

// Canadian Flag SVG Component (only for title)
const CanadianFlag = ({ size = 20 }) => (
  <svg width={size * 1.5} height={size} viewBox="0 0 30 20" className="inline-block ml-2" style={{ verticalAlign: 'middle' }}>
    <rect width="30" height="20" fill="#fff"/>
    <rect width="7.5" height="20" fill="#FF0000"/>
    <rect x="22.5" width="7.5" height="20" fill="#FF0000"/>
    <path fill="#FF0000" d="M15 4l-1 2h-2l1.5 1.5-.5 2.5 2-1 2 1-.5-2.5L18 6h-2l-1-2z"/>
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

// Project Contact Info Component
const ProjectContactInfo = ({ isFooter = false }) => (
  <div className={`bg-gradient-to-br ${isFooter ? 'from-purple-100 to-purple-200' : 'from-purple-50 to-white'} p-6 rounded-2xl shadow-lg border-2 border-purple-200 ${isFooter ? 'mt-6' : 'mb-4'}`}>
    <h3 className="font-bold text-xl text-purple-900 mb-4 flex items-center gap-2">
      <Mail size={24} className="text-purple-700" />
      Project Contact Information
    </h3>
    <div className="space-y-4 text-sm">
      <div className="bg-white p-4 rounded-xl border border-purple-200">
        <div className="font-bold text-purple-900 mb-2">Project Titles:</div>
        <div className="text-gray-700 text-sm space-y-3">
          <div><strong>Phase #1</strong><br /><strong>Creating a Drug Checking Network Using Machine Learning Enabled Spectrometers.</strong> Health Canada, Substance Use and Addictions Program (SUAP). Contribution Agreement_Arrangement # 2223-HQ-000095.</div>
          <div><strong>Phase #2</strong><br /><strong>Leading the Way: PWLLE at the Forefront of Drug-Checking Initiatives.</strong> Health Canada, Substance Use and Addictions Program (SUAP). Contribution Agreement_Arrangement # 2425-HQ-000058.</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-purple-200">
          <div className="font-bold text-purple-900 mb-2">Principal Investigator (PI):</div>
          <div className="text-gray-800 font-medium">Professor Francois Lagugne-Labarthet</div>
          <div className="text-gray-600">Faculty of Science, Western University</div>
          <div className="text-gray-600">London, ON, Canada</div>
          <div className="flex items-center gap-2 mt-2 text-purple-700">
            <Phone size={14} />
            <span>519-661-2111 x81006</span>
          </div>
          <div className="flex items-center gap-2 text-purple-700">
            <Mail size={14} />
            <a href="mailto:flagugne@uwo.ca" className="hover:underline">flagugne@uwo.ca</a>
          </div>
          <div className="flex items-center gap-2 mt-2 text-purple-700">
            <ExternalLink size={14} />
            <a href="https://publish.uwo.ca/~flagugne/#about" target="_blank" rel="noopener noreferrer" className="hover:underline">FLL Group Bio</a>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-purple-200">
          <div className="font-bold text-purple-900 mb-2">Project Manager:</div>
          <div className="text-gray-800 font-medium">Cameron Brown</div>
          <div className="text-gray-600">Faculty of Science, Western University</div>
          <div className="text-gray-600">London, ON, Canada</div>
          <div className="flex items-center gap-2 mt-2 text-purple-700">
            <Phone size={14} />
            <span>226-238-9970</span>
          </div>
          <div className="flex items-center gap-2 text-purple-700">
            <Mail size={14} />
            <a href="mailto:cbrown58@uwo.ca" className="hover:underline">cbrown58@uwo.ca</a>
          </div>
          <div className="flex items-center gap-2 mt-2 text-purple-700">
            <ExternalLink size={14} />
            <a href="https://publish.uwo.ca/~flagugne/#about" target="_blank" rel="noopener noreferrer" className="hover:underline">FLL Group Bio</a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// PowerPoint Viewer Component
const PowerPointViewer = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const pptxFileName = 'project-presentation.pptx';
  const siteUrl = 'https://partners.uwo-drugchecking.ca';
  const cacheBuster = '?v=' + Date.now();
  const pptxUrl = `${siteUrl}/${pptxFileName}${cacheBuster}`;
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

// Project Publications Section
const ProjectPublications = () => (
  <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
    <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4">
      <h2 className="flex items-center gap-2 font-bold text-2xl">
        <BookOpen size={28} />
        Project-Related Publications
      </h2>
    </div>
    <div className="p-6 bg-gradient-to-br from-white to-purple-50">
      <div className="relative overflow-hidden rounded-xl border-2 border-gray-300 shadow-lg max-w-[50%] mx-auto">
        <img src="/manuscript-preview.png" alt="Manuscript Preview" className="w-full blur-sm" />
        <div className="absolute inset-0 bg-white opacity-75"></div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-5xl font-bold text-red-500 opacity-80 rotate-[-30deg] text-center">UNDER REVIEW<br />Harm Reduction Journal</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-4 text-center italic">
        Publication details will be updated upon peer review completion and acceptance.
      </p>
    </div>
  </div>
);

// Partner Discussion Board Component (Discourse Integration)
const PartnerDiscussionBoard = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
      <div 
        className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4 cursor-pointer flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="flex items-center gap-2 font-bold text-2xl">
          <MessageSquare size={28} />
          Partner Discussion Board
        </h2>
        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </div>
      
      {isExpanded && (
        <div className="p-6 bg-gradient-to-br from-white to-purple-50">
          {DISCOURSE_CONFIG.isConfigured ? (
            // Embedded Discourse Forum
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <p className="text-sm text-purple-800">
                  Welcome to the Partner Discussion Board! Use this space to ask questions, share experiences, 
                  discuss best practices, and collaborate with other project partner sites across Canada.
                </p>
              </div>
              <iframe
                src={DISCOURSE_CONFIG.forumUrl}
                width="100%"
                height="600px"
                frameBorder="0"
                title="Partner Discussion Forum"
                className="rounded-lg border-2 border-purple-200"
              />
              <div className="text-center">
                <a 
                  href={DISCOURSE_CONFIG.forumUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors font-medium"
                >
                  <ExternalLink size={18} />
                  Open Forum in New Tab
                </a>
              </div>
            </div>
          ) : (
            // Pre-launch placeholder
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-xl border-2 border-purple-300 text-center">
                <MessageSquare size={64} className="mx-auto text-purple-600 mb-4" />
                <h3 className="text-2xl font-bold text-purple-900 mb-2">Discussion Forum Coming Soon!</h3>
                <p className="text-purple-700 mb-4">
                  We're setting up a dedicated discussion board powered by Discourse where project partners can:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                  <div className="bg-white p-4 rounded-lg border border-purple-200">
                    <div className="font-bold text-purple-900 mb-1">💬 Ask Questions</div>
                    <div className="text-sm text-gray-600">Get help from the project team and other experienced sites</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-purple-200">
                    <div className="font-bold text-purple-900 mb-1">📢 Share Updates</div>
                    <div className="text-sm text-gray-600">Post announcements and updates from your site</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-purple-200">
                    <div className="font-bold text-purple-900 mb-1">🤝 Collaborate</div>
                    <div className="text-sm text-gray-600">Connect with peers across the network for knowledge sharing</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-purple-200">
                    <div className="font-bold text-purple-900 mb-1">📋 Best Practices</div>
                    <div className="text-sm text-gray-600">Discuss and document effective approaches and protocols</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📧</div>
                  <div>
                    <div className="font-bold text-yellow-800 mb-1">In the meantime...</div>
                    <p className="text-sm text-yellow-700">
                      Please direct any questions or concerns to the Project Manager at{' '}
                      <a href="mailto:cbrown58@uwo.ca" className="underline hover:text-yellow-900">cbrown58@uwo.ca</a>
                      {' '}or call <span className="font-medium">226-238-9970</span>.
                      We'll notify all partners when the discussion board is ready!
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="font-bold text-gray-700 mb-2">Planned Forum Categories:</div>
                <div className="flex flex-wrap gap-2">
                  {['General Discussion', 'Technical Support', 'Device Issues', 'Training & Onboarding', 'Best Practices', 'Success Stories', 'Policy Updates', 'Research & Data'].map((cat, idx) => (
                    <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">{cat}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Back to Top Button Component
const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 bg-purple-700 hover:bg-purple-800 text-white p-3 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 group"
      title="Back to Top"
    >
      <ArrowUp size={24} />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-medium">Back to Top</span>
    </button>
  );
};

// Announcement Banner Component
const AnnouncementBanner = ({ onDismiss }) => {
  if (!ANNOUNCEMENT_CONFIG.isActive) return null;
  
  const bgColors = {
    info: 'bg-gradient-to-r from-blue-600 to-blue-700',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    urgent: 'bg-gradient-to-r from-red-600 to-red-700'
  };
  
  const icons = {
    info: <Newspaper size={20} />,
    warning: <AlertTriangle size={20} />,
    urgent: <AlertTriangle size={20} />
  };

  return (
    <div className={`${bgColors[ANNOUNCEMENT_CONFIG.type]} text-white px-4 py-3 shadow-lg`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {icons[ANNOUNCEMENT_CONFIG.type]}
          <span className="text-sm font-medium">{ANNOUNCEMENT_CONFIG.message}</span>
          {ANNOUNCEMENT_CONFIG.link && (
            <a href={ANNOUNCEMENT_CONFIG.link.url} className="underline hover:no-underline text-sm font-bold">
              {ANNOUNCEMENT_CONFIG.link.text}
            </a>
          )}
        </div>
        <button onClick={onDismiss} className="p-1 hover:bg-white/20 rounded transition-colors" title="Dismiss">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

// News/Updates Feed Component
const NewsUpdatesFeed = () => {
  const [showAll, setShowAll] = useState(false);
  const displayedNews = showAll ? NEWS_UPDATES : NEWS_UPDATES.slice(0, 3);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4">
        <h2 className="flex items-center gap-2 font-bold text-2xl">
          <Newspaper size={28} />
          News & Updates
        </h2>
      </div>
      <div className="p-6 bg-gradient-to-br from-white to-purple-50">
        <div className="space-y-4">
          {displayedNews.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                  {formatDate(item.date)}
                </div>
                <div>
                  <h3 className="font-bold text-purple-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {NEWS_UPDATES.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-4 w-full py-2 text-purple-700 hover:text-purple-900 font-medium text-sm flex items-center justify-center gap-2"
          >
            {showAll ? <><ChevronUp size={18} /> Show Less</> : <><ChevronDown size={18} /> Show All Updates ({NEWS_UPDATES.length})</>}
          </button>
        )}
      </div>
    </div>
  );
};

// FAQ Section Component
const FAQSection = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  return (
    <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4">
        <h2 className="flex items-center gap-2 font-bold text-2xl">
          <HelpCircle size={28} />
          Frequently Asked Questions
        </h2>
      </div>
      <div className="p-6 bg-gradient-to-br from-white to-purple-50">
        <div className="space-y-3">
          {FAQ_DATA.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl border-2 border-purple-200 overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full px-4 py-3 text-left flex items-center justify-between gap-4 hover:bg-purple-50 transition-colors"
              >
                <span className="font-medium text-purple-900">{faq.question}</span>
                {expandedFaq === idx ? <ChevronUp size={20} className="text-purple-600 flex-shrink-0" /> : <ChevronDown size={20} className="text-purple-600 flex-shrink-0" />}
              </button>
              {expandedFaq === idx && (
                <div className="px-4 pb-4 pt-0">
                  <div className="bg-purple-50 p-4 rounded-lg text-sm text-gray-700 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-xl border-2 border-purple-300">
          <p className="text-sm text-purple-800">
            <span className="font-bold">Still have questions?</span> Contact the Project Manager at{' '}
            <a href="mailto:cbrown58@uwo.ca" className="underline hover:text-purple-900">cbrown58@uwo.ca</a>
            {' '}or call <span className="font-medium">226-238-9970</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

// Training Tracker Component
const TrainingTracker = ({ partnersData }) => {
  const completedCount = Object.values(TRAINING_STATUS).filter(s => s.completed).length;
  const totalCount = Object.keys(TRAINING_STATUS).length;
  const progressPercent = (completedCount / totalCount) * 100;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4">
        <h2 className="flex items-center gap-2 font-bold text-2xl">
          <GraduationCap size={28} />
          Drug-Checking Peer (DCP) Training Status
        </h2>
      </div>
      <div className="p-6 bg-gradient-to-br from-white to-purple-50">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-purple-900">Network Training Progress</span>
            <span className="text-sm font-bold text-purple-700">{completedCount} of {totalCount} sites ({Math.round(progressPercent)}%)</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {partnersData.map((site) => {
            const status = TRAINING_STATUS[site.id];
            return (
              <div 
                key={site.id}
                className={`p-3 rounded-xl border-2 flex items-center gap-3 ${
                  status?.completed 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  status?.completed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-500'
                }`}>
                  {status?.completed ? <Check size={18} /> : <Clock size={18} />}
                </div>
                <div className="min-w-0">
                  <div className={`font-medium text-sm truncate ${
                    status?.completed ? 'text-green-900' : 'text-gray-700'
                  }`}>
                    {site.nameOrganization.length > 30 ? site.nameOrganization.substring(0, 27) + '...' : site.nameOrganization}
                  </div>
                  <div className="text-xs text-gray-500">
                    {status?.completed 
                      ? `Completed ${formatDate(status.date)}` 
                      : 'Training Pending'
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Training Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-300"></div>
            <span className="text-gray-600">Training Pending</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-4 bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
          <p className="text-sm text-yellow-800">
            <span className="font-bold">Ready to schedule training?</span> Contact the Project Manager at{' '}
            <a href="mailto:cbrown58@uwo.ca" className="underline hover:text-yellow-900">cbrown58@uwo.ca</a>
            {' '}to arrange a virtual training session for your team.
          </p>
        </div>
      </div>
    </div>
  );
};

// Print Contact List Function
const printContactList = (partnersData) => {
  const printWindow = window.open('', '_blank');
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Project Partner Contact List - ${today}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
        h1 { font-size: 18px; color: #5b21b6; margin-bottom: 5px; }
        h2 { font-size: 12px; color: #666; font-weight: normal; margin-top: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background-color: #5b21b6; color: white; font-size: 10px; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { margin-top: 20px; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
        @media print {
          body { margin: 10px; }
          table { font-size: 9px; }
          th, td { padding: 4px; }
        }
      </style>
    </head>
    <body>
      <h1>Western University Drug-Checking Network</h1>
      <h2>Project Partner Contact List - Generated ${today}</h2>
      <table>
        <thead>
          <tr>
            <th>Organization</th>
            <th>City, Prov</th>
            <th>Primary Contact</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Additional Contact</th>
            <th>Email</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          ${partnersData.map(site => `
            <tr>
              <td><strong>${site.nameOrganization}</strong></td>
              <td>${site.city}, ${site.prov}</td>
              <td>${site.primaryContact}</td>
              <td>${site.email1}</td>
              <td>${site.phone1}</td>
              <td>${site.additionalContact}</td>
              <td>${site.email2}</td>
              <td>${site.phone2}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p><strong>Project Contact:</strong> Cameron Brown, Project Manager | cbrown58@uwo.ca | 226-238-9970</p>
        <p><strong>Principal Investigator:</strong> Prof. Francois Lagugne-Labarthet | flagugne@uwo.ca | 519-661-2111 x81006</p>
        <p><em>This document contains confidential contact information. Please do not share outside the project network.</em></p>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 250);
};

// Table of Contents Component
const TableOfContents = () => {
  const sections = [
    { id: 'csuch', label: 'Canadian Substance Use Costs and Harms' },
    { id: 'news', label: 'News & Updates' },
    { id: 'timeline', label: 'Project Background & Timeline' },
    { id: 'presentation', label: 'Project Overview Presentation' },
    { id: 'publications', label: 'Project-Related Publications' },
    { id: 'documents', label: 'Research, Ethics & Related Documents' },
    { id: 'map', label: 'Interactive Map View of Project Partner Sites' },
    { id: 'table', label: 'Project Partner Contact Info' },
    { id: 'metrics', label: 'Summary Metrics' },
    { id: 'faq', label: 'FAQ' },
    { id: 'discussion', label: 'Partner Discussion Board' },
    { id: 'links', label: 'Related Links & Resources' }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="mt-4 bg-white p-4 rounded-xl border-2 border-purple-300 shadow-md">
      <div className="font-bold text-purple-900 mb-3 text-sm">Quick Navigation:</div>
      <div className="grid grid-cols-2 gap-3">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-left flex items-center gap-2 border-2 border-purple-700 hover:scale-[1.02]"
          >
            <span className="text-purple-200">→</span> {section.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const ProjectPartnerDashboard = () => {
  const [expandedMetrics, setExpandedMetrics] = useState({});
  const [expandedRow, setExpandedRow] = useState(null);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  const toggleMetric = (metricId) => {
    setExpandedMetrics(prev => ({
      ...prev,
      [metricId]: !prev[metricId]
    }));
  };

  const toggleRow = (rowId) => {
    setExpandedRow(expandedRow === rowId ? null : rowId);
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const partnersData = [
    { id: 1, nameOrganization: "Western University", address: "1151 Richmond Street", city: "London", prov: "ON", primaryContact: "Francois Lagugne-Labarthet, Primary Investigator", email1: "flagugne@uwo.ca", phone1: "519-661-2111 x81006", additionalContact: "Cameron Brown, Project Manager", email2: "cbrown58@uwo.ca", phone2: "226-238-9970", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 42.9849, lng: -81.2453, isLead: true },
    { id: 2, nameOrganization: "Regional HIV/AIDS Connection (RHAC)", address: "446 York Street", city: "London", prov: "ON", primaryContact: "Megan Van Boheemen", email1: "mvanboheemen@hivaidsconnection.ca", phone1: "226-377-8721", additionalContact: "Donovan Wiebe", email2: "DWiebe@hivaidsconnection.ca", phone2: "519-434-1601", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 42.9835, lng: -81.2497 },
    { id: 3, nameOrganization: "Sandy Hill Community Health Centre", address: "221 Nelson Street", city: "Ottawa", prov: "ON", primaryContact: "Dean Dewar", email1: "ddewar@sandyhillchc.on.ca", phone1: "613-795-8985", additionalContact: "Fiona Miller", email2: "fmiller@sandyhillchc.on.ca", phone2: "613-277-8932", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 45.4215, lng: -75.6972 },
    { id: 4, nameOrganization: "Ottawa Inner City Health", address: "5 Myrand Ave", city: "Ottawa", prov: "ON", primaryContact: "Louise Beaudoin", email1: "lbeaudoin@oich.ca", phone1: "613-797-7514", additionalContact: "Chad Bouthillier", email2: "cbouthillier@oich.ca", phone2: "613-709-9656", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 45.4235, lng: -75.6919 },
    { id: 5, nameOrganization: "Lower Mainland Purpose Society", address: "40 Begbie Street", city: "New Westminster", prov: "BC", primaryContact: "Lynda Fletcher-Gordon", email1: "lyndafg@purposesociety.org", phone1: "604-526-2522", additionalContact: "Jasmine Kaur", email2: "jasmine.kaur@purposesociety.org", phone2: "236-883-5584", devicesAssigned: "1", exemptionType1: "Mobile", exemptionType2: "NA", lat: 49.2057, lng: -122.9110 },
    { id: 6, nameOrganization: "County of Grey", address: "595 9th Avenue East", city: "Owen Sound", prov: "ON", primaryContact: "Kevin McNab", email1: "kevin.mcnab@grey.ca", phone1: "519-379-0279", additionalContact: "Teresa Tibbo", email2: "Teresa.Tibbo@grey.ca", phone2: "519-379-8743", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "Mobile", lat: 44.5667, lng: -80.9333 },
    { id: 7, nameOrganization: "Guelph Community Health Centre", address: "176 Wyndham Street North", city: "Guelph", prov: "ON", primaryContact: "Lindsey Sodtke", email1: "lsodtke@guephchc.ca", phone1: "519-821-6638 Ext302", additionalContact: "Cristiane Kraft", email2: "ckraft@guelphchc.ca", phone2: "519-821-6638 Ext341", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 43.5448, lng: -80.2482 },
    { id: 8, nameOrganization: "Sanguen Health Centre", address: "150 Duke Street West", city: "Kitchener", prov: "ON", primaryContact: "Leigh Wardlaw", email1: "l.wardlaw@sanguen.com", phone1: "226-789-5250", additionalContact: "Violet Umanetz", email2: "v.umanetz@sanguen.com", phone2: "519-547-7222", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "Mobile", lat: 43.4516, lng: -80.4925 },
    { id: 9, nameOrganization: "Moyo Health", address: "7700 Hurontario St. #601", city: "Brampton", prov: "ON", primaryContact: "Jillian Watkins", email1: "jillianw@moyohcs.ca", phone1: "905-361-0523 x215", additionalContact: "Adam Chalcraft", email2: "adamc@moyohcs.ca", phone2: "905-781-0223", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 43.7315, lng: -79.7624 },
    { id: 10, nameOrganization: "Hamilton Urban Core Community Health Centre", address: "70 St. James Street South", city: "Hamilton", prov: "ON", primaryContact: "Sandy Ezepue", email1: "ezepues@hucchc.com", phone1: "905-522-3233 Ext246", additionalContact: "Tiffany Toplin", email2: "ttoplin@hucchc.com", phone2: "905-522-3233 Ext238", devicesAssigned: "1", exemptionType1: "Mobile", exemptionType2: "NA", lat: 43.2557, lng: -79.8711 },
    { id: 11, nameOrganization: "Positive Living Niagara", address: "120 Queenston St", city: "St. Catharines", prov: "ON", primaryContact: "Talia Storm", email1: "tstorm@positivelivingniagra.com", phone1: "905-984-8684 Ext128", additionalContact: "Myrtle Stage", email2: "mstage@positivelivingniagra.com", phone2: "905-984-8684 Ext312", devicesAssigned: "2", exemptionType1: "Non-Mobile", exemptionType2: "Mobile", lat: 43.1594, lng: -79.2469, hasBothExemptions: true },
    { id: 12, nameOrganization: "Ensemble Moncton", address: "80 Weldon Street", city: "Moncton", prov: "NB", primaryContact: "Scott Phipps", email1: "sphipps@ensemblegm.ca", phone1: "506-859-9616", additionalContact: "Josue Goguen", email2: "jgoguen@ensemblegm.ca", phone2: "506-227-6416", devicesAssigned: "2", exemptionType1: "Non-Mobile", exemptionType2: "Mobile", lat: 46.0878, lng: -64.7782, hasBothExemptions: true },
    { id: 13, nameOrganization: "Prairie Harm Reduction", address: "1516 20th St W", city: "Saskatoon", prov: "SK", primaryContact: "Kayla DeMong", email1: "admin@prairiehr.ca", phone1: "306-242-5005 Ext 4", additionalContact: "Julene Rawson", email2: "operations@prairiehr.ca", phone2: "306-242-5005 Ext4", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 52.1332, lng: -106.6700 },
    { id: 14, nameOrganization: "Cochrane District Paramedic Service", address: "500 Algonquin Blvd East", city: "Timmins", prov: "ON", primaryContact: "Seamus Murphy", email1: "seamus.murphy@cdsb.care", phone1: "705-268-772 x296", additionalContact: "Chantal Riva", email2: "Chantal.riva@cdsb.care", phone2: "705-268-722 x150", devicesAssigned: "1", exemptionType1: "Mobile", exemptionType2: "NA", lat: 48.4758, lng: -81.3304 },
    { id: 15, nameOrganization: "Renfrew Paramedic Services", address: "450 O'Brien Rd", city: "Renfrew", prov: "ON", primaryContact: "Stephanie Rose", email1: "SRose@countyofrenfrew.on.ca", phone1: "613-818-9813", additionalContact: "TBD", email2: "TBD", phone2: "TBD", devicesAssigned: "1", exemptionType1: "Mobile", exemptionType2: "NA", lat: 45.4729, lng: -76.6867 },
    { id: 16, nameOrganization: "Peterborough AIDS Resource Network", address: "60 Hunter St E 2nd Floor", city: "Peterborough", prov: "ON", primaryContact: "Dane Record", email1: "executivedirector@parn.ca", phone1: "705-559-0656", additionalContact: "Aizha Polluck", email2: "aizha@parn.ca", phone2: "705-749-9110 Ext206", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 44.3091, lng: -78.3197 },
    { id: 17, nameOrganization: "Travailderue", address: "221 Rue Tessier", city: "Chicoutimi", prov: "QC", primaryContact: "Stephanie Bouchard", email1: "stephanie.bouchard@strchic.com", phone1: "418-545-0999", additionalContact: "Janick Meunier", email2: "janick.meunier@strchic.com", phone2: "418-545-0999", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 48.4284, lng: -71.0649 },
    { id: 18, nameOrganization: "NHC Society", address: "76 Esplanade", city: "Truro", prov: "NS", primaryContact: "Alana Weatherbee", email1: "support@nhcsociety.ca", phone1: "902-895-0931", additionalContact: "Albert McNutt", email2: "super@nhcsociety.ca", phone2: "902-895-0931", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 45.3669, lng: -63.2755 },
    { id: 19, nameOrganization: "Breakaway", address: "21 Strickland Ave", city: "Toronto", prov: "ON", primaryContact: "Ruben Tarajano", email1: "Rubent@breakawaycs.ca", phone1: "647-883-1135", additionalContact: "Angie Porter", email2: "AngieP@breakawaycs.ca", phone2: "416-537-9346 Ext235", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 43.6532, lng: -79.3832 },
    { id: 20, nameOrganization: "AIDS New Brunswick", address: "354 King St", city: "Fredericton", prov: "NB", primaryContact: "Linda Thompson-Brown", email1: "linda@aidsnb.com", phone1: "506-455-2625", additionalContact: "Jess Gionet", email2: "Jess.gionet@aidsnb.com", phone2: "506-478-4765", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 45.9636, lng: -66.6431 },
    { id: 21, nameOrganization: "Avenue B Harm Reduction Inc.", address: "62 Waterloo St", city: "Saint John", prov: "NB", primaryContact: "Laura MacNeill", email1: "laura.macneill@avenueb.ca", phone1: "506-652-2437", additionalContact: "Allie Myles", email2: "allie.myles@avenueb.ca", phone2: "506-652-2437", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "Mobile", lat: 45.2733, lng: -66.0633 },
    { id: 22, nameOrganization: "Boyle Street Service Society", address: "#201, 14065 Victoria Trail", city: "Edmonton", prov: "AB", primaryContact: "Sindi Addorisio", email1: "saddorisio@boylestreet.org", phone1: "587-340-2985", additionalContact: "Marliss Taylor", email2: "MTaylor@boylestreet.org", phone2: "708-915-2209", devicesAssigned: "1", exemptionType1: "Non-Mobile", exemptionType2: "NA", lat: 53.5461, lng: -113.4938 }
  ];

  const getSitesByProvince = () => {
    const byProvince = {};
    partnersData.forEach(site => {
      if (!byProvince[site.prov]) byProvince[site.prov] = [];
      byProvince[site.prov].push(site.nameOrganization);
    });
    return byProvince;
  };

  const sitesByProvince = getSitesByProvince();
  const getMobileSites = () => partnersData.filter(site => site.exemptionType1 === "Mobile" || site.exemptionType2 === "Mobile");
  const getNonMobileSites = () => partnersData.filter(site => site.exemptionType1 === "Non-Mobile" || site.exemptionType2 === "Non-Mobile");

  const getStatistics = () => {
    const provinces = [...new Set(partnersData.map(s => s.prov))];
    const totalDevices = partnersData.reduce((sum, s) => sum + parseInt(s.devicesAssigned), 0);
    return { totalPartners: partnersData.length, provinces, totalDevices, mobileSites: getMobileSites(), nonMobileSites: getNonMobileSites() };
  };

  const stats = getStatistics();
  const challengeUrl = "https://impact.canada.ca/en/challenges/drug-checking-challenge";

  const ProjectTimeline = () => {
    const today = new Date();
    const projectStart = new Date('2024-04-01');
    const projectEnd = new Date('2028-03-31');
    
    // Calculate fiscal year progress (4 fiscal years, each 25% of visual width)
    const fy1End = new Date('2025-03-31');
    const fy2End = new Date('2026-03-31');
    const fy3End = new Date('2027-03-31');
    
    let fyNumber, fyProgress;
    if (today <= fy1End) {
      fyNumber = 0;
      const fy1Start = new Date('2024-04-01');
      fyProgress = (today - fy1Start) / (fy1End - fy1Start);
    } else if (today <= fy2End) {
      fyNumber = 1;
      const fy2Start = new Date('2025-04-01');
      fyProgress = (today - fy2Start) / (fy2End - fy2Start);
    } else if (today <= fy3End) {
      fyNumber = 2;
      const fy3Start = new Date('2026-04-01');
      fyProgress = (today - fy3Start) / (fy3End - fy3Start);
    } else {
      fyNumber = 3;
      const fy4Start = new Date('2027-04-01');
      fyProgress = (today - fy4Start) / (projectEnd - fy4Start);
    }
    const progressPercent = Math.min(Math.max(((fyNumber + fyProgress) / 4) * 100, 0), 100);
    
    // Calculate HC timeline progress based on visual year positions (7 year markers, evenly spaced)
    const hcStartYear = 2022;
    const hcEndYear = 2028;
    const totalYearSpan = hcEndYear - hcStartYear; // 6 years
    const currentYear = today.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const dayOfYear = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
    const daysInYear = ((currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0) ? 366 : 365;
    const yearFraction = dayOfYear / daysInYear;
    const yearsFromStart = Math.min(Math.max((currentYear - hcStartYear) + yearFraction, 0), totalYearSpan);
    const hcProgressPercent = (yearsFromStart / totalYearSpan) * 100;
    
    const formatDate = (date) => date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
      <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4">
          <h2 className="flex items-center gap-2 font-bold text-2xl"><Clock size={28} />Project Background & Timeline</h2>
        </div>
        <div className="p-6 bg-gradient-to-br from-white to-purple-50">
          <div className="relative">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                Drug Checking Technology Challenge (2018-2021)
                <a href={challengeUrl} target="_blank" rel="noopener noreferrer" className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm hover:bg-purple-700 flex items-center gap-1">Learn More <ExternalLink size={14} /></a>
              </h3>
              <div className="relative">
                <div className="absolute top-1/2 left-0 right-0 h-2 bg-gradient-to-r from-purple-400 via-purple-600 to-purple-800 transform -translate-y-1/2"></div>
                <div className="relative flex justify-between items-center py-8">
                  <div className="flex flex-col items-center">
                    <div className="bg-purple-600 text-white font-bold text-lg px-4 py-2 rounded-full shadow-lg mb-2 flex items-center gap-1">2018 <Check size={16} className="text-green-300" /></div>
                    <div className="w-5 h-5 bg-purple-600 rounded-full border-4 border-white shadow-lg"></div>
                    <div className="mt-4 bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl shadow-lg border-2 border-purple-300 max-w-[180px] text-center">
                      <div className="font-bold text-purple-900 text-sm flex items-center justify-center gap-1">Challenge Launched <a href={challengeUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800"><ExternalLink size={14} /></a></div>
                      <div className="text-xs text-purple-700 mt-1">October 2018</div>
                      <div className="text-xs text-purple-600">Health Canada</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="mb-4 bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl shadow-lg border-2 border-purple-300 max-w-[150px] text-center">
                      <div className="font-bold text-purple-900 text-sm flex items-center justify-center gap-1">Application Deadline <a href={challengeUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800"><ExternalLink size={14} /></a></div>
                    </div>
                    <div className="w-5 h-5 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div>
                    <div className="bg-purple-500 text-white font-bold text-lg px-4 py-2 rounded-full shadow-lg mt-2 flex items-center gap-1">2019 <Check size={16} className="text-green-300" /></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-purple-500 text-white font-bold text-lg px-4 py-2 rounded-full shadow-lg mb-2 flex items-center gap-1">2020 <Check size={16} className="text-green-300" /></div>
                    <div className="w-5 h-5 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div>
                    <div className="mt-4 bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl shadow-lg border-2 border-purple-300 max-w-[150px] text-center">
                      <div className="font-bold text-purple-900 text-sm flex items-center justify-center gap-1">Pilot-Phase <a href={challengeUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800"><ExternalLink size={14} /></a></div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="mb-4 bg-gradient-to-br from-yellow-100 to-yellow-200 p-3 rounded-xl shadow-lg border-2 border-yellow-400 max-w-[220px] text-center">
                      <div className="flex items-center justify-center gap-1 mb-1"><Trophy className="text-yellow-600" size={16} /><span className="font-bold text-yellow-800 text-sm">Scatr Wins!</span><a href="https://www.canada.ca/en/health-canada/news/2021/07/government-of-canada-announces-the-grand-prize-winner-of-the-drug-checking-technology-challenge.html" target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:text-yellow-800"><ExternalLink size={14} /></a></div>
                      <div className="text-xs text-yellow-700">$1,000,000 Prize</div>
                    </div>
                    <div className="w-6 h-6 bg-yellow-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center"><Trophy className="text-white" size={12} /></div>
                    <div className="bg-purple-700 text-white font-bold text-lg px-4 py-2 rounded-full shadow-lg mt-2 flex items-center gap-1">2021 <Check size={16} className="text-green-300" /></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 mb-8">
              <h3 className="text-xl font-bold text-purple-900 mb-4">
                Health Canada Contribution Agreements w/ Western University (2022-2028)
              </h3>
              <div className="relative pt-12">
                <div className="absolute top-0 flex flex-col items-center z-10" style={{ left: `${hcProgressPercent}%`, transform: 'translateX(-50%)' }}>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-2 py-1 rounded-lg shadow-lg text-xs font-bold whitespace-nowrap">We Are Here</div>
                  <div className="text-xs text-green-700 font-medium whitespace-nowrap">{formatDate(today)}</div>
                  <div className="w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-green-500 mt-1"></div>
                  <div className="w-1 h-6 bg-green-500"></div>
                </div>
                <div className="absolute top-12 left-0 right-0 h-2 bg-gradient-to-r from-purple-400 via-purple-600 to-purple-800"></div>
                <div className="relative flex justify-between items-start pt-8" style={{ marginTop: '8px' }}>
                  <div className="flex flex-col items-center">
                    <div className="bg-purple-600 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg mb-2 flex items-center gap-1">2022 <Check size={14} className="text-green-300" /></div>
                    <div className="w-5 h-5 bg-purple-600 rounded-full border-4 border-white shadow-lg"></div>
                    <div className="mt-4 bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl shadow-lg border-2 border-purple-300 max-w-[220px] text-center">
                      <div className="font-bold text-purple-900 text-sm">Phase #1</div>
                      <div className="text-xs text-purple-600 mt-1">Creating a Drug Checking Network Using Machine Learning Enabled Spectrometers</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-purple-500 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg mb-2 flex items-center gap-1">2023 <Check size={14} className="text-green-300" /></div>
                    <div className="w-4 h-4 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  <div className="flex flex-col items-center relative">
                    <div className="mb-2 bg-gradient-to-br from-purple-200 to-purple-300 p-3 rounded-xl shadow-lg border-2 border-purple-400 max-w-[220px] text-center">
                      <div className="font-bold text-purple-900 text-sm">Phase #2</div>
                      <div className="text-xs text-purple-600 mt-1">Leading the Way: PWLLE at the Forefront of Drug-Checking Initiatives</div>
                    </div>
                    <div className="w-5 h-5 bg-purple-600 rounded-full border-4 border-white shadow-lg"></div>
                    <div className="bg-purple-600 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg mt-2 flex items-center gap-1">2024 <Check size={14} className="text-green-300" /></div>
                    <div className="absolute top-full mt-2 flex flex-col items-center">
                      <div className="w-1 h-16 bg-purple-500"></div>
                      <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-purple-500"></div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center"><div className="bg-purple-500 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg mb-2 flex items-center gap-1">2025 {currentYear >= 2025 && <Check size={14} className="text-green-300" />}</div><div className="w-4 h-4 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div></div>
                  <div className="flex flex-col items-center"><div className="bg-purple-500 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg mb-2">2026</div><div className="w-4 h-4 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div></div>
                  <div className="flex flex-col items-center"><div className="bg-purple-500 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg mb-2">2027</div><div className="w-4 h-4 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div></div>
                  <div className="flex flex-col items-center">
                    <div className="bg-purple-800 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg mb-2">2028</div>
                    <div className="w-5 h-5 bg-purple-800 rounded-full border-4 border-white shadow-lg"></div>
                    <div className="mt-4 bg-gradient-to-br from-purple-100 to-purple-200 p-2 rounded-xl shadow-lg border-2 border-purple-300 max-w-[100px] text-center"><div className="font-bold text-purple-900 text-xs">Project End</div><div className="text-xs text-purple-600">Mar 31, 2028</div></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-24">
              <h3 className="text-xl font-bold text-purple-900 mb-4">Phase #2 (CURRENT) Project Fiscal Years (April 1, 2024 - March 31, 2028)</h3>
              <div className="relative pt-16 pb-8">
                <div className="absolute top-0 flex flex-col items-center z-10" style={{ left: `${progressPercent}%`, transform: 'translateX(-50%)' }}>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-bold whitespace-nowrap">We Are Here</div>
                  <div className="text-xs text-green-700 font-medium mt-1 whitespace-nowrap">{formatDate(today)}</div>
                  <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-green-500 mt-1"></div>
                  <div className="w-1 h-8 bg-green-500"></div>
                </div>
                <div className="relative h-16 bg-gray-200 rounded-full overflow-hidden shadow-inner mt-8">
                  <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-l-full" style={{ width: `${progressPercent}%` }}></div>
                  <div className="absolute inset-0 flex">
                    <div className="flex-1 border-r-2 border-white flex items-center justify-center"><div className="text-center"><div className="font-bold text-purple-900 text-sm">Fiscal Year 1</div><div className="text-xs text-purple-700">Apr 1, 2024 - Mar 31, 2025</div></div></div>
                    <div className="flex-1 border-r-2 border-white flex items-center justify-center"><div className="text-center"><div className="font-bold text-purple-900 text-sm">Fiscal Year 2</div><div className="text-xs text-purple-700">Apr 1, 2025 - Mar 31, 2026</div></div></div>
                    <div className="flex-1 border-r-2 border-white flex items-center justify-center"><div className="text-center"><div className="font-bold text-purple-900 text-sm">Fiscal Year 3</div><div className="text-xs text-purple-700">Apr 1, 2026 - Mar 31, 2027</div></div></div>
                    <div className="flex-1 flex items-center justify-center"><div className="text-center"><div className="font-bold text-purple-900 text-sm">Fiscal Year 4</div><div className="text-xs text-purple-700">Apr 1, 2027 - Mar 31, 2028</div></div></div>
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <div className="text-center"><div className="font-bold text-purple-800 text-sm">Project Start</div><div className="text-xs text-purple-600">April 1, 2024</div></div>
                  <div className="text-center"><div className="font-bold text-purple-800 text-sm">Project End</div><div className="text-xs text-purple-600">March 31, 2028</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SiteDetails = ({ site }) => (
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
      <div><span className="font-semibold">Exemption Type #1:</span> {site.exemptionType1}</div>
      {site.exemptionType2 !== "NA" && <div><span className="font-semibold">Exemption Type #2:</span> {site.exemptionType2}</div>}
    </div>
  );

  const MapView = () => (
    <div className="h-[600px] rounded-xl overflow-hidden shadow-2xl border-4 border-purple-200 relative">
      <MapContainer center={[52.0, -95.0]} zoom={4} style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ResetMapButton />
        {partnersData.map((site) => (
          <Marker key={site.id} position={[site.lat, site.lng]}>
            <Tooltip permanent direction="top" offset={[0, -10]} className="font-semibold text-xs">{site.nameOrganization.length > 25 ? site.nameOrganization.substring(0, 22) + '...' : site.nameOrganization}</Tooltip>
            <Popup maxWidth={350}><SiteDetails site={site} /></Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );

  const TableView = () => (
    <div className="space-y-4">
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
              <th className="border border-purple-300 p-2 text-left font-bold">Type #1</th>
              <th className="border border-purple-300 p-2 text-left font-bold">Type #2</th>
            </tr>
          </thead>
          <tbody>
            {partnersData.map((site, idx) => (
              <tr key={site.id} onClick={() => toggleRow(site.id)} className={`cursor-pointer transition-all duration-200 ${expandedRow === site.id ? 'bg-purple-200 scale-[1.02] shadow-lg z-10 relative' : site.isLead ? 'bg-purple-200 border-4 border-purple-600' : idx % 2 === 0 ? 'bg-purple-50 hover:bg-purple-100' : 'bg-white hover:bg-purple-50'}`}>
                <td className={`border border-purple-200 p-2 font-bold text-purple-900 ${expandedRow === site.id ? 'text-base py-4' : ''}`}>{site.nameOrganization}</td>
                <td className={`border border-purple-200 p-2 font-medium ${expandedRow === site.id ? 'py-4' : ''}`}>{site.address}</td>
                <td className={`border border-purple-200 p-2 font-medium ${expandedRow === site.id ? 'py-4' : ''}`}>{site.city}</td>
                <td className={`border border-purple-200 p-2 font-medium ${expandedRow === site.id ? 'py-4' : ''}`}>{site.prov}</td>
                <td className={`border border-purple-200 p-2 font-medium ${expandedRow === site.id ? 'py-4' : ''}`}>{site.primaryContact}</td>
                <td className={`border border-purple-200 p-2 font-medium text-blue-700 ${expandedRow === site.id ? 'py-4' : ''}`}>{site.email1}</td>
                <td className={`border border-purple-200 p-2 font-medium ${expandedRow === site.id ? 'py-4' : ''}`}>{site.phone1}</td>
                <td className={`border border-purple-200 p-2 font-medium ${expandedRow === site.id ? 'py-4' : ''}`}>{site.additionalContact}</td>
                <td className={`border border-purple-200 p-2 font-medium text-blue-700 ${expandedRow === site.id ? 'py-4' : ''}`}>{site.email2}</td>
                <td className={`border border-purple-200 p-2 font-medium ${expandedRow === site.id ? 'py-4' : ''}`}>{site.phone2}</td>
                <td className={`border border-purple-200 p-2 font-bold text-center ${expandedRow === site.id ? 'py-4' : ''}`}>{site.devicesAssigned}</td>
                <td className={`border border-purple-200 p-2 font-medium ${expandedRow === site.id ? 'py-4' : ''}`}>{site.exemptionType1}</td>
                <td className={`border border-purple-200 p-2 font-medium ${expandedRow === site.id ? 'py-4' : ''}`}>{site.exemptionType2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 text-center italic">Click on any row to expand for easier viewing</p>
    </div>
  );

  const ResearchDocuments = () => (
    <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4">
        <h2 className="flex items-center gap-2 font-bold text-2xl"><FileText size={28} />Research, Ethics & Related Documents</h2>
      </div>
      <div className="p-6 bg-gradient-to-br from-white to-purple-50">
        <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border-2 border-purple-200">
          <div className="space-y-2">
            <a href="/LOI-Phase1.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Drug-Checking Device Use - Letter of Information & Consent (PDF)</a>
            <a href="/LOI-DCP-Training.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Drug-Checking Peer Training - Letter of Information & Consent (PDF)</a>
            <a href="/DCP-Survey.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Drug-Checking Peer Training - Pre- and Post-Surveys (PDF)</a>
            <a href="/DCP-Certificate-Example.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Drug-Checking Peer Training - Example Certificate of Achievement (PDF)</a>
            <a href="/Collaborative-Site-Agreement.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Collaborative Site Agreement - Example Template (PDF)</a>
            <a href="/Exemption-56-Template.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Exemption 56 Approved - Redacted Template (PDF)</a>
            <a href="/Exemption-56-Blank.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Exemption 56 Application - Blank Template (PDF)</a>
            <a href="/Scatr-Results-FAQ.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Scatr Results Explanation Document (PDF)</a>
            <a href="/Scatr-LOD-Study.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Scatr Series One LOD Study (PDF)</a>
            <a href="/Scatr-Technical-Research-Strategy.pdf" target="_blank" className="flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm p-2 bg-white rounded border border-purple-200 hover:bg-purple-50"><Download size={16} />Scatr Technical Research Strategy (PDF)</a>
          </div>
          <p className="text-xs text-gray-500 mt-2 italic">Click to view or download PDF documents</p>
        </div>
      </div>
    </div>
  );

  const linksData = [
    // === PROJECT & SCATR RESOURCES ===
    { title: "Western News: Health Canada Grant", url: "https://news.westernu.ca/2023/04/health-canada-grant-funds-innovative-drug-checking-technology/", description: "Chemistry professor Francois Lagugné-Labarthet teams up with Scatr Inc. to pilot drug-checking technology.", category: "Project & Scatr" },
    { title: "Impact Canada - Drug Checking Challenge", url: "https://impact.canada.ca/en/challenges/drug-checking-challenge", description: "Official Government of Canada page for the Drug Checking Technology Challenge.", category: "Project & Scatr" },
    { title: "Grand Prize Winner Announcement", url: "https://www.canada.ca/en/health-canada/news/2021/07/government-of-canada-announces-the-grand-prize-winner-of-the-drug-checking-technology-challenge.html", description: "Health Canada announces Scatr Inc. as the $1 million grand prize winner.", category: "Project & Scatr" },
    { title: "Toronto Met - Fighting the Opioid Crisis", url: "https://www.torontomu.ca/magazine/2019/08/how-an-aerospace-engineer-is-fighting-the-opioid-crisis/", description: "Profile of Scatr founder applying aerospace engineering to harm reduction.", category: "Project & Scatr" },
    { title: "Scatr Portal (Partner Login)", url: "https://scatr.ca/auth", description: "Secure login for partners to access the drug-checking data management system.", category: "Project & Scatr" },
    { title: "Scatr Live Dashboard", url: "https://scatr.live/", description: "Public dashboard with real-time drug-checking results across the network.", category: "Project & Scatr" },
    // === DRUG CHECKING PROGRAMS ===
    { title: "BCCSU Drug Checking", url: "https://drugcheckingbc.ca/", description: "BC Centre on Substance Use drug checking program information.", category: "Drug Checking" },
    { title: "CCSA - Drug Checking", url: "https://www.ccsa.ca/drug-checking", description: "Canadian Centre on Substance Use resources on drug checking.", category: "Drug Checking" },
    { title: "Sanguen - Drug Checking Program", url: "https://www.sanguen.com/drug-checking", description: "Drug checking services at Sanguen Health Centre - project partner.", category: "Drug Checking" },
    { title: "CDA-AMC - Drug-Checking Technologies", url: "https://www.cadth.ca/", description: "Review of drug-checking technologies for unregulated substances.", category: "Drug Checking" },
    // === GOVERNMENT & HEALTH CANADA ===
    { title: "Health Canada - Opioid/Stimulant Harms", url: "https://health-infobase.canada.ca/substance-related-harms/opioids-stimulants/", description: "Latest statistics on opioid and stimulant-related harms in Canada.", category: "Government" },
    { title: "Health Canada - SCS Statistics", url: "https://www.canada.ca/en/health-canada/services/substance-use/supervised-consumption-sites/status-application.html", description: "Federal statistics on supervised consumption sites in Canada.", category: "Government" },
    { title: "Health Canada - Apply for SCS", url: "https://www.canada.ca/en/health-canada/services/substance-use/supervised-consumption-sites/apply.html", description: "Federal application process for supervised consumption sites.", category: "Government" },
    { title: "CCRA 2024 Legislation", url: "https://www.ontario.ca/laws/statute/24c27", description: "Full text of Ontario's Community Care and Recovery Act.", category: "Government" },
    // === CATIE RESOURCES ===
    { title: "CATIE - Harm Reduction Toolkit", url: "https://www.catie.ca/harm-reduction-fundamentals-a-toolkit-for-service-providers", description: "Comprehensive toolkit for implementing harm reduction approaches.", category: "CATIE" },
    { title: "CATIE - Ontario HR Program", url: "https://www.catie.ca/caties-ontario-harm-reduction-program", description: "Distribution of harm reduction supplies across Ontario.", category: "CATIE" },
    { title: "CATIE - Monitoring Drug Supply", url: "https://www.catie.ca/monitoring-and-responding-to-the-unregulated-drug-supply", description: "Resources on monitoring the unregulated drug supply.", category: "CATIE" },
    // === CCSA RESOURCES ===
    { title: "CCSA Main Site", url: "https://www.ccsa.ca/", description: "Canadian Centre on Substance Use and Addiction resources.", category: "CCSA" },
    { title: "CSUCH - Costs and Harms Reports", url: "https://csuch.ca/publications/substance-use-costs-and-harms/", description: "Reports on economic and health burden of substance use.", category: "CCSA" },
    // === HARM REDUCTION SERVICES ===
    { title: "Vancouver Coastal Health - Harm Reduction", url: "https://www.vch.ca/en/health-topics/harm-reduction", description: "Comprehensive harm reduction information from BC health authority.", category: "Harm Reduction" },
    { title: "Toward the Heart - Safer Use", url: "https://towardtheheart.com/safer-use", description: "BC harm reduction resources for safer drug use practices.", category: "Harm Reduction" },
    { title: "Ontario Harm Reduction - Find Supplies", url: "https://findneedles.ca/", description: "Find harm reduction supplies across Ontario.", category: "Harm Reduction" },
    { title: "Waterloo Region - CTS Services", url: "https://www.regionofwaterloo.ca/en/health-and-wellness/consumption-and-treatment-services.aspx", description: "Regional supervised consumption and treatment services.", category: "Harm Reduction" },
    { title: "RHAC - Carepoint Service", url: "https://www.hivaidsconnection.ca/carepoint", description: "London's supervised consumption service - project partner site.", category: "Harm Reduction" },
    { title: "LIHC - Safer Opioid Supply", url: "https://www.lihc.on.ca/safer-supply", description: "London InterCommunity Health Centre's safer supply program.", category: "Harm Reduction" },
    { title: "SCS Dashboard Ontario", url: "https://scsdashboard.ca/", description: "Interactive dashboard tracking Ontario supervised consumption site data.", category: "Harm Reduction" },
    // === RESEARCH & PUBLICATIONS ===
    { title: "Harm Reduction Journal", url: "https://harmreductionjournal.biomedcentral.com/", description: "Open-access journal on harm reduction approaches to drug use.", category: "Research" },
    { title: "Johns Hopkins - Fentanyl Test Strips", url: "https://publichealth.jhu.edu/2018/low-tech-low-cost-test-strips-show-promise-for-reducing-fentanyl-overdoses", description: "Research on fentanyl test strips reducing overdose risk.", category: "Research" },
    { title: "CIAJ - Ontario Drug Policy Analysis", url: "https://ciaj-icaj.ca/en/publications/", description: "Analysis of Ontario's drug policy changes and impacts.", category: "Research" },
    // === NEWS & MEDIA ===
    { title: "CBC - Drug-Testing Machine 'Game Changer'", url: "https://www.cbc.ca/news/", description: "Coverage of portable drug-testing machines revolutionizing harm reduction.", category: "News" },
    { title: "CBC - Ontario SCS Policy Changes", url: "https://www.cbc.ca/news/canada/toronto/", description: "News coverage of Ontario policy changes affecting supervised consumption sites.", category: "News" }
  ];

  const RelatedLinks = () => (
    <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-purple-100">
      <div className="flex items-center gap-3 mb-6"><ExternalLink className="text-purple-700" size={32} /><h2 className="font-bold text-2xl text-purple-900">Related Links & Resources</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {linksData.map((link, idx) => (
          <div key={idx} className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-shadow">
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-2 mb-2 text-sm">{link.title} <ExternalLink size={14} /></a>
            <p className="text-xs text-gray-600">{link.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50" id="top">
      <BackToTop />
      {showAnnouncement && <AnnouncementBanner onDismiss={() => setShowAnnouncement(false)} />}
      <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-800 text-white p-6 shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            Western University
            <br /><br />
            <span className="text-slate-300">A Novel Two Phase Drug-Checking Initiative:</span>
            <br />
            Contribution Agreement Funding Provided by Health Canada's Substance Use and Addictions Program (SUAP)
          </h1>
          <p className="text-lg flex items-center justify-center gap-2 mt-4"><Users size={20} />In partnership with <a href="https://scatr.ca/" target="_blank" rel="noopener noreferrer" className="text-sky-300 font-bold hover:text-sky-100 hover:underline">Scatr Inc.</a></p>
        </div>
      </div>
      <div className="px-6 pt-6"><ProjectContactInfo /></div>
      <div className="text-center py-6 bg-gradient-to-r from-purple-50 to-white"><h2 className="text-5xl md:text-6xl font-black text-purple-900 tracking-tight">Interactive Project Partner Dashboard</h2></div>
      <div className="px-6 pb-4">
        <div className="bg-gradient-to-br from-purple-100 to-white p-6 rounded-2xl shadow-lg border-2 border-purple-200">
          <p className="text-gray-800 leading-relaxed">Welcome to the Project Partner Dashboard — a centralized platform designed to provide all project partners with comprehensive visibility into the project's network and infrastructure. While facilitating communication and collaboration across sites, and serving as a resource hub for project-related information.</p>
          <TableOfContents />
          <p className="text-gray-800 leading-relaxed mt-4">As of today (<strong>{todayFormatted}</strong>), Western University's Phase #2 <em>"Leading the Way: PWLLE at the Forefront of Drug-Checking Initiatives"</em>, funded via Health Canada's Substance Use and Addictions Program (SUAP), has successfully allocated <strong>24 spectrometers</strong> across <strong>22 distinct harm reduction sites</strong> across Canada.</p>
          <p className="text-gray-800 leading-relaxed mt-4">Looking ahead, the project aims to deploy 4 more spectrometers before project end: 2 in Fiscal Year 3 (April 1st 2026 to March 31st 2027) and 2 in Fiscal Year 4 (April 1st 2027 to March 31st 2028), bringing the total network capacity upon project completion, to <strong>28 devices</strong>.</p>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div id="csuch" className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden scroll-mt-4">
          <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4">
            <h2 className="flex items-center gap-2 font-bold text-2xl">Canadian Substance Use Costs and Harms</h2>
          </div>
          <div className="p-6 bg-gradient-to-br from-white to-purple-50">
            <img src="/csuch-infographic.png" alt="Canadian Substance Use Costs and Harms Infographic" className="w-full rounded-lg shadow-lg" />
            <p className="text-sm text-gray-600 mt-4 text-center italic">Source: Canadian Centre on Substance Use and Addiction (CCSA), 2023</p>
          </div>
        </div>
        <div id="news" className="scroll-mt-4"><NewsUpdatesFeed /></div>
        <div id="timeline" className="scroll-mt-4"><ProjectTimeline /></div>
        <div id="presentation" className="scroll-mt-4"><PowerPointViewer /></div>
        <div id="publications" className="scroll-mt-4"><ProjectPublications /></div>
        <div id="documents" className="scroll-mt-4"><ResearchDocuments /></div>
        <div id="map" className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden scroll-mt-4">
          <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4"><h2 className="flex items-center gap-2 font-bold text-2xl"><MapPin size={28} />Interactive Map View of Project Partner Sites</h2></div>
          <div className="p-6 bg-gradient-to-br from-white to-purple-50"><MapView /></div>
        </div>
        <div id="table" className="bg-white rounded-2xl shadow-2xl border-4 border-purple-100 overflow-hidden scroll-mt-4">
          <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-2xl"><List size={28} />Project Partner Contact Info</h2>
            <button
              onClick={() => printContactList(partnersData)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              title="Print Contact List"
            >
              <Printer size={18} />
              Print List
            </button>
          </div>
          <div className="p-6 bg-gradient-to-br from-white to-purple-50"><TableView /></div>
        </div>
        <div id="metrics" className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-purple-100 scroll-mt-4">
          <div className="flex items-center gap-3 mb-4"><Users className="text-purple-700" size={32} /><h2 className="font-bold text-2xl text-purple-900">Summary Metrics</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-5 rounded-xl shadow-lg border-2 border-purple-300 hover:shadow-2xl transition-shadow cursor-pointer" onClick={() => toggleMetric('total')}>
              <div className="flex items-center justify-between"><div><div className="text-3xl font-bold text-purple-900">{stats.totalPartners}</div><div className="text-sm text-purple-700 font-medium mt-1">Total Partner Sites</div></div>{expandedMetrics.total ? <ChevronUp className="text-purple-700" /> : <ChevronDown className="text-purple-700" />}</div>
              {expandedMetrics.total && <div className="mt-3 pt-3 border-t border-purple-300 text-xs text-purple-800 space-y-1">{partnersData.map(site => <div key={site.id}>• {site.nameOrganization}</div>)}</div>}
            </div>
            <div className="bg-gradient-to-br from-purple-200 to-purple-300 p-5 rounded-xl shadow-lg border-2 border-purple-400 hover:shadow-2xl transition-shadow"><div className="text-3xl font-bold text-purple-900">{stats.totalDevices} <span className="text-lg font-normal">(of 28 total)</span></div><div className="text-sm text-purple-700 font-medium mt-1">Devices Assigned</div></div>
            <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-5 rounded-xl shadow-lg border-2 border-indigo-300 hover:shadow-2xl transition-shadow cursor-pointer" onClick={() => toggleMetric('provinces')}>
              <div className="flex items-center justify-between"><div><div className="text-3xl font-bold text-indigo-900">{stats.provinces.length}</div><div className="text-sm text-indigo-700 font-medium mt-1">Provinces/Territories</div></div>{expandedMetrics.provinces ? <ChevronUp className="text-indigo-700" /> : <ChevronDown className="text-indigo-700" />}</div>
              {expandedMetrics.provinces && <div className="mt-3 pt-3 border-t border-indigo-300 text-xs text-indigo-800 space-y-2">{Object.entries(sitesByProvince).map(([prov, sites]) => <div key={prov}><div className="font-bold">{prov} ({sites.length}):</div>{sites.map((name, i) => <div key={i} className="ml-2">• {name}</div>)}</div>)}</div>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-teal-100 to-teal-200 p-5 rounded-xl shadow-lg border-2 border-teal-300 hover:shadow-2xl transition-shadow cursor-pointer" onClick={() => toggleMetric('mobile')}>
              <div className="flex items-center justify-between"><div><div className="text-2xl font-bold text-teal-900">{stats.mobileSites.length}</div><div className="text-sm text-teal-700 font-medium mt-1">Mobile Exemptions</div></div>{expandedMetrics.mobile ? <ChevronUp className="text-teal-700" /> : <ChevronDown className="text-teal-700" />}</div>
              {expandedMetrics.mobile && <div className="mt-3 pt-3 border-t border-teal-300 text-xs text-teal-800 space-y-1">{stats.mobileSites.map(site => <div key={site.id}>• {site.nameOrganization}{site.hasBothExemptions ? '*' : ''}</div>)}<div className="mt-2 text-xs italic text-teal-600">* Has both exemption types</div></div>}
            </div>
            <div className="bg-gradient-to-br from-sky-100 to-sky-200 p-5 rounded-xl shadow-lg border-2 border-sky-300 hover:shadow-2xl transition-shadow cursor-pointer" onClick={() => toggleMetric('nonMobile')}>
              <div className="flex items-center justify-between"><div><div className="text-2xl font-bold text-sky-900">{stats.nonMobileSites.length}</div><div className="text-sm text-sky-700 font-medium mt-1">Non-Mobile Exemptions</div></div>{expandedMetrics.nonMobile ? <ChevronUp className="text-sky-700" /> : <ChevronDown className="text-sky-700" />}</div>
              {expandedMetrics.nonMobile && <div className="mt-3 pt-3 border-t border-sky-300 text-xs text-sky-800 space-y-1">{stats.nonMobileSites.map(site => <div key={site.id}>• {site.nameOrganization}{site.hasBothExemptions ? '*' : ''}</div>)}<div className="mt-2 text-xs italic text-sky-600">* Has both exemption types</div></div>}
            </div>
          </div>
        </div>
        <div id="faq" className="scroll-mt-4"><FAQSection /></div>
        <div id="discussion" className="scroll-mt-4"><PartnerDiscussionBoard /></div>
        <div id="links" className="scroll-mt-4"><RelatedLinks /></div>
        <ProjectContactInfo isFooter={true} />
      </div>
    </div>
  );
};

export default ProjectPartnerDashboard;