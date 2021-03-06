"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance 
 * If not we alert the user that there is an issue with the login credientials
*/

async function login(evt) {
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  try {
    currentUser = await User.login(username, password);
  
    $loginForm.trigger("reset");
  
    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();
  } catch(e) {
    alert('Username or password is incorrect !')
  }
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  evt.preventDefault();
  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 * adding check for favoriterd stories as well
 */

async function checkForRememberedUser() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;
  // 
  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/******************************************************************************
 * Storing/recalling favorite stories
 */

/** If there are favorite stories - assign them to  currentUser
 * 
 */
function checkStoriesLocalStorage() {
  const $favoritedStories = localStorage.getItem('favoriteStories')
  const $myStories = localStorage.getItem('myStories')
  if(currentUser) {
    if($favoritedStories) currentUser.favorites = JSON.parse($favoritedStories)
    if($myStories) currentUser.ownStories = JSON.parse($myStories)
  }
  // currentUser.favorites = []
  // currentUser.ownStories = []
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}


/******************************************************************************
/** Sync current user favorites to localStorage.
 *
 * We store the favorited stories in localStorage so when the page is refreshed
 * (or the user revisits the site later), their favorited stories are available
 */

function saveUserFavoriteStoriesLocalStorage() {
  console.log('saving local')
  if (currentUser) {
    localStorage.removeItem("favoriteStories")
    localStorage.setItem("favoriteStories", JSON.stringify(currentUser.favorites));
  }
}

/******************************************************************************
/** Sync current user favorites to localStorage.
 *
 * We store the favorited stories in localStorage so when the page is refreshed
 * (or the user revisits the site later), their favorited stories are available
 */

function saveOwnStoriesLocalStorage() {
  if (currentUser) {
    localStorage.removeItem("ownStories")
    localStorage.setItem("ownStories", JSON.stringify(currentUser.ownStories));
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {

  $allStoriesList.show();

  updateNavOnLogin();
}
