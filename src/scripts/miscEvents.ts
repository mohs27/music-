import { audio, bitrateSelector, img } from "../lib/dom";
import player from "../lib/player";
import { blankImage, getSaved, params, save, updatePositionState } from "../lib/utils";


bitrateSelector.addEventListener('change', () => {
  const timeOfSwitch = parseInt(audio.dataset.seconds || '0');
  audio.src = bitrateSelector.value;
  audio.currentTime = timeOfSwitch;
  audio.play();
  updatePositionState();
});

const qualitySwitch = <HTMLElement>document.getElementById('qualitySwitch');

if (getSaved('quality') == 'hq')
  qualitySwitch.toggleAttribute('checked');

qualitySwitch.addEventListener('click', async () => {

  getSaved('quality') ?
    localStorage.removeItem('quality') : // low
    save('quality', 'hq'); // high

  if (params.has('s')) {
    const timeOfSwitch = parseInt(audio.dataset.seconds || '');
    await player(params.get('s') || '');
    audio.currentTime = timeOfSwitch;
    updatePositionState();
  }

})



const fullscreenSwitch = <HTMLElement>document.getElementById('fullscreenSwitch');

fullscreenSwitch.addEventListener('click', () => {
  document.fullscreenElement ?
    document.exitFullscreen() :
    document.documentElement.requestFullscreen();
});

const thumbnailSwitch = <HTMLElement>document.getElementById('thumbnailSwitch');

if (getSaved('img')) {
  thumbnailSwitch.removeAttribute('checked');
  img.src = blankImage;
  img.classList.toggle('hide');
}

thumbnailSwitch.addEventListener('click', () => {

  if (getSaved('img')) {
    img.src = getSaved('img') || '';
    localStorage.removeItem('img');
  }
  else {
    save('img', img.src);
    img.src = blankImage;
  }
  img.classList.toggle('hide');
});



const volumeSelector = <HTMLSelectElement>document.getElementById('volumeSelector');

volumeSelector.addEventListener('change', () => {
  audio.volume = parseFloat(volumeSelector.value);
})



const deleteButton = <HTMLAnchorElement>document.getElementById('deleteButton');

deleteButton.addEventListener('click', () => {
  self.caches.keys().then(s => { s.forEach(k => { self.caches.delete(k) }) });
  navigator.serviceWorker.getRegistrations().then(s => { s.forEach(r => { r.unregister() }) });
  localStorage.clear();
});
