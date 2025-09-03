# Social Media Handles & Metrics Tracker

## Overview

The Social Media Handles & Metrics Tracker is a comprehensive module designed to monitor digital presence and outreach across multiple social media platforms. This frontend-only implementation provides a complete social media management system with detailed analytics, performance tracking, and engagement monitoring.

## Purpose

- **Digital Presence Monitoring**: Track social media performance across multiple platforms
- **Engagement Analytics**: Monitor follower growth, reach, impressions, and engagement rates
- **Content Performance**: Identify top-performing posts and content strategies
- **Platform Comparison**: Compare performance across different social media platforms
- **Growth Tracking**: Monitor follower growth trends and account development

## Features

### Core Functionality

1. **Multi-Platform Support**
   - Facebook, Instagram, Twitter (X), YouTube
   - Platform-specific metrics and analytics
   - Unified dashboard for all platforms

2. **Account Management**
   - Add and manage multiple social media accounts
   - Track account status (Active/Inactive)
   - Verified account indicators
   - Profile information and bio management

3. **Metrics Tracking**
   - Followers count and growth rate
   - Reach and impressions
   - Engagement rates and total engagements
   - Posts frequency (weekly/monthly)

4. **Content Analytics**
   - Top posts by engagement
   - Post performance metrics
   - Content reach and impact analysis
   - Engagement rate calculations

### Analytics & KPIs

1. **Overall Performance**
   - Total followers across all platforms
   - Overall engagement rate
   - Total reach and impressions
   - Total posts and activity

2. **Platform Distribution**
   - Audience distribution across platforms
   - Platform-wise performance comparison
   - Platform-specific engagement rates
   - Growth rates by platform

3. **Growth Trends**
   - Weekly follower growth trends
   - Monthly performance metrics
   - Growth rate analysis
   - Performance comparisons

4. **Content Performance**
   - Top 5 posts by engagement
   - Post reach and impact
   - Content effectiveness metrics
   - Engagement quality analysis

### View Modes

1. **List View**
   - Card-based account display
   - Quick metrics overview
   - Account status indicators
   - Top posts preview

2. **Calendar View**
   - Monthly activity calendar
   - Post activity visualization
   - Platform activity indicators
   - Activity summary statistics

3. **Stats View**
   - Comprehensive analytics dashboard
   - Interactive charts and graphs
   - Key performance indicators
   - Platform performance comparison

## Components

### Main Components

1. **SocialMediaTracker (index.jsx)**
   - Main container component
   - State management for accounts and filters
   - View mode switching
   - Search and filter functionality

2. **SocialMediaCard**
   - Individual account display card
   - Account metrics and statistics
   - Action buttons (Edit, Visit Profile, Delete)
   - Top posts preview
   - Account status indicators

3. **SocialMediaForm**
   - Modal form for creating/editing accounts
   - Comprehensive form fields for all metrics
   - Platform selection and validation
   - Account settings management

4. **SocialMediaStats**
   - Analytics dashboard
   - KPI cards and charts
   - Platform distribution visualizations
   - Growth trend analysis
   - Top posts list

5. **SocialMediaCalendar**
   - Monthly calendar view
   - Activity indicators on dates
   - Platform activity visualization
   - Summary statistics

## Data Structure

### Account Object
```javascript
{
  id: number,
  platform: "Facebook" | "Instagram" | "Twitter" | "YouTube",
  handle: string,
  url: string,
  followers: number,
  reach: number,
  impressions: number,
  engagements: number,
  posts_this_week: number,
  posts_this_month: number,
  engagement_rate: number,
  growth_rate: number,
  status: "Active" | "Inactive",
  last_updated: string,
  top_posts: Array,
  is_verified: boolean,
  profile_image: string,
  bio: string
}
```

### Post Object
```javascript
{
  id: number,
  content: string,
  date: string,
  likes: number,
  comments: number,
  shares: number,
  reach: number,
  engagement_rate: number
}
```

### KPIs Object
```javascript
{
  total_followers: number,
  total_reach: number,
  total_impressions: number,
  total_engagements: number,
  overall_engagement_rate: number,
  total_posts_this_week: number,
  total_posts_this_month: number,
  growth_rate: number,
  platform_distribution: Array,
  weekly_growth: Array,
  top_posts: Array,
  monthly_metrics: Array,
  platform_performance: Array
}
```

## Usage

### Adding a New Account

1. Click "Add Account" button
2. Select platform (Facebook, Instagram, Twitter, YouTube)
3. Enter handle/username and profile URL
4. Add account bio/description
5. Enter metrics (followers, reach, impressions, engagements)
6. Set engagement rate and growth rate
7. Configure posts activity
8. Set account status and verification
9. Save account

### Managing Accounts

1. **View Accounts**: Browse all accounts in list view
2. **Edit Account**: Click edit button to modify account information
3. **Visit Profile**: Click to open social media profile in new tab
4. **Copy Handle**: Copy account handle to clipboard
5. **Delete Account**: Remove account from tracking

### Analytics Dashboard

1. **KPIs Overview**: View key metrics at a glance
2. **Platform Distribution**: See audience distribution across platforms
3. **Growth Trends**: Monitor follower growth over time
4. **Top Posts**: Identify best-performing content
5. **Performance Comparison**: Compare platform performance

### Calendar View

1. **Monthly Activity**: View social media activity by date
2. **Platform Indicators**: See which platforms had activity
3. **Engagement Metrics**: View engagement rates for activities
4. **Navigation**: Navigate between months
5. **Summary Statistics**: View account and activity summaries

## Styling

The module uses Tailwind CSS for styling and maintains consistency with the overall application design:

- **Color Scheme**: Platform-specific colors (Facebook blue, Instagram pink, Twitter blue, YouTube red)
- **Typography**: Consistent font hierarchy and spacing
- **Layout**: Responsive grid system for all screen sizes
- **Components**: Rounded corners, subtle shadows, and hover effects
- **Icons**: Lucide React icons for consistent visual language

## Responsive Design

The module is fully responsive and works on all device sizes:

- **Desktop**: Full feature set with multi-column layouts
- **Tablet**: Optimized layouts with adjusted spacing
- **Mobile**: Single-column layouts with touch-friendly interactions

## Integration

The module integrates seamlessly with the existing application:

- **Navigation**: Added to sidebar with appropriate icon
- **Routing**: Protected route with role-based access control
- **Internationalization**: Support for English and Hindi languages
- **Authentication**: Uses existing auth context
- **State Management**: Local component state with React hooks

## Future Enhancements

1. **Advanced Analytics**
   - Real-time data integration
   - Advanced filtering and sorting
   - Custom date range analysis
   - Export functionality

2. **Content Management**
   - Post scheduling integration
   - Content calendar
   - Post performance predictions
   - Content recommendations

3. **Automation**
   - Automatic metrics updates
   - Scheduled reports
   - Alert notifications
   - Performance benchmarks

4. **Collaboration**
   - Team member access
   - Role-based permissions
   - Activity logs
   - Comment and feedback system

5. **Advanced Features**
   - Competitor analysis
   - Hashtag performance tracking
   - Audience demographics
   - Influencer collaboration tracking

## Technical Notes

- **Frontend Only**: This is a frontend-only implementation with dummy data
- **React Hooks**: Uses modern React patterns with useState and useEffect
- **Performance**: Optimized rendering with React.memo and efficient state management
- **Accessibility**: Follows WCAG guidelines for accessibility
- **Browser Support**: Compatible with modern browsers (Chrome, Firefox, Safari, Edge)

## Dependencies

- React 18+
- Lucide React (for icons)
- Tailwind CSS (for styling)
- React Router DOM (for routing)

## File Structure

```
frontend/src/pages/SocialMediaTracker/
├── index.jsx                    # Main component
├── components/
│   ├── SocialMediaCard.jsx      # Account display card
│   ├── SocialMediaForm.jsx      # Account creation/editing form
│   ├── SocialMediaStats.jsx     # Analytics dashboard
│   └── SocialMediaCalendar.jsx  # Calendar view
└── README.md                    # This documentation
```

This module provides a comprehensive solution for managing and analyzing social media presence, with a focus on usability, performance, and scalability. It enables political representatives to effectively monitor their digital outreach and engagement across multiple platforms.
