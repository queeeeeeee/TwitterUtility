var authorization = null;
var ua = navigator.userAgentData.brands.map(brand => `"${brand.brand}";v="${brand.version}"`).join(', ');
var client_tid = null;
var client_uuid = null;
var csrf_token = null;
var platform = null;
var random_resource = "OAx9yEcW3JA9bPo63pcYlA";
var random_resource_old_tweets = "H8OOoI-5ZE4NxgRr8lfyWg"
var language_code = navigator.language.split("-")[0]
var tweets_to_delete = []
var tweets_to_delete_text = []
var user_id = null;
var username = null;
var stop_signal = undefined
var twitter_archive_content = undefined
var twitter_archive_loading_confirmed = false
var is_running = false
var is_rate_limited = false
var deletedCount = 0
var retries = 0
const max_retries = 5

function buildAcceptLanguageString() {
	const languages = navigator.languages;

	// Check if we have any languages
	if (!languages || languages.length === 0) {
		return "en-US,en;q=0.9"; // Default value if nothing is available
	}

	let q = 1;
	const decrement = 0.1;

	return languages.map(lang => {
		if (q < 1) {
			const result = `${lang};q=${q.toFixed(1)}`;
			q -= decrement;
			return result;
		}
		q -= decrement;
		return lang;
	}).join(',');
}

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetch_tweets(options, cursor = null) {
	try {
		if (is_rate_limited) {
			if (options.statusCallback) {
				options.statusCallback("Rate limit reached. Waiting 3 minute...");
			}
			await sleep(1000 * 180);
			is_rate_limited = false;
		}

		let count = "20";
		let final_cursor = cursor ? `%22cursor%22%3A%22${cursor}%22%2C` : "";
		let resource = options["old_tweets"] ? random_resource_old_tweets : random_resource
		let endpoint = options["old_tweets"] ? "UserTweets" : "UserTweetsAndReplies"
		var base_url = `https://x.com/i/api/graphql/${resource}/${endpoint}`;

		var variable = ""
		var feature = ""
		if (options["old_tweets"] == false) {
			variable = `?variables=%7B%22userId%22%3A%22${user_id}%22%2C%22count%22%3A${count}%2C${final_cursor}%22includePromotedContent%22%3Atrue%2C%22withCommunity%22%3Atrue%2C%22withVoice%22%3Atrue%7D`;
			feature = `&features=%7B%22rweb_video_screen_enabled%22%3Afalse%2C%22profile_label_improvements_pcf_label_in_post_enabled%22%3Atrue%2C%22rweb_tipjar_consumption_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22premium_content_api_read_enabled%22%3Afalse%2C%22communities_web_enable_tweet_community_results_fetch%22%3Atrue%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22responsive_web_grok_analyze_button_fetch_trends_enabled%22%3Afalse%2C%22responsive_web_grok_analyze_post_followups_enabled%22%3Atrue%2C%22responsive_web_jetfuel_frame%22%3Afalse%2C%22responsive_web_grok_share_attachment_enabled%22%3Atrue%2C%22articles_preview_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Atrue%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22responsive_web_grok_show_grok_translated_post%22%3Afalse%2C%22responsive_web_grok_analysis_button_from_backend%22%3Afalse%2C%22creator_subscriptions_quote_tweet_preview_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_grok_image_annotation_enabled%22%3Atrue%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D&fieldToggles=%7B%22withArticlePlainText%22%3Afalse%7D`;
		}
		else {
			variable = `?variables=%7B%22userId%22%3A%22${user_id}%22%2C%22count%22%3A${count}%2C${final_cursor}%22includePromotedContent%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withVoice%22%3Atrue%2C%22withV2Timeline%22%3Atrue%7D`
			feature = `&features=%7B%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22tweetypie_unmention_optimization_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Afalse%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_media_download_video_enabled%22%3Afalse%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D`
		}

		var final_url = `${base_url}${variable}${feature}`;

		const headers = {
			"accept": "*/*",
			"accept-language": buildAcceptLanguageString(),
			"authorization": authorization,
			"content-type": "application/json",
			"sec-ch-ua": ua,
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": platform,
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-origin",
			"x-client-transaction-id": client_tid,
			"x-csrf-token": csrf_token,
			"x-twitter-active-user": "yes",
			"x-twitter-auth-type": "OAuth2Session",
			"x-twitter-client-language": language_code
		};

		// if (client_uuid) {
		// 	headers["x-client-uuid"] = client_uuid;
		// }

		const response = await fetch(final_url, {
			"headers": headers,
			"referrer": `https://x.com/${username}/with_replies`,
			"referrerPolicy": "strict-origin-when-cross-origin",
			"body": null,
			"method": "GET",
			"mode": "cors",
			"credentials": "include"
		});

		if (!response.ok) {
			retries = retries + 1

			if (response.status === 429) {
				is_rate_limited = true;
				return await fetch_tweets(options, cursor);
			}
			if (retries >= max_retries) {
				if (options.statusCallback) {
					options.statusCallback("Max retries reached. Please try again later.");
				}
				throw new Error("Max retries reached");
			}
			console.log(`(fetch_tweets) Network response was not ok, retrying in ${5 * (1 + retries)} seconds`);

			options.statusCallback(`fetch ${retries}회 실패, ${5 * (1 + retries)}초 대기`)

			console.log(response.text())

			await sleep(5000 * (1 + retries));
			return await fetch_tweets(options, cursor)
		}

		retries = 0
		const data = await response.json();
		var entries = data["data"]["user"]["result"]["timeline"]["timeline"]["instructions"]
		for (item of entries) {
			if (item["type"] == "TimelineAddEntries") {
				entries = item["entries"]
			}
		}
		console.log(entries);
		return entries;
	} catch (error) {
		if (options.statusCallback) {
			options.statusCallback(`Error fetching tweets: ${error.message}`);
		}
		throw error;
	}
}

async function log_tweets(options, entries) {
	for (let item of entries) {
		if (item["entryId"].startsWith("profile-conversation") || item["entryId"].startsWith("tweet-")) {
			findTweetIds(options, item)
		}
		else if (item["entryId"].startsWith("cursor-bottom") && entries.length > 2) {
			let cursor_bottom = item["content"]["value"];

			return cursor_bottom;
		}
	}
	return "finished"
}

function check_keywords(options, text) {
	if (options["match_any_keywords"].length == 0) {
		return true
	}
	for (let word of options["match_any_keywords"]) {
		if (text.includes(word))
		{
			console.log(options["match_any_keywords"], text)
			return false
		}
	}
	return true
}

function check_date(options, tweet) {
	if (tweet['legacy'].hasOwnProperty('created_at')) {
		tweet_date = new Date(tweet['legacy']["created_at"])
		after_date = new Date(options["after_date"])
		before_date = new Date(options["before_date"])
		tweet_date.setHours(0, 0, 0, 0);
		if (tweet_date > after_date && tweet_date < before_date) {
			return true
		}
		else if (tweet_date < after_date) {
			stop_signal = true
		}
		console.log(tweet_date, after_date, before_date)
		return false
	}
	return true
}

function check_filter(options, tweet) {
	if (tweet['legacy'].hasOwnProperty('id_str')
		&& ( options["tweets_to_ignore"].includes(tweet['legacy']["id_str"]) || options["tweets_to_ignore"].includes( parseInt(tweet['legacy']["id_str"]) ) )) {
		return false
	}
	if (options["delete_message_with_url_only"] == true)
	{
		if (tweet['legacy'].hasOwnProperty('entities') && tweet['legacy']["entities"].hasOwnProperty('urls') && tweet['legacy']["entities"]["urls"].length > 0
			&& check_keywords(options, tweet['legacy']['full_text']) && check_date(options, tweet)) {
			return true
		}
		return false
	}
	if (check_keywords(options, tweet['legacy']['full_text']) && check_date(options, tweet))
		return true
	return false
}

function check_tweet_owner(options, obj, uid) {
	if (obj.hasOwnProperty('legacy') && obj['legacy'].hasOwnProperty('retweeted') && obj['legacy']['retweeted'] === true && options["unretweet"] == false)
		return false
	if (obj.hasOwnProperty('user_id_str') && obj['user_id_str'] === uid)
		return true;
	else if (obj.hasOwnProperty('legacy') && obj['legacy'].hasOwnProperty('user_id_str') && obj['legacy']['user_id_str'] === uid)
		return true;
	return false
}

function tweetFound(obj,options) {
	tweets_to_delete_text.push(`${obj['legacy']['full_text']}`)
	// if (options.statusCallback) {
		// options.statusCallback(`삭제 : ${obj['legacy']['full_text']}`);
	// }
}

function findTweetIds(options, obj) {
	function recurse(currentObj) {
		if (typeof currentObj !== 'object' || currentObj === null
		|| (options["do_not_remove_pinned_tweet"] == true && currentObj['__type'] == "TimelinePinEntry")) {
			return;
		}

		if (currentObj['__typename'] === 'TweetWithVisibilityResults' && currentObj.hasOwnProperty('tweet')
			&& check_tweet_owner(options, currentObj['tweet'], user_id) && check_filter(options, currentObj['tweet'])) {
			tweets_to_delete.push(currentObj['tweet']['id_str'] || currentObj['tweet']['legacy']['id_str']);
			tweetFound(currentObj['tweet'], options)
		}

		else if (currentObj.hasOwnProperty('__typename') && currentObj['__typename'] === 'Tweet'
			&& check_tweet_owner(options, currentObj, user_id) && check_filter(options, currentObj)) {
			tweets_to_delete.push(currentObj['id_str'] || currentObj['legacy']['id_str']);
			tweetFound(currentObj,options)
		}

		for (let key in currentObj) {
			if (currentObj.hasOwnProperty(key)) {
				recurse(currentObj[key]);
			}
		}
	}

	recurse(obj);
}

async function delete_tweets(id_list, options) {
	var delete_tid = "LuSa1GYxAMxWEugf+FtQ/wjCAUkipMAU3jpjkil3ujj7oq6munDCtNaMaFmZ8bcm7CaNvi4GIXj32jp7q32nZU8zc5CyLw"
	var id_list_size = id_list.length
	var retry = 0

	for (let i = 0; i < id_list_size; ++i) {
		const headers = {
			"accept": "*/*",
			"accept-language": buildAcceptLanguageString(),
			"authorization": authorization,
			"content-type": "application/json",
			"sec-ch-ua": ua,
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": platform,
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-origin",
			"x-client-transaction-id": delete_tid,
			"x-csrf-token": csrf_token,
			"x-twitter-active-user": "yes",
			"x-twitter-auth-type": "OAuth2Session",
			"x-twitter-client-language": language_code
		};

		if (client_uuid) {
			headers["x-client-uuid"] = client_uuid;
		}

		const response = await fetch("https://x.com/i/api/graphql/VaenaVgh5q5ih7kvyVjgtg/DeleteTweet", {
			"headers": headers,
			"referrer": `https://x.com/${username}/with_replies`,
			"referrerPolicy": "strict-origin-when-cross-origin",
			"body": `{\"variables\":{\"tweet_id\":\"${id_list[i]}\",\"dark_request\":false},\"queryId\":\"VaenaVgh5q5ih7kvyVjgtg\"}`,
			"method": "POST",
			"mode": "cors",
			"credentials": "include"
		});
		if (!response.ok) {
			if (response.status === 429) {
				if (options.statusCallback) {
					options.statusCallback("Rate limit reached. Waiting 3 minute...");
				}
				await sleep(1000 * 180);
				i -= 1;
				continue;
			}
			if (retry == 8) {
				if (options.statusCallback) {
					options.statusCallback("Max retries reached");
				}
				throw new Error("Max retries reached");
			}
			i -= 1;
			await sleep(10000 * (1 + retry));
			continue;
		}

		retry = 0;
		deletedCount++;

		if (options.countCallback) {
			options.statusCallback(`삭제 : ${tweets_to_delete_text[i]}`)
			options.countCallback(deletedCount);
		}

		await sleep(50);
	}
}

async function run(options) {
	retries = 0
    authorization = options.headers.authorization;
    client_tid = options.headers.clientTid;
    client_uuid = options.headers.clientUuid;
	csrf_token = options.csrf_token;
	user_id = options.user_id;
	username = options.headers.username;
	platform = options.headers.platform
	deletedCount = 0;
	tweets_to_delete = [];
	tweets_to_delete_text = [];

    var next = null;
    var entries = undefined;
    is_running = true;

    try {
        while (next != "finished" && stop_signal != true) {
            entries = await fetch_tweets(options, next);
            next = await log_tweets(options, entries);
            await delete_tweets(tweets_to_delete, options);
            tweets_to_delete = [];
			tweets_to_delete_text = [];
            await sleep(1000);
        }
    } catch (error) {
        console.error("Error in run:", error);
    } finally {
        is_running = false;
    }
}
