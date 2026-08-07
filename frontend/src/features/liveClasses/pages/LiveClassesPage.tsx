import React from 'react';
import { LiveClassesContainer } from '../components/LiveClassesContainer';

export const LiveClassesPage: React.FC = () => {
  return (
    <div className="p-6 bg-slate-950 min-h-screen">
      <LiveClassesContainer />
    </div>
  );
};

export default LiveClassesPage;
