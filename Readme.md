<br><br><br><br>

# Commands:(start with a '~')

##	create: 
	privilege: 3:superuser, 2:admin, 1:collaborators, 0:users

	~create
		No returns, create discord profile for current user.
		The error happens only when user already in the database.
		Example: ~create

	~create [discord_id] [discord_username]
		No returns, create discord profile for current user.
		The error happens only when user already in the database.
		Example: ~create 123456789012345678 myusername

	~create [discord_id] [discord_username] [privilege]
		No returns, create discord profile for current user.
		The error happens only when user already in the database or current user privilege is not sufficient to set target privilege.
		Example: ~create 123456789012345678 myusername 3

	~create [discord_id] [discord_username] [privilege] [lodestone]
		No returns, create discord profile for current user.
		The error happens only when user already in the database.
		Example: ~create 123456789012345678 myusername 3 12345678

##	link:

	~link [lodestone id]
		No returns. 
		Link current user discord profile with target Character. 
		The error happens only when character already linked with current user in the database.
		Example: ~link 12345678

	~link [discord id] [lodestone id]
		No returns. 
		Link target user discord profile with target Character. 
		The error happens only when character already linked with current user in the database.
		Example: ~link 123456789012345678 12345678

	~link [character name](fname lname) [server]
		No returns. 
		Link current user discord profile with target Character using character name and server. 
		The error happens only when character already linked with current user in the database.
		Example: ~link myfirstname mylastnem myserver

	~link [discord id] [character name](fname lname) [server]
		No returns. 
		Link target user discord profile with target Character using character name and server. 
		The error happens only when character already linked with current user in the database.
		Example: ~link 123456789012345678 myfirstname mylastnem myserver

## whoami:

	~whoami
		Returns embeded discord user information and final fantasy character information.
		If there are multiple character with the same name, returns the one with highest lodestone id.
		If current user is not in the database, create a new user profile and return this user information.
		If no final fantasy character linked with current user, only returns user profile.
		Example: ~whoami

## fflogs:

	~fflogs [character firstname] [character lastname]
		Returns the highest combat ranking of the final fantasy character for all current tier fights. 
		If there are multiple character with the same name, returns the one with most number of combat logs.
		Example: ~fflogs T'aldarim Annie

	~fflogs [character firstname] [character lastname] [server name] (Recommanded!!)
		Returns the highest combat ranking of the final fantasy character for all current tier fights.
		Example: ~fflogs T'aldarim Annie Sargatanas

	~fflogs [character firstname] [character lastname] [server name] [datacenter]
		Returns the highest combat ranking of the final fantasy character for all current tier fights.
		Example: ~fflogs T'aldarim Annie E9s Sargatanas Aether

	~fflogs [character firstname] [character lastname] [combat abbr.]
		Returns the highest combat ranking of the final fantasy character for [combat abbr.].
		Example: ~fflogs T'aldarim Annie E9s

	~fflogs [character firstname] [character lastname] [combat abbr.] [server name]
		Returns the highest combat ranking of the final fantasy character for [combat abbr.].
		Example: ~fflogs T'aldarim Annie E9s Sargatanas

	~fflogs
		Returns the highest combat ranking of the final fantasy character for all current tier fights.
		Need a discord user linked with at least one final fantasy character. 
		If more than one character are linked, return the first character linked
		Example: ~fflogs

<br><br><br><br>

# Database

## Table "discord_user" <br>

|Column    |         Type          | Collation | Nullable | Default|
|--------------|-----------------------|-----------|----------|---------|
|discord_id   | character varying(32) |           | not null ||
|privilege    | integer               |           | not null ||
|discord_name | character varying(32) |           |          ||

Indexes:

"discord_user_pkey" PRIMARY KEY, btree (discord_id)

Referenced by:
	
TABLE "ff14_user" CONSTRAINT "ff14_user_discord_id_fkey" FOREIGN KEY (discord_id) REFERENCES discord_user(discord_id) ON UPDATE CASCADE ON DELETE CASCADE  

<br>

## Table "ff14_user" <br>

|     Column     |         Type          | Collation | Nullable | Default|
|----------------|-----------------------|-----------|----------|---------|
| discord_id     | character varying(32) |           | not null ||
| ff14_loadstone | bigint                |           | not null ||
| fname          | character varying(32) |           |          ||
| lname          | character varying(32) |           |          ||
| server         | character varying(32) |           |          ||
| datacenter     | character varying(32) |           |          ||
| region         | character varying(32) |           |          ||

Indexes:

"ff14_user_pkey" PRIMARY KEY, btree (ff14_loadstone, discord_id)

Foreign-key constraints:

"ff14_user_discord_id_fkey" FOREIGN KEY (discord_id) REFERENCES discord_user(discord_id) ON UPDATE CASCADE ON DELETE CASCADE


<br><br><br><br>

# File Logistic

## Flow map for files:
![](images/readme.png)

bot_main.js: 

	initialize bot and seperate and channel commands into commands.js

commands.js: 

	distributing all commands to specific files

Classes.js: 

	all shared static variables, functions, and classes are stored in this file.

filesystem.js: 

	embeded_ff14(): send a discord embeded message(cards) to discord user. Using loadstone.find_character(). Currently only being called by find_character() and card().

	create_user(): create a new discord user and record in the database. ~create [discord_id] [discord_username] [privilege] [lodestone].

	link_ff14(): link ff14 character to a discord user and record in the database. The same character can be linked by multiple user but not the same user.
		~link [discord id] [character name](fname lname) [server]. ~link [discord id] [lodestone id]. ~link [lodestone id]

	card(): show discord user infomation and also show its ff14 info if he/she has character linked. ~whoami

	find_character(): show the designated character infomation by using embeded_ff14(). ~find [characterFname characterLname] [server/datacenter/server_region]. ~find lodestone_id

	check_rank(): check user info in database, if not insert into it. check if asked character is linked with user, if not link it with user.
				Using fflogs.check_rank() in fflogs_analysis.js. ~fflogs [character_firstName] [character_lastName] [combatName] [server_name].

fflogs_analysis.js:	

	check_rank(): check the fflogs of character. ~fflogs [character_firstName] [character_lastName] [combatName] [server_name].

act_auto_fflogs.js: (new features!!)

	ACT(Advanced Combat Tracker) with plugin Triggernometry script would output player join party message into discord channel, and this file would parse that message to automately check player's logs from fflogs

loadstone.js: 

	find_character(): find character info by two get requesting to XIVAPI. 
						1): With character_name and optional server_name to get lodestone_ID of that character.
						2): With only URL to get lodestone infomation, private key and lodestone ID has been added to URL before function called.
					function accepts calls from other function from current/other files and direct discord message.


