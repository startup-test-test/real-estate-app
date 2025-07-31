import React from 'react';

const TestApp: React.FC = () => {
  console.log('TestApp rendered');
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test App</h1>
      <p>If you can see this, React is working correctly.</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};

export default TestApp;