import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, Share2, PlusSquare, X, CheckCircle2 } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'sidebar' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running in installed standalone mode, do not show install prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else {
      setShowGuide(true);
    }
  };

  if (installSuccess) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30">
        <CheckCircle2 className="w-3.5 h-3.5" />
        App Installed!
      </div>
    );
  }

  // Variant: Sidebar
  if (variant === 'sidebar') {
    return (
      <>
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-900/40 border border-emerald-500/20 text-slate-800 dark:text-slate-200">
          <div className="flex items-center gap-2 mb-1.5">
            <Smartphone className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-black tracking-tight font-['Outfit']">Install FitTrack App</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5 leading-snug">
            Add to Android & iPhone home screen for 1-tap offline access.
          </p>
          <button
            onClick={handleInstallClick}
            className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Install on Device
          </button>
        </div>

        {showGuide && (
          <InstallGuideModal isIOS={isIOS} onClose={() => setShowGuide(false)} onTryInstall={install} />
        )}
      </>
    );
  }

  // Variant: Banner (e.g. at the top of dashboard)
  if (variant === 'banner') {
    return (
      <>
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl shadow-emerald-600/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm font-['Outfit']">Install FitTrack 30 on Your Phone</h4>
              <p className="text-xs text-emerald-100">
                Launch like a native Android app from your home screen with instant offline workout logging.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleInstallClick}
              className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-white text-emerald-700 font-extrabold text-xs shadow hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Install Now
            </button>
          </div>
        </div>

        {showGuide && (
          <InstallGuideModal isIOS={isIOS} onClose={() => setShowGuide(false)} onTryInstall={install} />
        )}
      </>
    );
  }

  // Default: Header compact button
  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Install FitTrack 30 on phone or desktop"
        className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all hover:scale-105"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
      </button>

      {showGuide && (
        <InstallGuideModal isIOS={isIOS} onClose={() => setShowGuide(false)} onTryInstall={install} />
      )}
    </>
  );
};

interface GuideProps {
  isIOS: boolean;
  onClose: () => void;
  onTryInstall: () => Promise<boolean>;
}

const InstallGuideModal: React.FC<GuideProps> = ({ isIOS, onClose, onTryInstall }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
          <Smartphone className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit'] mb-1">
          {isIOS ? 'Install on iPhone / iPad' : 'Install on Android / Chrome'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Add FitTrack 30 directly to your home screen or app drawer for full-screen offline workouts.
        </p>

        {isIOS ? (
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                1
              </div>
              <p>
                In Safari, tap the <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" /> in the bottom toolbar.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                2
              </div>
              <p>
                Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-emerald-500" />.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                3
              </div>
              <p>
                Tap <strong>Add</strong> in the top right. FitTrack 30 is now on your home screen!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                1
              </div>
              <p>
                Tap the <strong>three dots (⋮)</strong> menu in the top-right corner of Chrome.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                2
              </div>
              <p>
                Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                3
              </div>
              <p>
                Confirm by clicking <strong>Install</strong>. The icon will appear in your Android app drawer!
              </p>
            </div>
          </div>
        )}

        <div className="mt-5 flex gap-2">
          {!isIOS && (
            <button
              onClick={async () => {
                await onTryInstall();
                onClose();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md"
            >
              Trigger Prompt
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
