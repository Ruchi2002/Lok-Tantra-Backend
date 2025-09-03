import React, {
  createContext,
  useContext,
} from "react";
import PropTypes from "prop-types";
import { useGetCitizenIssuesQuery, useGetCitizenIssuesGeoJsonQuery, useGetPublicDashboardStatsQuery } from "../store/api/appApi";
import { useAuth } from "../hooks/useAuth";

export const AppDataContext = createContext();

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
};

export const AppDataProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // Use RTK Query hooks for data fetching
  const {
    data: issuesData,
    isLoading: issuesLoading,
    error: issuesError,
    refetch: refetchIssues
  } = useGetCitizenIssuesQuery(undefined, {
    skip: !isAuthenticated, // Only fetch if authenticated
  });

  const {
    data: geoJsonData,
    isLoading: geoJsonLoading,
    error: geoJsonError,
    refetch: refetchGeoJson
  } = useGetCitizenIssuesGeoJsonQuery(undefined, {
    skip: !isAuthenticated, // Only fetch if authenticated
  });

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard
  } = useGetPublicDashboardStatsQuery(); // Always fetch (public endpoint)

  // Method to refetch data after successful login
  const fetchDataAfterLogin = () => {
    refetchIssues();
    refetchGeoJson();
    refetchDashboard();
  };

  const value = {
    // Issues data
    issuesData,
    issuesLoading,
    issuesError,
    refetchIssues,
    
    // GeoJSON data
    geoJsonData,
    geoJsonLoading,
    geoJsonError,
    refetchGeoJson,
    
    // Dashboard data
    dashboardData,
    dashboardLoading,
    dashboardError,
    refetchDashboard,
    
    // Utility methods
    fetchDataAfterLogin,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

AppDataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
