# MPLADS & Development Projects Tracker

A comprehensive development project tracking system for MPs/MLAs to monitor MPLADS (Member of Parliament Local Area Development Scheme) projects and other development initiatives in their constituency.

## Features

### Core Functionality
- **Project Management**: Record and track development project details
- **Budget Tracking**: Monitor sanctioned vs utilized amounts
- **Progress Monitoring**: Track project completion percentages
- **Timeline Management**: Manage project start/end dates
- **Geo-tagging**: Store project location coordinates
- **Photo Documentation**: Upload and manage project photos
- **Status Tracking**: Monitor Planned/Ongoing/Completed status

### Key Performance Indicators (KPIs)
- **Total Projects**: Complete count of all projects
- **Budget Utilization**: Sanctioned vs utilized amount tracking
- **Average Progress**: Overall project completion percentage
- **Project Distribution**: Status-based project breakdown
- **Top Ongoing Projects**: Highest budget ongoing projects
- **Delayed Projects**: Projects past due date
- **Category-wise Analysis**: Projects by development category

## Components

### Main Components

#### 1. `index.jsx` - Main Tracker Component
- Central dashboard for MPLADS project management
- Three view modes: List, Calendar, and Statistics
- Search and filtering capabilities
- Project creation and management

#### 2. `ProjectCard.jsx` - Project Display Card
- Individual project information display
- Progress tracking with visual indicators
- Budget utilization visualization
- Photo gallery integration
- Location and timeline details
- Expandable details view

#### 3. `ProjectForm.jsx` - Project Creation/Editing
- Modal form for adding/editing projects
- Comprehensive project details input
- Budget and timeline management
- Location coordinates input
- Photo upload functionality
- Category and priority selection

#### 4. `ProjectStats.jsx` - Analytics Dashboard
- KPI cards with key metrics
- Visual charts and progress bars
- Budget analysis and utilization
- Project status distribution
- Category-wise breakdown
- Performance insights

#### 5. `ProjectCalendar.jsx` - Calendar View
- Monthly calendar display
- Project indicators on dates
- Timeline visualization
- Status-based color coding
- Summary statistics
- Upcoming milestones

## Data Structure

### Project Object
```javascript
{
  id: number,
  title: string,                    // Project title
  description: string,              // Project description
  sanctioned_amount: number,        // Sanctioned budget in ₹
  utilized_amount: number,          // Utilized amount in ₹
  contractor: string,               // Contractor name
  start_date: string,               // ISO date string
  end_date: string,                 // ISO date string
  progress_percentage: number,      // 0-100
  status: "Planned" | "Ongoing" | "Completed",
  category: string,                 // Project category
  priority: "High" | "Medium" | "Low",
  beneficiaries: number,            // Number of beneficiaries
  location: {
    latitude: number,
    longitude: number,
    address: string
  },
  photos: Photo[],                  // Array of photo objects
  is_delayed: boolean
}
```

### Photo Object
```javascript
{
  id: number,
  url: string,                      // Photo URL
  caption: string,                  // Photo caption
  date: string                      // ISO date string
}
```

### KPIs Object
```javascript
{
  total_projects: number,
  planned_projects: number,
  ongoing_projects: number,
  completed_projects: number,
  total_sanctioned_budget: number,
  total_utilized_amount: number,
  average_progress: number,
  delayed_projects: number,
  top_ongoing_projects: [
    { title: string, budget: number, progress: number }
  ],
  projects_by_category: [
    { category: string, count: number, budget: number }
  ],
  monthly_progress: [
    { month: string, completed: number, ongoing: number }
  ]
}
```

## Usage

### Adding a New Project
1. Click "New Project" button
2. Fill in project details (title, description, category)
3. Enter budget information (sanctioned and utilized amounts)
4. Set project timeline (start and end dates)
5. Add contractor and beneficiary information
6. Set priority level and status
7. Enter location coordinates and address
8. Upload project photos with captions
9. Save the project

### Managing Projects
- **Planned Projects**: Projects yet to start
- **Ongoing Projects**: Projects currently in progress
- **Completed Projects**: Finished projects
- **Budget Tracking**: Monitor sanctioned vs utilized amounts
- **Progress Updates**: Update completion percentages
- **Photo Documentation**: Add progress photos

### Viewing Analytics
- **List View**: Card-based project overview
- **Calendar View**: Monthly calendar with project indicators
- **Stats View**: Detailed analytics and KPIs

## Dummy Data

The module includes comprehensive dummy data for demonstration:
- 6 sample projects with realistic data
- Various project categories and priorities
- Different statuses and progress levels
- Sample photos and location data
- Comprehensive KPIs and analytics

## Styling

The module uses Tailwind CSS with:
- Consistent color scheme matching the app
- Responsive design for all screen sizes
- Interactive hover states and transitions
- Clean, modern UI components
- Accessible color contrasts
- Progress bars and visual indicators

## Integration

The MPLADS Project Tracker is designed to integrate with:
- Existing authentication system
- API services for data persistence
- Navigation and routing system
- Global state management
- File upload services for photos
- Mapping services for geo-tagging

## Future Enhancements

Potential improvements:
- Export functionality (PDF, Excel)
- Advanced filtering and search
- Real-time updates and notifications
- Integration with government APIs
- Mobile app support
- Multi-language support
- Advanced analytics and reporting
- Interactive maps integration
- Document management system
- Stakeholder collaboration features

## Project Categories

Available project categories:
- Infrastructure
- Healthcare
- Education
- Water Supply
- Energy
- Sports
- Transportation
- Agriculture
- Rural Development
- Urban Development
- Environment
- Social Welfare

## Priority Levels

Project priority levels:
- **High**: Critical projects requiring immediate attention
- **Medium**: Standard priority projects
- **Low**: Non-urgent projects

## Status Tracking

Project status options:
- **Planned**: Project approved but not yet started
- **Ongoing**: Project currently in progress
- **Completed**: Project finished and delivered

## Budget Management

Budget tracking features:
- Sanctioned amount tracking
- Utilized amount monitoring
- Budget utilization percentage
- Remaining budget calculation
- Category-wise budget allocation
- Budget vs progress correlation
