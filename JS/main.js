// Global functions
const removeActive = (selector, active) => {
  if (document.querySelector(`${selector}.${active}`) !== null) {
    document.querySelector(`${selector}.${active}`).classList.remove(active);
  }
};

const setActive = (elm, selector, active) => {
  removeActive(selector, active);
  elm.classList.add(active);
};

// Menu Button
const menu = '#menu';
const menuBtn = document.querySelector(menu);

menuBtn.addEventListener('click', () => {
  menuBtn.children[0].classList.toggle('fa-caret-up');
  menuBtn.children[0].classList.toggle('fa-caret-down');
  menuBtn.parentElement.parentElement.parentElement.classList.toggle('extended');
});