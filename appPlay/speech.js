
// Load this later since getVoices seems to be empty when called too early.
let loaded = false;
const locales = [
  {lang: 'en-US', name: 'English', voice: null},
  {lang: 'es-MX', name: 'Spanish', voice: null},
  {lang: 'zh-HK', name: 'Cantonese', voice: null},
  {lang: 'zh-CN', name: 'Chinese', voice: null},
  {lang: 'ja-JP', name: 'Japanese', voice: null},
  {lang: 'fr-FR', name: 'French', voice: null},
];

export function getLocales() {
  function getLocalesAfterLoading() {
    return locales.filter(locale => locale.voice || locale.lang === 'en-US');
  }
  if (loaded) {
    return getLocalesAfterLoading();
  }

  const langToGoogleVoice = new Map();
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    loaded = true;
  }
  voices.forEach(voice => {
      if (voice.voiceURI.match(/google/i)) {
        langToGoogleVoice.set(voice.lang, voice);
      };
  });
  const langToShortNameVoice = new Map();
  voices.forEach(voice => {
    if (voice.name.split(' ').length <= 1) {
      langToShortNameVoice.set(voice.lang, voice);
    }
  });
  locales.forEach(locale => {
    if (langToGoogleVoice.has(locale.lang)) {
      locale.voice = langToGoogleVoice.get(locale.lang);
      return; 
    }
    if (langToShortNameVoice.has(locale.lang)) {
      locale.voice = langToShortNameVoice.get(locale.lang);
      return; 
    }
  });
  return getLocalesAfterLoading();
}