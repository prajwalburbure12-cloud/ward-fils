import type {
  PortalSettingsData,
  RepresentativeData,
} from '../components/HomePortalView.tsx';
import type { HeroSlideItem } from '../db/schema.ts';

export const DEFAULT_HERO_SLIDES: HeroSlideItem[] = [
  {
    src: '/assets/slideshow/ward_roads_upgrade.jpg',
    titleEn: 'Concrete Roads & LED Lighting',
    titleKn: 'ಕಾಂಕ್ರೀಟ್ ರಸ್ತೆಗಳು ಮತ್ತು ಎಲ್‌ಇಡಿ ದೀಪಗಳು',
  },
  {
    src: '/assets/slideshow/ward_water_supply.jpg',
    titleEn: '24x7 Drinking Water Network',
    titleKn: '24x7 ಕುಡಿಯುವ ನೀರಿನ ಜಾಲ',
  },
  {
    src: '/assets/slideshow/ward_park_clean.jpg',
    titleEn: 'Neighborhood Parks & Walkways',
    titleKn: 'ಬಡಾವಣೆ ಉದ್ಯಾನವನ ಮತ್ತು ವಾಕಿಂಗ್ ಟ್ರ್ಯಾಕ್',
  },
  {
    src: '/assets/slideshow/ward_sanitation_drive.jpg',
    titleEn: 'Clean Streets & Segregated Waste',
    titleKn: 'ಸ್ವಚ್ಛ ಬೀದಿಗಳು ಮತ್ತು ತ್ಯಾಜ್ಯ ವಿಂಗಡಣೆ',
  },
];

export const DEFAULT_PORTAL_SETTINGS: PortalSettingsData = {
  id: 1,
  bannerImageUrl: null,
  bannerAlt: 'Ward No. 65, Hubballi-Dharwad Municipal Corporation',
  heroSlides: DEFAULT_HERO_SLIDES,
  officeAddressEn:
    'Ward No. 65 Civic Service Office, Hubballi-Dharwad Municipal Corporation, Hubballi, Karnataka 580020',
  officeAddressKn:
    'ವಾರ್ಡ್ ನಂ. 65 ನಾಗರಿಕ ಸೇವಾ ಕಚೇರಿ, ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ ಮಹಾನಗರ ಪಾಲಿಕೆ, ಹುಬ್ಬಳ್ಳಿ, ಕರ್ನಾಟಕ 580020',
  officePhone: '',
  officeEmail: '',
  whatsappNumber: '',
  googleMapsUrl: '',
  emergencyWaterPhone: '1533',
  emergencyPowerPhone: '1912',
  emergencySanitationPhone: '1533',
};

export const DEFAULT_REPRESENTATIVES: RepresentativeData[] = [
  {
    id: 1,
    slotOrder: 1,
    nameEn: 'Smt. Sunita Prakash Burabure',
    nameKn: 'ಶ್ರೀಮತಿ ಸುನೀತಾ ಪ್ರಕಾಶ ಬುರಬುರೆ',
    designationEn: 'Corporator – Ward No. 65 (HDMC)',
    designationKn: 'ಪಾಲಿಕೆ ಸದಸ್ಯರು – ವಾರ್ಡ್ ನಂ. 65 (ಎಚ್‌ಡಿಎಂಸಿ)',
    introEn:
      'Elected Corporator representing the residents of Ward No. 65 in the Hubballi-Dharwad Municipal Corporation, committed to accessible grassroots governance.',
    introKn:
      'ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ ಮಹಾನಗರ ಪಾಲಿಕೆಯ ವಾರ್ಡ್ ನಂ. 65 ರ ಚುನಾಯಿತ ಪಾಲಿಕೆ ಸದಸ್ಯರಾಗಿ ಜನಸ್ನೇಹಿ ಆಡಳಿತಕ್ಕೆ ಬದ್ಧರಾಗಿದ್ದಾರೆ.',
    workEn:
      'Focused on drinking water distribution, underground drainage upgrades, street lighting, sanitation drives, and timely redressal of citizen grievances.',
    workKn:
      'ಕುಡಿಯುವ ನೀರು ಸರಬರಾಜು, ಭೂಗತ ಒಳಚರಂಡಿ ಸುಧಾರಣೆ, ಬೀದಿ ದೀಪಗಳು, ಸ್ವಚ್ಛತಾ ಅಭಿಯಾನ ಮತ್ತು ನಾಗರಿಕರ ಕುಂದುಕೊರತೆಗಳ ತ್ವರಿತ ಪರಿಹಾರ.',
    phone: '+91 9513613689',
    email: '',
    officeHours: '',
    photoUrl: '/assets/aistudio/KIR_5071_sd--_copy_dcb9ba37.jpg',
  },
  {
    id: 2,
    slotOrder: 2,
    nameEn: 'Prakash Burbure',
    nameKn: 'ಪ್ರಕಾಶ್ ಬುರಬುರೆ',
    designationEn: 'Ward Operations Head',
    designationKn: 'ವಾರ್ಡ್ ಕಾರ್ಯಾಚರಣೆ ಮುಖ್ಯಸ್ಥರು',
    introEn:
      'Dedicated public representative serving the neighborhoods and civic committees of Ward No. 65, Hubballi.',
    introKn:
      'ಹುಬ್ಬಳ್ಳಿಯ ವಾರ್ಡ್ ನಂ. 65 ರ ಬಡಾವಣೆಗಳು ಮತ್ತು ನಾಗರಿಕ ಸಮಿತಿಗಳ ಸೇವೆಯಲ್ಲಿರುವ ಜನಪ್ರತಿನಿಧಿ.',
    workEn:
      'Coordinating road repairs, stormwater drain maintenance, cleanliness initiatives, and ward-level community infrastructure.',
    workKn:
      'ರಸ್ತೆ ದುರಸ್ತಿ, ಮಳೆನೀರು ಚರಂಡಿ ನಿರ್ವಹಣೆ, ಸ್ವಚ್ಛತಾ ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ವಾರ್ಡ್ ಮಟ್ಟದ ಮೂಲಸೌಕರ್ಯ ಅಭಿವೃದ್ಧಿ.',
    phone: '9886613689',
    email: '',
    officeHours: '',
    photoUrl: '/assets/aistudio/DSC02240_fc0057be.JPG',
  },
  {
    id: 3,
    slotOrder: 3,
    nameEn: 'Shri Prasad Abbayya',
    nameKn: 'ಶ್ರೀ ಪ್ರಸಾದ್ ಅಬ್ಬಯ್ಯ',
    designationEn: 'MLA – Hubballi-Dharwad East Constituency',
    designationKn: 'ಶಾಸಕರು – ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ ಪೂರ್ವ ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರ',
    introEn:
      'Member of the Karnataka Legislative Assembly representing Hubballi-Dharwad East, championing urban renewal, infrastructure, and public welfare.',
    introKn:
      'ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ ಪೂರ್ವ ಕ್ಷೇತ್ರದ ಶಾಸಕರಾಗಿ ನಗರ ಅಭಿವೃದ್ಧಿ, ಮೂಲಸೌಕರ್ಯ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಕಲ್ಯಾಣಕ್ಕಾಗಿ ಶ್ರಮಿಸುತ್ತಿದ್ದಾರೆ.',
    workEn:
      'Leading constituency-wide road concretization, 24x7 water supply expansion, public health facilities, education support, and municipal development grants.',
    workKn:
      'ಕ್ಷೇತ್ರಾದ್ಯಂತ ಕಾಂಕ್ರೀಟ್ ರಸ್ತೆ ನಿರ್ಮಾಣ, 24x7 ಕುಡಿಯುವ ನೀರು ಯೋಜನೆ, ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ, ಶಿಕ್ಷಣ ಮತ್ತು ಮಹಾನಗರ ಪಾಲಿಕೆ ಅಭಿವೃದ್ಧಿ ಅನುದಾನ.',
    phone: '',
    email: '',
    officeHours: 'Constituency Office Hours · Mon – Sat',
    photoUrl: '/assets/aistudio/Formal_Portrait_on_Blue_Background_6bd0ab4f.png',
  },
];
