// src/components/SubscriptionUsageIndicator.jsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { LinearProgress, Box, Typography, Chip } from '@mui/material';
import { Info } from 'lucide-react';

const SubscriptionUsageIndicator = ({ resourceType, currentCount }) => {
  const { user } = useSelector((state) => state.auth);
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionLimits = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_BACKEND_API || 'http://localhost:5050'}/subscription/my-subscription`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.subscription?.plan) {
            setLimits(data.subscription.plan);
          }
        }
      } catch (error) {
        console.error('Failed to fetch subscription limits:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role !== 'admin') {
      fetchSubscriptionLimits();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading || !limits || user?.role === 'admin') {
    return null;
  }

  const getLimitForResource = () => {
    switch (resourceType) {
      case 'organization':
        return limits.maxOrganizations;
      case 'venue':
        return limits.maxVenues;
      case 'device':
        return limits.maxDevices;
      case 'user':
        return limits.maxUsers;
      default:
        return 0;
    }
  };

  const maxLimit = getLimitForResource();
  const percentage = (currentCount / maxLimit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = currentCount >= maxLimit;

  return (
    <Box className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-blue-600" />
          <Typography variant="body2" className="font-medium text-gray-700">
            Subscription Usage
          </Typography>
        </div>
        <Chip
          label={`${currentCount} / ${maxLimit}`}
          size="small"
          color={isAtLimit ? 'error' : isNearLimit ? 'warning' : 'primary'}
        />
      </div>
      <LinearProgress
        variant="determinate"
        value={Math.min(percentage, 100)}
        color={isAtLimit ? 'error' : isNearLimit ? 'warning' : 'primary'}
        sx={{ height: 8, borderRadius: 1 }}
      />
      {isAtLimit && (
        <Typography variant="caption" className="text-red-600 mt-1 block">
          You've reached your plan limit. Upgrade to create more {resourceType}s.
        </Typography>
      )}
      {isNearLimit && !isAtLimit && (
        <Typography variant="caption" className="text-orange-600 mt-1 block">
          You're approaching your plan limit.
        </Typography>
      )}
    </Box>
  );
};

export default SubscriptionUsageIndicator;
