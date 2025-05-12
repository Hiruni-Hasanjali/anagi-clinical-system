//ProfileCard
import React from 'react';

const ProfileCard = ({ profile }) => {
  if (!profile || !profile.name || !profile.email) {
    return <p style={{ color: 'red' }}>Invalid profile data.</p>;
  }

  return (
    <div className="profile-card">
      <h3>{profile.name}</h3>
      <p>Email: {profile.email}</p>
      <p>Age: {profile.age || 'N/A'}</p>
      <p>
        Conditions:{' '}
        {Array.isArray(profile.conditions) && profile.conditions.length > 0
          ? profile.conditions.join(', ')
          : 'None'}
      </p>
    </div>
  );
};

export default ProfileCard;
