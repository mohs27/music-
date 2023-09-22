import { audio, author, img, listItemsAnchor, listItemsContainer, pipedInstances, superModal } from "./dom";


export const blankImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';


export const params = (new URL(location.href)).searchParams;

export const save = localStorage.setItem.bind(localStorage);

export const getSaved = localStorage.getItem.bind(localStorage);

export function convertSStoHHMMSS(seconds: number): string {
  const hh = Math.floor(seconds / 3600);
  seconds %= 3600;
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60);
  let mmStr = String(mm);
  let ssStr = String(ss);
  if (mm < 10) mmStr = '0' + mmStr;
  if (ss < 10) ssStr = '0' + ssStr;
  return hh > 0 ?
    `${hh}:${mmStr}:${ssStr}` :
    `${mmStr}:${ssStr}`;
}

export const numFormatter = (num: number): string => Intl.NumberFormat('en', { notation: 'compact' }).format(num);



export function setMetaData(
  id: string,
  thumbnail: string,
  streamName: string,
  authorName: string,
  authorUrl: string
) {

  if (getSaved('img')) {
    save('img', thumbnail)
    thumbnail = '';
  } else img.src = thumbnail;

  const title = <HTMLAnchorElement>document.getElementById('title');
  title.href = `https://youtube.com/watch?v=${id}`;
  title.textContent = streamName;

  author.href = pipedInstances.value + authorUrl;
  author.textContent = authorName.replace(' - Topic', '');

  document.title = streamName + ' - ytify';

  thumbnail.replace('maxres', 'hq');

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setPositionState();
    navigator.mediaSession.metadata = new MediaMetadata({
      title: streamName,
      artist: authorName,
      artwork: [
        { src: thumbnail, sizes: '96x96' },
        { src: thumbnail, sizes: '128x128' },
        { src: thumbnail, sizes: '192x192' },
        { src: thumbnail, sizes: '256x256' },
        { src: thumbnail, sizes: '384x384' },
        { src: thumbnail, sizes: '512x512' },
      ]
    });
  }
}


export function updatePositionState() {
  if ('mediaSession' in navigator) {
    if ('setPositionState' in navigator.mediaSession) {
      navigator.mediaSession.setPositionState({
        duration: audio.duration,
        playbackRate: audio.playbackRate,
        position: audio.currentTime,
      });
    }
  }
}



export type Item = {
  title: string,
  name: string,
  uploaderName: string,
  description: string,
  thumbnail: string,
  type: string,
  url: string,
  views: number,
  duration: number,
  uploadedDate: string,
  uploaderAvatar: string,
  videos: number,
  subscribers: number
}


function createStreamItem(stream: Item) {
  const streamItem = document.createElement('stream-item');
  streamItem.textContent = stream.title;
  streamItem.dataset.author = stream.uploaderName;
  streamItem.dataset.thumbnail = stream.thumbnail;
  streamItem.dataset.views = stream.views > 0 ? numFormatter(stream.views) + ' views' : '';
  streamItem.dataset.duration = convertSStoHHMMSS(stream.duration);
  streamItem.dataset.uploaded = stream.uploadedDate;
  streamItem.dataset.avatar = stream.uploaderAvatar || '';
  streamItem.addEventListener('click', () => {
    superModal.classList.toggle('hide');
    const _ = superModal.dataset;
    _.id = stream.url.substring(9);
    _.title = stream.title;
    _.thumbnail = stream.thumbnail;
    _.author = stream.uploaderName;
    _.duration = streamItem.dataset.duration;
  })
  return streamItem;
}


function createListItem(list: Item) {
  const listItem = document.createElement('list-item');
  listItem.textContent = list.name;
  listItem.dataset.thumbnail = list.thumbnail;

  listItem.dataset.uploaderData = list.description || list.uploaderName || '';

  listItem.dataset.stats = list.subscribers > 0 ? numFormatter(list.subscribers) + ' subscribers' : list.videos > 0 ? list.videos + ' streams' : '';

  listItem.addEventListener('click', () => {
    fetch(pipedInstances.value + list.url.replace('?list=', 's/'))
      .then(res => res.json())
      .then(group => group.relatedStreams)
      .then(streams => itemsLoader(streams))
      .then(fragment => {
        listItemsContainer.innerHTML = '';
        listItemsContainer.appendChild(fragment);
        listItemsAnchor.click();
      })
      .catch(err => {
        if (err.message !== 'No Data Found' && pipedInstances.selectedIndex < pipedInstances.length - 1) {
          pipedInstances.selectedIndex++;
          listItem.click();
          return;
        }
        alert(err);
      })
  })

  return listItem;
}




export function itemsLoader(itemsArray: Item[]): DocumentFragment {
  if (!itemsArray.length)
    throw new Error('No Data Found');
  const fragment = document.createDocumentFragment();

  for (const item of itemsArray) {

    const type = item.type === 'stream' ? createStreamItem(item) : createListItem(item);

    fragment.appendChild(type);
  }

  return fragment;
}




const radioRadius = <HTMLSelectElement>document.getElementById('radioRadius');

type Relative = {
  [index: string]: {
    [index: string]: string
  }
}



export async function similarStreamsCollector(streamTitle: string | undefined = '', streamAuthor: string | undefined = ''): Promise<[string[], Relative] | undefined> {
  if (!streamTitle || !streamAuthor) throw new Error('incompatible stream info');

  const streamInfo = streamTitle.replace('#', '') + ' ' + streamAuthor.replace(' - Topic', '');

  const searchPlaylists = await fetch(
    pipedInstances.value + '/search?q=' + streamInfo + '&filter=playlists'
  ).then(res => res.json())
    .then(data => data.items);

  const depth = parseInt(radioRadius.value);
  const relativesData: Relative = {};
  const frequency: { [index: string]: number } = {};

  for (let index = 0; index < depth; index++) {

    const luckyID = searchPlaylists[index].url.slice(15);

    const playlistItems = await fetch(
      pipedInstances.value + '/playlists/' + luckyID)
      .then(res => res.json())
      .then(data => data.relatedStreams);

    for (const stream of playlistItems)
      if (stream.duration < 600) {
        const id = stream.url.slice(9);
        // compute frequencies of each value
        id in frequency ?
          frequency[id]++ :
          frequency[id] = 1;

        relativesData[id] = {
          id: id,
          title: stream.title,
          thumbnail: stream.thumbnail,
          author: stream.uploaderName,
          duration: convertSStoHHMMSS(stream.duration)
        }
      }
  }


  const maxFreq = Math.max(...Object.values(frequency));

  // return the most frequent values and the data

  if (maxFreq !== 1)
    return [Object.keys(frequency)
      .filter(key => frequency[key] === maxFreq), relativesData]
}


