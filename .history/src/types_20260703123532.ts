/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LoveStoryEvent {
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface MenuItem {
  category: string;
  name: string;
}

export interface WeddingInvitation {
  id: string;
  slug: string;
  templateId: string;
  groomName: string;
  groomFather: string;
  groomMother: string;
  brideName: string;
  brideFather: string;
  brideMother: string;
  weddingDate: string; // YYYY-MM-DD
  weddingTime: string; // HH:MM
  venueName: string;
  venueAddress: string;
  googleMapsUrl: string;
  musicUrl: string; // Background music file/link
  musicTitle: string;
  dressCodeColor: string; // Hex color code
  dressCodeDescription: string;
  hashtag: string;
  loveStory: LoveStoryEvent[];
  menu: MenuItem[];
  qrGroomBank: string; // Base64 or image URL
  qrBrideBank: string; // Base64 or image URL
  groomBankName: string;
  groomBankAccount: string;
  groomBankUser: string;
  brideBankName: string;
  brideBankAccount: string;
  brideBankUser: string;
  groomAvatar?: string;
  brideAvatar?: string;
  galleryImages: string[];
  views: number;
  userId: string;
  createdAt: string;

  // Advanced display settings from the interactive editor UI
  timeFormat?: '24h' | '12h';
  limitGuestsEnabled?: boolean;
  countdownEnabled?: boolean;
  mapEnabled?: boolean;
  rsvpEnabled?: boolean;
  rsvpStyle?: 'button' | 'embedded';
  rsvpQuestions?: string[];
  dressCodeEnabled?: boolean;
  timelineEnabled?: boolean;
  guestbookEnabled?: boolean;
  guestbookFilterWords?: string[];
  giftBoxEnabled?: boolean;
  thankYouEnabled?: boolean;
  thankYouMessage?: string;
  envelopeEnabled?: boolean;
  envelopeGreeting?: string;
  previewStyle?: 'envelope' | 'customImage';
  previewCustomImage?: string;
  badWords?: string[];
}

export interface RSVP {
  id: string;
  invitationId: string;
  guestName: string;
  phone: string;
  attending: boolean; // true = Yes, false = No
  guestCount: number;
  greetings: string;
  foodChoice: string;
  allergies: string;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  category: 'modern' | 'classic' | 'luxury' | 'floral' | 'minimal' | 'vintage' | 'elegant' | 'premium';
  theme: string; // css class or tailwind preset
  fontHeading: string;
  fontBody: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  cardStyle: string;
  coverImage: string;
  description: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  readingTime: string;
  publishDate: string;
  coverImage: string;
  views: number;
}

export interface DashboardStats {
  views: number;
  rsvpsCount: number;
  attendingCount: number;
  declinedCount: number;
  totalGuests: number;
  wishesCount: number;
  contributions: number;
}
