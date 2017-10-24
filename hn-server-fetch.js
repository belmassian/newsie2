require('isomorphic-fetch')

exports.fetchNews = function(page) {
	page = page || ''
	return fetch('http://node-hnapi.herokuapp.com/news' + page).then(function(response) {
	  return response.json()
	}).then(function(json) {
	  var stories = '<ol class="Items__list" start="1">'
	  json.forEach(function(data, index) {
	      var story = '<li class="ListItem" style="margin-bottom: 16px;">' +
	          '<div class="Item__title" style="font-size: 18px;"><a href="' + data.url + '">' + data.title + '</a> ' +
	          '<span class="Item__host">(' + data.domain + ')</span></div>' +
	          '<div class="Item__meta"><span class="Item__score">' + data.points + ' points</span> ' +
	          '<span class="Item__by">by <a href="https://news.ycombinator.com/user?id=' + data.user + '">' + data.user + '</a></span> ' +
	          '<time class="Item__time">' + data.time_ago + ' </time> | ' +
	          '<a href="/news/story/' + data.id + '">' + data.comments_count + ' comments</a></div>'
	      '</li>'
	      stories += story
	  })
	  stories += '</ol>'
	  return stories
	})
}

function renderNestedComment(data) {
	return '<div class="Comment__kids">' +
		        '<div class="Comment Comment--level1">' +
		            '<div class="Comment__content">' +
		                '<div class="Comment__meta"><span class="Comment__collapse" tabindex="0">[–]</span> ' +
		                    '<a class="Comment__user" href="#/user/' + data.user + '">' + data.user + '</a> ' +
		                    '<time>' + data.time_ago + '</time> ' +
		                    '<a href="#/comment/' + data.id + '">link</a></div> ' +
		                '<div class="Comment__text">' +
		                    '<div>' + data.content +'</div> ' +
		                    '<p><a href="https://news.ycombinator.com/reply?id=' + data.id + '">reply</a></p>' +
		                '</div>' +
		            '</div>' +
		        '</div>' +
		    '</div>'
}

function generateNestedCommentString(data) {
	var output = ''
	data.comments.forEach(function(comment) {
		output+= renderNestedComment(comment)
		if (comment.comments) {
			output+= generateNestedCommentString(comment)
		}
	})
	return output
}

/**
 * Fetch details of the story/post/item with (nested) comments
 * TODO: Add article summary at top of nested comment thread
 */
exports.fetchItem = function(itemId) {
	return fetch('https://node-hnapi.herokuapp.com/item/' + itemId).then(function(response) {
		return response.json()
	}).then(function(json) {
		var comments = ''
		json.comments.forEach(function(data, index) {
			var comment = '<div class="Item__kids">' +
			'<div class="Comment Comment--level0">' +
		    '<div class="Comment__content">' +
		        '<div class="Comment__meta"><span class="Comment__collapse" tabindex="0">[–]</span> ' +
		            '<a class="Comment__user" href="#/user/' + data.user + '">' + data.user + '</a> ' +
		            '<time>' + data.time_ago + '</time> ' +
		            '<a href="#/comment/' + data.id + '">link</a></div> ' +
		        '<div class="Comment__text">' +
		            '<div>' + data.content +'</div> ' +
		            '<p><a href="https://news.ycombinator.com/reply?id=' + data.id + '">reply</a></p>' +
		        '</div>' +
		    '</div>' +
		   '</div>'
			comments += generateNestedCommentString(data) + '</div>' + comment
		})
		return comments
	})
}
