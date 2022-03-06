"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;
/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
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

/** If there are favorite stories - grab the IDS update main StoryList to reflect
 *  Else - construct a new StoryList with empty stories array
 */
function checkForFavoriteStories() {
  const favoritedStories = localStorage.getItem('favoriteStories')
  if(favoritedStories) {
    return new StoryList(JSON.parse(favoritedStories).stories)
  } else {
    return new StoryList([])
  }
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
/** Sync current user favorited Stories to localStorage.
 *
 * We store the favorited storiesin localStorage so when the page is refreshed
 * (or the user revisits the site later), their favorited stories are available
 */

function saveUserFavoriteStoriesLocalStorage(stories) {
  if (currentUser) {
    console.log('the fovaorites goin local ', stories)
    let favoriteStoryList = new StoryList(stories)
    localStorage.removeItem('favoriteStories')
    localStorage.setItem('favoriteStories', JSON.stringify(favoriteStoryList))
    console.log('localStorage ', localStorage.getItem('favoriteStories'))
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
