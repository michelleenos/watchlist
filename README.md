## To-Do/Ideas

- Get trailer from TMDB also: `videos` endpoint and can add to movies using `append_to_response`. Returns an array of videos like so, with `key` being the youtube vid id (youtube.com/watch?v=KEY):

```json
{
	"iso_639_1": "en",
	"iso_3166_1": "US",
	"name": "Official Trailer #2",
	"key": "nxi6rtBtBM0",
	"site": "YouTube",
	"size": 1080,
	"type": "Trailer",
	"official": true,
	"id": "5d313d7c326c1900101eba51",
	"published_at": "2019-07-18T14:00:27.000Z"
},
```

- Look into [`/discover/movie`](https://developer.themoviedb.org/reference/discover-movie) and using AND/OR logic with keywords etc
