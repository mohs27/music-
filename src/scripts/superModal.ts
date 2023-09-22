import { addToPlaylist, playNow, queueNext, queuelist, startRadio, superModal } from "../lib/dom";
import player from "../lib/player";
import { similarStreamsCollector } from "../lib/utils";

export const streamHistory: string[] = [];
export const queueArray: string[] = [];

export const appendToQueuelist = (data: DOMStringMap, prepend: boolean = false) => {
  queueArray.push(data.id || '');

  const listItem = document.createElement('stream-item');
  listItem.textContent = data.title || '';
  listItem.dataset.author = data.author;
  listItem.dataset.thumbnail = data.thumbnail;
  listItem.dataset.duration = data.duration;
  listItem.dataset.id = data.id;

  listItem.addEventListener('click', () => {
    const id = listItem.dataset.id || '';
    if (!listItem.classList.contains('delete'))
      player(id);
    const index = queueArray.indexOf(id);
    queueArray.splice(index, 1);
    queuelist.children[index].remove();
  });
  prepend ?
    queuelist.prepend(listItem) :
    queuelist.appendChild(listItem);
}


let oneOff = true;
superModal.addEventListener('click', () => {
  if (oneOff) {
    (<HTMLHeadingElement>queuelist.firstElementChild).remove();
    oneOff = !oneOff;
  }
  superModal.classList.toggle('hide');
});


playNow.addEventListener('click', () => {
  player(superModal.dataset.id);
});



queueNext.addEventListener('click', () => {
  appendToQueuelist(superModal.dataset);
});


startRadio.addEventListener('click', () => {

  const upcoming = <HTMLElement>(<HTMLAnchorElement>document.getElementById('/upcoming')).firstElementChild;

  upcoming.classList.replace(upcoming.className, 'ri-loader-3-line');

  player(superModal.dataset.id);

  similarStreamsCollector(
    superModal.dataset.title,
    superModal.dataset.author
  )
    .then(data => {
      if (!data) throw new Error('No Radio Data');
      const [relatives, relativesData] = data;
      if (!relatives) throw new Error('No Relatives Found');

      for (const id of relatives)
        if (id !== superModal.dataset.id && !streamHistory.includes(id) && !queueArray.includes(id))
          appendToQueuelist(relativesData[id]);
    })
    .catch(_ => alert(_))
    .finally(() => upcoming.classList.replace(upcoming.className, 'ri-skip-forward-line'));
});

addToPlaylist.addEventListener('click', () => {
  superModal.classList.toggle('hide');
});


// queue

const [clearQBtn, shuffleQBtn, removeQBtn] = (<HTMLSpanElement>document.getElementById('queuetools')).children;

clearQBtn.addEventListener('click', () => {
  queueArray.length = 0;
  queuelist.innerHTML = '';
})


shuffleQBtn.addEventListener('click', () => {
  const original = queueArray.slice(0);
  for (let i = queueArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = queueArray[i];
    queueArray[i] = queueArray[j];
    queueArray[j] = temp;
  }
  for (const item of queueArray)
    queuelist.appendChild(queuelist.children[original.indexOf(item)]);

})

removeQBtn.addEventListener('click', () => {

  queuelist.querySelectorAll('stream-item').forEach((el) => {
    el.classList.toggle('delete');
  })
  removeQBtn.classList.toggle('delete')
})