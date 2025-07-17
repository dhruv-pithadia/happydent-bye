import React, { useState, useEffect } from "react";

const RegistrationScreen = ({ onComplete, onTerms, sessionData }) => {
  // 🎯 SIMPLIFIED: Only group size and terms state
  const [groupSize, setGroupSize] = useState("less"); // Default to "less"
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Session management state
  const [snapAR, setSnapAR] = useState({
    sessionId: null,
    phoneAssociated: false,
    arEnded: false,
    isMonitoring: false,
  });

  // Initialize session data from splash screen
  useEffect(() => {
    // Get session ID from props (passed from splash screen) or localStorage
    const sessionId =
      sessionData?.sessionId || localStorage.getItem("snapARSessionId");

    if (sessionId) {
      setSnapAR((prev) => ({ ...prev, sessionId }));
      console.log(`🆔 Using session ID: ${sessionId}`);
    } else {
      console.warn(
        "⚠️ No session ID found - this may cause issues with Snap AR integration"
      );
    }
  }, [sessionData]);

  // Check if form is valid (only terms acceptance required)
  const isFormValid = () => {
    return termsAccepted;
  };

  const handleTermsChange = () => {
    setTermsAccepted(!termsAccepted);
    setError(""); // Clear error when user interacts
  };

  const handleGroupSizeSelect = async (size) => {
    setError(""); // Clear error when user selects
    setGroupSize(size);

    // Store selection in localStorage
    localStorage.setItem("selectedGroupSize", size);

    // 🎯 APPLY THE SELECTED LENS IMMEDIATELY
    console.log(`🎯 Applying lens for group size: ${size}`);

    const cache = window.snapARPreloadCache;
    if (cache && cache.lenses && cache.session) {
      const selectedLens = cache.lenses[size]; // 'less' or 'more'

      if (selectedLens) {
        try {
          console.log(`🎯 Applying ${size} lens:`, selectedLens);
          await cache.session.applyLens(selectedLens);
          cache.appliedLens = selectedLens;
          console.log("✅ Lens applied successfully");
        } catch (error) {
          console.error("❌ Failed to apply lens:", error);
          setError("Failed to apply lens. Please try again.");
        }
      } else {
        console.warn("⚠️ Selected lens not found in cache");
        setError("Selected lens not available. Please refresh and try again.");
      }
    } else {
      console.warn("⚠️ AR cache or session not available");
      setError("AR session not ready. Please refresh and try again.");
    }
  };

  const handleGetStarted = async () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    if (!isFormValid()) {
      if (!termsAccepted) {
        setError("Please accept the Terms & Conditions to continue");
        return;
      }
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 🎯 APPLY THE SELECTED LENS BASED ON GROUP SIZE
      console.log(`🎯 Applying lens for group size: ${groupSize}`);

      const cache = window.snapARPreloadCache;
      if (cache && cache.lenses && cache.session) {
        const selectedLens = cache.lenses[groupSize]; // 'less' or 'more'

        if (selectedLens) {
          console.log(`🎯 Applying ${groupSize} lens:`, selectedLens);
          await cache.session.applyLens(selectedLens);
          cache.appliedLens = selectedLens;
          console.log("✅ Lens applied successfully");
        } else {
          console.warn("⚠️ Selected lens not found in cache");
        }
      } else {
        console.warn("⚠️ AR cache or session not available");
      }

      // Store selected group size
      localStorage.setItem("selectedGroupSize", groupSize);

      // 🎯 COMPLETE REGISTRATION - Pass simplified data to SnapAR
      onComplete({
        groupSize: groupSize,
        termsAccepted: termsAccepted,
        sessionId: snapAR.sessionId,
        selectedLens: {
          groupSize: groupSize,
          lensId:
            groupSize === "less"
              ? "0eeedbf6-a026-4224-9942-554f7cd71ebf"
              : "32f1cc6e-cb6f-4f2f-be03-08f51b8feddf",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "Failed to proceed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTermsClick = () => {
    if (onTerms) {
      onTerms(); // Go to terms screen
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-white max-w-[991px] mx-auto">
      {/* HAPPYDENT Logo */}
      <img
        src="/assets/happydent-logo.png"
        alt="HAPPYDENT"
        className="w-64 h-32 object-contain mb-8"
      />

      {/* Subtitle */}
      <div className="text-center mb-8">
        <p className="text-lg italic">
          Get your <span className="font-bold">chamking</span> smile
        </p>
        <p className="text-lg italic">in 1 simple step!</p>
      </div>

      <div className="text-center mb-8">
        <p className="text-lg italic">
          <span className="font-bold">Get clicked and take home a Polaroid instantly.</span>
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="w-full max-w-sm mb-4">
          <div className="bg-red-500/20 border border-red-500/50 rounded p-3 text-center">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Form Container */}
      <div className="w-full max-w-sm space-y-6">
        {/* Group Size Selection */}
        <div className="text-center">
          <h3 className="text-white text-lg mb-4 text-[20px] flex items-center gap-4">
            <div className="flex-1 h-px bg-white"></div>
            Select your
            <span className="font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.9)] text-white">
              GROUP SIZE
            </span>
            <div className="flex-1 h-px bg-white"></div>
          </h3>

          <div className="relative">
            {/* Background container */}
            <div className="relative flex border-2 border-white rounded-[4px] overflow-hidden bg-transparent mt-[24px]">
              {/* Sliding white background */}
              <div
                className={`absolute top-0 h-full w-1/2 bg-white transition-transform duration-300 ease-in-out ${groupSize === "more"
                  ? "translate-x-full"
                  : "translate-x-0"
                  }`}
                style={{
                  margin: "0px",
                  width: "50%",
                  height: "100%",
                  borderRadius: "4px",
                }}
              />

              {/* Button container */}
              <div className="relative flex w-full radio-btn-container">
                <button
                  onClick={() => handleGroupSizeSelect("less")}
                  disabled={isLoading}
                  className={`outline-none hover:outline-none flex-1 py-[14px] px-6 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative z-10 font-semibold text-[14px] rounded-[4px] select-none focus:outline-none focus:ring-0 ${groupSize === "less"
                    ? "bg-transparent text-blue-700" // Selected: transparent bg (white shows from behind), blue text
                    : "bg-transparent text-white" // Not selected: transparent bg, white text
                    }`}
                  style={{
                    WebkitTapHighlightColor: "transparent",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                    userSelect: "none",
                    outline: "none",
                  }}
                >
                  Less than 3 people
                </button>
                <button
                  onClick={() => handleGroupSizeSelect("more")}
                  disabled={isLoading}
                  className={`outline-none hover:outline-none flex-1 py-[14px] px-6 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative z-10 font-semibold text-[14px] rounded-[4px] select-none focus:outline-none focus:ring-0 ${groupSize === "more"
                    ? "bg-transparent text-blue-700" // Selected: transparent bg (white shows from behind), blue text
                    : "bg-transparent text-white" // Not selected: transparent bg, white text
                    }`}
                  style={{
                    WebkitTapHighlightColor: "transparent",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                    userSelect: "none",
                    outline: "none",
                  }}
                >
                  More than 3 people
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="pt-4 max-w-sm">
        <div
          className="flex items-start space-x-3 p-3 rounded cursor-pointer transition-all duration-200"
          onClick={handleTermsChange}
        >
          {/* Custom Checkbox */}
          <div className="flex-shrink-0 mt-0.5">
            <div
              className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${termsAccepted
                ? "border-white bg-white"
                : "border-white/50 bg-transparent hover:border-white"
                }`}
            >
              {termsAccepted && (
                <svg
                  className="w-3 h-3 text-blue-700"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* Terms Text */}
          <div className="flex-1 text-sm text-white/80 leading-relaxed">
            <p>
              By participating, you consent to being photographed with no storage or liability held by Happydent or PVMI for any concerns arising.{" "}
              {/* <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent checkbox toggle
                  handleTermsClick();
                }}
                className="text-white underline hover:text-white/80 transition-colors bg-transparent border-none cursor-pointer px-0"
              >
                Terms & Conditions
              </button> */}
            </p>
          </div>
        </div>

        {/* Terms validation error */}
        {!termsAccepted && error.includes("terms") && (
          <p className="text-red-300 text-xs mt-2 text-center">
            Please accept the Terms & Conditions to continue
          </p>
        )}
      </div>

      {/* Get Started Button */}
      <div className="w-full mb-[8px] max-w-sm">
        <button
          onClick={handleGetStarted}
          disabled={!isFormValid() || isLoading}
          className={`w-full py-4 px-6 rounded font-bold text-lg transition-all relative ${isFormValid() && !isLoading
            ? "cursor-pointer hover:opacity-90"
            : "cursor-not-allowed opacity-60"
            }`}
          style={{
            background:
              isFormValid() && !isLoading
                ? "radial-gradient(40% 40% at 80% 100%, rgb(255 255 255 / 31%) 0%, rgb(0 51 255 / 31%) 59%, rgb(0 13 255 / 31%) 100%)"
                : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)", // Grey gradient when disabled
            borderRadius: "4px",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor:
              isFormValid() && !isLoading
                ? "rgba(255, 255, 255, 0.52)"
                : "rgba(156, 163, 175, 0.4)", // Grey border when disabled
            boxShadow:
              isFormValid() && !isLoading
                ? "2px 2px 4px 0px rgba(0, 0, 0, 0.39)"
                : "1px 1px 2px 0px rgba(0, 0, 0, 0.2)", // Lighter shadow when disabled
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              <span className="italic">LOADING...</span>
            </div>
          ) : (
            <span
              className={`italic ${isFormValid() && !isLoading ? "text-white" : "text-gray-300"
                }`}
            >
              GET STARTED
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default RegistrationScreen;