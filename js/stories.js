"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  $storiesLoadingMsg.show()
  // localStorage.clear();
  //check for existence of favoritesStories in localStorage
  checkStoriesLocalStorage()
  
  //get the current stories that will be displayed for all-stories list from DB
  storyList = await StoryList.getStories();
  
  $storiesLoadingMsg.remove();

  //add the stories to the DOM
  putStories();
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

/**
  * takes an event and figures out what tab we are on and what list of stories to display
  * @param {evt} - the event that was fired by clicking a nav button or the submit story form
*/

function getStoryParams(evt) {
  let $targetId
  let $currentStoryList
  let $storiesToShow

  //handle edge case where no event is passed on loading of page, but we need a OL to populate
  //we'll give it 'nav-all' since we are on the homepage (intial paint of page on log in)
  if(!evt) {
    $targetId = 'nav-all'
  } else {
    $targetId = evt.target.id   
  }
  
  //check to see what event id is making the call so we can setup which OL and which list
  //of stories we want to display
  if($targetId === 'nav-all' || $targetId == 'nav-submit-story' || $targetId == 'submit-form') {
    $currentStoryList = $allStoriesList
    $storiesToShow = storyList.stories
  } else if($targetId  == 'nav-favorites'){
    $currentStoryList = $favoritedStories
    $storiesToShow = currentUser.favorites
  } else if($targetId === 'nav-my-stories'){
    $currentStoryList = $myStories
    $storiesToShow = currentUser.ownStories
  }
  return {
    $currentStoryList,
    $storiesToShow
  }
}

/**
  * takes an event and displays the proper stories in the proper spot
  * by proper spot we mean that we have different lists (all stories/favorites/ownstories)
  * this function discovers where the evt came form using 'getStoryParams' and deduces what list should
  * be populated
  * @param {evt} - the event that was fired by clicking a nav button or the submit story form
*/

function putStories(evt) {
  let {$currentStoryList,  $storiesToShow} = getStoryParams(evt) 
  
  //prepare our OL to get the list
  $currentStoryList.empty()

  //check to see if we have an empty favorites or oenStories list and display mssg if so
  if($storiesToShow.length === 0 &&  $currentStoryList === $favoritedStories) {
    $currentStoryList.html('<h5>No favorites added!</h5>')
  } else if($storiesToShow.length === 0 &&  $currentStoryList === $myStories){
    $currentStoryList.html('<h5>You have submitted no stories!</h5>')
  }

  //create new Stories from our localStorage arrays and generate the markup
  for (let story of $storiesToShow) {
    const $story = generateStoryMarkup(new Story(story));
    
    $currentStoryList.append($story);
  }

  //display the html
  $currentStoryList.show();
  if(currentUser) {
    addFavoriteStars($currentStoryList)
  }

  //add click hadler for starring favorites on class star
  $(".star").on("click", favoriteStory)
  //add click hadler for removing stories on class trash-can
  $(".trash-can").on("click", deleteStory)
}

// /**
//  * Gets input from Submit story, makes a new Story instance and adds it to page
//  * 
//  */

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
  //reload all stories from DB
  storyList = await StoryList.getStories();
  //reset input fields
  $submitForm.trigger('reset')

  putStories(evt);
  //hide form with animation
  $submitForm.slideUp()
  //add story to currentUser ownStories
  // console.log('currentUSer, ', currentUser)
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
    removeFavoriteStoryFromUser($(this).parent()[0].id)
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
  saveUserFavoriteStoriesLocalStorage(currentUser.favorites)
}

/**
 * removes favorite story from storyList to favoriteStoryList and localStorage
 * @param {string} - story id
 */
function removeFavoriteStoryFromUser(opId) {
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
  let $storyId = $(this).parent()[0].id
  try {
    //remove Story from storyList
    await StoryList.deleteStory(currentUser, $storyId)
    //reload  storylist
    storyList = await StoryList.getStories();
    //remove story from user favorites
    removeFavoriteStoryFromUser($storyId)
    //remove story from user ownFavorites
    deleteStoryFromOwnStories($storyId)
    console.log('user after dleete ', currentUser)
    putStories()
  } catch(e) {
    console.log('the error ', e)
    alert('Not your story to delete !')
  }
}

/**
 * deletes story from currentUser's ownStories
 * @param {storyID} - the story to remove form the currentUSer ownStories Array
 */
function deleteStoryFromOwnStories(opId) {
  //remove favorite story from user favorites
  currentUser.ownStories = currentUser.ownStories.filter(story => {
    return story.storyId !== opId
  })
  //update localStorage with ownStories
  saveOwnStoriesLocalStorage(currentUser.ownStories)

}

/**
 * updates star in UI to be filled if the user has farvorited a story
 * @param {list} - the OL that needs to be updated : either #all-stories, #favorited-stories, or #my-stories
 */
function addFavoriteStars(list) {
  //check which tab we are in so we can update the appropriate OL
  let listId = list[0].id
  // loop through all LIs for approprite OL and fill start if there is a match from currentUser.favorites
  $(`#${listId}`).children().each((i, li) => {
    for(let fav of currentUser.favorites) {
      if(fav.storyId === li.id) {
        $(`#${listId} #${li.id} .star i`).removeClass('far').addClass('fas')
      }
    }
  })
} 


