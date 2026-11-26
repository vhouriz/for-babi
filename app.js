const album = [
  { id: 1, caption: 'You & me', alt: 'The two of us posing in front of a red curtain', focus: '50% 62%' },
  { id: 2, caption: 'That little smile', alt: 'Babi taking a selfie in the classroom', focus: '50% 58%' },
  { id: 13, caption: 'Just one more minute', alt: 'A peace sign during a video call', focus: '50% 84%' },
  { id: 20, caption: 'My favorite smile', alt: 'Babi smiling and holding the brim of her cap', focus: '50% 39%' },
  { id: 18, caption: 'A smile worth keeping', alt: 'Two smiling faces outside a classroom', focus: '50% 48%' },
  { id: 10, caption: 'Caught you smiling', alt: 'Babi laughing on a video call', focus: '50% 88%' },
  { id: 4, caption: 'Hello, you', alt: 'A smiling portrait of Babi against a dark background', focus: '50% 24%' },
  { id: 8, caption: 'Across the screen', alt: 'Babi resting a hand on her cheek on a call', focus: '50% 81%' },
  { id: 3, caption: 'Our little window', alt: 'A video call with both faces on screen', focus: '50% 77%' },
  { id: 7, caption: 'Side by side', alt: 'Another frame of the two of us by the red curtain', focus: '50% 61%' },
  { id: 11, caption: 'Keeping you company', alt: 'A quiet moment on a video call', focus: '50% 86%' },
  { id: 15, caption: 'One little peace sign', alt: 'Babi holding up two fingers on a call', focus: '50% 82%' },
  { id: 6, caption: 'Here with you', alt: 'A call continuing while Babi stands by the counter', focus: '50% 37%' },
  { id: 12, caption: 'Late-night hello', alt: 'Two faces on a dimly lit video call', focus: '50% 73%' },
  { id: 14, caption: 'Close to you', alt: 'A close-up during a call', focus: '50% 81%' },
  { id: 17, caption: 'An ordinary little day', alt: 'A video call from the kitchen', focus: '50% 31%' },
  { id: 9, caption: 'On the line', alt: 'A room seen through our video call', focus: '65% 44%' },
  { id: 16, caption: 'Still on my screen', alt: 'A captured phone screen with a smiling face', focus: '50% 71%' },
  { id: 5, caption: 'A quiet hello', alt: 'A close-up in the corner of a dark video call', focus: '50% 74%' },
  { id: 19, caption: 'A moment I saved', alt: 'A snapshot from our call across the room', focus: '65% 43%' },
  { id: 21, caption: 'Until the next call', alt: 'A final snapshot through the video-call window', focus: '65% 42%' }
];

const byId = id => document.getElementById(id);
const photoPath = id => 'assets/photos/' + String(id).padStart(2, '0') + '.jpg';
const film = byId('film');
const scroller = byId('film-scroll');
const prevStrip = byId('strip-prev');
const nextStrip = byId('strip-next');
const dialog = byId('keepsake-dialog');
const views = { letter: byId('letter-view'), photo: byId('photo-view') };
let activePhoto = 0;
let returnHash = '';

album.forEach((photo, index) => {
  const frame = document.createElement('button');
  frame.type = 'button';
  frame.className = 'frame';
  frame.dataset.photo = photo.id;
  frame.setAttribute('aria-label', 'View photo ' + (index + 1) + ', ' + photo.caption);
  const img = new Image();
  img.src = photoPath(photo.id);
  img.loading = index < 5 ? 'eager' : 'lazy';
  img.alt = photo.alt;
  img.style.objectPosition = photo.focus;
  const number = document.createElement('span');
  number.className = 'frame-no';
  number.setAttribute('aria-hidden', 'true');
  number.textContent = String(index + 1).padStart(2, '0') + ' ▸';
  frame.append(img, number);
  film.append(frame);
});

function updateStrip() {
  prevStrip.disabled = scroller.scrollLeft <= 2;
  nextStrip.disabled = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 2;
}

function scrollStrip(direction) {
  const stride = film.children[1].offsetLeft - film.children[0].offsetLeft;
  const steps = Math.max(1, Math.floor(scroller.clientWidth / stride) - 1);
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  scroller.scrollBy({ left: direction * stride * steps, behavior: smooth ? 'smooth' : 'instant' });
}

prevStrip.addEventListener('click', () => scrollStrip(-1));
nextStrip.addEventListener('click', () => scrollStrip(1));
scroller.addEventListener('scroll', updateStrip, { passive: true });
new ResizeObserver(updateStrip).observe(scroller);
updateStrip();

function showView(name, title) {
  const switched = views[name].hidden;
  Object.entries(views).forEach(([key, view]) => { view.hidden = key !== name; });
  dialog.setAttribute('aria-labelledby', title);
  dialog.classList.toggle('photo-dialog', name === 'photo');
  if (!dialog.open) {
    dialog.showModal();
  } else if (switched) {
    byId('close-dialog').focus({ preventScroll: true });
  }
  dialog.scrollTop = 0;
}

function showPhoto() {
  const photo = album[activePhoto];
  byId('full-photo').src = photoPath(photo.id);
  byId('full-photo').alt = photo.alt;
  byId('photo-caption').textContent = photo.caption;
  byId('photo-count').textContent = String(activePhoto + 1).padStart(2, '0') + ' / ' + album.length;
  showView('photo', 'photo-title');
}

function setPhoto(offset) {
  activePhoto = (activePhoto + offset + album.length) % album.length;
  showPhoto();
}

function applyHash() {
  const name = location.hash.slice(1);
  if (name === 'surprise' || name === 'letter') showView('letter', 'letter-heading');
  else {
    if (dialog.open) dialog.close();
    returnHash = location.hash;
  }
  updateNavigation();
}

function updateNavigation() {
  const inAlbum = byId('album').getBoundingClientRect().top < window.innerHeight * .45;
  const section = location.hash === '#letter' ? '#letter' : inAlbum ? '#album' : '#home';
  document.querySelectorAll('nav a').forEach(link => {
    const current = link.hash === section;
    link.classList.toggle('current', current);
    if (current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function dismiss() {
  if (location.hash === '#surprise' || location.hash === '#letter') {
    history.replaceState(null, '', location.pathname + location.search + returnHash);
  }
  dialog.close();
  updateNavigation();
}

document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-photo]');
  if (trigger) {
    activePhoto = album.findIndex(photo => photo.id === Number(trigger.dataset.photo));
    showPhoto();
  }
});
byId('close-dialog').addEventListener('click', dismiss);
dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dismiss();
});
byId('photo-prev').addEventListener('click', () => setPhoto(-1));
byId('photo-next').addEventListener('click', () => setPhoto(1));
dialog.addEventListener('keydown', event => {
  if (views.photo.hidden) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    setPhoto(event.key === 'ArrowLeft' ? -1 : 1);
  }
});
window.addEventListener('hashchange', applyHash);
window.addEventListener('scroll', updateNavigation, { passive: true });
applyHash();

const music = byId('music');
const songPanel = byId('song-panel');
const songFrame = byId('song-frame');

music.addEventListener('click', () => {
  const opening = songPanel.hidden;
  songPanel.hidden = !opening;
  music.setAttribute('aria-expanded', String(opening));
  byId('music-label').textContent = opening ? 'Close player' : 'Play music';
  music.querySelector('use').setAttribute('href', opening ? '#i-close' : '#i-play');

  if (opening) {
    const frame = document.createElement('iframe');
    frame.title = 'Paul Partohap – P.S. I LOVE YOU';
    frame.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.src = 'https://www.youtube.com/embed/n5i3QRvPA9Y?autoplay=1&playsinline=1';
    songFrame.append(frame);
  } else {
    songFrame.replaceChildren();
  }
});
