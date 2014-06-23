
previde readme

	= Overview

	This is a simple script to grap the list of video clip info, and then present them into the simple and clear view.

	The main idea of the script, is to composite different category of videos in diffent sites, then providing a quick view of the updates of the category that you added.
	
	

	= Usage
	
	Before using it, you must have some skills in coding in javascript.

	To use it, there are some step you should follow:
	
		* analyse the site on how to get the video list content
		* analyse the difference of each page's url, for writing the "nextPattern"
		* analyse the structure of content that you want in the page, then write the "dataModel"

	Let's look at an example in params:

		"params": {
			"acfun_variety": {
			
				"fetcher": {
					"url": "http://www.acfun.tv/dynamic/channel/1.aspx?channelId=98&orderBy=0",
					"baseUrl": "http://www.acfun.tv",
					"nextPattern": "url.replace(/(\\d+?)\\.aspx/, function(who, p1) {var n = parseInt(p1) + 1; return n + '.aspx'})"
				},
				"menu": {
					"uid": "acfun_variety",
					"title": "acfun 综艺"
				},
				"model": {
					"item": {
						"_": ".unit",
						"[]": {
							"img": {
								"_": ".preview",
								"src": "_ -> [src]"
								},
							"title": {
								"_": ".title",
								"text": ".title",
								"href": "_ -> [href]"
							},
							"desc": {
								"_": ".desc",
								"text": ""
							},
							"meta": {
								"_": ".name, .date, .info-hover",
								"text": ".name | / | .date | / | .info-hover"
							}
						}
					}
				}
			}
		}

	For example, if we want to add a user's video category of xxx, you can follow the detail steps below.

	First, setup the fetcher part of the params.

		We open a user's category page of a video site, then open up the console panel of chrome browser, and switch to the Network tab in console panel. We click the different page button in the web page, then the Network tab will show the content's urls.

		Analyse the difference of the urls, to write a replace codes for the "nextPattern" key of the local params.
		
			// for example, the content pages url are in these form:
			
			http://xxx.com/theUserId/page_1.asp
			http://xxx.com/theUserId/page_2.asp
			
			// then the value to the key "nextPattern" should be:
			
			url.replace(/page_(\\d+)/, function(whole, p1) {
				var num = parseInt(p1) + 1
				return "page_" + num
			})

		The "baseUrl" is for the lack part of the pages url, if the url in the page that we finally got is in a partial form.

		The "nextPattern" is the javascript codes in string form, and the program will use it's return value as the final next url. There are two variables can be used in the "nextPattern", the "url", which means the latest updated next url, and the "content", which means the latest updated page's content.
				
		Notice:
			The regular expression is the string form, that means you should use "\\" to indicate tranform syntax. For example "\\d" means all the digitals for regular expression.
		
	Then, setup the menu part of the params.
		
		The important part is the "uid" key. The value of "uid" should be the same as the key just inside the "params" key.
		
		The "title" key is for the title of the menu item.


	Finally, setup the model part of the params.
		
		You should follow the pattern below:
			"item": {
				"_": "the jquery selector of item",
				"[]": {
					// this part is used for the template
					// you can change them for your own
					"title": {
						"_": "the jquery selector of title",
						// the empty string means get the whole text of "_"
						"text": "",
						"href": "_ -> [href]"
					}
				}
			}
		
		The "_" key's value is the jquery selector, and the others are the custom selector.
		
		The "_" key's value means that it will act as the target content, for those other keys in the same level. For example, the item "href": "_ -> [href]" means getting the "href" attribute of the target content.
		
		The key-value pairs under the "[]" key, are used for select the content of each jquery item got from the "_" part. And this part should be correponding to the HTML template of our page (see below).
		
		The syntax of custom selector:
			
			jquerySelector -> [attribute] [[replacement]] || ...
			
			The "-> [attribute]" part is for getting the attribute's value.
			
			The "[[replacement]]" part is for replace the text got by the pervious selector. The replacement string should be:
				/regexString/, 'replacement string'
			
			The "||" part is to seprate different selector. You can insert custom string inside the two "|", the string will show as the part of the final text.
			
			For example:
				.title -> [title] [[/info:/, '']]

		The each item's template structure is:
			// as the key of "[]" part of model seciton in params
			// corrsponding to one item block of the list in web page
			img
				src
			title
				text
				href
				title
			desc
				text
			meta
				text
				author
				digiDate
				date
				time
				tag
				views
				comments

