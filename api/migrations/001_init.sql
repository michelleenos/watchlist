CREATE TABLE movies(
	id					INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	name				TEXT NOT NULL,
	year 				INT, 
	language			TEXT, 
	tagline				TEXT,
	description			TEXT,
	original_title		TEXT,
	tmdb_id				INT UNIQUE,
	poster_path			TEXT,
	tmdb_poster_path	TEXT,
	genres				TEXT[],
	cast_members		JSONB,
	issues				TEXT[] DEFAULT '{}',
	created_at			TIMESTAMPTZ DEFAULT now()
);
