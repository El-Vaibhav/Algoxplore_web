// Import React to use its hooks and utilities
import * as React from "react";

// Define the screen width breakpoint for mobile devices (768px is common for tablets)
const MOBILE_BREAKPOINT = 768;

// Export a custom React hook called useIsMobile
export function useIsMobile() {
  // Create state to store whether the device is mobile (starts as undefined)
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  // Use useEffect to run code when the component mounts
  React.useEffect(() => {
    // Create a media query to check if screen width is less than 768px
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Define a function to update the mobile state when screen size changes
    const onChange = () => {
      // Set isMobile to true if window width is less than breakpoint
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Add an event listener to detect screen size changes
    mql.addEventListener("change", onChange);

    // Immediately check and set the initial mobile state
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Return a cleanup function to remove the event listener when component unmounts
    return () => mql.removeEventListener("change", onChange);
  }, []); // Empty dependency array means this runs only once on mount

  // Return a boolean: convert undefined to false, and ensure it's a boolean
  return !!isMobile;
}
