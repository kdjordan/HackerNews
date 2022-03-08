"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  hidePageComponents();
  getAndShowStoriesOnStart(evt)
}

$body.on("click", "#nav-all", navAllStories);

function navSubmitStory(evt) {
  hidePageComponents();
  // putStoriesOnPage(evt);
  putStories(evt);
  //show story submit form
  $submitForm.show()
  
} 

$navSubmitStory.on("click", navSubmitStory);

function myFavorites(evt) {
  hidePageComponents();
  // putFavoriteStoriesOnPage(evt)
  putStories(evt);
  $favoritedStories.show()
} 

$navFavorites.on("click", myFavorites);


function myStories(evt) {
  hidePageComponents();
  // putMyStoriesOnPage(evt)
  putStories(evt);
  $myStories.show()
} 

$navMyStories.on("click", myStories);

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
