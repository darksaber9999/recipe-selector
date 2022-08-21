// View Toggle Buttons
const viewBtn = '.view-btn';
const viewBtns = document.querySelectorAll(viewBtn);

// Sort Toggle Buttons
const sortBtn = '.sort-btn';
const sortBtns = document.querySelectorAll(sortBtn);
const sort = 'recipeSortDirection';
const currentSort = localStorage.getItem(sort);

// Refresh Recipes Button
const refresh = '#refresh';
const refreshBtn = document.querySelector(refresh);

// Recipe Variables
const cardClose = '[data-close]';
let closeCards = document.querySelectorAll(cardClose);
const cardFavorite = '[data-favorite]';
let favoriteCards = document.querySelectorAll(cardFavorite);
const cardUnfavorite = '[data-unfav]';
let unfavoriteCards = document.querySelectorAll(cardUnfavorite);
const cardRecipeBtn = '[data-recipe]';
let recipeBtns = document.querySelectorAll(cardRecipeBtn);
const recipeCat = '.recipe-category';
let currentCategories = document.querySelectorAll(recipeCat);
const catClose = '[data-catClose]';
let closeCategories = document.querySelectorAll(catClose);
const modalClose = '[data-modalClose]';
let closeModal = document.querySelectorAll(modalClose);

let recipes = [];
let favoriteRecipes = [];
let recipeCategories = new Map();

// Recipe Functions
const getCurrentPage = () => {
  for (const elm of viewBtns) {
    if (elm.classList.contains(btnPrimary)) {
      return elm.dataset.toggle;
    }
  }
};

const createNewRecipeCard = (id, imageSource, title, category) => {
  const page = getCurrentPage();

  const recipeCard = document.createElement('div');
  const imgWrapper = document.createElement('div');
  const image = document.createElement('img');
  const textWrapper = document.createElement('div');
  const recipeTitle = document.createElement('h2');
  const recipeCategory = document.createElement('p');
  const favButton = document.createElement('button');
  const favIcon = document.createElement('i');
  const recipeButton = document.createElement('button');
  const recipeIcon = document.createElement('i');

  recipeCard.setAttribute('class', 'recipe-card');
  recipeCard.setAttribute('data-id', id);
  recipeCard.setAttribute('data-close', '');
  imgWrapper.setAttribute('class', 'img-wrapper');
  image.setAttribute('src', imageSource);
  image.setAttribute('alt', 'recipe thumbnail photo');
  textWrapper.setAttribute('class', 'text-wrapper');
  recipeTitle.setAttribute('class', 'recipe-title');
  recipeTitle.innerHTML = title;
  recipeCategory.setAttribute('class', 'recipe-category');
  recipeCategory.innerHTML = category;
  favButton.classList.add('fav-button', 'btn', 'btn-sm-square');
  favButton.setAttribute((page === 'recipes') ? 'data-favorite' : 'data-unfav', '');
  favIcon.classList.add('fav-icon', 'fa-solid', (page === 'recipes') ? 'fa-heart' : 'fa-x');
  recipeButton.classList.add('recipe-button', 'btn', 'btn-sm-square');
  recipeButton.setAttribute('data-recipe', '');
  recipeIcon.classList.add('recipe-icon', 'fa-solid', 'fa-bars');

  recipeButton.appendChild(recipeIcon);
  favButton.appendChild(favIcon);
  textWrapper.appendChild(recipeTitle);
  textWrapper.appendChild(recipeCategory);
  imgWrapper.appendChild(image);
  recipeCard.appendChild(imgWrapper);
  recipeCard.appendChild(textWrapper);
  recipeCard.appendChild(favButton);
  recipeCard.appendChild(recipeButton);

  document.querySelector('.recipe-card-wrapper').appendChild(recipeCard);
};

const clearRecipes = () => {
  for (const elm of closeCards) {
    elm.remove();
  }
};

const removeSpecificRecipe = (recipeID, recipeArray) => {
  for (const elm of closeCards) {
    if (elm.dataset.id === recipeID) {
      elm.remove();
    }
  }
  recipeArray = recipeArray.filter((item) => {
    if (item.idMeal !== recipeID) {
      return item;
    }
  });

  return recipeArray;
};

const updateDisplayedRecipes = (recipesArray) => {
  clearRecipes();
  for (const recipe of recipesArray) {
    createNewRecipeCard(recipe.idMeal, recipe.strMealThumb, recipe.strMeal, recipe.strCategory);
  }
  updateCategories(recipesArray);
  updateDisplayedCategories();
  closeCards = document.querySelectorAll(cardClose);
  favoriteCards = document.querySelectorAll(cardFavorite);
  unfavoriteCards = document.querySelectorAll(cardUnfavorite);
  recipeBtns = document.querySelectorAll(cardRecipeBtn);
  currentCategories = document.querySelectorAll(recipeCat);
  addFavoriteListener('fav');
  addFavoriteListener();
  assignRecipeCardModalButtonListeners();
  //checkForCurrentSort();  //FIXME: btn-primary for sortbtns breaks when this is active
};

const checkForDuplicate = (recipeID) => {
  for (const recipe of recipes) {
    if (recipe.idMeal === recipeID) {
      return true;
    }
  }

  return false;
};

const getNewRecipe = async () => {
  const site = new URL('https://www.themealdb.com/api/json/v1/1/random.php');

  const response = await fetch(site);
  const data = await response.json();
  if (!checkForDuplicate(data.meals[0].idMeal)) {
    recipes.push(data.meals[0]);
  } else {
    getNewRecipe();
  }
};

const addSpecificRecipe = (recipeID, recipeArray) => {
  const site = new URL(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeID}`);

  fetch(site)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      recipeArray.push(data.meals[0]);
    });

  return recipeArray;
};


function addFavoriteListener(arrayType) {
  const array = (arrayType === 'fav') ? favoriteCards : unfavoriteCards;
  const listOptions = (arrayType === 'fav') ? [recipes, favoriteRecipes] : [favoriteRecipes, recipes];
  for (const elm of array) {
    elm.addEventListener('click', function () {
      const recipeID = this.parentElement.dataset.id;
      listOptions[0] = removeSpecificRecipe(recipeID, listOptions[0]);
      listOptions[1] = addSpecificRecipe(recipeID, listOptions[1]);
      updateCategories(listOptions[0]);
      updateDisplayedCategories();
    })
  }
}

const trimIngredientsList = (ingredients) => {
  return ingredients.filter((ing) => {
    return ing.trim() !== '';
  })
};

const replaceNull = (ingredients) => {
  return ingredients.map((ing) => {
    return ing.replace('null', '');
  })
};

const createIngredientsList = (recipe) => {
  const ingredients = [...Array(20).keys()].map(
    item => `${recipe[`strMeasure${item + 1}`]} ${recipe[`strIngredient${item + 1}`]}`
  );

  return trimIngredientsList(replaceNull(replaceNull(ingredients)));
};

const createRecipeModal = (recipe) => {
  const fullSiteModal = document.createElement('div');
  const containerFluid = document.createElement('div');
  const modalHeader = document.createElement('header');
  const modalTitle = document.createElement('span');
  const headerTitle = document.createElement('h2');
  const headerSubtitle = document.createElement('span');
  const subtitleArea = document.createElement('span');
  const subtitleDash = document.createElement('span');
  const subtitleCategory = document.createElement('span');
  const modalClose = document.createElement('i');
  const modalBody = document.createElement('div');
  const recipeMedia = document.createElement('div');
  const recipeImageWrapper = document.createElement('div');
  const recipeImage = document.createElement('img');
  const recipeInfo = document.createElement('div');
  const recipeVideo = document.createElement('iframe');
  const recipeList = document.createElement('ul');
  const recipeInstructionsWrapper = document.createElement('div');
  const recipeInstructions = document.createElement('p');
  const recipeSource = document.createElement('a');

  fullSiteModal.setAttribute('class', 'full-site-modal');
  containerFluid.setAttribute('class', 'container-fluid');
  modalHeader.setAttribute('class', 'modal-header');
  modalTitle.setAttribute('class', 'modal-title');
  headerTitle.setAttribute('class', 'header-title');
  headerTitle.innerHTML = recipe.strMeal;
  headerSubtitle.setAttribute('class', 'header-subtitle');
  subtitleArea.setAttribute('class', 'subtitle-area');
  subtitleArea.innerHTML = recipe.strArea;
  subtitleDash.innerHTML = '-';
  subtitleCategory.setAttribute('class', 'subtitle-category');
  subtitleCategory.innerHTML = recipe.strCategory;
  modalClose.setAttribute('class', 'fas fa-times');
  modalClose.setAttribute('data-modalClose', '');
  modalBody.setAttribute('class', 'modal-body');
  recipeMedia.setAttribute('class', 'recipe-media');
  recipeImageWrapper.setAttribute('class', 'recipe-img-wrapper');
  recipeImage.setAttribute('class', 'recipe-image');
  recipeImage.setAttribute('src', recipe.strMealThumb);
  recipeInfo.setAttribute('class', 'recipe-info');
  recipeVideo.setAttribute('class', 'recipe-video');
  recipeVideo.setAttribute('width', '420');
  recipeVideo.setAttribute('height', '315');
  recipeVideo.setAttribute('src', recipe.strYoutube.replace('watch?v=', 'embed/'));
  recipeList.classList.add('recipe-list', 'ul-defaults-none');
  recipeInstructionsWrapper.classList.add('container', 'recipe-instructions-wrapper');
  recipeInstructions.setAttribute('class', 'recipe-instructions');
  recipeInstructions.innerHTML = recipe.strInstructions;
  recipeSource.setAttribute('class', 'recipe-source');
  recipeSource.setAttribute('href', recipe.strSource);
  recipeSource.innerHTML = 'Recipe Source';

  recipeInstructionsWrapper.appendChild(recipeInstructions);
  recipeInstructionsWrapper.appendChild(recipeSource);
  recipeImageWrapper.appendChild(recipeImage);
  recipeInfo.appendChild(recipeVideo);
  recipeInfo.appendChild(recipeList);
  recipeMedia.appendChild(recipeImageWrapper);
  recipeMedia.appendChild(recipeInfo);
  modalBody.appendChild(recipeMedia);
  modalBody.appendChild(recipeInstructionsWrapper);
  headerSubtitle.appendChild(subtitleArea);
  headerSubtitle.appendChild(subtitleDash);
  headerSubtitle.appendChild(subtitleCategory);
  modalTitle.appendChild(headerTitle);
  modalTitle.appendChild(headerSubtitle);
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(modalClose);
  containerFluid.appendChild(modalHeader);
  containerFluid.appendChild(modalBody);
  fullSiteModal.appendChild(containerFluid);

  const ingredients = createIngredientsList(recipe);

  for (const ing of ingredients) {
    const listItem = document.createElement('li');
    listItem.setAttribute('class', 'recipe-ingredient');
    listItem.innerHTML = ing;
    recipeList.appendChild(listItem);
  }

  document.getElementsByTagName('body')[0].appendChild(fullSiteModal);
};

const openModal = (recipeID) => {
  const recipeArray = (getCurrentPage() === 'recipes' ? recipes : favoriteRecipes);
  for (const recipe of recipeArray) {
    if (recipe.idMeal === recipeID) {
      createRecipeModal(recipe);
      closeModal = document.querySelectorAll(modalClose);
      assignModalCloseListener();
    }
  }
};

function assignModalCloseListener() {
  for (const elm of closeModal) {
    elm.addEventListener('click', function () {
      this.parentElement.parentElement.parentElement.remove();
    })
  }
}

function assignRecipeCardModalButtonListeners() {
  for (const elm of recipeBtns) {
    elm.addEventListener('click', function () {
      const recipeID = this.parentElement.dataset.id;
      openModal(recipeID);
    });
  }
}

// Recipe Categories Display Functions
const clearCategories = () => {
  for (const elm of closeCategories) {
    elm.remove();
  }
  recipeCategories = new Map();
};

const createNewCategoryCard = (catName, catNum) => {
  const categoryCard = document.createElement('div');

  categoryCard.setAttribute('class', 'category-card');
  categoryCard.setAttribute('data-catClose', '');
  categoryCard.innerHTML = `${catName}: ${catNum}`;

  document.querySelector('.recipe-category-stats').appendChild(categoryCard);
};

const updateDisplayedCategories = () => {
  recipeCategories.forEach((value, key) => {
    createNewCategoryCard(key, value);
  });
  closeCategories = document.querySelectorAll(catClose);
};

const updateCategories = (recipeArray) => {
  clearCategories();
  for (const recipe of recipeArray) {
    if (recipeCategories.has(recipe.strCategory)) {
      const tempNum = recipeCategories.get(recipe.strCategory);
      recipeCategories.set(recipe.strCategory, tempNum + 1);
    } else {
      recipeCategories.set(recipe.strCategory, 1)
    }
  }
};

// View Toggle Buttons
for (const elm of viewBtns) {
  elm.addEventListener('click', function () {
    const toggle = this.dataset.toggle;
    setActive(elm, viewBtn, btnPrimary);
    updateDisplayedRecipes((toggle === 'recipes' ? recipes : favoriteRecipes));
    removeActive(sortBtn, btnPrimary);
  });
}

// Sort Toggle Buttons
const sortArray = (recipeArray, direction = 1) => {
  recipeArray.sort((a, b) => (a.strMeal > b.strMeal) ? 1 * direction : ((b.strMeal > a.strMeal) ? -1 * direction : 0));
}

for (const elm of sortBtns) {
  elm.addEventListener('click', function () {
    const page = getCurrentPage();
    const toggle = this.dataset.toggle;
    localStorage.setItem(sort, toggle);
    setActive(elm, sortBtn, btnPrimary);
    sortArray((page === 'recipes' ? recipes : favoriteRecipes), (toggle === 'az' ? 1 : -1));
    updateDisplayedRecipes((page === 'recipes' ? recipes : favoriteRecipes));
  });
}

const checkForCurrentSort = () => {
  if (currentSort) {
    const page = getCurrentPage();
    sortArray((page === 'recipes' ? recipes : favoriteRecipes), (currentSort === 'az' ? 1 : -1));
    console.log('array sorted');
    sortBtns.forEach((btn) => {
      btn.classList.remove(btnPrimary);
    });
    sortBtns[(currentSort === 'az') ? 0 : 1].classList.add(btnPrimary);
  }
}

// Refresh Recipes Button
refreshBtn.addEventListener('click', () => {
  setActive(viewBtns[0], viewBtn, btnPrimary);
  viewBtns[1].setAttribute('disabled', '');
  removeActive(sortBtn, btnPrimary);
  clearRecipes();
  recipes.splice(0, recipes.length);
  fillRecipes();
});

// Initial functions
const fillRecipes = async () => {
  for (let i = 0; i < 30; i++) {
    await getNewRecipe();
    updateDisplayedRecipes(recipes);
  }
  viewBtns[1].removeAttribute('disabled');
};

// Initial commands
fillRecipes();