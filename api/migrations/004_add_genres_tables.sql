CREATE TABLE genres(
	id		INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	name	TEXT NOT NULL UNIQUE
);

CREATE TABLE movie_genres(
	movie_id 	INT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
	genre_id	INT NOT NULL REFERENCES genres(id)
);

INSERT INTO genres(name)
	SELECT DISTINCT unnest(genres) 
	FROM MOVIES 
	WHERE genres IS NOT NULL;

INSERT INTO movie_genres(movie_id, genre_id)
SELECT m.id, g.id 
FROM movies m 
CROSS JOIN LATERAL unnest(m.genres) AS gname 
JOIN genres g 
	ON g.name = gname;