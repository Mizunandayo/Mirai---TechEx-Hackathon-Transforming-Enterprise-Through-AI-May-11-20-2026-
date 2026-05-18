import { Reveal } from '../hooks/useScrollReveal.jsx'

// --- SVG ICON CONSTANTS ---
const GEMINI_SVG = `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 65 65"><mask id="maskme" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="65" height="65"><path d="M32.447 0c.68 0 1.273.465 1.439 1.125a38.904 38.904 0 001.999 5.905c2.152 5 5.105 9.376 8.854 13.125 3.751 3.75 8.126 6.703 13.125 8.855a38.98 38.98 0 005.906 1.999c.66.166 1.124.758 1.124 1.438 0 .68-.464 1.273-1.125 1.439a38.902 38.902 0 00-5.905 1.999c-5 2.152-9.375 5.105-13.125 8.854-3.749 3.751-6.702 8.126-8.854 13.125a38.973 38.973 0 00-2 5.906 1.485 1.485 0 01-1.438 1.124c-.68 0-1.272-.464-1.438-1.125a38.913 38.913 0 00-2-5.905c-2.151-5-5.103-9.375-8.854-13.125-3.75-3.749-8.125-6.702-13.125-8.854a38.973 38.973 0 00-5.905-2A1.485 1.485 0 010 32.448c0-.68.465-1.272 1.125-1.438a38.903 38.903 0 005.905-2c5-2.151 9.376-5.104 13.125-8.854 3.75-3.749 6.703-8.125 8.855-13.125a38.972 38.972 0 001.999-5.905A1.485 1.485 0 0132.447 0z" fill="#000"/><path d="M32.447 0c.68 0 1.273.465 1.439 1.125a38.904 38.904 0 001.999 5.905c2.152 5 5.105 9.376 8.854 13.125 3.751 3.75 8.126 6.703 13.125 8.855a38.98 38.98 0 005.906 1.999c.66.166 1.124.758 1.124 1.438 0 .68-.464 1.273-1.125 1.439a38.902 38.902 0 00-5.905 1.999c-5 2.152-9.375 5.105-13.125 8.854-3.749 3.751-6.702 8.126-8.854 13.125a38.973 38.973 0 00-2 5.906 1.485 1.485 0 01-1.438 1.124c-.68 0-1.272-.464-1.438-1.125a38.913 38.913 0 00-2-5.905c-2.151-5-5.103-9.375-8.854-13.125-3.75-3.749-8.125-6.702-13.125-8.854a38.973 38.973 0 00-5.905-2A1.485 1.485 0 010 32.448c0-.68.465-1.272 1.125-1.438a38.903 38.903 0 005.905-2c5-2.151 9.376-5.104 13.125-8.854 3.75-3.749 6.703-8.125 8.855-13.125a38.972 38.972 0 001.999-5.905A1.485 1.485 0 0132.447 0z" fill="url(#prefix__paint0_linear_2001_67)"/></mask><g mask="url(#maskme)"><g filter="url(#prefix__filter0_f_2001_67)"><path d="M-5.859 50.734c7.498 2.663 16.116-2.33 19.249-11.152 3.133-8.821-.406-18.131-7.904-20.794-7.498-2.663-16.116 2.33-19.25 11.151-3.132 8.822.407 18.132 7.905 20.795z" fill="#FFE432"/></g><g filter="url(#prefix__filter1_f_2001_67)"><path d="M27.433 21.649c10.3 0 18.651-8.535 18.651-19.062 0-10.528-8.35-19.062-18.651-19.062S8.78-7.94 8.78 2.587c0 10.527 8.35 19.062 18.652 19.062z" fill="#FC413D"/></g><g filter="url(#prefix__filter2_f_2001_67)"><path d="M20.184 82.608c10.753-.525 18.918-12.244 18.237-26.174-.68-13.93-9.95-24.797-20.703-24.271C6.965 32.689-1.2 44.407-.519 58.337c.681 13.93 9.95 24.797 20.703 24.271z" fill="#00B95C"/></g><g filter="url(#prefix__filter3_f_2001_67)"><path d="M20.184 82.608c10.753-.525 18.918-12.244 18.237-26.174-.68-13.93-9.95-24.797-20.703-24.271C6.965 32.689-1.2 44.407-.519 58.337c.681 13.93 9.95 24.797 20.703 24.271z" fill="#00B95C"/></g><g filter="url(#prefix__filter4_f_2001_67)"><path d="M30.954 74.181c9.014-5.485 11.427-17.976 5.389-27.9-6.038-9.925-18.241-13.524-27.256-8.04-9.015 5.486-11.428 17.977-5.39 27.902 6.04 9.924 18.242 13.523 27.257 8.038z" fill="#00B95C"/></g><g filter="url(#prefix__filter5_f_2001_67)"><path d="M67.391 42.993c10.132 0 18.346-7.91 18.346-17.666 0-9.757-8.214-17.667-18.346-17.667s-18.346 7.91-18.346 17.667c0 9.757 8.214 17.666 18.346 17.666z" fill="#3186FF"/></g><g filter="url(#prefix__filter6_f_2001_67)"><path d="M-13.065 40.944c9.33 7.094 22.959 4.869 30.442-4.972 7.483-9.84 5.987-23.569-3.343-30.663C4.704-1.786-8.924.439-16.408 10.28c-7.483 9.84-5.986 23.57 3.343 30.664z" fill="#FBBC04"/></g><g filter="url(#prefix__filter7_f_2001_67)"><path d="M34.74 51.43c11.135 7.656 25.896 5.524 32.968-4.764 7.073-10.287 3.779-24.832-7.357-32.488C49.215 6.52 34.455 8.654 27.382 18.94c-7.072 10.288-3.779 24.833 7.357 32.49z" fill="#3186FF"/></g><g filter="url(#prefix__filter8_f_2001_67)"><path d="M54.984-2.336c2.833 3.852-.808 11.34-8.131 16.727-7.324 5.387-15.557 6.631-18.39 2.78-2.833-3.853.807-11.342 8.13-16.728 7.324-5.387 15.558-6.631 18.39-2.78z" fill="#749BFF"/></g><g filter="url(#prefix__filter9_f_2001_67)"><path d="M31.727 16.104C43.053 5.598 46.94-8.626 40.41-15.666c-6.53-7.04-21.006-4.232-32.332 6.274s-15.214 24.73-8.683 31.77c6.53 7.04 21.006 4.232 32.332-6.274z" fill="#FC413D"/></g><g filter="url(#prefix__filter10_f_2001_67)"><path d="M8.51 53.838c6.732 4.818 14.46 5.55 17.262 1.636 2.802-3.915-.384-10.994-7.116-15.812-6.731-4.818-14.46-5.55-17.261-1.636-2.802 3.915.383 10.994 7.115 15.812z" fill="#FFEE48"/></g></g><defs><filter id="prefix__filter0_f_2001_67" x="-19.824" y="13.152" width="39.274" height="43.217" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="2.46" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter1_f_2001_67" x="-15.001" y="-40.257" width="84.868" height="85.688" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="11.891" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter2_f_2001_67" x="-20.776" y="11.927" width="79.454" height="90.916" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="10.109" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter3_f_2001_67" x="-20.776" y="11.927" width="79.454" height="90.916" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="10.109" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter4_f_2001_67" x="-19.845" y="15.459" width="79.731" height="81.505" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="10.109" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter5_f_2001_67" x="29.832" y="-11.552" width="75.117" height="73.758" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="9.606" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter6_f_2001_67" x="-38.583" y="-16.253" width="78.135" height="78.758" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="8.706" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter7_f_2001_67" x="8.107" y="-5.966" width="78.877" height="77.539" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="7.775" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter8_f_2001_67" x="13.587" y="-18.488" width="56.272" height="51.81" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="6.957" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter9_f_2001_67" x="-15.526" y="-31.297" width="70.856" height="69.306" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="5.876" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter10_f_2001_67" x="-14.168" y="20.964" width="55.501" height="51.571" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="7.273" result="effect1_foregroundBlur_2001_67"/></filter><linearGradient id="prefix__paint0_linear_2001_67" x1="18.447" y1="43.42" x2="52.153" y2="15.004" gradientUnits="userSpaceOnUse"><stop stop-color="#4893FC"/><stop offset=".27" stop-color="#4893FC"/><stop offset=".777" stop-color="#969DFF"/><stop offset="1" stop-color="#BD99FE"/></linearGradient></defs></svg>`;
const MUJOCO_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="8" cy="8" rx="6.5" ry="2.5" stroke="#a78bfa" stroke-width="1.4" fill="none"/><ellipse cx="8" cy="8" rx="6.5" ry="2.5" stroke="#a78bfa" stroke-width="1.4" fill="none" transform="rotate(60 8 8)"/><ellipse cx="8" cy="8" rx="6.5" ry="2.5" stroke="#a78bfa" stroke-width="1.4" fill="none" transform="rotate(120 8 8)"/><circle cx="8" cy="8" r="1.4" fill="#a78bfa"/></svg>`;

const JOTAI_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 9V6a4 4 0 0 1 8 0v3l-1.5 1.5-1 -1-1 1-1-1-1.5 1.5Z" fill="#6ee7b7" stroke="#6ee7b7" stroke-width="0.3" stroke-linejoin="round"/><circle cx="6.5" cy="6.8" r="0.7" fill="#064e3b"/><circle cx="9.5" cy="6.8" r="0.7" fill="#064e3b"/></svg>`;

const FABRIK_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="2" y1="14" x2="6" y2="10" stroke="#fb923c" stroke-width="1.5" stroke-linecap="round"/><line x1="6" y1="10" x2="10" y2="6" stroke="#fb923c" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="6" x2="13" y2="3" stroke="#fb923c" stroke-width="1.5" stroke-linecap="round"/><circle cx="2" cy="14" r="1.8" fill="#fb923c"/><circle cx="6" cy="10" r="1.8" fill="#fb923c"/><circle cx="10" cy="6" r="1.8" fill="#fb923c"/><circle cx="13" cy="3" r="1.8" fill="#fb923c"/></svg>`;

const FK_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5.5" y="13" width="5" height="2" rx="1" fill="#38bdf8"/><line x1="8" y1="13" x2="8" y2="8" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/><line x1="8" y1="8" x2="12" y2="4" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="13" r="1.5" fill="#38bdf8"/><circle cx="8" cy="8" r="1.5" fill="#38bdf8"/><circle cx="12" cy="4" r="1.5" fill="#38bdf8"/><circle cx="12" cy="4" r="2.5" stroke="#38bdf8" stroke-width="1" fill="none"/></svg>`;

const R3F_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="8" cy="8" rx="7" ry="2.8" stroke="#61dafb" stroke-width="1.3" fill="none"/><ellipse cx="8" cy="8" rx="7" ry="2.8" stroke="#61dafb" stroke-width="1.3" fill="none" transform="rotate(60 8 8)"/><ellipse cx="8" cy="8" rx="7" ry="2.8" stroke="#61dafb" stroke-width="1.3" fill="none" transform="rotate(120 8 8)"/><circle cx="8" cy="8" r="1.4" fill="#61dafb"/></svg>`;

const REACT_FLOW_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="5" height="4" rx="1.2" fill="#ff0072" opacity="0.9"/><rect x="10" y="11" width="5" height="4" rx="1.2" fill="#ff0072" opacity="0.9"/><path d="M6 3 H8 V13 H10" stroke="#ff0072" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.7"/><circle cx="8" cy="8" r="1.2" fill="#ff0072"/></svg>`;

const MOTION_COMPILER_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="1" y1="4" x2="5" y2="4" stroke="#e2e8f0" stroke-width="1.3" stroke-linecap="round"/><line x1="1" y1="6.5" x2="4" y2="6.5" stroke="#e2e8f0" stroke-width="1.3" stroke-linecap="round"/><line x1="1" y1="9" x2="5" y2="9" stroke="#e2e8f0" stroke-width="1.3" stroke-linecap="round"/><path d="M6 8 L9 8" stroke="#facc15" stroke-width="1.4" stroke-linecap="round"/><path d="M8 6.5 L10 8 L8 9.5" stroke="#facc15" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M10.5 8 Q11.5 5 12.5 8 Q13.5 11 14.5 8" stroke="#facc15" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>`;

const TYPESCRIPT_SVG = `<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 100 100'><g clip-path='url(#a)'><path fill='#017acb' d='M0 0h100v100H0z'/><path fill='#fff' d='M48.016 37.031h4.797v8.282h-12.97v36.843l-.343.094c-.469.125-6.64.125-7.969-.016l-1.062-.093V45.312H17.5v-8.28l4.11-.048c2.25-.03 8.03-.03 12.843 0 4.813.032 10.906.047 13.563.047m36.61 41.219c-1.907 2.016-3.954 3.14-7.36 4.063-1.485.406-1.735.421-5.078.406-3.344-.016-3.61-.016-5.235-.438-4.203-1.078-7.594-3.187-9.906-6.172-.656-.843-1.734-2.593-1.734-2.812 0-.063.156-.203.359-.297s.625-.36.969-.562c.343-.204.968-.579 1.39-.797.422-.22 1.64-.938 2.703-1.579 1.063-.64 2.032-1.156 2.141-1.156.11 0 .313.219.469.485.937 1.578 3.125 3.593 4.672 4.28.953.407 3.062.86 4.078.86.937 0 2.656-.406 3.578-.828.984-.453 1.484-.906 2.078-1.812.406-.641.453-.813.438-2.032 0-1.125-.063-1.437-.375-1.953-.875-1.437-2.063-2.187-6.875-4.312-4.97-2.203-7.204-3.516-9.016-5.282-1.344-1.312-1.61-1.67-2.453-3.312-1.094-2.11-1.235-2.797-1.25-5.937-.016-2.204.031-2.922.265-3.672.329-1.125 1.391-3.297 1.875-3.844 1-1.172 1.36-1.531 2.063-2.11 2.125-1.75 5.438-2.906 8.61-3.015.359 0 1.546.062 2.656.14 3.187.266 5.359 1.047 7.453 2.72 1.578 1.25 3.968 4.187 3.734 4.577-.156.235-6.39 4.391-6.797 4.516-.25.078-.422-.016-.765-.422-2.125-2.547-2.985-3.094-5.047-3.219-1.469-.093-2.25.078-3.235.735-1.03.687-1.53 1.734-1.53 3.187.015 2.125.827 3.125 3.827 4.61 1.938.953 3.594 1.734 3.719 1.734.188 0 4.203 2 5.25 2.625 4.875 2.86 6.86 5.797 7.375 10.86.375 3.812-.703 7.296-3.047 9.765'/></g><defs><clipPath id='a'><path fill='#fff' d='M0 0h100v100H0z'/></clipPath></defs></svg>`;

const RAILWAY_SVG = `<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 100 100'><g clip-path='url(#a)'><g fill='#fff' clip-path='url(#b)'><path d='M.464 42.79A51 51 0 0 0 0 47.825h75.957c-.265-.519-.622-.986-.981-1.443-12.985-16.776-19.97-15.322-29.963-15.748-3.331-.137-5.59-.192-18.851-.192-7.097 0-14.813.018-22.327.038-.973 2.625-1.91 5.17-2.368 7.24H40.39v5.07zm76.092 10.109H.039c.08 1.353.206 2.687.388 4.004h70.644c3.15 0 4.912-1.787 5.485-4.004M4.396 70.732s11.712 28.756 45.551 29.267c20.226 0 37.605-12.012 45.499-29.267z'/><path d='M49.947-.001c-18.702 0-34.975 10.27-43.57 25.45 6.717-.014 19.796-.022 19.796-.022h.003v-.005c15.46 0 16.035.07 19.055.195l1.87.07c6.514.217 14.52.916 20.82 5.682 3.419 2.585 8.356 8.29 11.299 12.356 2.72 3.76 3.503 8.081 1.653 12.222-1.702 3.806-5.366 6.076-9.803 6.076H1.63s.413 1.752 1.033 3.686h94.788A49.8 49.8 0 0 0 100 50.02C100.001 22.397 77.591 0 49.947 0'/></g></g><defs><clipPath id='a'><path fill='#fff' d='M0 0h100v100H0z'/></clipPath><clipPath id='b'><path fill='#fff' d='M0-.001h100v100H0z'/></clipPath></defs></svg>`;

const PYTHON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 512 512"><linearGradient id="python_svg__a" x1="85.802" x2="582.437" y1="534.316" y2="961.604" gradientTransform="matrix(.5625 0 0 .568 -57.88 -288.938)" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:#5a9fd4"/><stop offset="1" style="stop-color:#306998"/></linearGradient><path d="M253 0c-20.9.1-40.8 1.9-58.4 5-51.7 9.1-61.1 28.2-61.1 63.5V115h122.1v15.5H87.7c-35.5 0-66.6 21.3-76.3 61.9C.2 239-.3 268 11.4 316.6c8.7 36.2 29.4 61.9 64.9 61.9h42v-55.8c0-40.3 34.9-75.9 76.3-75.9h122c34 0 61.1-28 61.1-62.1V68.5c0-33.1-27.9-58-61.1-63.5-21-3.5-42.7-5.1-63.6-5m-66.1 37.4c12.6 0 22.9 10.5 22.9 23.3s-10.3 23.2-22.9 23.2C174.3 84 164 73.6 164 60.8c0-12.9 10.3-23.4 22.9-23.4" style="fill:url(#python_svg__a)"/><linearGradient id="python_svg__b" x1="774.444" x2="597.096" y1="1220.223" y2="969.306" gradientTransform="matrix(.5625 0 0 .568 -57.88 -288.938)" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:#ffd43b"/><stop offset="1" style="stop-color:#ffe873"/></linearGradient><path d="M392.9 130.6v54.2c0 42.1-35.7 77.4-76.3 77.4h-122c-33.4 0-61.1 28.6-61.1 62.1v116.3c0 33.1 28.8 52.6 61.1 62.1 38.7 11.4 75.7 13.4 122 0 30.8-8.9 61.1-26.8 61.1-62.1V394h-122v-15.5h183.1c35.5 0 48.7-24.8 61.1-61.9 12.8-38.3 12.2-75.1 0-124.1-8.8-35.3-25.5-61.9-61.1-61.9zm-68.6 294.5c12.7 0 22.9 10.4 22.9 23.2 0 12.9-10.3 23.3-22.9 23.3s-22.9-10.5-22.9-23.3 10.3-23.2 22.9-23.2" style="fill:url(#python_svg__b)"/></svg>`;

// --- ICON COMPONENT ---
const Icon = ({ slug, color, alt, svg, size = 17 }) => (
  svg ? (
    <span
      style={{ display: 'inline-block', width: size, height: size, verticalAlign: 'middle' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  ) : (
    <img
      src={`https://cdn.simpleicons.org/${slug}/${color}`}
      width={size}
      height={size}
      alt={alt}
      loading="lazy"
      style={{ objectFit: 'contain' }}
    />
  )
)

// --- TECH STACK DATA ---
const LAYERS = [
  {
    cat: 'Inference',
    items: [
{ role: 'Planning',  name: 'Gemini 2.5 Flash', icon: <Icon svg={GEMINI_SVG} alt="Gemini" /> },
{ role: 'Reasoning', name: 'Gemini 2.0 Pro',   icon: <Icon svg={GEMINI_SVG} alt="Gemini Pro" /> },
      { role: 'Validation', name: 'MuJoCo 3.x',       icon: <Icon svg={MUJOCO_SVG} alt="MuJoCo" /> },
    ],
  },
  {
    cat: 'AI & Physics',
    items: [
      { role: 'Realtime sim', name: 'Rapier WASM',        icon: <Icon slug="webassembly" color="654FF0" alt="WASM" /> },
      { role: '3D engine',    name: 'Three.js',            icon: <Icon slug="threedotjs" color="FFFFFF" alt="Three.js" /> },
      { role: '3D engine',    name: 'React Three Fiber',   icon: <Icon svg={R3F_SVG} alt="React Three Fiber" /> },
      { role: 'IK',           name: 'FABRIK',              icon: <Icon svg={FABRIK_SVG} alt="FABRIK" /> },
      { role: 'IK',           name: 'Forward Kinematics',  icon: <Icon svg={FK_SVG} alt="Forward Kinematics" /> },
      { role: 'Motion',       name: 'Motion Compiler',     icon: <Icon svg={MOTION_COMPILER_SVG} alt="Motion Compiler" /> },
      { role: 'Task graph',   name: 'React Flow v12',      icon: <Icon svg={REACT_FLOW_SVG} alt="React Flow" /> },
      { role: 'State',        name: 'Jotai',               icon: <Icon svg={JOTAI_SVG} alt="Jotai" /> },
{ role: 'Language', name: 'Python', icon: <Icon svg={PYTHON_SVG} alt="Python" /> },
    ],
  },
  {
    cat: 'Application',
    items: [
      { role: 'Frontend',  name: 'React 18',    icon: <Icon slug="react" color="61DAFB" alt="React" /> },
      { role: 'Frontend',  name: 'TypeScript',  icon: <Icon svg={TYPESCRIPT_SVG} alt="TypeScript" /> },
      { role: 'Backend',   name: 'FastAPI',     icon: <Icon slug="fastapi" color="009688" alt="FastAPI" /> },
      { role: 'Export',    name: 'Jinja2',      icon: <Icon slug="jinja" color="B41717" alt="Jinja2" /> },
      { role: 'Deploy',    name: 'Vercel',      icon: <Icon slug="vercel" color="FFFFFF" alt="Vercel" /> },
      { role: 'Deploy',    name: 'Railway',     icon: <Icon svg={RAILWAY_SVG} alt="Railway" /> },
      { role: 'Container', name: 'Docker',      icon: <Icon slug="docker" color="2496ED" alt="Docker" /> },
      { role: 'Storage',   name: 'SQLite',      icon: <Icon slug="sqlite" color="003B57" alt="SQLite" /> },
    ],
  },
]

// --- COMPONENT ---
export default function TechStack() {
  return (
    <section id="techstack" className="relative py-32 z-10" style={{ background: '#070707' }}>
      <div className="max-w-[1100px] mx-auto px-8">
        <Reveal>
          <p className="micro-label font-bold uppercase text-zinc-300/90 mb-5">Stack</p>
        </Reveal>

        <Reveal delay={1}>
          <h2
            className="font-black tracking-[-0.04em] leading-none text-white mb-12"
            style={{ fontSize: 'clamp(2.35rem,5vw,4rem)' }}
          >
            Built on browser-native simulation{' '}
            <span className="text-zinc-300/88">and grounded AI planning</span>
          </h2>
        </Reveal>

        <Reveal delay={1}>
          <div className="si-feat-mirai mb-3">
            <div className="si-feat-ico-mirai" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10.5c0 4.694-3.806 8.5-8.5 8.5S4 15.194 4 10.5 7.806 2 12.5 2c1.844 0 3.551.588 4.943 1.587" />
                <path d="M21 3v6h-6" />
                <path d="M9 13.5 11.5 16 17 10.5" />
              </svg>
            </div>
            <div className="si-feat-body-mirai">
              <div className="si-feat-eyebrow-mirai">Primary runtime profile</div>
              <div className="si-feat-name-mirai">Rapier + Gemini + MuJoCo</div>
              <div className="si-feat-desc-mirai">
                60fps browser simulation with deterministic validation and signed Arduino/Python export pipeline.
              </div>
            </div>
            <div className="si-feat-pills-mirai">
              <span className="si-feat-pill-mirai">60fps client sim</span>
              <span className="si-feat-pill-mirai">5-15s planning</span>
              <span className="si-feat-pill-mirai">Dual physics</span>
              <span className="si-feat-pill-mirai">SHA-256 signed</span>
              <span className="si-feat-pill-mirai">BOM export</span>
            </div>
          </div>
        </Reveal>

        <div className="stack-layers-mirai">
          {LAYERS.map((layer, layerIdx) => (
            <Reveal key={layer.cat} delay={layerIdx + 1}>
              <div className="stack-layer-mirai">
                <div className="sl-cat-mirai">{layer.cat}</div>
                <div className="sl-cards-mirai">
                  {layer.items.map((item) => (
                    <div key={`${layer.cat}-${item.name}`} className="si-mirai">
                      <div className="si-icon-mirai">{item.icon}</div>
                      <div className="si-text-mirai">
                        <div className="si-role-mirai">{item.role}</div>
                        <div className="si-name-mirai">{item.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}