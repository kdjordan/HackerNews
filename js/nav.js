"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  hidePageComponents();
  putStoriesOnPage();
  addFavoriteStars()
}

$body.on("click", "#nav-all", navAllStories);

function navSubmitStory(evt) {
  hidePageComponents();
  putStoriesOnPage();
  //show story submit form
  $submitForm.show()
  
} 

$navSubmitStory.on("click", navSubmitStory);

function navFavorites() {
  // console.debug('fovorites clicked', evt)
  hidePageComponents();
  putFavoriteStoriesOnPage()
  $favoritedStories.show()
  //call to get favorites

  //if favorites show favorites - else show id="favorited-stories"
} 

$navFavorites.on("click", navFavorites);

/** Show login/signup on click on "login" */

function navLoginClick() {
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $loginForm.hide()
  $signupForm.hide()
  $navUserProfile.text(`${currentUser.username}`).show();
}
