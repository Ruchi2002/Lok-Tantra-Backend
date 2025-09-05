import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

const LeftColumn = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { t, tSection } = useTranslation();
  const tDashboard = tSection('dashboard');

  const parliamentNews = [
    {
      en: "Lok Sabha passes Digital India Bill with focus on cyber security.",
      hi: "लोक सभा ने साइबर सुरक्षा पर ध्यान केंद्रित करते हुए डिजिटल इंडिया बिल पारित किया।"
    },
    {
      en: "Rajya Sabha debates climate change and renewable energy adoption.",
      hi: "राज्य सभा में जलवायु परिवर्तन और नवीकरणीय ऊर्जा अपनाने पर बहस।"
    },
    {
      en: "Finance Minister tables Economic Survey ahead of Budget session.",
      hi: "वित्त मंत्री ने बजट सत्र से पहले आर्थिक सर्वेक्षण पेश किया।"
    },
    {
      en: "Discussion on rising unemployment scheduled for next week.",
      hi: "बेरोजगारी बढ़ने पर चर्चा अगले सप्ताह के लिए निर्धारित।"
    },
    {
      en: "New bill on women's reservation tabled in Parliament.",
      hi: "संसद में महिलाओं के आरक्षण पर नया बिल पेश।"
    },
    {
      en: "MPs raise concerns over farmer protests and MSP policy.",
      hi: "सांसदों ने किसान आंदोलन और एमएसपी नीति पर चिंता जताई।"
    },
    {
      en: "Health Minister updates on AIIMS expansion projects.",
      hi: "स्वास्थ्य मंत्री ने एम्स विस्तार परियोजनाओं पर अपडेट दिया।"
    },
    {
      en: "Opposition demands discussion on rising fuel prices.",
      hi: "विपक्ष ने बढ़ते ईंधन कीमतों पर चर्चा की मांग की।"
    },
    {
      en: "Parliamentary panel reviews progress on Smart Cities Mission.",
      hi: "संसदीय पैनल ने स्मार्ट सिटीज मिशन पर प्रगति की समीक्षा की।"
    },
    {
      en: "Debate on National Education Policy implementation underway.",
      hi: "राष्ट्रीय शिक्षा नीति के कार्यान्वयन पर बहस जारी।"
    },
    {
      en: "Railways Minister announces new high-speed rail corridors.",
      hi: "रेल मंत्री ने नए हाई-स्पीड रेल कॉरिडोर की घोषणा की।"
    },
    {
      en: "Parliament observes tribute to freedom fighters on anniversary.",
      hi: "संसद ने वर्षगांठ पर स्वतंत्रता सेनानियों को श्रद्धांजलि दी।"
    },
    {
      en: "Standing Committee submits report on water conservation projects.",
      hi: "स्थायी समिति ने जल संरक्षण परियोजनाओं पर रिपोर्ट प्रस्तुत की।"
    },
    {
      en: "Lok Sabha adjourned after heated debate on inflation.",
      hi: "मुद्रास्फीति पर गर्म बहस के बाद लोक सभा स्थगित।"
    },
    {
      en: "Bill introduced to strengthen data protection and privacy laws.",
      hi: "डेटा संरक्षण और गोपनीयता कानूनों को मजबूत करने के लिए बिल पेश।"
    }
  ];

  // Get current language from context
  const { currentLang } = useTranslation();
  
  // Duplicate the array to create seamless loop
  const duplicatedNews = [...parliamentNews, ...parliamentNews];

  const scrollAnimation = {
    animation: isHovered ? 'none' : 'scroll 30s linear infinite',
  };

  const handleHeaderClick = () => {
    // Navigate to a news or updates page - you can create this route later
    navigate('/dashboard/news-updates');
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500  h-[78vh] flex flex-col">
      <h3 
        className="text-xl font-bold text-gray-800 mb-6 flex-shrink-0 cursor-pointer hover:text-blue-600 transition-color s duration-200"
        onClick={handleHeaderClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleHeaderClick();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Navigate to News Updates page"
      >
        {tDashboard('parliamentNewsUpdates')}
      </h3>
      <div 
        className="relative overflow-hidden flex-1 min-h-0"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className="space-y-3 transition-transform duration-1000"
          style={scrollAnimation}
        >
          {duplicatedNews.map((news, index) => (
            <div 
              key={`news-${index}-${news.en?.slice(0, 20)}`} 
              className="text-blue-700 hover:text-blue-900 cursor-pointer text-sm font-medium p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all duration-300 border border-blue-100 hover:border-blue-200"
            >
              {news[currentLang] || news.en}
            </div>
          ))}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scroll {
            0% {
              transform: translateY(0);
            }
            100% {
              transform: translateY(-50%);
            }
          }
        `
      }} />
    </div>
  );
};

export default LeftColumn;