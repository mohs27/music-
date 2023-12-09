import { audio, pipedInstances } from "../lib/dom";
import player from "../lib/player";
import { getSaved, save } from "../lib/utils";


const defURL = 'https://pipedapi.kavin.rocks';
const [initial_name, initial_url] = getSaved('pipedInstance')?.split('|') || ['kavin.rocks (Official) 🌐', defURL];

if (initial_name.includes('Custom')) {
  pipedInstances.options[0].value = initial_url;
  pipedInstances.options[0].textContent += ' : ' + new URL(initial_url).hostname;
} else pipedInstances.add(new Option(initial_name, initial_url, undefined, true));


// fetches list and falls back to saved previous list if not available

addEventListener('DOMContentLoaded', async () => {
  (await fetch('https://piped-instances.kavin.rocks')
    .then(res => res.json())
    .then(data => {
      save('apiList', JSON.stringify(data));
      return data;
    })
    .catch(() => JSON.parse(getSaved('apiList') || '[]')))
    .forEach((instance: Record<'api_url' | 'name' | 'locations', string>) => {
      if (initial_url !== instance.api_url)
        pipedInstances.add(new Option(instance.name + ' ' + instance.locations, instance.api_url))
    });
});

// Instance Selector change event

pipedInstances.addEventListener('change', async () => {
  const instance = pipedInstances.options[pipedInstances.selectedIndex];
  const name = <string>instance.textContent;
  if (name.includes('Custom')) {
    const url = prompt('Enter the URL');
    if (!url) return;
    instance.value = url;
    instance.textContent += ' : ' + new URL(url).hostname;
  }
  const url = instance.value;
  if (name && url)
    save('pipedInstance', name + '|' + url);
  if (url === defURL)
    localStorage.removeItem('pipedInstance');
  audio.pause();
  const timeOfSwitch = audio.currentTime;
  await player(audio.dataset.id);
  audio.currentTime = timeOfSwitch;
});
