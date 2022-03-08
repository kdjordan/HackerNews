"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  // console.log(localStorage)
  $storiesLoadingMsg.show()
  //check for existence of favoritesStories in localStorage
  getFavoriteStoriesLocalStorage()
  // emptyFavs()
  // console.log('current user ', currentUser)
  storyList = await StoryList.getStories();
  
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <span class="star">
          <i class="fa-star far"></i>
        </span>
        <span class="trash-can">
          <i class="fa-trash fa"></i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    
    $allStoriesList.append($story);
  }
  $allStoriesList.show();
  addFavoriteStars('all-stories-list')
  //add click hadler for starring favorites on class star
  $(".star").on("click", favoriteStory)
  //add click hadler for removing stories on class trash-can
  $(".trash-can").on("click", deleteStory)
}

/** Gets list of favorite stories  favoriteStoryList, generates their HTML, and puts on page. */

function putFavoriteStoriesOnPage() {
  console.debug("putFavoriteStoriesOnPage", );
  $favoritedStories.empty();
  
  if(currentUser.favorites.length > 0) {
    // loop through all of our stories and generate HTML for them
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(new Story(story));
      $favoritedStories.append($story);
    }
    $favoritedStories.show();
    addFavoriteStars('favorited-stories')
    //add click hadler for starring favorites on class star
    $(".star").on("click", favoriteStory)
    //add click hadler for removing stories on class trash-can
    $(".trash-can").on("click", deleteStory)
  } else {
    $favoritedStories.html('<h5>No favorites added!</h5>')
  }
}

function putMyStoriesOnPage() {
  console.debug("putMyStoriesOnPage", );
  $myStories.empty();

  if(currentUser.ownStories.length > 0) {
    // loop through all of our stories and generate HTML for them
    for (let story of currentUser.ownStories) {
      const $story = generateStoryMarkup(new Story(story));
      $myStories.append($story);
    }
    addFavoriteStars('my-stories')
    //add click hadler for starring favorites on class star
    $(".star").on("click", favoriteStory)
    //add click hadler for removing stories on class trash-can
    $(".trash-can").on("click", deleteStory)
  } else {
    $myStories.html('<h5>You have submitted no stories!</h5>')
    $myStories.show();
  }
}

/**
 * Gets input from Submit story, makes a new Story instance and adds it to page
 * 
 */

async function createStoryFromForm(evt) {
  evt.preventDefault();
  const $author = $('#create-author').val()
  const $title = $('#create-title').val()
  const $url = $('#create-url').val()

  let newStory = {
    title: $title, 
    author: $author,
    url: $url, 
  }
  //call static function in models.js to add newStory to DB
  let $res = await StoryList.addStory(currentUser, newStory)
  //reset input fields
  $('#create-author').val('')
  $('#create-title').val('')
  $('#create-url').val('')
  //hide form with animation
  $submitForm.slideUp()
  
  //reload all stories from DB
  $allStoriesList.empty();
  putStoriesOnPage();
  //add story to currentUser ownStories
  console.log('add new story to current User ', $res)
  console.log('currentUSer, ', currentUser)
  currentUser.ownStories.push($res)
}

$submitForm.on('submit', createStoryFromForm)


/**
 * toggles star from filled to unfilled depending on state when user favorites a story
 * calls other functions to update localStorage with favorited story
 */

function favoriteStory() {
  // console.log('favoriteing ', evt.target.closest('ol').id)
  if($(this).children().hasClass('far')) {
    //a favorite story - update .star class to be filled
    $(this).children().removeClass('far').addClass('fas')
    //add story to User favorites array and localStorage by passing id 
    addFavoriteStory($(this).parent()[0].id)
  } else {
    //not a favorite story
    $(this).children().removeClass('fas').addClass('far')
    //remove story from favorites array and localStorage by passing id 
    removeFavoriteStory($(this).parent()[0].id)
  }
}


/**
 * adds favorite story from storyList to favoriteStoryList and localStorage
 * @param {string} - story id
 */
function addFavoriteStory(opId) {
  console.log('addin ', opId)
  
  for (let story of storyList.stories) {
    if(story.storyId === opId) {
      currentUser['favorites'].push(story)
      console.log('currentUser favs', currentUser.favorites)
    }
  }
  // console.log('addin ', currentUser.favorites)
  saveUserFavoriteStoriesLocalStorage(currentUser.favorites)
}

/**
 * removes favorite story from storyList to favoriteStoryList and localStorage
 * @param {string} - story id
 */
function removeFavoriteStory(opId) {
  //remove favorite story from user favorites
  currentUser.favorites = currentUser.favorites.filter(story => {
    return story.storyId !== opId
  })
  saveUserFavoriteStoriesLocalStorage(currentUser.favorites)
}

/**
 * deletes Story from DB - called from click hadler on class 'trash-can'
 * references class ID of parent li in DOM
 * needs currentUser to get token for acces to API (protected call)
 */
async function deleteStory() {
  console.log('deleting ', $(this).parent()[0].id)
  console.log('deleting from ',  $(this).closest('ol')[0].id)
  let $storyId = $(this).parent()[0].id
  let $list = $(this).closest('ol')[0].id
  try {
    //remove Story from storyList
    await StoryList.deleteStory(currentUser, $storyId)

    // console.log('delete from favorites', $(this).closest('ol')[0].id)
    removeFavoriteStory($storyId)
    if( $list === 'all-stories-list') {
      $(`#${$list} #${$storyId}`).remove()
      // putStoriesOnPage()
    } else if( $list === 'favorited-stories'){
      console.log('running here')
      //reload stories list
      putFavoriteStoriesOnPage()
      // putStoriesOnPage()
    } else if($list === 'my-stories') {
      $(`#${$list} #${$storyId}`).remove()
    }
  } catch(e) {
    console.log('the error ', e)
    alert('Not your story to delete !')

  }
}


/**
 * updates star in UI to be filled if the user has farvorited a story
 */
function addFavoriteStars(list) {
  //check if we are in the favorites tab and add stars to that list
  // console.log('running stars', $(`#${list}`).children())
  $(`#${list}`).children().each((i, li) => {
    for(let fav of currentUser.favorites) {
      if(fav.storyId === li.id) {
        $(`#${list} #${li.id} .star i`).removeClass('far').addClass('fas')
      }
    }
  })
} 
