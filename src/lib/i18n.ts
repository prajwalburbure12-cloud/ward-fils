export type Language = 'en' | 'kn';

export const CATEGORY_LABELS: Record<string, { en: string; kn: string }> = {
  'Drinking Water Problems': {
    en: 'Drinking Water Problems',
    kn: 'ಕುಡಿಯುವ ನೀರಿನ ಸಮಸ್ಯೆಗಳು',
  },
  'Drainage / Underground Drainage': {
    en: 'Drainage / Underground Drainage',
    kn: 'ಚರಂಡಿ / ಭೂಗತ ಒಳಚರಂಡಿ ಸಮಸ್ಯೆ',
  },
  'Garbage Collection': {
    en: 'Garbage Collection',
    kn: 'ಕಸ ಸಂಗ್ರಹಣೆ',
  },
  'Road Damage / Potholes': {
    en: 'Road Damage / Potholes',
    kn: 'ರಸ್ತೆ ಹಾನಿ / ಗುಂಡಿಗಳು',
  },
  'Street Lights': {
    en: 'Street Lights',
    kn: 'ಬೀದಿ ದೀಪಗಳು',
  },
  'Rainwater Drain Problems': {
    en: 'Rainwater Drain Problems',
    kn: 'ಮಳೆನೀರು ಚರಂಡಿ ಸಮಸ್ಯೆಗಳು',
  },
  'Mosquitoes / Sanitation': {
    en: 'Mosquitoes / Sanitation',
    kn: 'ಸೊಳ್ಳೆಗಳು / ನೈರ್ಮಲ್ಯ',
  },
  'Encroachment Issues': {
    en: 'Encroachment Issues',
    kn: 'ಅತಿಕ್ರಮಣ ಸಮಸ್ಯೆಗಳು',
  },
  'Public Health and Hygiene': {
    en: 'Public Health and Hygiene',
    kn: 'ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ಮತ್ತು ನೈರ್ಮಲ್ಯ',
  },
  'Other Civic Problems': {
    en: 'Other Civic Problems',
    kn: 'ಇತರ ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳು',
  },
};

export const STATUS_LABELS: Record<string, { en: string; kn: string }> = {
  Submitted: { en: 'Submitted', kn: 'ದಾಖಲಿಸಲಾಗಿದೆ' },
  'Under Review': { en: 'Under Review', kn: 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ' },
  'Assigned to Department': {
    en: 'Assigned to Department',
    kn: 'ಇಲಾಖೆಗೆ ವಹಿಸಲಾಗಿದೆ',
  },
  'Work in Progress': { en: 'Work in Progress', kn: 'ಕಾಮಗಾರಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ' },
  Resolved: { en: 'Resolved', kn: 'ಪರಿಹರಿಸಲಾಗಿದೆ' },
  Closed: { en: 'Closed', kn: 'ಮುಕ್ತಾಯಗೊಂಡಿದೆ' },
};

export const DEV_CATEGORY_LABELS: Record<string, { en: string; kn: string }> = {
  'Road Development': { en: 'Road Development', kn: 'ರಸ್ತೆ ಅಭಿವೃದ್ಧಿ' },
  'Drainage Works': { en: 'Drainage Works', kn: 'ಒಳಚರಂಡಿ ಕಾಮಗಾರಿಗಳು' },
  'Drinking Water': { en: 'Drinking Water', kn: 'ಕುಡಿಯುವ ನೀರು' },
  'Street Lighting': { en: 'Street Lighting', kn: 'ಬೀದಿ ದೀಪ ವ್ಯವಸ್ಥೆ' },
  Cleanliness: { en: 'Cleanliness', kn: 'ಸ್ವಚ್ಛತೆ' },
  'Public Infrastructure': {
    en: 'Public Infrastructure',
    kn: 'ಸಾರ್ವಜನಿಕ ಮೂಲಸೌಕರ್ಯ',
  },
};

export const ANNOUNCEMENT_TYPE_LABELS: Record<
  string,
  { en: string; kn: string }
> = {
  'New Development Project': {
    en: 'New Development Project',
    kn: 'ಹೊಸ ಅಭಿವೃದ್ಧಿ ಯೋಜನೆ',
  },
  'Ongoing Civic Work': {
    en: 'Ongoing Civic Work',
    kn: 'ಪ್ರಗತಿಯಲ್ಲಿರುವ ನಾಗರಿಕ ಕಾಮಗಾರಿ',
  },
  'Completed Project': {
    en: 'Completed Project',
    kn: 'ಪೂರ್ಣಗೊಂಡ ಯೋಜನೆ',
  },
  'Public Notice': { en: 'Public Notice', kn: 'ಸಾರ್ವಜನಿಕ ಪ್ರಕಟಣೆ' },
  'Important Announcement': {
    en: 'Important Announcement',
    kn: 'ಪ್ರಮುಖ ಘೋಷಣೆ',
  },
  'Community Programme': {
    en: 'Community Programme',
    kn: 'ಸಮುದಾಯ ಕಾರ್ಯಕ್ರಮ',
  },
};

export const COPY = {
  en: {
    brandShort: 'HDMC Ward No. 65',
    municipality: 'Hubballi-Dharwad Municipal Corporation',
    cityState: 'Hubballi, Karnataka',
    nav: {
      home: 'Home',
      register: 'Register Complaint',
      track: 'Track Complaint',
      gallery: 'Gallery',
      updates: 'Updates',
      contact: 'Contact Us',
      admin: 'Admin Portal',
    },
    hero: {
      eyebrow: 'Official Civic Service Portal · Ward No. 65, Hubballi',
      title: 'WELCOME TO WARD NO. 65',
      subtitle: 'Hubballi-Dharwad Municipal Corporation',
      motto: '"Your Ward, Your Voice, Our Responsibility"',
      ctaRegister: 'Register a Complaint',
      ctaTrack: 'Track Your Complaint',
      bannerPending:
        'Official Ward 65 Banner Frame — Upload the supplied banner image in the Admin Portal to display it here in original proportions.',
    },
    stats: {
      heading: 'Live Ward Service & Development Overview',
      subheading:
        'Real-time civic records connected directly to the Ward No. 65 database.',
      totalComplaints: 'Total Complaints Received',
      pendingComplaints: 'Pending Complaints',
      underProcess: 'Complaints Under Process',
      resolvedComplaints: 'Resolved Complaints',
      totalProjects: 'Total Development Projects',
      completedProjects: 'Completed Development Projects',
    },
    reps: {
      heading: 'OUR PUBLIC REPRESENTATIVES',
      subheading:
        'Dedicated elected leadership serving the residents of Ward No. 65, Hubballi.',
      publicWorkLabel: 'Public Service & Development Focus',
      contactLabel: 'Contact Details',
      photoPending: 'Official Photograph Pending Upload',
      notProvided: 'Updated via Ward Office',
    },
    quickServices: {
      heading: 'Resident Civic Services',
      registerTitle: 'Public Complaint Registration',
      registerDesc:
        'Report water supply, drainage, road damage, street lights, or sanitation issues directly without creating an account.',
      trackTitle: 'Track Your Complaint',
      trackDesc:
        'Check real-time department assignment, field updates, and resolution status with your Complaint ID and mobile number.',
      galleryTitle: 'Ward Development Gallery',
      galleryDesc:
        'Inspect before-and-after photographs of completed and ongoing civic works across Ward 65 localities.',
      updatesTitle: 'Latest Updates & Announcements',
      updatesDesc:
        'Read official public notices, project launches, and community programme schedules.',
    },
    register: {
      heading: 'Register a Civic Complaint',
      subheading:
        'No account required. Submit your civic issue with photos or short videos for immediate Ward 65 review.',
      nameLabel: 'Full Name',
      namePlaceholder: 'Enter resident full name',
      mobileLabel: 'Mobile Number (10 digits)',
      mobilePlaceholder: 'e.g. 9845012345',
      confirmMobileLabel: 'Confirm Mobile Number',
      confirmMobilePlaceholder: 'Re-enter 10-digit mobile number',
      areaLabel: 'Area / Street Name',
      areaPlaceholder: 'Select or enter street / locality',
      wardLabel: 'Ward Number',
      categoryLabel: 'Complaint Category',
      landmarkLabel: 'Location / Landmark (Optional)',
      landmarkPlaceholder: 'Near temple, school, cross road, or house no.',
      descLabel: 'Detailed Description of the Problem',
      descPlaceholder:
        'Describe the exact location, severity, and duration of the issue...',
      mediaLabel: 'Upload Photographs or Short Videos',
      mediaHint:
        'Attach clear site photos (JPG/PNG/WebP) or short videos (MP4/WebM) to help field engineers inspect faster.',
      captchaLabel: 'Spam Protection Verification',
      submitBtn: 'SUBMIT COMPLAINT',
      submittingBtn: 'Submitting Complaint...',
      successTitle: 'Complaint Registered Successfully',
      successNote:
        'Please save your unique Complaint ID. Use your Complaint ID and mobile number anytime to track progress.',
      complaintIdLabel: 'Your Complaint ID',
      trackNowBtn: 'Track This Complaint',
      submitAnotherBtn: 'Register Another Complaint',
      privacyNotice:
        'Privacy Guarantee: Your mobile number and personal details are kept strictly confidential and are never published publicly.',
    },
    track: {
      heading: 'Track Your Complaint',
      subheading:
        'Enter your unique Complaint ID and registered 10-digit mobile number to view live status and resolution progress.',
      codeLabel: 'Complaint ID',
      codePlaceholder: 'e.g. HDMC-W65-2026-0001',
      mobileLabel: 'Registered Mobile Number',
      mobilePlaceholder: '10-digit mobile number',
      searchBtn: 'Check Status',
      searchingBtn: 'Fetching Record...',
      regDate: 'Registration Date',
      category: 'Category',
      area: 'Area / Street',
      landmark: 'Landmark',
      department: 'Assigned Department',
      latestUpdate: 'Latest Progress Update',
      resolution: 'Resolution Details',
      timelineTitle: 'Visual Progress Timeline',
      historyTitle: 'Official Update Log',
      mediaTitle: 'Submitted Evidence',
    },
    gallery: {
      heading: 'Ward Development Gallery',
      subheading:
        'Before-and-after documentation of civic infrastructure, roads, water supply, and sanitation improvements across Ward No. 65.',
      allAreas: 'All Ward 65 Areas',
      allCategories: 'All Categories',
      beforeLabel: 'Before Work',
      afterLabel: 'After Completion',
      empty:
        'No development works have been uploaded yet. Ward administrators can add projects and before-and-after photos from the Admin Portal.',
    },
    updates: {
      heading: 'Latest Updates & Announcements',
      subheading:
        'Official Ward 65 notices, new development projects, ongoing civic works, and community programmes.',
      allTypes: 'All Updates',
      empty:
        'No public notices or announcements have been published yet. Administrators can publish official updates from the Admin Portal.',
    },
    contact: {
      heading: 'Contact & Public Grievance Cell',
      subheading:
        'Reach the Ward No. 65 office, public representatives, or emergency HDMC helplines.',
      officeTitle: 'Ward No. 65 Municipal Office',
      whatsappBtn: 'Contact via WhatsApp',
      mapsBtn: 'Open Location in Google Maps',
      emergencyTitle: 'Emergency Civic Helplines',
      waterEmergency: 'Drinking Water Emergency',
      powerEmergency: 'Street Light / Electrical',
      sanitationEmergency: 'Sanitation & Drainage',
    },
    footer: {
      title: 'WARD NO. 65',
      corp: 'Hubballi-Dharwad Municipal Corporation',
      place: 'Hubballi, Karnataka.',
      motto: '"Public Service | Transparency | Development | Accountability"',
      quickLinksTitle: 'Quick Links',
      worksLink: 'Development Works',
    },
  },
  kn: {
    brandShort: 'ಎಚ್‌ಡಿಎಂಸಿ ವಾರ್ಡ್ ನಂ. 65',
    municipality: 'ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ ಮಹಾನಗರ ಪಾಲಿಕೆ',
    cityState: 'ಹುಬ್ಬಳ್ಳಿ, ಕರ್ನಾಟಕ',
    nav: {
      home: 'ಮುಖಪುಟ',
      register: 'ದೂರು ದಾಖಲಿಸಿ',
      track: 'ದೂರು ಪರಿಶೀಲಿಸಿ',
      gallery: 'ಗ್ಯಾಲರಿ',
      updates: 'ಪ್ರಕಟಣೆಗಳು',
      contact: 'ಸಂಪರ್ಕಿಸಿ',
      admin: 'ಆಡಳಿತ ವಿಭಾಗ',
    },
    hero: {
      eyebrow: 'ಅಧಿಕೃತ ನಾಗರಿಕ ಸೇವಾ ಜಾಲತಾಣ · ವಾರ್ಡ್ ನಂ. 65, ಹುಬ್ಬಳ್ಳಿ',
      title: 'ವಾರ್ಡ್ ನಂ. 65 ಕ್ಕೆ ಸ್ವಾಗತ',
      subtitle: 'ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ ಮಹಾನಗರ ಪಾಲಿಕೆ',
      motto: '"ನಿಮ್ಮ ವಾರ್ಡ್, ನಿಮ್ಮ ಧ್ವನಿ, ನಮ್ಮ ಜವಾಬ್ದಾರಿ"',
      ctaRegister: 'ದೂರು ದಾಖಲಿಸಿ',
      ctaTrack: 'ನಿಮ್ಮ ದೂರನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
      bannerPending:
        'ಅಧಿಕೃತ ವಾರ್ಡ್ 65 ಬ್ಯಾನರ್ ಸ್ಥಳ — ಮೂಲ ವಿನ್ಯಾಸದೊಂದಿಗೆ ಪ್ರದರ್ಶಿಸಲು ಆಡಳಿತ ವಿಭಾಗದಲ್ಲಿ ಬ್ಯಾನರ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
    },
    stats: {
      heading: 'ನೇರ ವಾರ್ಡ್ ಸೇವೆ ಮತ್ತು ಅಭಿವೃದ್ಧಿ ಅಂಕಿಅಂಶಗಳು',
      subheading:
        'ವಾರ್ಡ್ ನಂ. 65 ಡೇಟಾಬೇಸ್‌ಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕಗೊಂಡಿರುವ ನೈಜ ನಾಗರಿಕ ದಾಖಲೆಗಳು.',
      totalComplaints: 'ಒಟ್ಟು ಸ್ವೀಕರಿಸಿದ ದೂರುಗಳು',
      pendingComplaints: 'ಬಾಕಿ ಇರುವ ದೂರುಗಳು',
      underProcess: 'ಪ್ರಗತಿಯಲ್ಲಿರುವ ದೂರುಗಳು',
      resolvedComplaints: 'ಪರಿಹರಿಸಲಾದ ದೂರುಗಳು',
      totalProjects: 'ಒಟ್ಟು ಅಭಿವೃದ್ಧಿ ಯೋಜನೆಗಳು',
      completedProjects: 'ಪೂರ್ಣಗೊಂಡ ಅಭಿವೃದ್ಧಿ ಯೋಜನೆಗಳು',
    },
    reps: {
      heading: 'ನಮ್ಮ ಜನಪ್ರತಿನಿಧಿಗಳು',
      subheading:
        'ಹುಬ್ಬಳ್ಳಿಯ ವಾರ್ಡ್ ನಂ. 65 ರ ನಿವಾಸಿಗಳ ಸೇವೆಯಲ್ಲಿರುವ ಚುನಾಯಿತ ಜನಪ್ರತಿನಿಧಿಗಳು.',
      publicWorkLabel: 'ಸಾರ್ವಜನಿಕ ಸೇವೆ ಮತ್ತು ಅಭಿವೃದ್ಧಿ ಕಾರ್ಯಗಳು',
      contactLabel: 'ಸಂಪರ್ಕ ವಿವರಗಳು',
      photoPending: 'ಅಧಿಕೃತ ಭಾವಚಿತ್ರ ಶೀಘ್ರದಲ್ಲೇ ಅಪ್‌ಲೋಡ್ ಆಗಲಿದೆ',
      notProvided: 'ವಾರ್ಡ್ ಕಚೇರಿಯ ಮೂಲಕ ನವೀಕರಿಸಲಾಗುತ್ತದೆ',
    },
    quickServices: {
      heading: 'ನಾಗರಿಕ ಸೇವೆಗಳು',
      registerTitle: 'ಸಾರ್ವಜನಿಕ ದೂರು ನೋಂದಣಿ',
      registerDesc:
        'ಖಾತೆ ತೆರೆಯದೆಯೇ ಕುಡಿಯುವ ನೀರು, ಒಳಚರಂಡಿ, ರಸ್ತೆ ಹಾನಿ, ಬೀದಿ ದೀಪ ಅಥವಾ ಸ್ವಚ್ಛತಾ ಸಮಸ್ಯೆಗಳನ್ನು ನೇರವಾಗಿ ದಾಖಲಿಸಿ.',
      trackTitle: 'ನಿಮ್ಮ ದೂರನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
      trackDesc:
        'ನಿಮ್ಮ ದೂರು ಸಂಖ್ಯೆ ಮತ್ತು ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ಬಳಸಿ ಇಲಾಖೆ ನಿಯೋಜನೆ ಮತ್ತು ಪರಿಹಾರದ ಪ್ರಗತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.',
      galleryTitle: 'ವಾರ್ಡ್ ಅಭಿವೃದ್ಧಿ ಗ್ಯಾಲರಿ',
      galleryDesc:
        'ವಾರ್ಡ್ 65 ರ ವಿವಿಧ ಪ್ರದೇಶಗಳಲ್ಲಿ ಪೂರ್ಣಗೊಂಡ ಮತ್ತು ಪ್ರಗತಿಯಲ್ಲಿರುವ ಕಾಮಗಾರಿಗಳ ಮೊದಲು-ನಂತರದ ಚಿತ್ರಗಳನ್ನು ವೀಕ್ಷಿಸಿ.',
      updatesTitle: 'ಇತ್ತೀಚಿನ ಮಾಹಿತಿ ಮತ್ತು ಪ್ರಕಟಣೆಗಳು',
      updatesDesc:
        'ಅಧಿಕೃತ ಸಾರ್ವಜನಿಕ ಸೂಚನೆಗಳು, ಹೊಸ ಯೋಜನೆಗಳು ಮತ್ತು ಸಮುದಾಯ ಕಾರ್ಯಕ್ರಮಗಳ ವಿವರಗಳನ್ನು ಓದಿ.',
    },
    register: {
      heading: 'ನಾಗರಿಕ ದೂರು ದಾಖಲಿಸಿ',
      subheading:
        'ಖಾತೆಯ ಅಗತ್ಯವಿಲ್ಲ. ತ್ವರಿತ ಪರಿಶೀಲನೆಗಾಗಿ ಫೋಟೋಗಳು ಅಥವಾ ಕಿರು ವೀಡಿಯೊಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಸಲ್ಲಿಸಿ.',
      nameLabel: 'ಪೂರ್ಣ ಹೆಸರು',
      namePlaceholder: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
      mobileLabel: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (10 ಅಂಕೆಗಳು)',
      mobilePlaceholder: 'ಉದಾ: 9845012345',
      confirmMobileLabel: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ದೃಢೀಕರಿಸಿ',
      confirmMobilePlaceholder: '10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ಮತ್ತೆ ನಮೂದಿಸಿ',
      areaLabel: 'ಪ್ರದೇಶ / ಬೀದಿಯ ಹೆಸರು',
      areaPlaceholder: 'ಪ್ರದೇಶವನ್ನು ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ನಮೂದಿಸಿ',
      wardLabel: 'ವಾರ್ಡ್ ಸಂಖ್ಯೆ',
      categoryLabel: 'ದೂರಿನ ವರ್ಗ',
      landmarkLabel: 'ಸ್ಥಳ / ಗುರುತು (ಐಚ್ಛಿಕ)',
      landmarkPlaceholder: 'ದೇವಸ್ಥಾನ, ಶಾಲೆ, ಕ್ರಾಸ್ ರಸ್ತೆ ಅಥವಾ ಮನೆ ಸಂಖ್ಯೆ',
      descLabel: 'ಸಮಸ್ಯೆಯ ವಿವರವಾದ ಮಾಹಿತಿ',
      descPlaceholder:
        'ಸಮಸ್ಯೆಯ ನಿಖರವಾದ ಸ್ಥಳ, ತೀವ್ರತೆ ಮತ್ತು ಎಷ್ಟು ದಿನಗಳಿಂದ ಇದೆ ಎಂಬುದನ್ನು ವಿವರಿಸಿ...',
      mediaLabel: 'ಛಾಯಾಚಿತ್ರಗಳು ಅಥವಾ ಕಿರು ವೀಡಿಯೊಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      mediaHint:
        'ಅಧಿಕಾರಿಗಳ ತ್ವರಿತ ಪರಿಶೀಲನೆಗಾಗಿ ಸ್ಪಷ್ಟವಾದ ಫೋಟೋಗಳು (JPG/PNG) ಅಥವಾ ಕಿರು ವೀಡಿಯೊಗಳನ್ನು ಲಗತ್ತಿಸಿ.',
      captchaLabel: 'ಸ್ಪ್ಯಾಮ್ ತಡೆಗಟ್ಟುವಿಕೆ ಪರಿಶೀಲನೆ',
      submitBtn: 'ದೂರು ಸಲ್ಲಿಸಿ',
      submittingBtn: 'ದೂರು ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...',
      successTitle: 'ದೂರು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ',
      successNote:
        'ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿಶಿಷ್ಟ ದೂರು ಸಂಖ್ಯೆಯನ್ನು (Complaint ID) ಉಳಿಸಿಕೊಳ್ಳಿ. ಪ್ರಗತಿಯನ್ನು ಪರಿಶೀಲಿಸಲು ಇದನ್ನು ಬಳಸಿ.',
      complaintIdLabel: 'ನಿಮ್ಮ ದೂರು ಸಂಖ್ಯೆ',
      trackNowBtn: 'ಈ ದೂರನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
      submitAnotherBtn: 'ಮತ್ತೊಂದು ದೂರು ದಾಖಲಿಸಿ',
      privacyNotice:
        'ಗೌಪ್ಯತಾ ಭರವಸೆ: ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮತ್ತು ವೈಯಕ್ತಿಕ ವಿವರಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿಡಲಾಗುತ್ತದೆ ಮತ್ತು ಸಾರ್ವಜನಿಕವಾಗಿ ಪ್ರದರ್ಶಿಸಲಾಗುವುದಿಲ್ಲ.',
    },
    track: {
      heading: 'ನಿಮ್ಮ ದೂರನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
      subheading:
        'ನೇರ ಸ್ಥಿತಿ ಮತ್ತು ಪರಿಹಾರದ ಪ್ರಗತಿಯನ್ನು ನೋಡಲು ನಿಮ್ಮ ದೂರು ಸಂಖ್ಯೆ ಮತ್ತು ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.',
      codeLabel: 'ದೂರು ಸಂಖ್ಯೆ (Complaint ID)',
      codePlaceholder: 'ಉದಾ: HDMC-W65-2026-0001',
      mobileLabel: 'ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
      mobilePlaceholder: '10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
      searchBtn: 'ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ',
      searchingBtn: 'ಮಾಹಿತಿ ಪಡೆಯಲಾಗುತ್ತಿದೆ...',
      regDate: 'ದಾಖಲಾದ ದಿನಾಂಕ',
      category: 'ದೂರಿನ ವರ್ಗ',
      area: 'ಪ್ರದೇಶ / ಬೀದಿ',
      landmark: 'ಗುರುತು',
      department: 'ನಿಯೋಜಿತ ಇಲಾಖೆ',
      latestUpdate: 'ಇತ್ತೀಚಿನ ಪ್ರಗತಿ ಮಾಹಿತಿ',
      resolution: 'ಪರಿಹಾರದ ವಿವರಗಳು',
      timelineTitle: 'ಪ್ರಗತಿಯ ಹಂತಗಳು',
      historyTitle: 'ಅಧಿಕೃತ ಪ್ರಗತಿ ದಾಖಲೆ',
      mediaTitle: 'ಸಲ್ಲಿಸಿದ ದಾಖಲೆಗಳು',
    },
    gallery: {
      heading: 'ವಾರ್ಡ್ ಅಭಿವೃದ್ಧಿ ಗ್ಯಾಲರಿ',
      subheading:
        'ವಾರ್ಡ್ ನಂ. 65 ರ ರಸ್ತೆಗಳು, ಒಳಚರಂಡಿ, ಕುಡಿಯುವ ನೀರು ಮತ್ತು ಸ್ವಚ್ಛತೆ ಕಾಮಗಾರಿಗಳ ಮೊದಲು-ನಂತರದ ದೃಶ್ಯಾವಳಿ.',
      allAreas: 'ಎಲ್ಲಾ ವಾರ್ಡ್ 65 ಪ್ರದೇಶಗಳು',
      allCategories: 'ಎಲ್ಲಾ ವರ್ಗಗಳು',
      beforeLabel: 'ಕಾಮಗಾರಿ ಮೊದಲು',
      afterLabel: 'ಪೂರ್ಣಗೊಂಡ ನಂತರ',
      empty:
        'ಇನ್ನೂ ಯಾವುದೇ ಅಭಿವೃದ್ಧಿ ಕಾಮಗಾರಿಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗಿಲ್ಲ. ಆಡಳಿತ ವಿಭಾಗದ ಮೂಲಕ ಅಧಿಕಾರಿಗಳು ಯೋಜನೆಗಳನ್ನು ಸೇರಿಸಬಹುದು.',
    },
    updates: {
      heading: 'ಇತ್ತೀಚಿನ ಮಾಹಿತಿ ಮತ್ತು ಪ್ರಕಟಣೆಗಳು',
      subheading:
        'ವಾರ್ಡ್ ನಂ. 65 ರ ಅಧಿಕೃತ ಪ್ರಕಟಣೆಗಳು, ಹೊಸ ಯೋಜನೆಗಳು ಮತ್ತು ಸಮುದಾಯ ಕಾರ್ಯಕ್ರಮಗಳು.',
      allTypes: 'ಎಲ್ಲಾ ಪ್ರಕಟಣೆಗಳು',
      empty:
        'ಇನ್ನೂ ಯಾವುದೇ ಪ್ರಕಟಣೆಗಳನ್ನು ಪ್ರಕಟಿಸಲಾಗಿಲ್ಲ. ಆಡಳಿತ ವಿಭಾಗದಿಂದ ಅಧಿಕಾರಿಗಳು ಪ್ರಕಟಣೆಗಳನ್ನು ಸೇರಿಸಬಹುದು.',
    },
    contact: {
      heading: 'ಸಂಪರ್ಕ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆ ವಿಭಾಗ',
      subheading:
        'ವಾರ್ಡ್ ನಂ. 65 ಕಚೇರಿ, ಜನಪ್ರತಿನಿಧಿಗಳು ಅಥವಾ ತುರ್ತು ಪಾಲಿಕೆ ಸಹಾಯವಾಣಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.',
      officeTitle: 'ವಾರ್ಡ್ ನಂ. 65 ಮಹಾನಗರ ಪಾಲಿಕೆ ಕಚೇರಿ',
      whatsappBtn: 'ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಸಂಪರ್ಕಿಸಿ',
      mapsBtn: 'ಗೂಗಲ್ ನಕ್ಷೆಯಲ್ಲಿ ಸ್ಥಳ ತೆರೆಯಿರಿ',
      emergencyTitle: 'ತುರ್ತು ನಾಗರಿಕ ಸಹಾಯವಾಣಿ',
      waterEmergency: 'ಕುಡಿಯುವ ನೀರಿನ ತುರ್ತು ಸೇವೆ',
      powerEmergency: 'ಬೀದಿ ದೀಪ / ವಿದ್ಯುತ್ ವಿಭಾಗ',
      sanitationEmergency: 'ನೈರ್ಮಲ್ಯ ಮತ್ತು ಒಳಚರಂಡಿ',
    },
    footer: {
      title: 'ವಾರ್ಡ್ ನಂ. 65',
      corp: 'ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ ಮಹಾನಗರ ಪಾಲಿಕೆ',
      place: 'ಹುಬ್ಬಳ್ಳಿ, ಕರ್ನಾಟಕ.',
      motto: '"ಸಾರ್ವಜನಿಕ ಸೇವೆ | ಪಾರದರ್ಶಕತೆ | ಅಭಿವೃದ್ಧಿ | ಉತ್ತರದಾಯಿತ್ವ"',
      quickLinksTitle: 'ತ್ವರಿತ ಕೊಂಡಿಗಳು',
      worksLink: 'ಅಭಿವೃದ್ಧಿ ಕಾಮಗಾರಿಗಳು',
    },
  },
} as const;
