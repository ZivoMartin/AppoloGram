\c postgres
DROP DATABASE appologram;
CREATE DATABASE appologram;
\c appologram;

CREATE TABLE utilisateur(
    pseudo VARCHAR(50) PRIMARY KEY NOT NULL,
    passw VARCHAR(25) NOT NULL,
    nb_followers INT DEFAULT 0,
    nb_follow INT DEFAULT 0,
    file_path_pdp VARCHAR(200) DEFAULT '/public/photos/pdp_par_default.jpg',
    bio VARCHAR(300) DEFAULT ''
);

CREATE TABLE follow(
    id SERIAL PRIMARY KEY,
    follower VARCHAR(50) REFERENCES utilisateur(pseudo) NOT NULL,
    followed VARCHAR(50) REFERENCES utilisateur(pseudo) NOT NULL
);

CREATE TABLE images(
    id SERIAL PRIMARY KEY,
    file_path VARCHAR(200) NOT NULL,
    pseudo VARCHAR(50) REFERENCES utilisateur(pseudo) NOT NULL,
    nb_likes INT DEFAULT 0,
    bio VARCHAR(300) DEFAULT ''
);

CREATE TABLE likes(
    id SERIAL PRIMARY KEY,
    id_image INT REFERENCES images(id),
    pseudo VARCHAR(50) REFERENCES utilisateur(pseudo)
);

CREATE TABLE commentaires(
    id SERIAL PRIMARY KEY,
    id_image INT REFERENCES images(id),
    pseudo VARCHAR(50) REFERENCES utilisateur(pseudo),
    texte VARCHAR(300) NOT NULL
);

CREATE TABLE conversations(
    id SERIAL PRIMARY KEY,
    user1 VARCHAR(50) REFERENCES utilisateur(pseudo),
    user2 VARCHAR(50) REFERENCES utilisateur(pseudo)
);

CREATE TABLE messages(
    id_image INT REFERENCES images(id),
    envoyeur VARCHAR(50) REFERENCES utilisateur(pseudo),
    receveur VARCHAR(50) REFERENCES utilisateur(pseudo),
    texte VARCHAR(300) NOT NULL,
    id_conv INT REFERENCES conversations(id)
);

INSERT INTO utilisateur (pseudo, passw) VALUES ('user1', 'user1');
INSERT INTO utilisateur (pseudo, passw) VALUES ('user2', 'user2');
INSERT INTO utilisateur (pseudo, passw) VALUES ('user3', 'user3');

INSERT INTO follow (follower, followed) VALUES ('user1', 'user2');
INSERT INTO follow (follower, followed) VALUES ('user2', 'user3');
INSERT INTO follow (follower, followed) VALUES ('user1', 'user3');


INSERT INTO images (file_path, pseudo) VALUES ('/public/images/image1.jpg', 'user2');
INSERT INTO images (file_path, pseudo) VALUES ('/public/images/image2.jpg', 'user3');
INSERT INTO images (file_path, pseudo) VALUES ('/public/images/image3.jpg', 'user2');
INSERT INTO images (file_path, pseudo) VALUES ('/public/images/image4.jpg', 'user3');
INSERT INTO images (file_path, pseudo) VALUES ('/public/images/image5.jpg', 'user2');

SELECT * FROM utilisateur;
SELECT * FROM follow;
SELECT * FROM images;