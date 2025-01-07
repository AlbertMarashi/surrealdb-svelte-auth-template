
DEFINE TABLE OVERWRITE user SCHEMAFULL
    PERMISSIONS
        FOR SELECT, UPDATE, DELETE WHERE id = $auth
        FOR CREATE WHERE true;
DEFINE FIELD OVERWRITE id ON user TYPE string;
DEFINE FIELD OVERWRITE email ON user TYPE string;
DEFINE FIELD OVERWRITE name ON user TYPE string;
DEFINE FIELD OVERWRITE password ON user TYPE string
    VALUE crypto::bcrypt::generate($value)
    PERMISSIONS
        FOR SELECT WHERE false;

DEFINE INDEX unique_email ON user FIELDS email UNIQUE;

DEFINE ACCESS OVERWRITE users
    ON DATABASE TYPE RECORD WITH JWT ALGORITHM HS256
    # This key will need to match the AUTH_SECRET in the .env file on your server
    KEY "SHARED_SECRET_HERE"
    DURATION FOR TOKEN 1w;