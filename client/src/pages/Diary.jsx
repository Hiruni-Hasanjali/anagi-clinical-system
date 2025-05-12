//Dary
import React from 'react';
import DiaryForm from '../components/DiaryForm';
import DiaryList from '../components/DiaryList';

const Diary = () => {
  const [refreshFlag, setRefreshFlag] = React.useState(false);
  const [error, setError] = React.useState('');

  const refresh = () => setRefreshFlag(!refreshFlag);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>My Personal Diary</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <DiaryForm refresh={refresh} setError={setError} />
      <DiaryList key={refreshFlag} />
    </div>
  );
};

export default Diary;