import { audio, img, invidiousInstances, pipedInstances, searchFilters, thumbnailProxies, unifiedInstances } from "../lib/dom";
import { blankImage, getDB, getSaved, removeSaved, save, saveDB } from "../lib/utils";
import player from "../lib/player";

const startupTabSelector = <HTMLSelectElement>document.getElementById('startupTab');
const fullscreenSwitch = <HTMLElement>document.getElementById('fullscreenSwitch');
const ytmPlsSwitch = <HTMLElement>document.getElementById('featuredPlaylistsSwitch');
const defaultFilterSongs = <HTMLElement>document.getElementById('defaultFilterSongs');
const autoQueueSwitch = <HTMLElement>document.getElementById('autoQueue');
const qualitySwitch = <HTMLElement>document.getElementById('qualitySwitch');
const thumbnailSwitch = <HTMLElement>document.getElementById('thumbnailSwitch');
const lazyLoadSwitch = <HTMLElement>document.getElementById('lazyThumbSwitch');
const discoverSwitch = <HTMLSelectElement>document.getElementById('discoverSwitch');
const discover = <HTMLDetailsElement>document.getElementById('discover');
const historySwitch = <HTMLElement>document.getElementById('historySwitch');
const history = <HTMLDetailsElement>document.getElementById('history');

export { ytmPlsSwitch };

/////////////////////////////////////////////////////////////

const unifiedInstanceState = getSaved('unifiedInstance');
const unifiedInstanceLabel = <HTMLLabelElement>unifiedInstances.previousElementSibling;

unifiedInstanceState !== 'disabled' ?
  [pipedInstances, invidiousInstances, thumbnailProxies].forEach(i => {
    (<HTMLSpanElement>i.parentElement).classList.add('hide');
  })
  :
  unifiedInstanceLabel.textContent = 'Click here to enable Unified Instances ✅';

unifiedInstanceLabel.addEventListener('click', () => {
  if (unifiedInstanceState === 'disabled') {
    removeSaved('unifiedInstance');
    location.reload();
  } else {
    alert('Enables seamless experience across the ytify platform using the same instance for data, audio & images. Switch to classic instances mode by selecting disabled, if you want to use your own custom instance or prefer that. Note : Subtitles are not supported through the classic instance structure.');
  }
});

/////////////////////////////////////////////////////////////

startupTabSelector.addEventListener('change', () => {
  const tab = startupTabSelector.value;
  tab ?
    save('startupTab', tab) :
    removeSaved('startupTab');
});

const savedStartupTab = getSaved('startupTab') || '';
if (savedStartupTab) {
  startupTabSelector.value = savedStartupTab;
  if (location.pathname === '/')
    (<HTMLAnchorElement>document.getElementById(savedStartupTab)).click();
}

/////////////////////////////////////////////////////////////

fullscreenSwitch.addEventListener('click', () => {
  document.fullscreenElement ?
    document.exitFullscreen() :
    document.documentElement.requestFullscreen();
});

/////////////////////////////////////////////////////////////

ytmPlsSwitch.addEventListener('click', () => {
  getSaved('featuredPlaylists') ?
    removeSaved('featuredPlaylists') :
    save('featuredPlaylists', 'off');
  location.assign('/search');
});

if (getSaved('featuredPlaylists')) {
  ytmPlsSwitch.removeAttribute('checked');
  (<HTMLHeadingElement>document.querySelector('h1.featuredPlaylists')).textContent = 'Search Results Appear Here.';
}

/////////////////////////////////////////////////////////////

defaultFilterSongs.addEventListener('click', () => {
  getSaved('defaultFilter') ?
    removeSaved('defaultFilter') :
    save('defaultFilter', 'songs');
  location.assign('/search');
});

if (getSaved('defaultFilter')) {
  defaultFilterSongs.setAttribute('checked', '');
  searchFilters.value = 'music_songs';
}

/////////////////////////////////////////////////////////////

autoQueueSwitch.addEventListener('click', () => {
  autoQueueSwitch.hasAttribute('checked') ?
    save('autoQueue', 'off') :
    removeSaved('autoQueue');
});

if (getSaved('autoQueue') === 'off')
  autoQueueSwitch.removeAttribute('checked');

/////////////////////////////////////////////////////////////

qualitySwitch.addEventListener('click', async () => {
  getSaved('hq') ?
    removeSaved('hq') :
    save('hq', 'true');

  const timeOfSwitch = audio.currentTime;
  await player(audio.dataset.id);
  audio.currentTime = timeOfSwitch;
});

if (getSaved('hq') == 'true')
  qualitySwitch.toggleAttribute('checked');

/////////////////////////////////////////////////////////////

thumbnailSwitch.addEventListener('click', () => {
  getSaved('img') ?
    removeSaved('img') :
    localStorage.setItem('img', 'off');
  location.reload();
});

if (getSaved('img')) {
  thumbnailSwitch.removeAttribute('checked');
  img.src = blankImage;
  img.classList.toggle('hide');
}

/////////////////////////////////////////////////////////////

lazyLoadSwitch.addEventListener('click', () => {
  getSaved('lazyImg') ?
    removeSaved('lazyImg') :
    localStorage.setItem('lazyImg', 'true');
});

if (getSaved('lazyImg'))
  lazyLoadSwitch.toggleAttribute('checked');

/////////////////////////////////////////////////////////////

discoverSwitch.addEventListener('click', () => {
  if (discoverSwitch.hasAttribute('checked')) {
    const db = getDB();
    if (!confirm(`This will clear your existing ${Object.keys(db.discover).length || 0} discoveries, continue?`))
      return discoverSwitch.toggleAttribute('checked');
    delete db.discover;
    saveDB(db);
    discover.classList.add('hide');
    save('discover', 'off');

  } else {
    discover.classList.remove('hide');
    removeSaved('discover');
  }
});

if (getSaved('discover')) {
  discoverSwitch.removeAttribute('checked');
  discover.classList.add('hide');
}

/////////////////////////////////////////////////////////////

historySwitch.addEventListener('click', () => {
  if (historySwitch.hasAttribute('checked')) {
    const db = getDB();
    if (!confirm(`This will clear ${Object.keys(db.history).length || 0} items from your history, continue?`)) return historySwitch.toggleAttribute('checked');
    delete db.history;
    saveDB(db);
    history.classList.add('hide');
    save('history', 'off')
  }
  else {
    history.classList.remove('hide');
    removeSaved('history');
  }
});

if (getSaved('history')) {
  historySwitch.removeAttribute('checked');
  history.classList.add('hide')
}

/////////////////////////////////////////////////////////////

document.getElementById('clearCacheBtn')?.addEventListener('click', () => {
  self.caches.keys().then(s => { s.forEach(k => { self.caches.delete(k) }) });
  navigator.serviceWorker.getRegistrations().then(s => { s.forEach(r => { r.unregister() }) });
  location.reload();
});

document.getElementById('restoreSettingsBtn')?.addEventListener('click', () => {
  for (let i = 0; i < localStorage.length; i++)
    if (localStorage.key(i) !== 'library')
      removeSaved(<string>localStorage.key(i));
  location.reload();
});

