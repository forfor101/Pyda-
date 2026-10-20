import React, { useState } from 'react';
import {
  Briefcase,
  Truck,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  UserCheck,
  Award,
  ChevronRight,
  FileText,
  Phone,
  Mail,
  X,
  Send,
  Sparkles,
  Users,
  Building,
  ArrowRight,
  HeartHandshake,
  Calendar,
  Compass,
  Check,
  Copy,
  Info
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { JobOpening, JobApplication, JobCategory } from '../types';

interface CareersSectionProps {
  onOpenQuoteModal?: () => void;
}

export const CareersSection: React.FC<CareersSectionProps> = ({ onOpenQuoteModal }) => {
  const { cms, addJobApplication } = useCms();
  const { jobOpenings, company } = cms;

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  // Modal / Detail States
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyingForJob, setApplyingForJob] = useState<JobOpening | null>(null);

  // Application Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cityState: '',
    licenseClass: 'Class G (Articulated / Heavy Vehicle)',
    yearsExperience: '3-5 Years',
    currentEmployer: '',
    availableStartDate: 'Immediate',
    hasGuarantor: true,
    resumeOrBioNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<JobApplication | null>(null);
  const [formError, setFormError] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Filtered Jobs
  const activeJobs = (jobOpenings || []).filter((job) => job.status === 'active');
  const filteredJobs = activeJobs.filter((job) => {
    const matchesSearch =
      searchQuery === '' ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requirements.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    const matchesLocation =
      selectedLocation === 'all' ||
      job.location.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchesSearch && matchesCategory && matchesLocation;
  });

  const handleOpenApplyModal = (job: JobOpening) => {
    setApplyingForJob(job);
    setFormError('');
    setSubmissionSuccess(null);
    setApplyModalOpen(true);
    // Set appropriate license default based on job category
    if (job.category === 'driver') {
      setFormData((prev) => ({
        ...prev,
        licenseClass: job.title.includes('Class E')
          ? 'Class E (Commercial / Van)'
          : 'Class G (Articulated / Heavy Vehicle)',
      }));
    } else if (job.category === 'warehouse') {
      setFormData((prev) => ({
        ...prev,
        licenseClass: 'Forklift Operator / Warehouse Specialist',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        licenseClass: 'Not Applicable (Office / Operations)',
      }));
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setFormError('Please provide a valid active phone or WhatsApp number.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Please provide a valid email address.');
      return;
    }
    if (!formData.cityState.trim()) {
      setFormError('Please enter your current city and state of residence.');
      return;
    }
    if (!formData.hasGuarantor) {
      setFormError(
        'Due to logistics security compliance, applicants must have 2 verifiable guarantors.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await addJobApplication({
        jobId: applyingForJob ? applyingForJob.id : 'general-inquiry',
        jobTitle: applyingForJob ? applyingForJob.title : 'General Fleet Position',
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        cityState: formData.cityState.trim(),
        licenseClass: formData.licenseClass,
        yearsExperience: formData.yearsExperience,
        currentEmployer: formData.currentEmployer.trim(),
        availableStartDate: formData.availableStartDate,
        hasGuarantor: formData.hasGuarantor,
        resumeOrBioNotes: formData.resumeOrBioNotes.trim(),
      });

      setSubmissionSuccess(created);
    } catch (err) {
      setFormError('Something went wrong submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyAppId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const getCategoryBadgeColor = (category: JobCategory) => {
    switch (category) {
      case 'driver':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'warehouse':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'operations':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'technician':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <section className="py-10 sm:py-16 bg-slate-950 text-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Hero Header Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-8 sm:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 max-w-3xl space-y-5">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Pyda Movers Recruitment Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Build a High-Impact Career in <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Logistics & Fleet Transport</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Join Nigeria and Pan-Africa’s premier relocation and haulage enterprise. We offer stable career progression, competitive on-time salaries, per-trip food & lodging allowances, comprehensive family HMO healthcare, modern air-conditioned trucks, and certified safety training.
            </p>

            {/* Value Highlights Pill Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mb-1" />
                <p className="text-xs font-black text-white">100% HMO Cover</p>
                <p className="text-[11px] text-slate-400">Driver & family healthcare</p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl">
                <DollarSign className="w-5 h-5 text-amber-400 mb-1" />
                <p className="text-xs font-black text-white">Prompt Salary + Trips</p>
                <p className="text-[11px] text-slate-400">Per-trip bonus & per diem</p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl">
                <Truck className="w-5 h-5 text-blue-400 mb-1" />
                <p className="text-xs font-black text-white">Modern Fleet</p>
                <p className="text-[11px] text-slate-400">A/C cabins & GPS telematics</p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl">
                <Award className="w-5 h-5 text-purple-400 mb-1" />
                <p className="text-xs font-black text-white">Safety Bonuses</p>
                <p className="text-[11px] text-slate-400">Accident-free milestones</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search job title, requirements, city (e.g., Driver, Abuja, Forklift, Class G)..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all"
                id="careers-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Location Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-3 outline-none focus:border-amber-500 cursor-pointer"
                id="careers-location-filter"
              >
                <option value="all">All Hubs & Corridors</option>
                <option value="Abuja">Abuja Corporate HQ</option>
                <option value="Lagos">Lagos Maritime Hub</option>
                <option value="Port Harcourt">Port Harcourt Hub</option>
                <option value="ECOWAS">Cross-Border (ECOWAS)</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Openings' },
              { id: 'driver', label: '🚛 Truck & Van Drivers' },
              { id: 'warehouse', label: '📦 Warehouse & Material Handling' },
              { id: 'operations', label: '🛰️ Fleet Telematics & Dispatch' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shrink-0 ${
                  selectedCategory === tab.id
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-white'
                }`}
                id={`careers-cat-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Job Listings Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing <strong className="text-white">{filteredJobs.length}</strong> active job openings</span>
            <span>Fast-track hiring • Interview scheduled within 48h</span>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">No openings match your search</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                We are constantly expanding our nationwide driver network and freight depot teams. Submit a general application and our HR department will reach out when a suitable vacancy opens.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-amber-400"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className={`bg-slate-900 border transition-all rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-amber-500/40 hover:shadow-2xl ${
                    job.featured
                      ? 'border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20'
                      : 'border-slate-800'
                  }`}
                  id={`job-card-${job.id}`}
                >
                  <div className="space-y-4">
                    {/* Header with Title & Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${getCategoryBadgeColor(
                              job.category
                            )}`}
                          >
                            {job.category.toUpperCase()}
                          </span>
                          {job.featured && (
                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>Urgent Hiring</span>
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                            {job.vacancies} {job.vacancies > 1 ? 'Vacancies' : 'Vacancy'}
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                          {job.title}
                        </h3>
                      </div>
                    </div>

                    {/* Metadata Specs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                      <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800/80 px-3 py-2 rounded-xl">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800/80 px-3 py-2 rounded-xl">
                        <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{job.employmentType} • {job.experienceRequired}</span>
                      </div>
                    </div>

                    {job.salaryRange && (
                      <div className="flex items-center gap-2 text-xs font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-xl">
                        <DollarSign className="w-4 h-4 shrink-0" />
                        <span>{job.salaryRange}</span>
                      </div>
                    )}

                    {/* Short Description */}
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      {job.description}
                    </p>

                    {/* Highlights List */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Key Requirements:</p>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {job.requirements.slice(0, 3).map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="text-xs font-bold text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1"
                      id={`view-job-details-${job.id}`}
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>View Full Job Spec & Benefits</span>
                    </button>

                    <button
                      onClick={() => handleOpenApplyModal(job)}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
                      id={`apply-job-btn-${job.id}`}
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Why Drive & Work with Pyda Movers Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Driver Welfare & Workplace Culture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Why Nigeria's Top Logistics Professionals Choose Pyda Movers
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              We treat our drivers, rigging technicians, and depot specialists as core stakeholders. Your safety, comfort, and financial growth are our priority.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 border border-slate-800/80 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Modern & Safe Fleet</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drive late-model trucks with factory air conditioning, ergonomic seats, sleeper bunks, satellite speed limiters, and real-time highway telematics.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Guaranteed Pay & Per Diem</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Salaries are credited promptly on or before the 25th of every month. Drivers receive upfront trip food & lodging per diem before every long-haul journey.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Family Health & Safety Gear</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full HMO medical cover at top Nigerian hospitals for you and your family. Free premium safety boots, high-vis uniforms, hard hats, and gloves provided.
              </p>
            </div>
          </div>
        </div>

        {/* Recruitment FAQs */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 space-y-6">
          <h3 className="text-xl font-black text-white">
            Frequently Asked Questions for Applicants
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
            <div className="space-y-1.5 bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
              <p className="font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>What is the guarantor requirement?</span>
              </p>
              <p className="text-slate-400 leading-relaxed pl-6">
                All drivers and warehouse personnel must provide 2 reputable guarantors (e.g. Civil Servants, Clergy, Registered Business Owners, or Community Elders) who can verify their identity and good conduct.
              </p>
            </div>

            <div className="space-y-1.5 bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
              <p className="font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>How soon will I hear back after applying?</span>
              </p>
              <p className="text-slate-400 leading-relaxed pl-6">
                Our HR recruitment team screens applications daily. Shortlisted candidates receive a phone call and SMS invite within 24 to 48 hours for a physical road test and interview.
              </p>
            </div>

            <div className="space-y-1.5 bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
              <p className="font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Where do physical interviews take place?</span>
              </p>
              <p className="text-slate-400 leading-relaxed pl-6">
                Interviews are conducted either at our Abuja Corporate HQ (AA Rano Citygate Plaza, Airport Road) or Lagos Maritime Terminal (Old Ojo Road, Alakija, Satellite Town) depending on your preferred operational base.
              </p>
            </div>

            <div className="space-y-1.5 bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
              <p className="font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Can I call HR directly with questions?</span>
              </p>
              <p className="text-slate-400 leading-relaxed pl-6">
                Yes! You can contact the Pyda Movers recruitment desk directly during business hours at <a href={`tel:${company.phones[0]}`} className="text-amber-400 font-bold hover:underline">{company.phones[0]}</a> or <a href={`tel:${company.phones[1]}`} className="text-amber-400 font-bold hover:underline">{company.phones[1]}</a>.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Full Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors"
              id="close-job-details-modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 pr-8">
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${getCategoryBadgeColor(
                  selectedJob.category
                )}`}
              >
                {selectedJob.category.toUpperCase()} • {selectedJob.employmentType}
              </span>
              <h2 className="text-2xl font-black text-white">{selectedJob.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {selectedJob.location}
                </span>
                <span>•</span>
                <span>{selectedJob.vacancies} open position(s)</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">{selectedJob.salaryRange}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <h4 className="font-bold text-white uppercase text-xs tracking-wider">Role Overview</h4>
              <p className="leading-relaxed">{selectedJob.description}</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-xs tracking-wider">Core Responsibilities</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                {selectedJob.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-xs tracking-wider">Requirements & Qualifications</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                {selectedJob.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-xs tracking-wider">Employee Benefits & Perks</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                {selectedJob.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Award className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const jobToApply = selectedJob;
                  setSelectedJob(null);
                  handleOpenApplyModal(jobToApply);
                }}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5"
              >
                <span>Proceed to Application Form</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Online Application Modal Form */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl relative">
            
            <button
              onClick={() => setApplyModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors"
              id="close-apply-modal"
            >
              <X className="w-5 h-5" />
            </button>

            {submissionSuccess ? (
              /* Success State Screen */
              <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>

                <div className="space-y-2">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    Application Successfully Submitted!
                  </span>
                  <h3 className="text-2xl font-black text-white">
                    Welcome to Pyda Movers Recruitment
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-white">{submissionSuccess.fullName}</strong>. Your application for <strong className="text-amber-400">{submissionSuccess.jobTitle}</strong> has been logged in our central HR database.
                  </p>
                </div>

                {/* Application Reference ID Box */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl max-w-sm mx-auto space-y-2">
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Your Application Reference</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-lg font-black text-amber-400">{submissionSuccess.id}</span>
                    <button
                      onClick={() => handleCopyAppId(submissionSuccess.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                      title="Copy Reference ID"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">Save this ID to quote when contacting HR</p>
                </div>

                {/* Next Steps Checklist */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl text-left space-y-2.5 text-xs">
                  <p className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>What Happens Next?</span>
                  </p>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                      <span><strong>Document Vetting:</strong> Our recruitment team will review your qualifications and contact your guarantors.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                      <span><strong>Phone Screening:</strong> You will receive a call within 24 to 48 hours to confirm your experience.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                      <span><strong>Practical Road Test / On-site Interview:</strong> Scheduled at our Abuja HQ or Lagos Maritime Depot.</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={`tel:${company.phones[0]}`}
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl flex items-center justify-center gap-2"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Call Recruitment Desk</span>
                  </a>
                  <button
                    onClick={() => {
                      setApplyModalOpen(false);
                      setSubmissionSuccess(null);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg"
                  >
                    Done & Return to Jobs
                  </button>
                </div>
              </div>
            ) : (
              /* Application Form */
              <div className="space-y-5">
                <div className="space-y-1 pr-6">
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                    Candidate Application Form
                  </span>
                  <h3 className="text-xl font-black text-white">
                    Apply for {applyingForJob ? applyingForJob.title : 'Pyda Logistics'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Fill out the basic information below. No complicated resume file required.
                  </p>
                </div>

                {formError && (
                  <div className="bg-red-950/60 border border-red-500/50 text-red-300 text-xs p-3.5 rounded-xl flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs">
                  
                  {/* Position Applying For */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Job Position Selected
                    </label>
                    <select
                      value={applyingForJob?.id || 'general'}
                      onChange={(e) => {
                        const target = activeJobs.find((j) => j.id === e.target.value);
                        if (target) setApplyingForJob(target);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-amber-500"
                      id="apply-job-select"
                    >
                      {activeJobs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.title} ({j.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Full Legal Name <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Musa Abdullahi or Emmanuel Okafor"
                      className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 rounded-xl p-3 outline-none focus:border-amber-500"
                      id="apply-fullname-input"
                    />
                  </div>

                  {/* Phone & Email Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Active Phone / WhatsApp <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 08062466212"
                        className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 rounded-xl p-3 outline-none focus:border-amber-500"
                        id="apply-phone-input"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Email Address <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. driver@gmail.com"
                        className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 rounded-xl p-3 outline-none focus:border-amber-500"
                        id="apply-email-input"
                      />
                    </div>
                  </div>

                  {/* City & State of Residence */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Current City & State of Residence <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cityState}
                      onChange={(e) => setFormData({ ...formData, cityState: e.target.value })}
                      placeholder="e.g. Abuja (Kubwa/Gwarinpa), Lagos (Alakija/Festac), Kano, Ibadan"
                      className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 rounded-xl p-3 outline-none focus:border-amber-500"
                      id="apply-citystate-input"
                    />
                  </div>

                  {/* License Class & Years Experience Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Driver's License / Certification
                      </label>
                      <select
                        value={formData.licenseClass}
                        onChange={(e) => setFormData({ ...formData, licenseClass: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-amber-500"
                        id="apply-license-select"
                      >
                        <option value="Class G (Articulated / Heavy Vehicle)">Class G (Articulated / Heavy Rig)</option>
                        <option value="Class E (Commercial / Van)">Class E (Commercial Box Truck / Van)</option>
                        <option value="Forklift Operator / Warehouse Specialist">Forklift Operator Certified</option>
                        <option value="Class C / D (Standard Commercial)">Class C / D Commercial</option>
                        <option value="Not Applicable (Office / Operations)">Not Applicable (Fleet Dispatch / Operations)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Years of Experience
                      </label>
                      <select
                        value={formData.yearsExperience}
                        onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-amber-500"
                        id="apply-experience-select"
                      >
                        <option value="1-2 Years">1 - 2 Years</option>
                        <option value="3-5 Years">3 - 5 Years</option>
                        <option value="5-10 Years">5 - 10 Years</option>
                        <option value="10+ Years">10+ Years Senior Veteran</option>
                        <option value="Entry Level">Entry Level / Trainee</option>
                      </select>
                    </div>
                  </div>

                  {/* Current/Former Employer & Availability */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Most Recent Employer (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.currentEmployer}
                        onChange={(e) => setFormData({ ...formData, currentEmployer: e.target.value })}
                        placeholder="e.g. ABC Haulage, Self-employed, etc."
                        className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 rounded-xl p-3 outline-none focus:border-amber-500"
                        id="apply-employer-input"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Earliest Available Start Date
                      </label>
                      <select
                        value={formData.availableStartDate}
                        onChange={(e) => setFormData({ ...formData, availableStartDate: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-amber-500"
                        id="apply-startdate-select"
                      >
                        <option value="Immediate">Immediately (Within 24-48 Hours)</option>
                        <option value="Within 1 Week">Within 1 Week</option>
                        <option value="Within 2 Weeks">Within 2 Weeks</option>
                        <option value="Next Month">Beginning of Next Month</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary / Driving Record Notes */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Experience Summary & Driving Record Notes
                    </label>
                    <textarea
                      rows={3}
                      value={formData.resumeOrBioNotes}
                      onChange={(e) => setFormData({ ...formData, resumeOrBioNotes: e.target.value })}
                      placeholder="Briefly state routes you have driven (e.g., Lagos-Abuja-Kano), types of vehicles operated, accident-free records, or warehouse skills..."
                      className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 rounded-xl p-3 outline-none focus:border-amber-500"
                      id="apply-notes-textarea"
                    />
                  </div>

                  {/* Guarantor Checkbox (Crucial for logistics compliance) */}
                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="apply-guarantor-checkbox"
                      checked={formData.hasGuarantor}
                      onChange={(e) => setFormData({ ...formData, hasGuarantor: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <label htmlFor="apply-guarantor-checkbox" className="text-[11px] text-slate-300 cursor-pointer leading-tight">
                      <strong className="text-white">Guarantor Confirmation:</strong> I confirm that I have 2 verifiable professional guarantors (civil servant, registered business owner, or elder) ready to provide verification letters as required by Pyda Movers security protocols.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                      id="apply-submit-btn"
                    >
                      {isSubmitting ? (
                        <span>Transmitting Application to HR...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4 stroke-[2.5]" />
                          <span>Submit Application Directly</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </section>
  );
};
