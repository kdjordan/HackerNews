"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

// This is the global list of the favorited stories, an array of favorite story IDs
// let favoriteStoryArr = []
let favoriteStoryList 
/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  // localStorage.removeItem('favoriteStories')
  //get favorited Stories from user class whiich has grabbed favorites stories on refresh from localStorage
  favoriteStoryList = checkForFavoriteStories()
  storyList = await StoryList.getStories();
  console.log('the stories list be like: ', storyList)
  console.log('the favorite stories list be like: ', favoriteStoryList)

  $storiesLoadingMsg.remove();
  
  putStoriesOnPage();
  addFavoritestoUI()
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
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  
  $allStoriesList.show();
  //add click hadler for starring favorites on class star
  $(".star").on("click", favoriteStory)
  //add click hadler for removing stories on class trash-can
  $(".trash-can").on("click", deleteStory)
}

/** Gets list of favorite stories  favoriteStoryList, generates their HTML, and puts on page. */

function putFavoriteStoriesOnPage() {
  console.debug("putFavoriteStoriesOnPage", favoriteStoryList);
  if(favoriteStoryList.stories.length > 0) {
    $favoritedStories.empty();
    // loop through all of our stories and generate HTML for them
    for (let story of favoriteStoryList.stories) {
      console.log(new Story(story))
      const $story = generateStoryMarkup(new Story(story));
      $favoritedStories.append($story);
    }
    $favoritedStories.show();
    //add click hadler for starring favorites on class star
    $(".star").on("click", favoriteStory)
    //add click hadler for removing stories on class trash-can
    $(".trash-can").on("click", deleteStory)
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
  await StoryList.addStory(currentUser, newStory)
  //reset input fields
  $('#create-author').val('')
  $('#create-title').val('')
  $('#create-url').val('')
  //hide form with animation
  $submitForm.slideUp()
  //show loadingMsg while new Storyies made form repsonse and added to DOM
  $storiesLoadingMsg.show();
  //reload all stories from DB
  getAndShowStoriesOnStart()
}

$submitForm.on('submit', createStoryFromForm)


/**
 * toggles star from filled to unfilled depending on state when user favorites a story
 * calls other functions to update localStorage with favorited story
 */

function favoriteStory() {
  let storyIsFavorite = favoriteStoryList.stories.filter(story => {
    console.log(story)
    return story.storyId === $(this).parent()[0].id
  })
  console.log('filter ', storyIsFavorite)
  console.log($(this).parent()[0].id)
  if($(this).children().hasClass('far') && storyIsFavorite.length == 0) {
    console.log('adding ', $(this).parent()[0].id)
    //a favorite story
    $(this).children().removeClass('far').addClass('fas')
    //add story to favorites array and localStorage by passing id 
    addFavoriteStory($(this).parent()[0].id)
  } else {
    //not a favorite story
    $(this).children().removeClass('fas').addClass('far')
    //remove story from favorites array and localStorage by passing id 
    removeFavoriteStory($(this).parent()[0].id)
  }
}

/**
 * updates .star to reflect favorited stories in favoriteStoryList
 * 
 */
function addFavoritestoUI() {
  // console.log('starring mfrs ', favoriteStoryList)
  $.each($('li'), (i, el) => {
    for (let story of favoriteStoryList.stories) {
      if(story.storyId === el.id) {
        // console.log($(`#${el.id} .star`).children())
        console.log('runnin ', story)
        $(`#${el.id} .star`).children().removeClass('far').addClass('fas')
        console.log('now ', $(`#${el.id} .star`).children())
      }
    }
  })
}

/**
 * adds favorite story from storyList to favoriteStoryList and localStorage
 * @param {string} - story id
 */
function addFavoriteStory(opId) {
  console.log('addin ', opId)
  for (let story of storyList.stories) {
    if(story.storyId === opId) {
      favoriteStoryList.stories.push(story)
    }
  }
  saveUserFavoriteStoriesLocalStorage(favoriteStoryList)
}

/**
 * removes favorite story from storyList to favoriteStoryList and localStorage
 * @param {string} - story id
 */
function removeFavoriteStory(opId) {
  favoriteStoryList.stories = favoriteStoryList.stories.filter(story => {
    return story.storyId !== opId
  })
  ///remove from DOM $favoritedStories
  $(`#favorited-stories #${opId}`).remove()
  //if there are no favorite stories - display mssg
  if(favoriteStoryList.stories.length === 0) {
    $favoritedStories.html('<h5>No favorites added!</h5>')
  }
  saveUserFavoriteStoriesLocalStorage(favoriteStoryList)
  addFavoritestoUI
}
//#\30 6af647b-5479-4524-aa22-3ac69890c819
/**
 * deletes Story from DB - called from click hadler on class 'trash-can'
 * references class ID of parent li in DOM
 * needs currentUser to get token for acces to API (protected call)
 */
async function deleteStory() {
  try {
    //remove story from favorites if it's in there 
    removeFavoriteStory($(this).parent()[0].id) 
    //remove Story from storyList
    await StoryList.deleteStory(currentUser, $(this).parent()[0].id)
    $storiesLoadingMsg.append();
    //reload stories list
    getAndShowStoriesOnStart()
  } catch(e) {
    alert('Not your story to delete !')
  }
}
