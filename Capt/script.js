function showPage(page) {
  
  // Hide all pages
  for (let i=0; i<allPages.length; i++) {
    $('#page' + allPages[i]).css({display: 'none'})
  }
  
  // Show the one
  $('#page' + page).css({display: 'flex'})
  
  // SOME PAGES ACCESS DB DIRECTLY (Write & Vote)
  if (page == 'Write' || page == 'Vote') {
    
    // Feedback to user
    loadingStart(page)
    
    // IF VOTE
    if (page == 'Vote') {
      // Activate Vote Stars 
      activateVotes(true)
      
      // Reset button text
      updateNextVote('CANCEL')
      
      // Hide Average Vote
      showVoteAverage(false)
    }
    
    // IF WRITE
    if (page == 'Write') {
      // Activate BUtton OK
      activateCaptionOK(true)
      
      // Reset Next_button &  Caption 
      updateNextCaption('CANCEL & ')
      resetCaption()
    }
    
    // GET Info from DB
    $.get(page + '.php', {action: 'getRandomElement'})
      .done(function(data){
        showStuffFromDB(page, data)
      })
      .fail(function(){
        failDB(page)
      })
      .always(loadingEnd)
  }
}
function showStuffFromDB(page, data){
  console.log(data)
  data = JSON.parse(data) // Parse from JSON to JS-object
  console.log(page)
  
  // Update Image
  let imageFile = data.File
  $('#page' + page + ' .image').css({ 
    backgroundImage: 'url(images/' + imageFile + ')' 
  })
  
  // Update Caption (if user is Voting)
  if (page == 'Vote') {    
    let text = data.Text
    $('#pageVote .caption').html(text)
    
    // Also keep track of current Caption being voted
    currentCaptionVoted = data.CaptID    
  }
  
  // Update Current File, if user is writing
  if (page == 'Write') {
    currentFileWritten = data.File
  }
}
function loadingStart(page){
  $('#page' + page + ' .image').html('loading...')
  $('#page' + page + ' .caption').text('loading...')
}
function loadingEnd(){
  $('.image').html('')
  // Don't change caption because it's been set with info from DB
}
function updateVote(jqVote){
  // Called on click of vote stars
  
  // Check that the clicked vote star is active
  if (!jqVote.data('active')) { return }
  
  // Update DB
  let vote = jqVote.text()
  $.get('Vote.php', {action: 'vote', caption: currentCaptionVoted, vote: vote})
    .done(function(data){
    
      // IF the uploading of the vote went OK
      if (data == '1') {
        
        // Update Text in NEXT Button
        updateNextVote('OK')
        
        // SHOW AVERAGE
        $.get('Vote.php', {action: 'average', caption: currentCaptionVoted})
          .done(function(data){
            console.log(data)
            if (data == "0") {
              // Something went wrong. Just don't do anything
            } else {
              // Data contains average
              data = JSON.parse(data)
              showVoteAverage(data.Average)
            }
          })
          .fail(function(){
            console.log('getting average failed');
          })
        
      } else {
        // If the updating of vote failed
        console.log('voting ERROR');  
      }      
    })
    .fail(function(){
      console.log('voting failed');
    })

  // Deactivate votes &  show feedback
  activateVotes(false, jqVote)
}
function updateCaption(){
  console.log('updateCaption: ' + currentFileWritten)
  // Called on click of OK Caption (to upload new caption)
  
  // Check that button is active
  if (!$('#knappCaptionOK').data('active')) {
    console.log('not active')
    return
  }
  
  // Update DB
  $.get('Write.php', {
                      action: 'write',
                      file: currentFileWritten,
                      caption: $('.captionContainer input').val()})
    .done(function(data){
    
      console.log(data)
    
      // IF the uploading of the caption went OK
      if (data == '1') {
        
        // Update Text in NEXT Button
        updateNextCaption('')
        
        // Deactivate OK
        activateCaptionOK(false)
        
      } else {
        // If the updating of caption failed
        console.log('caption update ERROR');  
      }      
    })
    .fail(function(){
      console.log('caption update failed');
    })
}
function activateVotes(yes, which){
  // yes: if true => activate all vote stars
  //      if false => deactivate all vote stars, but show which more
                      // When user votes & we want to send feedback
  allVotes.forEach(function(v) {
    if (yes) {
      v.data('active', true)
      v.css({
        backgroundColor: 'transparent',
        opacity: 1
      })
    } else {
      v.data('active', false)
      v.css({opacity: .2})
      which.css({
        backgroundColor: 'Skyblue',
        opacity: 1
      })
    }
    
  })
}
function updateNextCaption(which){
  $('#knappCancelWrite').text(which + "NEXT")
}
function updateNextVote(which){
  $('#knappCancelVote').text(which + " & NEXT")
}
function showVoteAverage(data){
  if (data) {
    data = data.substring(0,3)
    $('#voteAverage').text("AVE: " + data).css({display: 'flex'})
  } else {
    $('#voteAverage').css({display: 'none'})
  }
}
function resetCaption(){
  $('.captionContainer input').val('')
}           
function activateCaptionOK(yes){
  $('#knappCaptionOK').data('active', yes)
  if (yes) {
    $('#knappCaptionOK').css({opacity: 1})
  } else {
    $('#knappCaptionOK').css({opacity: 0.2})
  }
}
// *******
// ON LOAD


// Global variables
let allPages = ['Home', 'Login', 'Vote', 'Write', 'Upload']
let allVotes = [] // To keep all voting stars (jQuery-elements)
let currentCaptionVoted = '' // To keep ID of caption being voted
let currentFileWritten = '' // To keep ID of image being written (caption)

// ******
// EVENTS
// EVENTS: ALL BUTTONS IN HOME-PAGE
// forEach är en intressant metod som alla arrays har
// Kolla gärna på hur den fungerar. Den gör dock inget annat
// än det man kan göra med en vanlig for-loop som går igenom
// hela arrayen.
allPages.forEach(function(onePage){
  $('#knapp' + onePage).click(function(){
    showPage(onePage)
  })
})
$('.home').click(function(){
  showPage('Home')
})

// EVENTS: NEXT CAPTION / NEXT IMAGE / OK IMAGE
$('#knappCancelVote').click(function(){
  showPage('Vote')
})
$('#knappCancelWrite').click(function(){
  showPage('Write')
})
$('#knappCaptionOK').click(updateCaption)

// Wait until whole document is ready before initializing
$( document ).ready(function(){
  
  // Create Voting stars
  let nStars = 5;
  for (let i=nStars; i>=1; i--) {
    let d = $('<div/>')
    allVotes.push(d)
    d.text(i).addClass('voteOne centerflex')
    d.data('active', true)
    d.click(function(){updateVote(d)})
    $('#pageVote .votes').prepend(d)
  }
  
  // Show Menu at the beginning
  showPage('Home')
  
  // Make image container square
  $('.image').css({
    height: $('#allPages > div > div').width() + 'px'
  })
})














