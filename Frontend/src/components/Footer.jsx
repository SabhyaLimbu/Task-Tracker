import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();
  const name = "Task Tracker App";
  const description = "All rights reserved";

  return (
    <div className="flex justify-center items-center h-16 text-white font-bold fixed bottom-0 w-full bg-black">
      &copy; {year} | {name} | {description}
    </div>
  );
};

export default Footer;
