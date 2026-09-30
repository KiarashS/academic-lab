// Slides for the slider at the top of the home page (turn it off in site.home.slider).
// Files go in public/ (e.g. public/slides/group-photo.jpg -> 'slides/group-photo.jpg'). Full URLs also work.
//
// Slide types:
//   { type: 'image', src, alt }
//   { type: 'video', src, poster }        // mp4/webm file; plays muted, then the slider moves on
//   { type: 'embed', src }                // YouTube/Vimeo embed URL, e.g. 'https://www.youtube.com/embed/VIDEO_ID'
//                                         // autoplay pauses on embed slides
// Every slide can also have:
//   title, caption                        // text shown over the bottom of the slide
//   link: '/research' or 'https://…'      // makes the title a link
//   position: 'center' | 'top' | 'bottom' // which part of the image to keep when it is cropped

const slides = [
  {
    type: 'image',
    src: 'slides/slide-1.svg',
    alt: '',
    title: 'Few-shot learning for scientific data',
    caption: 'Models that adapt to a new experiment from tens of measurements.',
    link: '/research/few-shot-science',
  },
  {
    type: 'image',
    src: 'slides/slide-2.svg',
    alt: '',
    title: 'ICML 2026 oral',
    caption: 'Priya Nair presented our work on protein fitness landscapes.',
    link: '/publications',
  },
  {
    type: 'image',
    src: 'slides/slide-3.svg',
    alt: '',
    title: 'We are hiring',
    caption: 'PhD and postdoc positions for 2027.',
    link: '/join',
  },
  // {
  //   type: 'video',
  //   src: 'slides/lab-tour.mp4',
  //   poster: 'slides/lab-tour.jpg',
  //   title: 'A tour of the lab',
  // },
  // {
  //   type: 'embed',
  //   src: 'https://www.youtube.com/embed/VIDEO_ID',
  //   title: 'Talk at NeurIPS',
  // },
]

export default slides
