import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { WebsiteVisitor } from '../types';

const VisitorTracker: React.FC = () => {
  const location = useLocation();
  const isInitialized = useRef(false);
  const sessionData = useRef<Partial<WebsiteVisitor>>({});

  useEffect(() => {
    const initTracking = async () => {
      if (isInitialized.current) return;
      isInitialized.current = true;

      // Generate or retrieve IDs
      let visitorId = localStorage.getItem('visitor_id');
      if (!visitorId) {
        visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('visitor_id', visitorId);
      }

      let sessionId = sessionStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = `s_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('session_id', sessionId);
      }

      // Check for bots
      const ua = navigator.userAgent.toLowerCase();
      const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(ua);

      // Determine Traffic Source
      let trafficSource = 'Direct';
      const referrer = document.referrer;
      if (referrer) {
        if (referrer.includes('google.com') || referrer.includes('bing.com') || referrer.includes('yahoo.com')) {
          trafficSource = 'Search Engine';
        } else if (referrer.includes('facebook.com') || referrer.includes('twitter.com') || referrer.includes('linkedin.com') || referrer.includes('instagram.com')) {
          trafficSource = 'Social Media';
        } else if (!referrer.includes(window.location.hostname)) {
          trafficSource = 'Referral';
        }
      }

      // Get Device Info
      const getDeviceType = () => {
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet';
        if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'Mobile';
        return 'Desktop';
      };

      const getOS = () => {
        if (ua.includes('win')) return 'Windows';
        if (ua.includes('mac')) return 'Mac OS';
        if (ua.includes('linux')) return 'Linux';
        if (ua.includes('android')) return 'Android';
        if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
        return 'Unknown';
      };

      const getBrowser = () => {
        if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome';
        if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
        if (ua.includes('firefox')) return 'Firefox';
        if (ua.includes('edg')) return 'Edge';
        return 'Unknown';
      };

      // Initial Data
      sessionData.current = {
        visitor_id: visitorId,
        session_id: sessionId,
        device_type: getDeviceType(),
        os: getOS(),
        browser: getBrowser(),
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        referrer: document.referrer || 'Direct',
        landing_page: window.location.href,
        first_visit: new Date().toISOString(),
        is_bot: isBot,
        traffic_source: trafficSource,
        pages_visited: 0,
        page_views: []
      };

      // Try to get Geolocation/IP data
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const geoData = await response.json();
          sessionData.current.ip_address = geoData.ip;
          sessionData.current.country = geoData.country_name;
          sessionData.current.state = geoData.region;
          sessionData.current.city = geoData.city;
          sessionData.current.latitude = geoData.latitude;
          sessionData.current.longitude = geoData.longitude;
          sessionData.current.isp = geoData.org;
        }
      } catch (e) {
        console.warn("Could not fetch geolocation data", e);
        // Fallbacks
        sessionData.current.ip_address = 'Unknown';
        sessionData.current.country = 'Unknown';
        sessionData.current.city = 'Unknown';
      }
    };

    initTracking();
  }, []);

  useEffect(() => {
    // Track page views
    if (!sessionData.current.session_id) return;

    const currentPath = location.pathname + location.search;
    
    // Update session data
    sessionData.current.last_visit = new Date().toISOString();
    
    // Check if this is a new page view or just a re-render
    const lastView = sessionData.current.page_views?.[sessionData.current.page_views.length - 1];
    if (!lastView || lastView.path !== currentPath) {
      sessionData.current.pages_visited = (sessionData.current.pages_visited || 0) + 1;
      sessionData.current.page_views = [
        ...(sessionData.current.page_views || []),
        { path: currentPath, timestamp: new Date().toISOString() }
      ];
    }

    // Send update to backend
    // Use a small timeout to batch rapid changes if needed, but for now direct call
    const timeoutId = setTimeout(() => {
      try {
        const cleanData = {
          visitor_id: sessionData.current.visitor_id,
          session_id: sessionData.current.session_id,
          device_type: sessionData.current.device_type,
          os: sessionData.current.os,
          browser: sessionData.current.browser,
          screen_resolution: sessionData.current.screen_resolution,
          referrer: sessionData.current.referrer,
          landing_page: sessionData.current.landing_page,
          first_visit: sessionData.current.first_visit,
          last_visit: sessionData.current.last_visit,
          is_bot: sessionData.current.is_bot,
          traffic_source: sessionData.current.traffic_source,
          pages_visited: sessionData.current.pages_visited,
          page_views: sessionData.current.page_views ? [...sessionData.current.page_views] : [],
          ip_address: sessionData.current.ip_address,
          country: sessionData.current.country,
          state: sessionData.current.state,
          city: sessionData.current.city,
          latitude: sessionData.current.latitude,
          longitude: sessionData.current.longitude,
          isp: sessionData.current.isp
        };
        mockBackend.logVisitor(cleanData);
      } catch (e) {
        console.error("Failed to send sessionData to backend", e);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [location]);

  return null; // This component doesn't render anything
};

export default VisitorTracker;
