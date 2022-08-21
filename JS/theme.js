// Light/dark theme controls
const theme = 'theme';
const dataTheme = 'data-theme';
const themeBtn = '.theme-btn';
const dark = 'dark';
const light = 'light';
const btnPrimary = 'btn-primary';

const root = document.documentElement;

const themeBtns = document.querySelectorAll(themeBtn);
const currentTheme = localStorage.getItem(theme);

const setTheme = (val) => {
  root.setAttribute(dataTheme, val);
  localStorage.setItem(theme, val);
};

if (currentTheme) {
  root.setAttribute(dataTheme, currentTheme);
  themeBtns.forEach((btn) => {
    btn.classList.remove(btnPrimary);
  });
  themeBtns[(currentTheme === dark) ? 1 : 0].classList.add(btnPrimary);
}

for (const elm of themeBtns) {
  elm.addEventListener('click', function () {
    const toggle = this.dataset.toggle;
    // set active state
    setActive(elm, themeBtn, btnPrimary);
    setTheme(toggle);
  })
}