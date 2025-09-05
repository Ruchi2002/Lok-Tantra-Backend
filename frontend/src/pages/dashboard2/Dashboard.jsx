import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import LeftColumn from './LeftColumn';
import MainCards from './MainCards';
import GrievanceDashboard from './GrievanceDashboard';
import SocialMedia from './SocialMedia';
import ResearchWorks from './ResearchWorks';
import DevelopmentGoals from './DevelopmentGoals';
import UpcomingMeetings from './UpcomingMeetings';
import TodayMeetings from './TodayMeetings';

const Dashboard = () => {
  console.log('New Dashboard2 component rendered');
  const { t, tSection } = useTranslation();
  const tDashboard = tSection('dashboard');



  return (
    <div className="">
      

      {/* Main Content Grid */}
      <div className="px-6 py-8 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column - Top Works */}
          <div className="md:col-span-1 md:row-start-1 md:row-end-5 ">
            <LeftColumn />
          </div>

          {/* Middle Columns - Main Cards */}
          <div className="lg:col-span-2 space-y-6">
            <MainCards />
            <GrievanceDashboard />
            
            {/* Two cards per row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SocialMedia />
              <ResearchWorks />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DevelopmentGoals />
              <UpcomingMeetings />
            </div>
          </div>

          {/* Right Column - Video and Meetings */}
          <div className="lg:col-span-1 space-y-6">
            <TodayMeetings />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
