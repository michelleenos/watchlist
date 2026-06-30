ALTER TABLE movies 
	ADD CONSTRAINT fk_movies_language
	FOREIGN KEY (language) REFERENCES languages (code);