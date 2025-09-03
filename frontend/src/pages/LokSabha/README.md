# Lok Sabha Session Tracker

A comprehensive parliamentary performance tracking system for MPs/MLAs to monitor their Lok Sabha session activities and question management.

## Features

### Core Functionality
- **Session Management**: Record and track parliamentary session details
- **Question Tracking**: Manage both Starred and Unstarred questions
- **Ministry Integration**: Track questions by different ministries
- **Outcome Monitoring**: Monitor answered vs pending questions
- **Answer Archival**: Store and reference answer texts

### Key Performance Indicators (KPIs)
- **Total Questions Asked**: Complete count of all questions
- **Starred vs Unstarred Ratio**: Distribution of question types
- **Answered vs Pending Questions**: Response rate tracking
- **Top 3 Ministries Addressed**: Most questioned ministries
- **Questions per Session Trends**: Performance analytics

## Components

### Main Components

#### 1. `index.jsx` - Main Tracker Component
- Central dashboard for Lok Sabha session management
- Three view modes: List, Calendar, and Statistics
- Search and filtering capabilities
- Session creation and management

#### 2. `SessionCard.jsx` - Session Display Card
- Individual session information display
- Progress tracking with visual indicators
- Question type breakdown
- Ministry information
- Expandable details view

#### 3. `SessionForm.jsx` - Session Creation/Editing
- Modal form for adding/editing sessions
- Dynamic question addition
- Ministry selection dropdown
- Question type and outcome management
- Answer text input

#### 4. `SessionStats.jsx` - Analytics Dashboard
- KPI cards with key metrics
- Visual charts and progress bars
- Top ministries analysis
- Questions per session trends
- Performance insights

#### 5. `SessionCalendar.jsx` - Calendar View
- Monthly calendar display
- Session indicators on dates
- Status icons for quick identification
- Navigation between months
- Summary statistics

## Data Structure

### Session Object
```javascript
{
  id: number,
  session_number: string,        // e.g., "17th Lok Sabha - Session 1"
  date: string,                  // ISO date string
  total_questions: number,
  starred_questions: number,
  unstarred_questions: number,
  answered_questions: number,
  pending_questions: number,
  top_ministries: string[],      // Array of ministry names
  questions: Question[]          // Array of question objects
}
```

### Question Object
```javascript
{
  id: number,
  type: "Starred" | "Unstarred",
  ministry: string,              // Ministry name
  subject: string,               // Question subject
  outcome: "Answered" | "Pending",
  answer_text: string,           // Optional answer text
  date_asked: string            // ISO date string
}
```

### KPIs Object
```javascript
{
  total_questions: number,
  starred_ratio: number,         // Percentage
  unstarred_ratio: number,       // Percentage
  answered_ratio: number,        // Percentage
  pending_ratio: number,         // Percentage
  top_ministries: [
    { name: string, count: number }
  ],
  questions_per_session: [
    { session: string, count: number }
  ]
}
```

## Usage

### Adding a New Session
1. Click "New Session" button
2. Fill in session number and date
3. Add questions with ministry, subject, and outcome
4. Optionally add answer text
5. Save the session

### Managing Questions
- **Starred Questions**: Oral questions that require immediate answers
- **Unstarred Questions**: Written questions with delayed responses
- **Ministry Assignment**: Select from predefined ministry list
- **Outcome Tracking**: Mark as "Answered" or "Pending"

### Viewing Analytics
- **List View**: Card-based session overview
- **Calendar View**: Monthly calendar with session indicators
- **Stats View**: Detailed analytics and KPIs

## Dummy Data

The module includes comprehensive dummy data for demonstration:
- 3 sample sessions with realistic data
- Various question types and ministries
- Different outcome statuses
- Sample KPIs and analytics

## Styling

The module uses Tailwind CSS with:
- Consistent color scheme matching the app
- Responsive design for all screen sizes
- Interactive hover states and transitions
- Clean, modern UI components
- Accessible color contrasts

## Integration

The Lok Sabha Session Tracker is designed to integrate with:
- Existing authentication system
- API services for data persistence
- Navigation and routing system
- Global state management

## Future Enhancements

Potential improvements:
- Export functionality (PDF, Excel)
- Advanced filtering and search
- Real-time updates
- Integration with parliamentary APIs
- Mobile app support
- Multi-language support
- Advanced analytics and reporting
