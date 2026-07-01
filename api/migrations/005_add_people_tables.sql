CREATE TABLE people(
	id			INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	tmdb_id		INT NOT NULL UNIQUE,
	name		TEXT NOT NULL
);

CREATE TABLE movie_people(
	movie_id		INT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
	person_id		INT NOT NULL REFERENCES people(id),
	role			TEXT NOT NULL,	-- 'cast' | 'director' | 'writer' | 'source'
	character_name	TEXT,			-- cast only, else NULL (CHARACTER is a reserved word)
	billing_order	INT,			-- cast only (TMDB `order`), else NULL
	PRIMARY KEY (movie_id, person_id, role)
);

CREATE INDEX movie_people_person_idx ON movie_people(person_id);