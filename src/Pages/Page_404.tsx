import React from 'react';

const PAGE_NOT_FOUND = () => {
  // console.log('Rendering Page_404.tsx');

  return (
    <div>
      <h1>Page Not Found</h1>
      <h3>Location :- {window.location.href}</h3>
    </div>
  );
};

export default PAGE_NOT_FOUND;
