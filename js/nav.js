"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  hidePageComponents();
  putStoriesOnPage();
  addFavoritestoUI()
}

$body.on("click", "#nav-all", navAllStories);

function navSubmitStory(evt) {
  hidePageComponents();
  //show story submit form
  putStoriesOnPage();
  addFavoritestoUI()
  $submitForm.show()
} 

$navSubmitStory.on("click", navSubmitStory);

function navFavorites(evt) {
  // console.debug('fovorites clicked', evt)
  hidePageComponents();
  putFavoriteStoriesOnPage()
  addFavoritestoUI()
  $favoritedStories.show()
  //call to get favorites

  //if favorites show favorites - else show id="favorited-stories"
} 

$navFavorites.on("click", navFavorites);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $loginForm.hide()
  $signupForm.hide()
  $navUserProfile.text(`${currentUser.username}`).show();
}
