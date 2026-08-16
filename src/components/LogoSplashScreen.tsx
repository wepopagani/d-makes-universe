import { useEffect, useState } from "react";

const LogoSplashScreen = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <img
        src="/logo 2.png"
        alt="Logo 3DMAKES — stampa 3D professionale a Lugano"
        className="w-60 h-auto md:w-80"
      />
    </div>
  );
};

export default LogoSplashScreen;

